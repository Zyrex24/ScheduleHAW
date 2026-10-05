# ScheduleHAW V2 implementation report

Release: 6 October 2026. This report supersedes the architecture handoff's statements that runtime work has not started; the original documents remain the specification and source-gap record.

## Product delivered

Component-aware manual progress; exam-only derivation; transactional IndexedDB, revision/reset protection and memory fallback; reviewed JSON backup/import/reset; English/German shell and four direct routes; deterministic academic tiers and eligibility; joint complete action/group search; Safe/Balanced/Aggressive alternatives; separate non-applicable collision preview; worker cancellation/freshness checks; reasons/omissions/conditional milestone previews; exact plan application and Undo; manual group/week/filter timetable, mobile agenda and full-term conflict inspection; standards-compliant ICS; interactive degree map plus accessible list/actions; local reviewed PDF preview; optional disabled Pulse API/UI/schema; installable public-only offline PWA.

No inference API, analytics, transcript upload, academic server action or profile endpoint exists. Core functions require no environment variables or credentials.

## Data and implementation decisions

Production browser verification caught a hosting-only offline packaging bug: npm postbuild generated the worker after Vercel had captured public outputs, leaving uploaded local chunk names in production. Generation now runs through Next's [production compiler hook](https://nextjs.org/docs/architecture/nextjs-compiler), using the same build ID assigned to Next before output packaging. Browser tests additionally verify every cache-listed asset exists, so a stale worker fails with exact missing paths instead of hanging installation.

Linux CI/Vercel initially rejected a Windows-derived lockfile because optional WASM dependency entries were missing. The lock was regenerated without installed-package state, followed by a clean Windows install and successful npm 10 Linux-resolution dry run; final remote gate results are recorded in the release verification section.

The public historical package accounts for all 212 source rows/123 codes, 47 module/teaching-opportunity identities, 69 components, 212 session series and 877 actual occurrences. Migration reads allowlisted public timetable fields, never personal markdown outcomes. Five same-code overlap pairs yield seven dated review cases; affected bundles are excluded from ready plans and inspectable manually. No current 2026/27 timetable was available.

The public first-year roster is ten modules/60 ECTS; the eleven-module recovery fixture is explicitly synthetic. Study Methods completion, elective credit/slot crosswalks and applicable regulation still need confirmation. WPP33/WP33 have different observed titles and remain separate uncertain opportunities without inferred credit. Unverified prerequisites remain advisory. Unknown exam dates are preparation warnings, never fabricated sessions. Workload estimates and potential credits are conditional, not certified workload or guaranteed attainment.

Migration/validators use `.cjs` because the Windows TypeScript runner failed reading user information. Runtime/contracts remain TypeScript. `Pages/Schedule.tsx` is preserved in `Legacy/Schedule.tsx` to avoid an unintended second Next route. An exact pathname proxy preserves `/Schedule` access without the case-insensitive redirect loop detected by tests.

Sorted actual-date sweeps and bounded DFS replace the proposed precomputed bitsets/memoization. An exhaustive Cartesian oracle verifies small-fixture optimum agreement. Node budgets apply separately to each policy and conditional search, and coverage is explicitly reported. Conditional previews permit only one required collision of at most 30 minutes while preserving academic/lab/hour restrictions; they have no apply action. PDF limits are 10 MiB/80 pages/50,000 items; encrypted documents use manual fallback. Real HAW format acceptance remains unchecked until a permitted representative anonymized sample is validated.

## Validation

Clean `npm ci` completed. Both validators passed (47 modules / 69 components / 212 series / 877 occurrences, 255 bilingual messages), ESLint and TypeScript passed, all **28 unit/database tests in ten files passed**, and the webpack production build completed with all four direct pages generated. All **four Chromium browser flows passed** in 17.2 seconds locally, including zero serious/critical WCAG A/AA findings on all German 320px routes. The offline flow generated/applied a plan and downloaded a parseable ICS after full offline reload, with a private note marker absent from every request and cached response. Final screenshot review prompted only small mobile language-control/group-label polish.

