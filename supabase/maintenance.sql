-- Run hourly as an operator/database scheduler. NEVER expose this role to the web API.
-- Same course/term lock convention as mutations. Retain aggregate-only snapshots.
begin;
do $$ declare row record;begin
 for row in select * from pulse_private.course_terms loop
  perform pg_advisory_xact_lock(hashtextextended(row.course_id||chr(1)||row.term_id,0));
  if row.closes_at<=now() then update pulse_private.course_terms set accepts_votes=false where course_id=row.course_id and term_id=row.term_id;end if;
  if row.purge_at<=now() then delete from pulse_private.course_votes where course_id=row.course_id and term_id=row.term_id;end if;
 end loop;
end $$;
insert into pulse_private.course_snapshots select * from pulse_private.course_aggregates
on conflict(course_id,term_id)do update set intent_count=excluded.intent_count,recommend_yes=excluded.recommend_yes,recommend_total=excluded.recommend_total,workload_light=excluded.workload_light,workload_moderate=excluded.workload_moderate,workload_heavy=excluded.workload_heavy,updated_at=excluded.updated_at;
delete from pulse_private.rate_limits where expires_at<=now();
commit;
