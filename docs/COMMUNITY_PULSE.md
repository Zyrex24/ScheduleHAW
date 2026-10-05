# Optional course-only Community Pulse

P1 feature flag `NEXT_PUBLIC_COMMUNITY_PULSE_ENABLED=false` by default. Deployment may omit all backend credentials. Core planner imports only public aggregate DTO types, not a Supabase client. No realtime subscription, accounts, profile table or instructor feedback.

## API and identity

Next server route `/api/pulse` owns the narrow API; Supabase is private server-side storage only. `GET ?term=<published-term-id>` returns the entire public aggregate term bundle, identical for every caller. `POST` accepts exactly `{courseId, termId, type, value, token}` for one vote; `DELETE` the same identity without value. Runtime schema rejects unknown properties, oversized body (>1 KiB), unlisted course/term/type and values outside their enumerations. GET never takes selected courses or profile filters.

After opt-in, create a random 256-bit local seed in a separate `schedulehaw-pulse` IndexedDB store. Derive `token = HMAC(seed, courseId + '\\0' + termId)` in browser Web Crypto; send only this course/term-scoped opaque token. Server stores `HMAC(serverSecret, token + '\\0' + courseId + '\\0' + termId)` as `anonymous_id_hash`, never the seed or token. The hash is stable across vote types for that one course/term but cannot link other courses via equality. Rotating server hash secrets requires retaining the previous key for the term or an explicit reset window to avoid duplicate identities; store key version. This is abuse mitigation, not authenticated one-person-one-vote.

No automatic intent vote on "Use this plan". Workload/recommendation input is self-reported opinion, not transcript-derived eligibility. Friends stay local. Local reset/device changes can create another token; disclose this limitation instead of collecting identity. Clearing the pulse seed removes the ability to change/remove prior votes unless removed first.

## Proposed schema (design SQL, not a migration executed in this pass)

```sql
create schema if not exists pulse_private;
revoke all on schema pulse_private from public, anon, authenticated;

create table pulse_private.course_terms (
  course_id text not null,
  term_id text not null,
  accepts_votes boolean not null default false,
  closes_at timestamptz not null,
  primary key (course_id, term_id)
);

create table pulse_private.course_votes (
  course_id text not null,
  term_id text not null,
  vote_type text not null check (vote_type in ('intent', 'recommend', 'workload')),
  value smallint not null,
  anonymous_id_hash text not null check (length(anonymous_id_hash) = 64),
  hash_key_version smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (course_id, term_id, vote_type, anonymous_id_hash),
  foreign key (course_id, term_id)
    references pulse_private.course_terms(course_id, term_id),
  check ((vote_type = 'intent' and value = 1)
      or (vote_type = 'recommend' and value in (0, 1))
      or (vote_type = 'workload' and value in (1, 2, 3)))
);

create table pulse_private.course_aggregates (
  course_id text not null,
  term_id text not null,
  intent_count integer not null check (intent_count >= 0),
  recommend_yes integer not null check (recommend_yes >= 0),
  recommend_total integer not null check (recommend_total >= recommend_yes),
  workload_light integer not null check (workload_light >= 0),
  workload_moderate integer not null check (workload_moderate >= 0),
  workload_heavy integer not null check (workload_heavy >= 0),
  updated_at timestamptz not null default now(),
  primary key (course_id, term_id),
  foreign key (course_id, term_id)
    references pulse_private.course_terms(course_id, term_id)
);

alter table pulse_private.course_terms enable row level security;
alter table pulse_private.course_votes enable row level security;
alter table pulse_private.course_aggregates enable row level security;
revoke all on all tables in schema pulse_private from public, anon, authenticated;

-- Provision this role's random password separately, never in the migration/repository.
create role pulse_api login noinherit;
grant usage on schema pulse_private to pulse_api;
grant select on pulse_private.course_terms to pulse_api;
grant select, insert, update, delete on pulse_private.course_votes to pulse_api;
grant select, insert, update on pulse_private.course_aggregates to pulse_api;
create policy server_catalog_read on pulse_private.course_terms
  for select to pulse_api using (true);
create policy server_vote_access on pulse_private.course_votes
  for all to pulse_api using (true) with check (true);
create policy server_aggregate_access on pulse_private.course_aggregates
  for all to pulse_api using (true) with check (true);
```