Final clean-install and production/browser results passed as recorded below. Tests cover manual recovery → plans → exact schedule → independently parsed ICS → backup/reset/restore; browser PDF extraction → correction → confirmed save → plan; German 320px routes/accessibility; and full offline reload with local persistence. Unit tests also exercise exhaustive search, source validation, prerequisite timing, cap/conflict boundaries, PostgreSQL roles/upserts/retention, service-worker atomic installation/failure/explicit activation/previous-version retention and private-request bypasses.

`npm audit --omit=dev` reports **zero production vulnerabilities** following the Next.js 16.3.8 / React 19.3.0 / PDF.js 6.4.299 upgrade. The complete development audit still reports five high-severity advisories in the Next ESLint glob/braces chain, which runs over trusted repository files and is absent from production dependencies. ESLint 9.39.5 is the compatible major for the installed Next lint plugins; upstream development-tool updates need follow-up. This report does not claim a clean full development audit.

Academic browser flows assert zero non-GET requests and no browser exceptions. PWA caches contain allowlisted public paths only and never API/profile responses. CSP permits only same-origin connections/workers, with inline script/style allowances for static Next hydration and React Flow; it is not described as a nonce-based policy.

## Deployment and external activation

Existing project: `schedule-haw`, ID `prj_6lPT3llpYU2MgwB8c98Qfnoy4vlW`, team `zyrex24s-projects`; Node.js 22, install `npm ci`, build `npm run build`. No existing environment variables were configured. Deployment identity, source commit and HTTPS verification are recorded in Release verification below.

`schedulehaw.ahulir.com` is added and ownership verified in Vercel. Its external GoDaddy DNS still needs the **exact Vercel-provided** record:

| Type | Host in ahulir.com | Value |
| --- | --- | --- |
| A | schedulehaw | 76.76.21.21 |

Set that subdomain record externally, then verify Vercel configuration/HTTPS. Retain the old ScheduleHAW address until the new domain works; afterward redirect only the old ScheduleHAW subdomain. Unrelated root domains remain untouched. Profiles are origin-scoped: export at the old origin and import at the new origin when moving.

