# ScheduleHAW academic planning upgrade

Status: implementation contract, architecture pass, 2026-10-05. No application feature is implemented by this document set. Start with [TASKS](../TASKS.md); evidence and unresolved source questions are in [AUDIT](AUDIT.md).

## Product boundary

Evolve the existing Next.js student timetable into a local academic planner for HAW Hamburg Bachelor Information Engineering. Keep the bold ScheduleHAW visual identity and existing selection, groups, week view, filters and calendar download. No account, student identity, administrator workflow, advisor approval or AI service is required. Code computes completion, eligibility, priorities, group choices and explanations.

The four destinations are **Advisor / Studienplanung**, **My Progress / Mein Studienstand**, **Schedule / Stundenplan**, and **Degree Map / Studienverlaufsplan**. `/` remains Schedule for existing links; `/schedule` is the canonical Schedule route. Onboarding is dismissible and never prevents schedule browsing.

## Outcomes and acceptance

| ID | Required outcome | Acceptance evidence |
|---|---|---|
| P-01 | Manual setup is a complete onboarding path | No file/account requested; component changes survive reload; six exam-backlog modules consume zero new labs |
| P-02 | Correct academic state | Lab/exercise/project outcomes are independent of exam outcomes; no automatic credit for a partial module |
| P-03 | Three deterministic plans | Safe, Balanced and Aggressive are compared with groups, reasons, workload, conflicts and conditional credits; duplicate alternatives are honestly identified |
| P-04 | Academic priorities first | Internship goal ranks remaining first-year requirements ahead of ordinary later modules; social preferences cannot defeat hard rules |
| P-05 | Exact timetable feasibility | Partial overlap is detected on actual dates; rotating groups on different dates do not conflict |
| P-06 | One-click integration | Use this plan atomically replaces the active term selection and opens Schedule; rollback/undo is available |
| P-07 | Useful degree map | Components, hard/recommended edges and milestone progress are available in graph and accessible list views |
| P-08 | Local transcript review | Text PDF parsing runs locally; each proposed change is editable and reviewed before one atomic save |
| P-09 | Portable private profile | Versioned JSON export/restore/reset works, including offline and storage-error handling |
| P-10 | EN + DE | All controls, explanations, warnings, empty states and accessibility labels have both languages |
| P-11 | Term-aware export | Full selected term exported independently of display filters; date/year/timezone tests pass |
| P-12 | Optional public pulse | Course-only explicit votes; no instructor ratings/comments; disabling backend leaves P-01 through P-11 functional |

## State and terminology

Do not equate enrollment, attendance, assessment and degree credit. A lecture is a teaching session; an exam is an assessment component. A passed lab is banked progress, not proof that an exam was passed. "Exam only" means all known required non-exam components are passed and one or more exams remain; it does not guarantee exam registration eligibility or a published exam date.

Show **earned credits** only from confirmed completed requirements under a resolved curriculum version. **Potential additional credits** are modules whose remaining requirements are all targeted by the plan, conditional on passing. **Planned workload** is a separate estimate, including exam preparation even when no lecture is attended. Lab-only banking contributes zero potential module credits unless it is the final missing requirement. Unknown credit totals appear as a known subtotal plus an unknown count, never zero.

Student data defaults to unknown/unreviewed, not failed. Bulk "Completed" explicitly marks every required component passed in a reviewed module; it is unavailable if completion requirements are unresolved. Fast "Lab passed; exam outstanding" sets only those named components. Grades, attempt counts and notes are optional. No GPA or attempt-limit policy is invented.

## MVP and staged delivery

P0 delivers verified domain/data foundations, bilingual manual progress, deterministic plans and exact group optimization, schedule integration/ICS, accessible degree map and the test/privacy gates. P1 adds browser transcript extraction and a deterministic adapter for supported text layouts. This is the target release following the P0 cut. Community Pulse is P1 but ships disabled unless its backend/privacy tests and credentials are available. PWA and AI explanations are P2; neither delays the local planner.

Current repository data belongs to **2025-ws**. It is usable as a clearly labelled historical term. The application may identify the calendar's current term as 2026-ws, but must show "Timetable not yet available" until an independently verified package is supplied. Do not copy 2025 dates, instructors or availability forward. Academic progress and curriculum-only priorities still work without term data; no exact group plan is claimed in that state.

## Required plan contents

Each card shows selected modules and targeted components, exact group labels, new lab count, other new PVL count, exam-only modules, conditional additional credits, workload hours with estimate quality, hard/soft conflict occurrences, campus dates, heavy days/weeks, longest day, idle gaps, newly satisfied prerequisite conditions and milestone before/after preview. Reasons and omissions link to module details and rule sources. Actual and hypothetical progress are visually distinct.

Safe and Balanced have no mandatory-session conflicts. Aggressive increases workload, never silently violates rules. A separate conditional Aggressive proposal may expose one exceptional date collision; it cannot be applied until the student supplies a revised schedule that passes validation. The app never suggests that an exception is institutionally approved.

## Non-goals

No administrative portal, national ID/login, professor ranking, public text comments, university registration integration, guaranteed passing predictions, automatic transcript upload, remote academic backup, or full multi-year optimization. A local what-if preview is supported by cloning state in memory and running the same engine; it never marks real progress passed.

## Definition of useful

The recovery fixture can be entered manually, produce explainable feasible options, populate existing Schedule and download an accurate calendar with all network requests blocked after public assets load. Every unresolved input is visible and does not become an authoritative fact. See [TEST_PLAN](TEST_PLAN.md) for measurable gates.
