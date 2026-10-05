# Deterministic advisor and group optimizer

Specification version `planner-v1`. All functions are pure TypeScript over [domain contracts](contracts/domain.ts); no fetch, storage, clock, randomness, React or AI inside the engine. Inject `asOf`, versions and all data. Identical canonical inputs and node budget produce identical outputs. Rendered language cannot influence sorting or scores.

## 1. Normalize and evaluate

Validate package references and profile. Canonicalize arrays by ID, preserve distinct group bundles, index exact occurrences by date, and precompute component state, rule truth, forward/reverse prerequisite graphs and actual milestone progress. IDs tie-break by code-point comparison, not localeCompare. Reject invalid inputs with typed codes before search.

Availability is component-specific: an offered lecture does not prove a lab or exam is offered. No entry means unknown. Generate actions for unmet component sets, not just whole modules:

* `complete_remaining`: one minimal remaining completion path, with available required practical components and separately assessed exam availability.
* `bank_components`: a non-empty compatible subset of offered, unpassed PVLs/labs/projects. This does not claim full module credits unless it completes the remaining requirements.
* `exam_only`: non-exam requirements met, exams outstanding. It consumes exam preparation workload but no new lab capacity. Unknown exam date or offering appears as a conditional preparation action, not a scheduled exam.

Produce at most one chosen action per module. Alternatives such as lab-only versus full completion are mutually exclusive search options. Explicit participation prerequisites must pass for each target; recommended prerequisites append warnings. A completion rule cannot automatically be reinterpreted as a participation block. Same-term plans do not satisfy before-term prerequisites. A before-assessment dependency can be shown hypothetically, but timing uncertainty must remain visible.

Unknown progress is neither passed nor failed: show Needs review and do not emit a ready action relying on unknown eligibility. User can explicitly mark remaining components Not started via the progress review. Do not secretly infer all unspecified modules failed to make the solver run.

## 2. Workload, lab counts and potential credits

`newLabs` = count of distinct targeted component IDs whose kind is lab and actual status != passed. A failed lab consumes one new lab. Multiple sessions/groups of one lab still count once. Exercise/project/other PVL counts are separate, with their workload charged; the lab cap must not hide overload from non-lab PVLs. Existing registered/in-progress unpassed labs count toward this term's new-lab burden when included. Already passed labs are omitted unless the student manually chooses optional repetition; that repetition affects contact time but does not become a newly bankable component.

Use an official component remaining-hours estimate when available. Otherwise product defaults (estimates, not HAW rules): exam preparation 75h; lab `max(45h, chosen contact hours * 2)`; exercise `max(30h, contact * 1.5)`; project 120h; presentation 30h; case study 60h; other PVL 45h. Add optional lecture contact hours separately; cap a known official full-module total only if all its remaining tasks are included and no double-counting occurs. Defaults are additive and intentionally conservative; never derive lab effort by granting a fraction of ECTS. Expose the estimate source and allow a local total-hours cap.

| Policy | Safe | Balanced | Aggressive |
|---|---:|---:|---:|
| Default maximum remaining workload | 360h | 540h | 720h |
| Effective maximum new labs | min(user cap, 2) | min(user cap, 4) | user cap |
| Mandatory collision tolerance in ready plans | 0 | 0 | 0 |
| Optional lecture overlap preference | Strong penalty | Normal penalty | Normal penalty |

These are initial product settings, never institutional load limits. An explicit maxWorkloadHours reduces each policy's cap, never increases it silently. No GPA-based caps. No requirement to fill every budget. Unknown assessment date adds a warning even when a preparation action is useful.

Potential credits: evaluate completion against an in-memory copy with targeted components hypothetically passed; subtract actually completed modules; sum known whole-module credits once. Assign elective credits to at most one compatible degree slot. Retain unknown-credit IDs and label all totals conditional. Return actual and hypothetical milestone truth separately. No plan or what-if result modifies real progress.

## 3. Transparent priorities

Each action gets structured `Reason` records, including negative terms and exclusions. UI presents ordered reasons such as `milestone.firstYearRemaining`, `component.pvlAvailable`, `component.examBacklog`, `rule.recommendedMissing`, `schedule.lectureOverlap` with entity/rule IDs and interpolation values. Academic statements always link to their underlying data source or clearly labelled advisory checklist.

There are three ranking tiers for the internship goal: **A** remaining first-year/milestone work and verified hard ancestors that block it; **B** failed cleanup, practical banking and other verified hard prerequisite chains; **C** remaining curriculum opportunities. Other goals keep hard constraints identical but promote their goal's actions within B/C. A resolved mandatory milestone still takes precedence over social signals. Provisional milestone membership may guide A as an advisory goal only, with a warning and no eligibility claim.

Within each tier, sum the following integer features once per action (not once per session). If a module has competing actions, each gets only the features justified by its targeted components:

