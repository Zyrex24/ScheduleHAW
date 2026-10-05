import "server-only";
import postgres from "postgres";
import { createHmac } from "node:crypto";
import { publicAggregate, type AggregateRow } from "./contracts";
export function pulseConfigured() {
  return (
    process.env.NEXT_PUBLIC_COMMUNITY_PULSE_ENABLED === "true" &&
    !!process.env.PULSE_DATABASE_URL &&
    !!process.env.PULSE_HASH_SECRET &&
    process.env.PULSE_RETENTION_VERIFIED === "true"
  );
}
let connection: ReturnType<typeof postgres> | undefined;
function db() {
  if (!connection)
    connection = postgres(process.env.PULSE_DATABASE_URL!, {
      max: 3,
      prepare: false,
      connect_timeout: 3,
      idle_timeout: 20,
      onnotice: () => {},
      connection: { statement_timeout: 3000 },
    });
  return connection;
}
function digest(scope: string) {
  return createHmac("sha256", process.env.PULSE_HASH_SECRET!)
    .update(scope)
    .digest("hex");
}
export async function pulseRead(termId: string, ip: string) {
  const sql = db();
  await rateLimit(
    sql,
    digest("read:" + new Date().toISOString().slice(0, 10) + ":" + ip),
    120,
  );
  const rows = await sql<
    AggregateRow[]
  >`select * from pulse_private.course_snapshots where term_id=${termId}`;
  return rows.map(publicAggregate);
}
async function rateLimit(
  sql: ReturnType<typeof postgres>,
  key: string,
  limit: number,
) {
  const rows =
    await sql`insert into pulse_private.rate_limits (digest,count,expires_at) values (${key},1,now()+interval '1 hour') on conflict(digest) do update set count=case when pulse_private.rate_limits.expires_at<=now() then 1 else pulse_private.rate_limits.count+1 end,expires_at=case when pulse_private.rate_limits.expires_at<=now() then now()+interval '1 hour' else pulse_private.rate_limits.expires_at end returning count`;
  if (rows[0].count > limit) throw new Error("RATE_LIMIT");
}
export async function pulseMutate(
  v: {
    courseId: string;
    termId: string;
    token: string;
    type?: string;
    value?: number;
  },
  ip: string,
  remove: boolean,
) {
  const sql = db(),
    id = digest(v.token + "\0" + v.courseId + "\0" + v.termId);
  await rateLimit(
    sql,
    digest("ip:" + new Date().toISOString().slice(0, 10) + ":" + ip),
    60,
  );
  await rateLimit(sql, digest("token:" + id), 10);
  await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(hashtextextended(${v.courseId + "\x01" + v.termId},0))`;
    const allowed =
      await tx`select * from pulse_private.course_terms where course_id=${v.courseId} and term_id=${v.termId}`;
    if (
      !allowed.length ||
      (!remove &&
        (!allowed[0].accepts_votes ||
          new Date(allowed[0].closes_at).getTime() <= Date.now()))
    )
      throw new Error("VOTING_CLOSED");
    if (remove)
      await tx`delete from pulse_private.course_votes where course_id=${v.courseId} and term_id=${v.termId} and anonymous_id_hash=${id}`;
    else
      await tx`insert into pulse_private.course_votes(course_id,term_id,vote_type,value,anonymous_id_hash,hash_key_version) values (${v.courseId},${v.termId},${v.type!},${v.value!},${id},${Number(process.env.PULSE_HASH_KEY_VERSION || 1)}) on conflict(course_id,term_id,vote_type,anonymous_id_hash) do update set value=excluded.value,updated_at=now()`;
    await tx`insert into pulse_private.course_aggregates(course_id,term_id,intent_count,recommend_yes,recommend_total,workload_light,workload_moderate,workload_heavy) select ${v.courseId},${v.termId},count(*) filter(where vote_type='intent'),count(*) filter(where vote_type='recommend' and value=1),count(*) filter(where vote_type='recommend'),count(*) filter(where vote_type='workload' and value=1),count(*) filter(where vote_type='workload' and value=2),count(*) filter(where vote_type='workload' and value=3) from pulse_private.course_votes where course_id=${v.courseId} and term_id=${v.termId} on conflict(course_id,term_id) do update set intent_count=excluded.intent_count,recommend_yes=excluded.recommend_yes,recommend_total=excluded.recommend_total,workload_light=excluded.workload_light,workload_moderate=excluded.workload_moderate,workload_heavy=excluded.workload_heavy,updated_at=now()`;
  });
  return { ok: true };
}
