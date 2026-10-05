# Test and acceptance plan

This pass supplies test specifications and an anonymized scenario, not a claim that future application features have passing tests. Use Vitest for pure functions, fake-indexeddb/Testing Library for persistence/UI and Playwright for end-to-end, timezone, privacy and offline checks. Test data is synthetic; never use the mixed personal status text in source markdown.

## Executable fixture seed

[fixtures/recovery-scenario.json](fixtures/recovery-scenario.json) is the normative recovery scenario. T01 expands its explicit records into synthetic `Curriculum`, `TermDataset` and `StudentProfile` contracts. Test curriculum evidence is marked fixture-only and cannot enter production data. Other first-year requirements are explicitly passed in the fixture; this makes the expected remaining priority set unambiguous. In real profiles absent records remain unknown.

Use a second independent synthetic requirements fixture for hard/recommended prerequisites, OR/at-least requirements, elective assignment and before-assessment timing. Do not invent a hard HAW edge just to satisfy a test. Dates in optimizer fixtures are invented test cases in 2026/27, never published offerings.

## Unit acceptance matrix

| Test ID | Inputs / assertion | Target |
|---|---|---|
| U01 | 08:10–11:25 and 09:55–13:40 on same date => 90 overlap minutes | overlap |
| U02 | Same intervals/weekday on alternating dates => zero conflicts | occurrence expansion + overlap |
| U03 | End 09:40, next starts 09:40 => no conflict; invalid reversed interval rejected | overlap/schema |
| U04 | Same numeric ISO week in different years => distinct dates; Jan 4 ISO conversion handles year boundary | occurrences |
| U05 | Passed lab + failed exam => Exam only + Failed exam, 0 new labs, no earned module credit | status/actions |
| U06 | Failed lab + failed exam => Lab missing, 1 new lab when targeted; exercise analogue | status/actions |
| U07 | Absent progress => Needs review, never passed/failed; unsupported completion expression => unknown | requirements |
| U08 | Unmet verified hard participation prerequisite excludes action; recommendation warns and allows it | eligibility |
| U09 | Same-term target cannot satisfy before-term hard rule; before-assessment uncertainty stays conditional | eligibility |
| U10 | Recovery internship priority top set MA2, EE1, EE2, EL1; reasons identify first-year milestone | rank |
| U11 | SS1, DI, AD, OS plus MA2/EE1 exam-only targets together consume 0 new labs | actions |
| U12 | User cap 2 applies to every ready/conditional policy; one lab with four sessions counts once | search |
| U13 | Passed exercise/lab excluded from new workload; remaining exam preparation still >0 | workload |
| U14 | Whole-module completion credits once; bank-only action credits zero unless last requirement; unknown credits reported separately | credits |
| U15 | Elective counted toward only one slot; incompatible assignment rejected; graduation remains unknown without verified requirements | credits |
| U16 | Group bundle includes intro and every recurrence, with allowed-pair restrictions across choices | selection |
| U17 | No first-group greedy trap: lower-ranked group permits more tier-A progress than earliest group | search |
| U18 | Exhaustive brute-force oracle for <=6 modules equals pruned search optimum under same comparator | search |
| U19 | Same inputs, budget and IDs => byte-identical canonical output except requestId; no locale dependence | planner |
| U20 | 200k node budget => explicit incomplete metadata; zero fake optimality claim; deterministic prefix result | search |
| U21 | Equal-total-contact schedules: even chooses balanced weeks, compressed chooses fewer active weeks with non-heavy peaks | metrics |
| U22 | Mean/variance includes zero-session teaching weeks; overlap union avoids double-counting; campus days count actual dates | metrics |
| U23 | Friend/pulse changes never override eligibility or higher academic tuple; stale/low-N pulse has score zero | rank |
| U24 | Enough feasible targets: Safe <= Balanced <= Aggressive caps and at least two distinct selections; constrained singleton => duplicate explanation | alternatives |
| U25 | Mandatory collision cannot be applied; one bounded aggressive exception shown separately; acknowledgement cannot validate it | applyPlan |
| U26 | Save/reload manual profile; quota/memory-only path; interrupted transaction leaves previous version intact | repository |
| U27 | Restore future schema/duplicate IDs/prototype fields invalid; replace is atomic; schema migration preserves banked components | persistence |
| U28 | Revision conflict, reset epoch and stale worker cannot restore cleared/older data | orchestration |
| U29 | 2026-10-19 08:10 Berlin => 06:10Z; 2026-10-26 08:10 => 07:10Z; 2027 January events retain 2027 | timezone/ICS |
| U30 | Full-term ICS identical across UI filter/week changes; stable term-scoped UIDs, DTSTAMP, CRLF, correct escaping/folding | ICS |
| U31 | Independent ICS parser roundtrip preserves umlauts, punctuation and actual event count; optional all-day break end exclusive | ICS |
| U32 | Duplicate module/group IDs, cycles, dangling refs, malformed date/group IDs, overlap variants => expected validation issue/severity | data validator |
| U33 | Mixed source personal statuses never appear in normalized public packages; every old row accounted for | migration |
| U34 | Exact code beats name similarity; EEL1 != ELL1; admitted != passed; unknown result never inferred from grade alone | parser |
| U35 | Multi-column/repeated headers, ambiguity, conflicting retakes and preexisting pass => review, no silent overwrite | parser/merge |
| U36 | Image-only, corrupt, encrypted, oversize, cancel => safe manual fallback or memory-only prompt; no partial save | extraction |
| U37 | EN/DE exact key and placeholder parity; reason registry covered; no hard-coded visible engine sentences | i18n |