| Feature | Base points / bound |
|---|---:|
| Targets unmet selected milestone condition | +1000 |
| Targets an unfinished first-year requirement | +800 |
| Verified hard prerequisite ancestor of selected milestone | +600 |
| Finishes all remaining module requirements if passed | +150 |
| New offered PVL target | +120 per component, capped 240 |
| Failed component targeted for recovery | +100, capped once per module |
| Future hard dependents improved | +60 per distinct target, capped 300 |
| Recommended curriculum semester <= current subject semester | +70 |
| Recommended dependency chain improved | +25 per distinct target, capped 100 |
| Project opportunity | +60 |
| Exam-only backlog | +80 |
| Custom module priority | +20 * local priority 0..5 |

Use unique sets over the dependency closure; no cycle or multiple-path double counting. A downstream module is "unlocked" only if all its hard requirements become met; satisfying one of several leaves is "prerequisite progress". Recommended links are "recommended preparation improved", not formal eligibility unlocks.

Goal multipliers: internship doubles milestone/first-year features; credits doubles the completion feature and adds `20 * potential known credits` (cap 200/action); bank_pvl doubles PVL feature; backlog doubles failed/exam-only features; curriculum doubles recommended-semester feature; custom adds its explicit per-module preference and otherwise uses base values. Integer arithmetic throughout. An ineligible action is excluded, never rescued by points.

Compare plans lexicographically by `(tierA total, tierB total, tierC total, -scheduleCost, socialScore, canonicalSignature)`, maximizing first three and social, minimizing cost and signature. Excluded/conditional plans are not in the ready-plan ranking. This ensures any amount of friend/pulse preference cannot overwhelm a better academic tier. Workload and hard feasibility constrain search before ranking. Many low-value choices cannot displace a feasible higher-tier requirement by accumulating social bonuses.

Schedule cost is bounded to 0..100,000 so feature reporting stays readable. SocialScore = 2 per preferred group + 1 per friend module (cap 12 total) + pulse tie-break 0..2 for the entire plan. Pulse recommendation contributes only for >=20 published recommendation votes and freshness <=30 days; otherwise 0. It never changes weights, workloads, feasibility or tier membership. Do not sort primarily by popularity.

## 4. Exact overlap and bundles

For each pair of distinct occurrences on the same date:

```ts
const overlaps = a.date === b.date &&
  a.startMinute < b.endMinute && b.startMinute < a.endMinute;
const minutes = overlaps
  ? Math.min(a.endMinute, b.endMinute) - Math.max(a.startMinute, b.startMinute)
  : 0;
```

Intervals are half-open; 09:40 ending and 09:40 starting do not overlap. The same weekday/week number in different ISO years is not the same date. Expand recurrence once in ingestion, including cancellations and extra sessions. Never compare display strings or use a bounding date range as occurrence evidence.

A group is the complete set of series referenced by its option. Selecting EEL2 group 02 includes its intro and all rotating dates. Select one option per required choice for targeted components, all shared mandatory sessions, and optional lectures according to action settings. Compatibility tuples are explicit; group 02 in two components need not imply compatibility. Missing compatibility metadata is an uncertainty issue when source indicates coupling, not permission to combine arbitrarily. Shared occurrence IDs are deduplicated before comparison; distinct same-group contradictory occurrences fail data validation rather than scoring as a student's conflict.

Severity: mandatory + mandatory = hard; any unknown attendance = uncertain (exclude from ready plan until verified or clearly preview-only); all other overlaps = soft. Mandatory labs/PVLs/exams stay mandatory regardless of lecture preference. An unclassified lab is treated conservatively and cannot be waived by lowering lecture importance. Optional lecture versus lab is soft because attendance at that optional lecture can be skipped, but the exact missed minutes and sessions must be visible.

Soft pair cost per overlapping minute: high lecture priority 10, medium 4, low 1, doubled in Safe. Mandatory hard overlap is never a finite-score tradeoff. Add a campus transfer warning if non-overlapping sessions at different known campuses leave <30 minutes; this is a product heuristic, not a universal travel fact or hard rule. Unknown locations warn without claiming a verified feasible transfer.

## 5. Metrics and schedule style

Compute metrics using unioned occupied intervals, avoiding double-counted contact duration when overlaps exist. Keep overlap pairs separately by ordered occurrence IDs/date. `hardConflicts` counts hard occurrence pairs; UI also groups them by date/module and reports affected dates.

* Campus days = distinct dates with at least one selected campus occurrence, not distinct weekdays. Online sessions contribute contact load but not campus days; unknown delivery is reported separately.
* Contact minutes per day = interval union across selected sessions. Day span = latest campus end minus earliest campus start. Idle minutes = span minus union of campus intervals. Longest campus day is the maximum span.
* Heavy day = >360 contact minutes or >600 campus span; heavy week = >1,200 contact minutes. These thresholds are product defaults displayed as such. No implication that weeks below threshold are easy.
* Fragmentation = number of intra-day gaps >=90 minutes. Zero-session teaching weeks remain in the vector, unlike break weeks explicitly excluded by term configuration.
* Weekly mean `mu=sum(w)/N`; variance `V=sum((w-mu)^2)/N`. For comparable module/contact sets, even style minimizes rounded `V/3600` plus `50 * heavyWeeks`. Compressed style minimizes `100 * activeWeeks + 20 * campusDays + 50 * heavyWeeks`. It encourages fewer active weeks but penalizes extreme peaks.
* Both add `ceil(idleMinutes/30) + 5*fragmentation`, early/late/avoided-day occurrence penalties (10 each), `5*heavyDays` and soft overlap costs. Fewer-campus-days preference adds `20*campusDays` for either style.