Use the dedicated `pulse_api` role through a pooled PostgreSQL connection in a server-only module with secret `PULSE_DATABASE_URL`; use server-only `PULSE_HASH_SECRET` and its version for HMAC. The private role policies intentionally allow the narrow API service to access votes across callers; end-user authorization/change/delete ownership is enforced by the scoped hash predicate in the API. This role is never assigned to `anon`/`authenticated` or handed to browsers. Operators, not the API role, manage the public course-term allowlist. Test role privileges independently.

Never expose service credentials as NEXT_PUBLIC variables. No anon/authenticated direct table access, including raw SELECT. Do not expose this private schema in Data API. Server executes parameterized SQL; no public RPC or SECURITY DEFINER function is needed. Schema privileges and RLS are separate controls; check both against [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

For concurrent votes, acquire a transaction-scoped PostgreSQL advisory lock keyed by a stable 64-bit hash of courseId/termId, read/validate open/close state, upsert/delete the unique vote and recompute the aggregate for that course/term before commit. Use parameterized values for the lock key and all queries. A hash collision only serializes unrelated courses and cannot mix their data. Catalog-close and retention jobs use the same lock convention. This avoids granting the API role UPDATE on the course-term allowlist. The lock serializes competing writes so cached totals cannot overwrite each other with stale counts. Single vote updates preserve created_at and change updated_at. Terms/courses come from the public catalog allowlist, not untrusted user inserts. Never log parameter values.

## Rate limits and abuse

At the server/edge, rate-limit per scoped token hash (10 mutations/hour) and per short-lived keyed IP digest (60/hour), body-size limit and same-origin Origin validation; no permissive CORS. Use a distributed TTL-backed store/managed edge limiter, not per-instance memory counters on serverless deployments. Digest key rotates daily; entries expire within one hour. Do not store raw IP/UA in application tables. Read requests have a separate coarse limit and public cache. Return 429 with Retry-After, no academic details. Keep the feature disabled if distributed limiting is not provisioned. Captcha escalation is P2 and would require separate privacy review.

Token replacement can bypass duplicate mitigation, and shared NAT limits may affect several students. Explain rate-limit errors and allow later retry; do not silently suppress submitted votes or market counts as verified enrollment. No professor identifiers appear in the vote schema or UI. Change intent to off via DELETE, not a negative anonymous enrollment record.

## Aggregation and retention

Public output suppresses each signal below 5 independent scoped voters. Suppression is null/Not enough responses, not 0. Percent recommend = yes/total * 100, nearest integer, with denominator; workload uses three counts and median label (tie toward heavier). Publish a snapshot at most hourly to reduce single-vote differencing and cache it per term; low-count privacy is not guaranteed by threshold alone. Product planner ignores recommendation tie-breaks below 20 votes and above 30 days old.

Close voting 30 days after term end. Delete individual votes and token hashes 90 days after term end; retain only aggregate snapshots. Configure and test cleanup (host scheduler or database job), aggregate invalidation and secret rotation before launch. No automated academic-data job is ever needed. Infrastructure access-log policy must be documented; app-level pseudonymity does not hide network metadata from the hosting provider.

Timeout 3s, no background vote retry queue, public aggregate GET may retry once on user request. Missing keys, 503 or offline return a neutral unavailable state and zero community scoring. Required tests: malformed/extra fields, forged course IDs, duplicate/upsert/change/delete, concurrency, RLS denial for raw readers, secrets absent in bundle, distributed limiter, suppression, deletion and advisor behavior with service down.

Implementation follows the Supabase skill's migration workflow and current CLI/docs at T23; this document intentionally does not create a database, install packages or invent a migration filename. The changelog markdown endpoint was unavailable in this audit; recheck relevant backend changes when implementing.