U21 concrete oracle: four non-break teaching weeks and same 360-minute total. Group Even = [90,90,90,90]; Group Compressed = [180,180,0,0]. No other penalties, same academic targets. Even variance selects Even; compressed active-week cost selects Compressed. A [1440,0,0,0] heavy-week candidate is tested separately with thresholds visible.

## Integration and browser flows

| ID | Flow | Required assertions |
|---|---|---|
| I01 P0 | Fresh visit -> manual setup -> recovery progress -> generate -> choose -> Schedule -> calendar | No PDF/account required; correct badges; six backlog labs absent; exact chosen bundles populated; reload preserves selection; exported occurrence IDs/dates match selection |
| I02 P1 | Synthetic text PDF -> PDF.js -> adapter -> review correction -> save -> Advisor | Real browser extraction exercised; correction wins; no change before save; existing profile revision preserved on cancel; expected component-based plan |
| I03 P0 | German browser -> change to EN -> reload -> DE -> mobile all screens | Persistent locale; document lang correct; no overflow at 320px or 200% zoom; keyboard labels translated |
| I04 P0 | Change profile/term during worker run -> late result arrives -> apply | Stale result ignored; prior selection intact; request ID/version checks enforced |
| I05 P0 | Two tabs edit/reset -> save old tab | Revision/reset rejection; cleared data not repopulated; visible conflict guidance |
| I06 P0 | Export JSON -> reset -> restore -> generate same plans | Same academic facts/group intent; derived caches recomputed; corrupt/future JSON cannot damage current state |
| I07 P0 | Switch visible week/instructor with hidden conflict | Term-wide banner remains; export defaults to entire selection; current-week export explicitly limited |
| I08 P0 | Degree map/list -> module -> edit progress -> regenerate | Graph/list and Progress derive same states; keyboard return focus; recommended edge never implies hard block |
| I09 P0 | Network disabled after public assets load -> manual edit/generate/apply/export | All operations work; no academic request attempted; Pulse disabled/unavailable does not block |
| I10 P1 | Opt in -> vote/change/delete -> offline -> retry | Only exact narrow single-course DTO; nothing automatic on plan changes; safe aggregate display and rate-limit message |
| I11 P0 | Current term absent / historical selected | Current term never populated with 2025 dates; historical banner; curriculum priorities remain usable |
| I12 P1 | Representative redacted HAW PDF of declared layout -> review -> save | Correctly scoped MA2/EE1-style component results; documented adapter coverage; cannot be replaced by mocked text test |

Network tests capture all request mechanisms listed in PRIVACY.md with unique synthetic data markers. Block external endpoints and test malicious strings in notes and parsed text. Inspect static build for sensitive source patterns and service credentials. No private profile appears in server-rendered HTML/RSC or URL query strings.

## Nonfunctional release gates

* Accessibility: automated axe scan plus keyboard-only manual setup, drawer, plan apply, export and Degree List; no critical/serious violations. Check contrast manually for preserved brutalist colors.
* Browser: Chromium, Firefox, WebKit desktop; 320/375/768/1440 viewports; Europe/Berlin plus host America/New_York and UTC prove calendar independence.
* Performance: deterministic node counts, oracle equality, typical fixture targets in PLANNER_ALGORITHM; worker cancellation <500ms on test device; no planner-origin long tasks >50ms in main thread. Report hardware/CPU throttling.
* Data: strict validator passes published packages. Historical quarantines have explicit migration records and cannot be accidentally offered as ready-plan inputs. No unsupported current-term claim.
* Backend P1: raw tables denied, extra payload fields rejected, unique upsert concurrency correct, distributed rate limiting active, retention cleanup and aggregate suppression tested. With flag off, no backend traffic/import requirement.

## Implementation commands to add

At T01: `test` (Vitest run), `test:watch`, `test:e2e` (Playwright), `typecheck` (tsc --noEmit), `validate:data` and `validate:i18n` (TypeScript scripts through a pinned runner). CI: npm ci -> typecheck -> data/i18n validators -> unit/integration -> next build -> browser tests against production server. Configure ESLint noninteractively before invoking lint; no current lint configuration was asserted working. Pin browser artifacts in CI; do not make contributor tests require a real Supabase project or any AI key.

Test only the promised implementation stage: P0 must pass all P0 cases and core U01–U33/U37; P1 adds U34–U36/I02/I10/I12 and backend gates. Existing typecheck passing is a baseline, not proof of these future requirements.
