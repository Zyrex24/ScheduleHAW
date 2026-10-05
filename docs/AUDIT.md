# Repository and evidence audit

Audited 2026-10-05. Local ScheduleHAW HEAD: `4cae649bc821a9486623cea08aef5cbdbc42bb87`. Working tree initially clean. No applicable AGENTS.md found in the repository or immediate parent. Inspection and TypeScript checks used the existing installation; no dependency upgrades or app edits made.

## ScheduleHAW, inspected source

| File | Observed behavior | Decision |
|---|---|---|
| `package.json`, `package-lock.json` | Next 14 / React 18 / strict TypeScript / Tailwind / Radix; dev, build, start, lint only | Keep stack; introduce tests incrementally; separately check framework maintenance before deployment |
| `app/page.tsx`, `app/layout.tsx` | Single schedule entry; root document language always en | Preserve `/`; shared client provider and four route shells |
| `Pages/Schedule.tsx` | Hook state only; empty until course selection; week defaults 41; filters before conflict display | Shared persisted term selection; term-wide conflict computation before visual filters |
| `Entities/ScheduleBlock.ts` | 212 rows, 123 distinct exact course codes, IE1–IE7; `get()` waits artificially 800 ms | Archive historical source, split curriculum/offerings/occurrences; remove simulated delay |
| `Components/schedule/ConflictDetector.tsx` | Groups by identical weekday/start/end, then counts common week numbers | Replace with pure pairwise occurrence interval overlap; current implementation misses partial overlaps and may attribute a pair conflict to the whole group |
| `Components/schedule/ScheduleGrid.tsx` | Fixed slot boundaries and minimum width 1200px | Minute-based placement and overlap lanes; mobile agenda. Source contains 12:00–14:00, unsupported by slot lookup |
| `Components/schedule/ScheduleFilters.tsx` | Hard-coded weeks; calendar uses already week-filtered block list | Separate view filters from saved selection and explicit export scope |
| `Components/schedule/WeekTimeline.tsx` | Week list fixed; obsolete 2024/25 comment | Derive ordered ISO week-year pairs from term dates |
| `Components/schedule/ScheduleBlock.tsx` | Course colors, room/instructor, week timeline | Reuse visual vocabulary and useful display fields |
| `lib/icsGenerator.ts` | Hard-coded years/calendar title/holiday; floating times; UID lacks term/year; no DTSTAMP or line folding | Replace internals behind download API; explicit Berlin-to-UTC dates and stable occurrence IDs |
| `Courses.md`, `newschedule.md` | Scraped portal structures, catalog/assessment/timetable clues; historical 2025/26 term; personal status/earned-credit fragments mixed with public data | Local source inspection only, never bundle these raw files or derive default student progress from them |
| `Components/ui/*`, `app/globals.css`, `tailwind.config.ts` | Existing accessible primitives and brutalist design | Reuse; consolidate tokens and verify contrast/focus |

The original calendar expands all weeks of each block even though its input has already been filtered to one display week: exported membership can depend on the selected week while exported events extend beyond it. Its week-to-year function ignores its year argument. `X-WR-TIMEZONE` alone does not give floating DTSTART/DTEND a timezone. Holiday DTEND is exclusive, and source date claims must be reconciled rather than repeated.

## Concrete migration anomalies

An in-memory evaluation of the existing typed array found these five same-code overlap pairs (they are review cases, not five proven mistakes):

| Code | Common legacy weeks | Intervals |
|---|---|---|
| IE2-SOL2/04 | 4 | 12:10–15:40 twice |
| IE6-BUL/04 | 2 | 15:55–19:10 twice |
| IE6-DCL/01 | 45 | 12:10–13:40 and 12:10–15:40 |
| E7-WPP22-Schulz | 3 | 12:10–15:40 twice |
| E7-WPP34-Radt | 48, 51, 4 | 12:00–14:00 and 12:10–15:40 |

Only identical complete occurrence records may be deduplicated automatically. Different instructor/room/time may mean combined teaching or inconsistent source; keep both evidence records and quarantine from verified optimizer input until resolved. Source comments, `weeks` and scraped exact recurrence endpoints can disagree. Re-expanding dates must not silently reproduce existing mistakes.

Schedule codes are not module IDs: `IE2-MAE2/01` is an exercise group for MA2, `IE3-DI` means Digital Circuits while `IE4-DS` means Digital Systems. Use explicit alias tables, not remove-the-letter-L heuristics. Elective codes embedding instructor names are term identifiers, never stable degree identities. `IE5-SP` is not evidence of a fifth-semester curriculum rule. E2-LP and IE1-LSL2 require a source-backed mapping, not an invented module.

