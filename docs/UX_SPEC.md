# UX specification

## Shell and visual identity

Desktop: compact black ScheduleHAW masthead, active term selector, EN/DE switch and four text navigation links. Main width 1440px, content padding 24px, panels with 3–4px black border and 4–6px solid offset shadow. Keep existing cyan, pink, lime and yellow accents; use white/black for primary reading. Reserve heavy uppercase type for short headings; body and long German text use normal case. No marketing hero or chat-first interface.

Below 768px, use a two-by-two navigation grid or four compact wrapping links, single-column panels and a day agenda by default. Do not require a 1200px-wide grid on a phone. Schedule week grid remains an explicit alternate view with a labelled scroll region. Degree graph has a full equivalent list view. Module detail uses a right drawer on desktop, full-height sheet on mobile.

Use consistent statuses with text + icon + color, never color alone. Minimum 44px action targets, visible focus ring outside thick borders, semantic labels and fieldsets, logical keyboard order, Escape/return-focus for drawers and dialogs, live save/generation announcements. Respect reduced motion. Test 320px width, 200% zoom and long German labels. Text contrast >=4.5:1 and controls/focus >=3:1; existing neon/white combinations are not assumed to pass.

## 1. Onboarding

Trigger once on first visit; user may dismiss and browse Schedule immediately. Heading: "Your study plan stays on this device". Two equally prominent actions: **Enter progress manually** and **Import a transcript locally**. Secondary: Restore JSON; Browse schedule. No name, student number, account or PDF required.

Step 1: choose known curriculum/regulation version and subject semester (default 1, editable). Show source label/date; if version is unresolved use a clearly advisory curriculum preview, not a guessed official variant. Step 2: progress entry or transcript review. Step 3: goal and workload preferences with Balanced highlighted as an initial product setting. Finish opens Advisor. Progress can be saved before the checklist is complete; unknown modules stay Needs review.

Historical term banner appears whenever selected term != current calendar term. If current offerings are unavailable: "Current timetable not published here yet. You can still update progress and review academic priorities." Offer historical data only by an explicit term choice; never quietly generate an old schedule as current.

## 2. My Progress

Top strip: known earned credits, completed modules, exam-only backlog, first-year checklist progress; unknown denominator displayed as such. Semester sections 1–7, search by code/name/alias, filters Needs review / Remaining / Completed. Do not hide completed modules permanently.

Each card: code + official name, credits or Unknown, primary and secondary badges, compact rows for each required component with human labels. Quick actions: Completed; Not started; and source-supported presets such as Lab passed, exam outstanding. Each preset previews touched component values inline and offers Undo. Batch marking a semester completed requires a review of affected modules so mistaken mass entry is reversible before save. It is a product confirmation, not a required interaction in this architecture pass.

Expanded component editor: status select (Not started, Registered, In progress, Passed, Failed), optional grade/attempts/notes under "More details". Saving updates the derived badge and earned credits. Absent record is "Not reviewed"; it is visually separate from explicit Not started. No input of lab status toggles exam status implicitly. Competing completion paths (e.g. alternative assessment) ask which applicable path is known rather than marking every option required.

Persistent bottom note: Saved on this device / Saving / Unsaved — storage unavailable. Profile tools expose JSON download, preview-and-replace restore and clear-local-data. Reset dialog specifies exactly what disappears; offer download first without making it mandatory. Do not imply reset removes existing files on disk or revokes previously submitted public votes.

## 3. Advisor preferences

Summary of local progress and selected term sits above the form. Required fields: goal, subject semester, max new labs (2–6); Balanced initial preference. Goal options: Internship readiness, Complete more credits, Bank labs/PVLs, Reduce backlog, Follow curriculum, Custom. Custom opens per-module priority 0–5 and milestone selection; it cannot edit rules.

Advanced disclosure: Even / Compressed week distribution; fewer campus days / neutral; lecture importance high/medium/low; optional before/after times and avoided days; local friend module marks and preferred group labels. All "avoid" fields say Preference, not Unavailable. Explain max-new-labs includes failed or unfinished labs and excludes passed labs; show other PVL workload separately.

Generate plans is enabled with enough reviewed state to evaluate candidates. Partial review may generate eligible reviewed options with a visible omitted-data count. If public term data is absent, show academic-priority list and data gaps, not empty apparently feasible timetable cards. While generating, retain previous result with Stale label, show explored combinations and Cancel; never freeze form controls.

## 4. Generated plan comparison

Desktop three cards, mobile vertical cards with sticky comparison summary. Safe / Balanced / Aggressive labels are accompanied by effort estimates, no safety guarantee. All fields required by PRODUCT_SPEC P-03 are present; details may expand. Weekly contact-load bars explain even/compressed effects. List exam-only modules separately from new labs/PVLs.

Each module lists actual group labels, targeted components and top reasons. Expand "Why this module?" for all reason contributions and source links; do not show unexplained AI scores. Show "Why excluded?" for blocked, unavailable or capacity-limited candidates. Distinguish future hard unlocks from recommended preparation.

Primary action: **Use this plan / Diesen Plan übernehmen**. Ready plan saves atomically, navigates to Schedule and announces success with Undo. Conditional collision proposals have **Resolve group conflict** instead; acknowledgement is not enough. Unknown exam dates retain a "Check assessment dates" warning and remain off the exported calendar. An identical alternative explicitly says it shares the same selection; no fabricated variety.

What-if action makes a temporary preview (e.g. assume EE1 passed), tags every preview with "Simulation — progress unchanged", and restores original inputs on Exit. Applying a simulated plan first revalidates against actual state; impossible simulated eligibility cannot leak into a real selection.

