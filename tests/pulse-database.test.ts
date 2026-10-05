import { it, expect } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
it("enforces private role access, vote constraints/upserts, rate buckets and scheduled retention in PostgreSQL", async () => {
  const db = new PGlite();
  await db.exec("create role anon;create role authenticated;");
  await db.exec(
    readFileSync(
      "supabase/migrations/20261005214317_community_pulse_private.sql",
      "utf8",
    ),
  );
  await db.exec(
    "insert into pulse_private.course_terms values ('ma2','test',true,now()+interval '1 day',now()+interval '2 days');set role anon;",
  );
  await expect(
    db.query("select * from pulse_private.course_votes"),
  ).rejects.toThrow(/permission denied/);
  await db.exec("reset role;set role authenticated;");
  await expect(
    db.query("insert into pulse_private.course_votes default values"),
  ).rejects.toThrow(/permission denied/);
  await db.exec("reset role;set role pulse_api;");
  await db.query(
    "insert into pulse_private.course_votes(course_id,term_id,vote_type,value,anonymous_id_hash,hash_key_version)values('ma2','test','recommend',1,$1,1)",
    ["a".repeat(64)],
  );
  await db.query(
    "insert into pulse_private.course_votes(course_id,term_id,vote_type,value,anonymous_id_hash,hash_key_version)values('ma2','test','recommend',0,$1,1)on conflict(course_id,term_id,vote_type,anonymous_id_hash)do update set value=excluded.value",
    ["a".repeat(64)],
  );
  expect(
    (
      await db.query<{ value: number }>(
        "select value from pulse_private.course_votes",
      )
    ).rows,
  ).toEqual([{ value: 0 }]);
  await expect(
    db.query(
      "insert into pulse_private.course_votes(course_id,term_id,vote_type,value,anonymous_id_hash,hash_key_version)values('ma2','test','workload',4,$1,1)",
      ["b".repeat(64)],
    ),
  ).rejects.toThrow(/check constraint/);
  await expect(
    db.exec("update pulse_private.course_terms set accepts_votes=true"),
  ).rejects.toThrow(/permission denied/);
  const rate =
    "insert into pulse_private.rate_limits values($1,1,now()+interval '1 hour')on conflict(digest)do update set count=pulse_private.rate_limits.count+1 returning count";
  for (let n = 1; n <= 11; n++)
    expect(
      (await db.query<{ count: number }>(rate, ["c".repeat(64)])).rows[0].count,
    ).toBe(n);
  await db.exec("reset role;");
  await db.exec(
    "update pulse_private.course_terms set closes_at=now()-interval '2 days',purge_at=now()-interval '1 day';update pulse_private.rate_limits set expires_at=now()-interval '1 minute';",
  );
  await db.exec(readFileSync("supabase/maintenance.sql", "utf8"));
  expect(
    (await db.query("select * from pulse_private.course_votes")).rows,
  ).toEqual([]);
  expect(
    (await db.query("select * from pulse_private.rate_limits")).rows,
  ).toEqual([]);
  expect(
    (
      await db.query<{ accepts_votes: boolean }>(
        "select accepts_votes from pulse_private.course_terms",
      )
    ).rows[0].accepts_votes,
  ).toBe(false);
  await db.close();
}, 30000);