## Reference inspection and decisions

Inspected Git tree and files at [Smart-Academic-Advisor f8bfbe3](https://github.com/SheedoM/Smart-Academic-Advisor/tree/f8bfbe3393c5f817004abacfa12eb6445bd539ba). No cloning or code copying. Reference license is Apache-2.0; ScheduleHAW is MIT. Any later copying requires separate license review; this handoff reimplements concepts.

| Reference file | Actual design | Adaptation |
|---|---|---|
| `src/lib/roadmapLogic.ts` | Eligibility then weighted sorting: failed +100, direct dependent +50, mandatory +25; greedy load fill, textual logs | Keep pure eligibility/ranking/explanation separation; use component actions, versioned rules, milestone priorities and joint subset/group search |
| Same | GPA determines 12/19 load; `HOURS_70`, summer restriction; some helpers read global COURSES even with alternate coursesInput | Reject institution-specific rules; inject one immutable dataset throughout so simulations cannot mix catalogs |
| `src/types/index.ts` | Passed/failed course lists, majors CS/IT/IS, bucket totals | Reject flat completion and Damietta categories |
| `src/components/PrerequisiteGraph.tsx` | React Flow nodes/edges and prerequisite-depth layout; course completion coloring | Reuse concept; component-aware statuses, solid/dashed edges, milestones and accessible list. Avoid setting state inside useMemo |
| `src/components/StudentPlanEditor.tsx` | Editable course bank, missing-prerequisite warnings, fixed 9–19 credit validity | Keep local what-if editing; no inherited load thresholds, approval workflow or rules |
| `src/components/StudentProfileView.tsx` | Progress, draft/approved plans, tickets and administrative actions | Keep student progress/plan comparison concepts only |
| `src/context/StudentContext.tsx` | localStorage multi-student records keyed by national ID | Reject identity/admin model; one anonymous local profile, transactional IndexedDB |
| `src/lib/gemini.ts` | Sends transcript text/known codes to Gemini; reads VITE client API key | Entirely excluded; local deterministic parser and no AI dependency |
| `package.json` | Vite/React, React Flow, Gemini, drag/drop | No framework transplant; React Flow alone is a suitable optional UI dependency |

The reference roadmap contains no exact-date group combination solver. Its useful graph and scoring concepts do not resolve this project's main scheduling problem.

## Source register and unresolved facts

Use these stable source IDs in data provenance; accessed 2026-10-05:

* `repo-4cae649`: local paths above. Historical timetable evidence, not authoritative regulation.
* `haw-handbook-2024`: [official module handbook dated 01.04.2024](https://www.haw-hamburg.de/fileadmin/International/PDF/PDFs_Ingrid/modulehandbook-IE_2024.pdf). Printed pp. 18–19 identify EE2/EL1 prerequisites as recommended; pp. 40 and 51 describe SP and CJ1. SP semester differs from the repository, and study-method components need curriculum-version reconciliation. Do not merge versions blindly.
* `haw-internship-2026`: [faculty internship guidelines, §4, p. 2](https://www.haw-hamburg.de/fileadmin/Fakultaet_EMI/PDF/Guidelines_Internship_EMI_20260318.pdf). First-year coursework, PVLs and exams must be complete; a missing single requirement may allow an exception request. The app cannot grant that exception.
* `haw-student-page`: [official program student page](https://www.haw-hamburg.de/en/bachelor-information-engineering-students/). Use to locate regulations applicable to the selected curriculum/cohort before activating hard rules.

No verified 2026-ws offering package and no representative anonymized transcript PDF are present in the inspected workspace. Portal text is not a proven transcript layout. These are content gaps with defined fallbacks, not permission gates: keep historical schedule accessible; use unknown availability, review-only ambiguous parsing and manual progress. Do not claim production transcript-format coverage until a representative approved/redacted fixture passes.

Hard-rule activation requires source locator + applicable curriculum version + human data-maintainer verification. For the first-year milestone, ship an advisory readiness checklist if the exact first-year roster/version remains unresolved. This checklist still drives the internship goal but never claims official eligibility. Hard prerequisite filtering is implemented and tested against synthetic fixtures independently of uncertain HAW edges.

## Baseline validation

`node node_modules/typescript/bin/tsc --noEmit --incremental false` passed on the unmodified app. No test runner existed. No build, browser or deployed behavior has been claimed as tested during this architecture pass. Documentation/model checks are recorded in the implementation handoff after creation.