## 5. Schedule

Keep existing course/group search and filters, with curriculum names and legacy codes searchable. Shared sessions are automatic where appropriate; group picker selects one complete bundle per choice and displays all actual dates before changing it. Multi-group exploratory manual selections require an explicit Compare mode rather than accidental selection as a ready plan.

Controls: term, previous/next ISO week with date range, Today when inside term, subject semester, instructor. Filters can be cleared without changing selected groups. Term-wide conflict banner remains visible even when a conflict is hidden by filters; each conflict links to its date. Pair lists report actual overlap minutes and attendance severity. Mobile day cards show ordered intervals, rooms and instructors; overlapping events remain visible side by side or as a conflict stack.

Export button opens scope summary: Full selected term (default), This week, Visible filters. Display event count/date span and omitted undated exams. No unexpected upload; download is local. If no events exist, disable export with a precise reason. Empty week is "No selected sessions this week"; Christmas/break copy only comes from verified term data.

## 6. Degree Map

Semester-column graph with milestone nodes and legend: solid hard prerequisite; dashed recommendation; dotted milestone membership. Node text shows name, credits and status. Availability, academic eligibility and completion are separate badges: an incomplete module may be academically available but not offered this term. Unknown data gets a visible question marker, not Blocked.

Completed, Available, Recommended, Blocked, Exam only and Lab missing are supported. Recommended indicates selected advisor output, not a university mandate. Click/Enter opens module detail. Focus search can highlight prerequisites/dependents without moving all nodes. No animated moving edges by default. Toggle to keyboard-accessible list with exactly the same nodes/relations/milestones; screen readers need not navigate a canvas to access core information.

## 7. Module detail

Drawer order: code/name; credits/recommended semester and provenance; student's components; hard prerequisite conditions with truth; recommended preparation; current term offerings/group date list; future unlocks/milestone effects; optional Pulse. Show uncertainty next to the affected field, not only in a global footer.

Actions: Add to plan (creates a local candidate preference then revalidates), Compare groups (opens exact-date matrix), Update progress (same ComponentEditor as Progress). A blocked Add action explains missing hard requirements; recommended missing preparation remains actionable. Instructor names are factual schedule metadata with no ratings controls.

## 8. Transcript review

See [TRANSCRIPT_IMPORT](TRANSCRIPT_IMPORT.md). Local file selection says "Processed in your browser; the file is not uploaded". Show extraction progress/cancel; unsupported/encrypted/image-only files offer manual entry. No automatic cloud fallback.

Review table: Detected text (local excerpt), Proposed module, Component, Status, Confidence label, Existing value, Action. Flag contradictory/ambiguous rows above high-confidence rows. Match confidence is not passing probability. Allow correction, ignore, accept selected rows and expand source page text. Never accept low-confidence rows by default. Final summary counts additions/changes/skipped conflicts; Save confirmed results is the only persistence step. Cancel leaves the profile unchanged and releases PDF/text/proposals.

## 9. Community Pulse

Only when enabled; opt-in panel in module detail, collapsed initially. Read aggregates by entire public term bundle, never a user's chosen module list. Explain that an optional course vote is sent, with no transcript/progress attached. Explicit controls: Planning to take; Recommend when eligible (yes/no); Reported workload (light/moderate/heavy). No prompt to rate instructors, no comments, no automatically checked vote based on plan.

Show denominator next to percentages. Below threshold show Not enough responses. Offline/503 shows "Community Pulse unavailable — your planner still works" without repeatedly retrying. Voting failure does not queue private choices for later automatic submission. Change/remove a vote is explicit. Local friend/group preferences never invoke this backend.

## Translation implementation

Use one client LocaleProvider and typed translation helper over `messages/en.json` and `de.json`, with interpolation and explicit singular/plural variants. Domain reasons carry keys/params; no English concatenation from the engine. Generate a typed key union and verify exact key/placeholder parity. Browser de-* -> de, otherwise en; restore `schedulehaw.locale` after hydration. Server shell uses a neutral loading placeholder until locale is ready to avoid flash/hydration mismatch, then updates document.documentElement.lang. Locale is not sent to an academic backend.

| Key | en | de |
|---|---|---|
| nav.advisor | Advisor | Studienplanung |
| nav.progress | My Progress | Mein Studienstand |
| nav.schedule | Schedule | Stundenplan |
| nav.map | Degree Map | Studienverlaufsplan |
| status.completed | Completed | Abgeschlossen |
| status.examOnly | Exam only | Nur Prüfung offen |
| status.labMissing | Lab missing | Labor noch offen |
| status.exerciseMissing | Exercise missing | Übung noch offen |
| status.failedExam | Failed exam | Prüfung nicht bestanden |
| status.needsReview | Needs review | Angaben prüfen |
| credits.potential | Potential additional credits, if passed | Mögliche zusätzliche Leistungspunkte bei Bestehen |
| plan.newLabs | New labs: {count} | Neue Labore: {count} |
| reason.firstYear | Required for first-year completion | Für den Abschluss des ersten Studienjahres erforderlich |
| privacy.saved | Saved on this device | Auf diesem Gerät gespeichert |

Module official English names may remain in German UI when no official German name is available; store the same official name in both locales and mark this as a deliberate fallback. Format dates/numbers with Intl using locale and Europe/Berlin. Validation errors, graph labels, download dialog, worker states and import confidence reasons are part of translation coverage. Avoid fixed button widths and text truncation that hides the only copy of a German label.
