-- Server-only course signals. No academic profiles, identities or instructor ratings.
create schema if not exists pulse_private;
revoke all on schema pulse_private from public;
do $$ begin
 if not exists(select 1 from pg_roles where rolname='pulse_api') then create role pulse_api login noinherit; end if;
end $$;
create table pulse_private.course_terms(
 course_id text not null,term_id text not null,accepts_votes boolean not null default false,
 closes_at timestamptz not null,purge_at timestamptz not null,primary key(course_id,term_id),check(purge_at>closes_at)
);
create table pulse_private.course_votes(
 course_id text not null,term_id text not null,vote_type text not null check(vote_type in('intent','recommend','workload')),
 value smallint not null,anonymous_id_hash text not null check(length(anonymous_id_hash)=64),hash_key_version smallint not null,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 primary key(course_id,term_id,vote_type,anonymous_id_hash),foreign key(course_id,term_id) references pulse_private.course_terms,
 check((vote_type='intent' and value=1)or(vote_type='recommend' and value in(0,1))or(vote_type='workload' and value in(1,2,3)))
);
create index course_votes_retention on pulse_private.course_votes(term_id,updated_at);
create table pulse_private.course_aggregates(
 course_id text not null,term_id text not null,intent_count integer not null check(intent_count>=0),
 recommend_yes integer not null check(recommend_yes>=0),recommend_total integer not null check(recommend_total>=recommend_yes),
 workload_light integer not null check(workload_light>=0),workload_moderate integer not null check(workload_moderate>=0),workload_heavy integer not null check(workload_heavy>=0),
 updated_at timestamptz not null default now(),primary key(course_id,term_id),foreign key(course_id,term_id) references pulse_private.course_terms
);
create table pulse_private.course_snapshots(like pulse_private.course_aggregates including all);
create table pulse_private.rate_limits(digest text primary key check(length(digest)=64),count integer not null check(count>0),expires_at timestamptz not null);
create index rate_limits_expiry on pulse_private.rate_limits(expires_at);
alter table pulse_private.course_terms enable row level security;
alter table pulse_private.course_votes enable row level security;
alter table pulse_private.course_aggregates enable row level security;
alter table pulse_private.course_snapshots enable row level security;
alter table pulse_private.rate_limits enable row level security;
revoke all on all tables in schema pulse_private from public;
-- Supabase roles may be absent in standalone PostgreSQL test environments.
do $$ declare r text;begin foreach r in array array['anon','authenticated'] loop
 if exists(select 1 from pg_roles where rolname=r)then execute format('revoke all on schema pulse_private from %I',r);execute format('revoke all on all tables in schema pulse_private from %I',r);end if;
end loop;end $$;
grant usage on schema pulse_private to pulse_api;
grant select on pulse_private.course_terms,pulse_private.course_snapshots to pulse_api;
grant select,insert,update,delete on pulse_private.course_votes to pulse_api;
grant select,insert,update on pulse_private.course_aggregates,pulse_private.rate_limits to pulse_api;
create policy server_catalog_read on pulse_private.course_terms for select to pulse_api using(true);
create policy server_vote_access on pulse_private.course_votes for all to pulse_api using(true) with check(true);
create policy server_aggregate_access on pulse_private.course_aggregates for all to pulse_api using(true) with check(true);
create policy server_snapshot_read on pulse_private.course_snapshots for select to pulse_api using(true);
create policy server_rate_access on pulse_private.rate_limits for all to pulse_api using(true) with check(true);
-- Provision pulse_api password separately. No public RPC or SECURITY DEFINER.
