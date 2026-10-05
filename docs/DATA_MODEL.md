# Data contract and migration

[contracts/domain.ts](contracts/domain.ts) is the exact TypeScript contract. It contains no runtime or application feature. Copy its types into `lib/domain/types.ts` at T02 and create strict runtime schemas. JSON input must reject extra keys, unknown IDs and invalid union combinations; TypeScript alone is not validation.

## Identity and ownership

| Layer | Identity | Lifetime / owner |
|---|---|---|
| Curriculum | haw-ie-bsc + version; module `ma2`; component `ma2.exercise` | Public, regulation-scoped, versioned immutable assets |
| Rules | Stable rule ID + curriculum version + evidence | Public; no inferred hard edges |
| Offering | `2025-ws:ma2` | Public term-specific course opportunity |
| Choice / group | `2025-ws:ma2:exercise` / `2025-ws:ma2:exercise:02` | Public, opaque IDs; label `02` preserved |
| Session / occurrence | Stable series ID / series ID + date + disambiguator | Public, exact date/time and provenance |
| Progress | Globally unique componentId | Private IndexedDB, absent means unreviewed |
| Selection | Term ID + termVersion + revision | Private; groups and sessions are validated against that version |

Official module codes and transcript aliases are explicit arrays. `moduleM-02-P`, `1IE-MAE2.VL`, `IE2-MAE2/02`, and `ma2.exercise` are different identifiers connected by a reviewed crosswalk. Canonical module IDs omit the semester and instructor. Do not normalize all codes with a regex and hope they identify the same requirement.

## Completion and eligibility are separate

`Requirement` is an AND/OR/at-least expression with explicit unknown leaves. Module completion expressions normally reference components in that module; prohibit self/module recursion. Milestones and prerequisites may reference other modules/components/milestones. Validate their combined dependency graph before evaluation. Unknown propagates by three-valued logic: all=unmet if any unmet, otherwise unknown if any unknown; any=met if any met, otherwise unknown if any unknown; at-least counts met and possible unknown results.

Component status `passed` satisfies a component. Registered/in-progress/failed/not-started do not. Missing records are unknown. A manual module-level completion shortcut creates reviewed component records in a single transaction. An imported aggregate module pass without component-level evidence remains an unresolved proposal; it does not fabricate lab results. If transcript formats establish an official aggregate completion unambiguously, the review UI offers the same explicit completion shortcut and explains that it fills required components.

Badge precedence: unresolved requirements or relevant unknown records -> Needs review; complete -> Completed; all non-exam requirements met and exams remain -> Exam only; known missing lab -> Lab missing; missing exercise -> Exercise missing; any registered/in-progress/passed partial component -> In progress; otherwise Not started. Failed exam is an independent secondary badge, so "Exam only · Failed exam" is valid. Alternative completion paths are evaluated as expressions: never require every component in an OR branch. Select a minimal remaining satisfying set; return alternatives when tied.

Credits are earned once per completed module, not once per component. Partial exam/PVL credit fragments in scraped portal text do not define the application's total-credit rules. Elective slot assignments must be explicit, eligible and unique: one module cannot satisfy two slots. A resolved slot contributes toward degree requirements; an unassigned elective remains visible in academic history without double counting. Never set a graduation threshold from memory. Unknown requirement sets cannot display 100% degree completion.

Rule scope matters: a module participation prerequisite is different from a lab prerequisite and a PVL-before-exam requirement. `before_term` hard prerequisites must already be satisfied. For `before_assessment`, targeting the missing PVL in the same term may produce a conditional exam-preparation action only; without source-backed timing/permission, do not promise exam eligibility. Recommendations are warnings, not exclusions. An unverified/disputed hard rule fails data validation and is downgraded to an advisory candidate before publication, with an explicit issue. Do not silently ignore a hard rule at runtime.

## Versioned packages

```text
data/
  curriculum/haw-ie-bsc/<version>/curriculum.json
  curriculum/haw-ie-bsc/<version>/aliases.json
  curriculum/haw-ie-bsc/<version>/sources.json
  rules/haw-ie-bsc/<version>/prerequisites.json
  rules/haw-ie-bsc/<version>/milestones.json
  terms/index.json
  terms/2025-ws/term.json
  terms/2025-ws/offerings.json
  terms/2025-ws/sessions.json
  validation/issues.json
  migration/legacy-code-map.json
  migration/reconciliation.json
```

The loader assembles the `Curriculum` and `TermDataset` contracts; no duplicated prerequisite arrays or stored unlock lists. Unlocks are derived reverse edges. `terms/index.json` lists only published packages and their hashes; an unavailable current term can exist as metadata without invented dates. New packages must preserve old IDs or include a reviewed crosswalk. Profile version upgrades preview orphaned records and changed completion requirements. Never silently discard a banked component when a curriculum changes.

