# ScheduleHAW V2

A local academic planner for HAW Hamburg Information Engineering. Enter component progress, generate deterministic Safe/Balanced/Aggressive alternatives, choose exact parallel groups, inspect the timetable and export a calendar. English and German are supported throughout the core flows.

**Academic profiles stay in this browser.** Grades, failures, transcript contents, selected groups and personal schedules have no server API. The core requires no account, database, inference service or API key.

## Using the app

1. **My progress:** review exams, labs, exercises and other components. Unknown progress never means passed. A passed lab/exercise with an outstanding exam becomes Exam only and consumes no new lab capacity. Optional grades, attempts and notes remain local.
2. **Advisor:** select goal, lab/workload limits and schedule preferences. Compare real group/date combinations, workload charts, potential credits, milestone previews, omissions and deterministic explanations. Internship priorities outrank social preferences. Budget-limited searches and identical alternatives are labelled. A separate bounded conflict preview cannot be applied.
3. **Schedule:** use a feasible plan to populate its exact groups and sessions. Manual course/group selection, weeks, course/type/instructor filters, full-term conflicts, mobile agenda and whole-selection/current-view ICS exports remain available. Calendar dates derive from the term and use Europe/Berlin daylight-saving conversion.
4. **Degree map:** inspect components, prerequisites, offerings, sources and future dependencies in the graph or accessible list. Actions open progress, planning priorities and group comparison.

My progress also offers local JSON export, reviewed replacement import and reset. Export before clearing site data or switching origin/device; there is no cross-device sync. A browser storage failure is visibly memory-only, so export before closing.

## Data, PDF and offline limits

- WS 2025/26 is explicitly historical: 212 source rows expand to 877 actual occurrences. Five same-code overlap pairs yield seven dated review cases; quarantined bundles are excluded from ready plans and remain inspectable manually.
- WS 2026/27 has no supplied timetable and is unavailable. Curriculum-only priorities still work; historical dates are never presented as current.
- The versioned public curriculum is provisional. Applicable regulation, Study Methods completion, elective credit/slot allocation and assessment dates require confirmation. Unknown facts remain issues and unverified prerequisite edges remain advisory. The ten-module public first-year roster differs from the eleven-module synthetic test fixture.
- Local PDF import is **Preview — check every match**. PDF.js and its same-origin worker run locally; each accepted row is reviewed/corrected before saving. Limits: 10 MiB, 80 pages, 50,000 text items. Unsupported/corrupt/encrypted/scanned documents use manual fallback. No remote OCR/upload exists. A permitted representative anonymized HAW transcript is still needed to certify real-format coverage.
- The PWA caches public code/static documents, never academic payloads or API responses. After online installation, full reloads and academic tools work offline. Updates activate on explicit reload; failed installs preserve the previous release. Historical warnings remain visible offline.

## Development and validation

Use Node.js 22:

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. Release commands:

```sh
npm run validate:data
npm run validate:i18n
npm run lint
npm run typecheck
npm test
npm audit --omit=dev
npm run build
npx playwright install chromium
npm run test:e2e
```

`npm run start` serves the built app; `TEST_BASE_URL` selects an already running local/deployed build. Tests use invented local data and do not submit community votes. GitHub Actions runs the validation gate. Next.js 16 explicitly uses webpack for the planner worker; postinstall copies the PDF worker and postbuild creates the public offline cache.

## Optional Community Pulse

Course-only intent, recommendation when eligible and workload; no comments or professor ratings. It is **off by default** because no suitable configured Supabase backend was available. See [.env.example](.env.example), [migration](supabase/migrations/20261005214317_community_pulse_private.sql), [hourly maintenance](supabase/maintenance.sql), and [activation steps](docs/IMPLEMENTATION_REPORT.md#community-pulse-activation).

Secrets stay server-only. Activation requires a dedicated PostgreSQL role, RLS, distributed limits, retention scheduling and live verification. Signals below five responses are hidden; planner tie-breaks require twenty fresh responses and cannot override academic priorities. Academic changes never automatically request or submit community data.

## Deployment

The existing Vercel project is `schedule-haw` under `zyrex24s-projects`, for [Zyrex24/ScheduleHAW](https://github.com/Zyrex24/ScheduleHAW). The requested domain is [schedulehaw.ahulir.com](https://schedulehaw.ahulir.com). Its external DNS must set `A schedulehaw → 76.76.21.21`, exactly as Vercel requested. Verified production/fallback addresses and results are in the [implementation report](docs/IMPLEMENTATION_REPORT.md).

Vercel requires its [GitHub App](https://github.com/apps/vercel) installation/access before this repository can connect for automatic main-branch deployments. Connect Git in this existing project after installation; do not create another project. `.vercelignore` excludes the original local academic markdown notes from uploads, and `.gitignore` excludes secrets/generated assets.

Further documentation: [product](docs/PRODUCT_SPEC.md), [architecture](docs/ARCHITECTURE.md), [privacy](docs/PRIVACY.md), [data model](docs/DATA_MODEL.md), [algorithm](docs/PLANNER_ALGORITHM.md), [task acceptance](TASKS.md), and [implementation report](docs/IMPLEMENTATION_REPORT.md).

## License

MIT.