The existing project had no Git link. Both official CLI connection attempts and the project-link API returned **install the GitHub integration first**. Install [Vercel for GitHub](https://github.com/apps/vercel), grant access to `Zyrex24/ScheduleHAW`, then connect Settings → Git in the existing project, production branch `main`. Alternatively run `npx vercel@latest git connect https://github.com/Zyrex24/ScheduleHAW.git --scope zyrex24s-projects` from this linked checkout. Verify a subsequent documentation commit automatically deploys. GitHub CI is supplied, but no broad deployment token is embedded in Actions and unavailable account integration is not claimed connected.

## Community Pulse activation

No suitable configured Supabase project/connection/secret was available. UI flag and server config fail closed. Embedded PostgreSQL tests exercise actual privileges, unique vote upserts, rate buckets and cleanup SQL, but do not certify live Supabase deployment or multi-connection concurrency.

1. Apply `supabase/migrations/20261005214317_community_pulse_private.sql` to the intended project; keep `pulse_private` outside exposed Data API schemas. Run Supabase security/performance advisors.
2. Provision the dedicated `pulse_api` role's random password separately; never grant it to `anon`/`authenticated`. Set its pooled URL in server-only `PULSE_DATABASE_URL`, a random server-only `PULSE_HASH_SECRET` (at least 32 bytes) and `PULSE_HASH_KEY_VERSION=1`. Do not use a broad service-role connection in the app.
3. As operator, populate genuine public `course_terms` IDs, closing 30 days after term end and purging 90 days after term end. Historical voting can remain closed; the API role cannot edit this allowlist.
4. Schedule `supabase/maintenance.sql` hourly with an operator/database scheduler. It uses the mutation lock convention, retains aggregate snapshots, closes voting and deletes expired raw votes/token hashes/rate buckets. Operator credentials remain outside public app variables.
5. Verify live simultaneous vote/change/delete/cleanup, raw-role denial, 429 limits, low-count suppression, retention and hosting access-log policy. Snapshots publish at most hourly; fewer than five responses are suppressed; the planner requires twenty recommendations no older than thirty days and uses only a bounded final tie-break.
6. After those gates pass, set `PULSE_RETENTION_VERIFIED=true` and build-time `NEXT_PUBLIC_COMMUNITY_PULSE_ENABLED=true` in the existing Vercel project and redeploy. Missing keys remain unavailable; academic operations never automatically submit votes.

## Release verification

- Deployed code commit: [`0091540927f94f37d684c5c221381fcb8bb5b1ed`](https://github.com/Zyrex24/ScheduleHAW/commit/0091540927f94f37d684c5c221381fcb8bb5b1ed), pushed to `main` after implementation and cross-platform/offline repairs. Subsequent report-only commit changes no deployed runtime code.
- Existing Vercel project remains `schedule-haw`. Final production deployment is `dpl_5PHg2TpeftKzgUbznDzKSSPrU7ax`, **READY**, generated address `https://schedule-o2zyaqrd6-zyrex24s-projects.vercel.app`. The generated deployment retains existing Vercel authentication protection.
- Public HTTPS application: [schedule-haw.vercel.app](https://schedule-haw.vercel.app/advisor). `/`, `/advisor`, `/progress`, `/schedule` and `/degree-map` returned HTTP 200 with the expected production CSP; `/Schedule` redirects correctly. The user-facing custom domain is configured but cannot resolve until external DNS is fixed.
- [Full Linux GitHub CI passed](https://github.com/Zyrex24/ScheduleHAW/actions/runs/37383987817): clean npm install, both validators, lint, typecheck, all 28 unit/database tests, zero production dependency advisories, build and all four browser flows.
- Final **production** Chromium suite: **4/4 passed in 18.3 seconds**. It exercised desktop manual planning/calendar/backup restoration, actual browser local PDF extraction/correction, German 320px navigation and all direct routes with no serious/critical WCAG A/AA findings, plus complete offline reload → generate → apply → ICS. Every cache-listed production asset returned success. A private note marker appeared in no request or cached response; academic flows submitted zero mutations/API requests and recorded no browser exceptions.
- Production worker cache ID `d75d967f-290f-4a33-84a9-d3937a3b13ea` matches the Vercel compiler build; `/sw.js` is served with `no-cache`. Generated caches contain 47 public assets in this cloud build. Local builds may have a different count because platform output differs; tests verify actual asset availability rather than a hardcoded count.
- The requested `schedulehaw.ahulir.com` alias is attached to this production deployment. Latest Vercel domain inspection again supplied `A schedulehaw.ahulir.com 76.76.21.21`; HTTPS DNS resolution still returns `ENOTFOUND`. Old alias assignments, including unrelated root assignments already belonging to this project, were not edited or redirected. The old ScheduleHAW subdomain also does not currently resolve; the verified `.vercel.app` address is the available fallback.
- Automatic GitHub → Vercel connection remains blocked by the account's missing Vercel GitHub App installation. Live Pulse remains disabled pending backend/secret/operator-retention verification. T22 representative transcript acceptance remains unchecked. Current-term/source uncertainties and the development-only audit caveat are documented above.

Final self-review checked source/bundle privacy boundaries, intentional input/configuration disabled states, real route/actions, translated core controls, exact date/group handling, deployed cache coherence, supported runtime dependencies and a clean tracked working tree before this report update. No production TODO/FIXME/coming-soon implementation stub remains in the core flows.

## Local commands

Node.js 22: `npm ci`, `npm run dev`. Release: `npm run validate:data`, `npm run validate:i18n`, `npm run lint`, `npm run typecheck`, `npm test`, `npm audit --omit=dev`, `npm run build`, `npx playwright install chromium`, `npm run test:e2e`. `npm run start` serves production locally; `TEST_BASE_URL` selects an existing build for browser verification.