Compare academic benefit before schedule cost so compression cannot win just by dropping important study targets. Show actual weekly load bars so the user sees tradeoffs. Compressing labs does not compress untimetabled self-study; show that caveat beside the chart.

## 6. Joint action/group search

A greedy top-N module picker followed by a group picker is insufficient: it can miss a feasible high-priority plan. Search mutually exclusive module actions and their group assignments together, including skip decisions. All published, compatible group options for every included action are explored unless safely pruned or the visible resource budget stops the search.

```text
validate; derive component state, actions, obligations and indices
sort modules by tier then descending optimistic benefit, then module ID
for each intensity:
  retain previous solution candidates only as lower bounds, not forced choices
  DFS(moduleIndex, chosenActions, groups, occurrenceIndex, labCount, hours):
    stop/cancel after configured node budget; record incomplete search
    prune if lab/hour cap exceeded or mandatory/uncertain collision
    prune if optimistic remaining academic tuple is worse than kth retained result
    if at leaf: compute full metrics, reasons, potential credits; keep top K
    else:
      for each action sorted by priority/mode/ID:
        enumerate full compatible group assignments, fewest-options choice first
        add entire bundles; reject internal/cross-plan mandatory collision
        recurse with action; undo incremental state
      recurse with skip; preserve omission reasons
deduplicate signatures; choose one best candidate per policy
optionally compute one conditional aggressive proposal in a separate search
return input versions, coverage metadata, plans and excluded reasons
```

Keep K=20 distinct terminal plans per policy for diversity comparisons, not a limit on explored combinations. An upper bound may include all remaining positive academic features ignoring conflicts; this is loose but admissible. Never prune on a heuristic score claimed as a proven bound. A group option is dominated only when its full occurrence/obligation signature and academic effects are identical and it has no better preferred-group or schedule feature. Do not discard a group merely because it appears busy in isolation.

Memoize partial states only with the entire future-relevant signature (index, chosen component set, lab/workload use, occupied occurrences, compatibility assignments). A module-index-only cache is incorrect. Precompute date conflict bitsets and group signatures; maintain incremental per-date intervals for quick pruning. Sort all alternatives for repeatability.

Worker default budget: 200,000 expanded nodes per policy; user-triggered deep search 2,000,000. Send progress every 2,000 nodes and yield to the worker event loop so cancel messages are processed. Terminate/recreate worker on cancellation if needed. Budget-based termination is deterministic; elapsed-time watchdog can abort without pretending the result is complete. Never report exhaustive optimality when `complete=false`. Exhaustive coverage is a release test for typical small fixtures, not a promise for arbitrarily large elective pools. No fixed "first three groups" or silent top-N modules truncation.

Performance target: representative 12 candidate modules, 1–6 group options/choice, <=1,000 occurrences yields a useful result within 2s on a documented mid-range laptop and responsive UI at 4x CPU throttle. Mobile time budget 5s before offering Cancel/continue search. Record hardware and node counts; adjust data structures before increasing dependencies. Brute-force oracle on <=6 modules verifies pruning does not lose the true optimum.

## 7. Alternatives and infeasibility

Use different workload/lab policies first. Prefer structurally distinct near-best plans (different target set or group signature) only within the same academic tuple; never sacrifice milestone priority just for visual variety. If all feasible solutions coincide, show "These settings lead to the same plan" with the shared result. If only two useful plans exist, the third card explains the binding cap; do not pad with unsafe modules. Empty feasible result states which hard constraints/data gaps caused it and offers progress/preferences links. Ready plan exclusions explain not offered, blocked rule, capacity, or collision.

Conditional Aggressive proposal: search only after ready solutions, may retain at most one hard collision date with at most 30 minutes overlap between two practical occurrences, with a separate warning and exact affected groups. These bounds express a product preview, not permission to miss required work. Proposed replacement occurrence/group must pass the same validator before Use this plan is enabled. Acknowledging a warning alone does not resolve a collision. Hard academic prerequisites and the user's lab cap are never relaxed even for this preview.

## 8. Plan application and freshness

`applyPlan(result, planId, currentProfile, currentDataset)` checks profile revision, curriculum/term/algorithm versions, action eligibility, group compatibility and feasibility again. If stale, regenerate or return `STALE_PLAN`; do not apply stale results after an import/reset. Build exact ScheduleSelection from chosen actions/groups/shared sessions, save profile atomically, then navigate. Store previous selection in memory for Undo; a later edit invalidates Undo safely. Manual selection continues to allow exploratory conflicts with visible warnings; advisor ready-plan rules remain stricter.

Plan IDs are hashes of canonical target/group/term/algorithm signatures, never identity. `asOf` affects registration notices only, not automatic registration eligibility or inferred seat availability. Future unlocks and milestone previews always read the same hypothetical profile snapshot, not a mutated real profile.