`terms/index.json` contains `TermCatalogEntry[]`: unavailable entries need only ID/label; published entries point to a hash-verified package. Only published packages construct a full `TermDataset`. Use `rankWithoutTimetable` for curriculum-only advice; do not pass an invented empty term into the full planner. `AcademicAlias[]` is the typed crosswalk for matching; alias ambiguity is retained as multiple candidates, never resolved by last-write-wins.

## Migration algorithm (T03–T05)

1. Capture legacy row index, source hash and complete public ScheduleBlock fields. Baseline = 212 rows / 123 codes. Emit a local audit manifest; preserve the source file until parity passes.
2. Create an explicit crosswalk of every legacy code to module, teaching type, optional component and group choice. Keep `sourceCodes`. For unknown electives use an unresolved curriculum mapping, retaining their historical timetable availability.
3. Extract only allowlisted public catalog fields from markdown into candidate records. Do not copy raw markdown into `public/`, fixtures, logs or network payloads. Personal "actual status", earned-credit quantities and registration actions are excluded. Exact names and codes may be retained as source identifiers; no student state is inferred.
4. Reconcile component assessment and credits against the applicable official curriculum. Treat alternative exam formats as one assessment outcome where appropriate, not multiple exams to pass. For SP, study methods, CJ1/elective projects and practice weeks, record unresolved mapping explicitly until reviewed.
5. Expand each legacy `(weekday, week)` using an explicit ISO week-year map: 41–52 -> ISO year 2025, 1–4 -> ISO year 2026, only for this historical package. Use the Jan 4 ISO algorithm, not host-dependent Jan 1 heuristics. Compare against exact dates/recurrences from source. Different future terms use their own date packages. Do not globally remove all of week 1/52 as a holiday; retained Jan 5 occurrences must be reconciled with actual closure evidence.
6. Build session bundles, including introductory dates with different durations. Multiple series with the same course/group are parts of one group, not interchangeable alternatives. Deduplicate only fully identical occurrences; conflicting variants go into quarantine with both sources retained in reconciliation records.
7. Validate all IDs, dates, references and bundles. Every source row must map to emitted occurrences or a documented issue. Record old/new occurrence counts and each intentional difference; do not require parity with known errors.
8. Introduce `legacyScheduleAdapter.ts` for display while selection and conflicts migrate. Keep original code labels searchable. No legacy academic storage migration is needed because the existing UI only has in-memory state. Preserve selections made during an active session when switching adapters.
9. Remove runtime imports of the giant array only after regression calendar and schedule checks pass. Keep historical evidence outside the public bundle, document provenance, and review existing repository history for any prior personal-data exposure separately; do not rewrite Git history in this upgrade.

## Validation tooling contract

`scripts/validate-data.ts` exits nonzero for duplicate IDs, dangling references, wrong curriculum version, invalid dates/week-year bounds, out-of-term occurrences, start >= end, non-integer minutes, malformed canonical group IDs, duplicate group labels within a choice, unknown session references, an option mixing terms, unsupported compatibility references, unsatisfiable choice cardinality, hard prerequisite/milestone cycles and incomplete source metadata. Detect recommended cycles separately as warnings and prevent graph recursion.

Exact duplicate occurrences are errors unless an explicit dedup reconciliation exists. Same-group overlapping variants are quarantine errors, not conflicts between two student choices. Cross-group overlaps are normal optimization inputs. Unknown attendance/delivery/requirements generate visible issues; unverified data never yields a `ready` plan. `--strict` rejects quarantined records in published verified packages; historical packages may preserve flagged display-only records. Scripts operate on allowlisted public fields only.

## Local persistence

IndexedDB database `schedulehaw-local`, version 1: `profile` key `active` contains the whole profile (small enough for one atomic transaction); `meta` stores migration version and reset epoch. Preferences such as locale are separate small localStorage keys `schedulehaw.locale`. Do not scatter grades across stores. Saved selections are in the profile; generated alternatives and transcript proposals stay in memory, avoiding stale sensitive caches.

`save` verifies expectedRevision inside a readwrite transaction and increments it. `restore` is replace-only in V1, with review and local backup offer, to avoid ambiguous merge semantics; it validates all records first. Future schema versions are rejected without touching current data. A BroadcastChannel communicates only revision/reset notices, causing other tabs to reread; no full profile is broadcast. Storage unavailable/quota failure -> visible memory-only mode, no false "Saved" label, JSON export remains available. Failed writes leave the previous persisted snapshot intact.

Export envelope is UTF-8 JSON, size limit 5 MiB, maximum 10,000 progress entries (actual curriculum is far smaller), notes max 2,000 characters, grades max 32, attempts integer 0–99. Reject duplicate component records, unknown prototypes/keys and curriculum mismatch until mapped. Strings are rendered as text, never HTML. Export contains sensitive data by user action, no identity, raw transcript, pulse token or source excerpt. Reset terminates workers, clears stores/state, broadcasts the reset epoch and removes app-owned academic caches; language may remain. It cannot remove previously downloaded backup files.
