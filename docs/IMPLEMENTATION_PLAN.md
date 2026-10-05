# Implementation sequence

Architecture pass complete when the document set and contract/fixture checks pass. Implementation work is tracked in [TASKS.md](../TASKS.md); its IDs are authoritative dependencies. No unchecked implementation task below is claimed complete.

## Execution order and milestone exits

| Phase | Tasks | Deliverable and exit gate |
|---|---|---|
| 0 Audit | A00 (done), T01 | Record baseline, known data conflicts and synthetic fixtures; test tooling runs without changing runtime behavior |
| 1 Domain + data | T02–T06 | Strict types/schemas, versioned historical migration, rules/provenance, source validator, local repository; no invented hard rules/current term |
| 2 EN/DE foundation | T07–T08 | Translation parity, locale persistence, four-route shell, existing `/` remains usable |
| 3 My Progress | T09–T10 | Complete manual path, local persistence/import/export/reset; recovery profile entered and reloaded |
| 4 Deterministic advisor core | T11–T12 | Eligibility/action scoring, milestones and structured reasons pass unit tests; no LLM/network |
| 5 Joint optimizer | T13–T15 | Exact occurrences/metrics, complete group bundles, joint subset/group search, worker/cancel and alternatives |
| 6 Schedule integration | T16–T18 | Comparison, atomic Use this plan, existing schedule/filters and correct term-aware ICS work end to end |
| 7 Degree Map | T19 | Graph + accessible list + shared module drawer; component state matches Progress |
| P0 gate | T20 | P0 browser/privacy/accessibility/performance checks, accurate historical/current data state; manual student workflow fully useful |
| 8 Local transcript | T21–T22 | PDF.js extraction, deterministic matching/review and supported-format acceptance; manual fallback always available |
| 9 Optional Pulse | T23–T24 | Private-schema server voting API, policy tests, opt-in UI; flag remains off without credentials or operational controls |
| 10 Release | T25 | README/privacy/coverage notes, production build and release validation; no misleading data coverage |
| Later | T26–T27 | Optional PWA and secondary explanation interface; no impact on P0 completion |

Implement in that order. The overlap primitive T13 is needed before optimizer scoring is complete; no generated plan is considered finished in phase 4. Translations start early and every later task must add both locales. Test alongside each domain feature instead of postponing all verification to phase 10.

## Scope management

P0 is a usable local manual planner, not a claim of live 2026 offerings. If current term data is unavailable, preserve historical schedule and expose curriculum-only advice; publish exact current scheduling only when a verified package arrives. Do not use missing source material as an excuse to fabricate it. P1 transcript pipeline must not be labelled as supporting real HAW formats based solely on synthetic tests. T22's representative-format gate is an external content dependency; keep review-only preview available while obtaining a permissible fixture.

No credentials are needed for P0/PDF parsing. If Pulse credentials or rate-limit/log-retention controls are absent, T23 can deliver a local/mock-tested implementation and T24 stays feature-flagged. There is no reason to block the advisor. PWA is assessed as modest additional work but requires offline reload/update testing, so it is deliberately after release-critical features.

## Migration checkpoints and rollback

1. Baseline commit/tag or local checkpoint before runtime changes; keep any user work intact. No branch/commit is required by this architecture pass. When a branch is created, use `codex/` prefix.
2. Domain/data PR-sized change: old UI still uses legacy adapter, new validator reports known anomalies, reconciled historical package has source manifest.
3. Switch Schedule to occurrence selection only after comparison of chosen historical groups and ICS dates. Keep a temporary feature flag/adapter rollback during development, not two permanent engines.
4. Persistence migrations run transactionally and keep the previous valid profile until success. Never auto-migrate curriculum versions by matching names; use reviewed IDs/crosswalk and a change preview.
5. New term publication is a content change with independent validation, not an app release that silently overwrites older selections. Old profiles keep their selected term/version; stale selection prompts repair.

## Dependency policy

Use installed Next/React/Tailwind stack; do not migrate to Vite or a new framework. At T01/T25 check current official framework/security guidance and choose a minimal supported update only if necessary, with a separate validation record. Pin new library versions and commit lockfile in implementation. No heavy optimization solver or remote AI SDK. No premature backend for curriculum or student state.

## Handoff resources

* [PRODUCT_SPEC](PRODUCT_SPEC.md): scope and acceptance IDs.
* [AUDIT](AUDIT.md): source evidence, five overlap cases and reference decisions.
* [DATA_MODEL](DATA_MODEL.md) + [domain.ts](contracts/domain.ts): canonical data contracts and migration.
* [PLANNER_ALGORITHM](PLANNER_ALGORITHM.md): action generation, constraints, exact comparator, budget and search.
* [UX_SPEC](UX_SPEC.md): all nine screens, translations, errors and responsive/accessibility behavior.
* [TRANSCRIPT_IMPORT](TRANSCRIPT_IMPORT.md): local parser adapters and confidence/review policy.
* [PRIVACY](PRIVACY.md) + [COMMUNITY_PULSE](COMMUNITY_PULSE.md): data boundaries and optional schema/API.
* [TEST_PLAN](TEST_PLAN.md) + [recovery fixture](fixtures/recovery-scenario.json): acceptance oracles and required checks.

## IMPLEMENTATION HANDOFF FOR SOL

Architecture-pass verification: `node docs/check-spec.cjs` passed (12 Markdown documents checked, 21 local links, 28 acyclic task IDs and recovery-fixture invariants). `node node_modules/typescript/bin/tsc --noEmit --incremental false` passed for the existing app and specification contracts. `git diff --check` passed for tracked changes. No application feature tests or production build were claimed run; they are implementation tasks.

**Exact first task:** T01 in TASKS.md. Run the current app's TypeScript check, install/configure the pinned test tooling, create synthetic fixture builders and a passing baseline harness. Do not start by rewriting the home page.

**Exact sequence:** T01 -> T02 -> T03 -> T04 -> T05 -> T06 -> T07 -> T08 -> T09 -> T10 -> T11 -> T12 -> T13 -> T14 -> T15 -> T16 -> T17 -> T18 -> T19 -> T20; then T21 -> T22; optional T23 -> T24; T25 release gate. T26/T27 remain later.

**Important existing files:** Entities/ScheduleBlock.ts, Pages/Schedule.tsx, Components/schedule/*, lib/icsGenerator.ts, app/page.tsx/layout.tsx, Courses.md and newschedule.md (inspect locally, do not ship raw). New canonical types come from docs/contracts/domain.ts.

**Risky areas:** actual curriculum version/first-year roster, status text mixed into source markdown, alias EEL1 versus ELL1 and DI versus DS, all sessions of one group, five overlapping-source cases, ISO week-year/DST handling, unknown exam offerings, raw PDF memory/network boundaries, fake exhaustive search claims, restore/reset races and source/version drift.

**Must not change:** student-owned/local academic data boundary, deterministic core, existing framework and ScheduleHAW identity, historical schedule access, explicit distinction between recommended and hard rules, and passed lab/exercise progress when an exam is failed. Never send private inputs to Pulse/AI or promote uncertain data into hard regulation.

**Definition of done:** all P0 tasks and tests pass, the manual recovery flow works in EN/DE with backend disconnected, feasible plans populate the exact schedule and correct ICS, strict data validation holds for verified packages, uncertainties/current-term gaps are visible, and no privacy leak occurs. P1 adds genuinely validated transcript-format coverage; Pulse may remain disabled. Production release claims must match the actual source and test coverage.
