# Privacy architecture and release gates

## Promise

Student profiles are processed and stored on the device. The application does not send transcript files/text, grades, failed or passed components, name, student ID, academic history, private plans or complete timetables to its backend. No account or AI provider is required. Browser persistence is local storage, not encryption or guaranteed permanent backup.

| Information | Location / retention | Network policy |
|---|---|---|
| PDF, filename, password, extracted text, source excerpts | Memory/worker for current import only; destroyed after save/cancel | Never transmitted or logged |
| Components, grades, attempts, notes, plan selections | IndexedDB until reset/user clears browser | Never transmitted, including telemetry and crash reports |
| Generated alternatives / what-if state | Memory, discarded on exit/change | Never transmitted |
| Profile JSON / calendar export | User-triggered local download | No upload; external calendar import is the user's separate action |
| Locale | localStorage until changed/reset | No academic payload |
| Friend module/group preference | Local profile, no friend names | Never transmitted |
| Public curriculum, term data, UI assets | Static server plus optional public cache | Same public packages for everyone |
| Optional single course vote | Narrow explicit Pulse DTO | Sent only after opt-in and per-vote action |

## Implementation constraints

No SSR/server actions, request URLs, cookies, browser telemetry, session replay or exception payloads contain academic data. Do not persist private state in service-worker caches. PDF assets/workers/fonts must be same-origin; do not use a remote PDF viewer. No CDN OCR fallback. Domain/planner code has no network dependency. Imports do not trigger external links embedded in files.

Disable production analytics/replay by default. Log only public error codes/counts; no snippets, filenames or serialized objects. Public assets must be scrubbed of the personal statuses mixed into `Courses.md` and `newschedule.md`. Build allowlists forbid these raw documents from entering client assets. Existing repository history is outside the app's new privacy promise; this pass does not erase it or claim it never contained personal data.

Use a restrictive production Content-Security-Policy: default-src 'self'; connect-src 'self' (and only separately reviewed endpoints if needed); object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; worker-src 'self' with blob: only if the tested worker build requires it. Use production nonce/hash handling supported by the deployed Next version; dev-only eval exceptions cannot ship. Font/image assets must not introduce passive third-party requests. Plain escaped React text renders imported fields; never dangerouslySetInnerHTML. Validate files and restore schemas before allocation/merge.

## Honest local-storage limitations

The browser/OS account can read local data; XSS or a compromised same-origin dependency could too. Use reviewed pinned dependencies, production CSP, no dynamic remote scripts, and no secret credentials in client code. Do not claim encrypted storage. Private browsing, quota limits and site-data clearing can remove data. Show save status and encourage optional JSON backups, especially when storage is unavailable. Request persistent storage only behind an explanatory user action; refusal is nonfatal.

Reset terminates workers, invalidates pending saves/results, clears the academic DB and in-memory stores and notifies other tabs. It preserves locale unless "Reset all settings" is chosen. A stale tab cannot immediately repopulate the DB: reset epoch and revision validation reject old writes. Reset cannot remove exported JSON/ICS already on disk or data later imported into external apps. Public vote deletion is separate and explicit; offer it before deleting the local vote token.

## Community consent boundary

Community Pulse is optional and off by default. It is pseudonymous, not a promise of perfect anonymity: hosting sees normal request metadata, and repeated votes within a course/term can be linked. Explicitly sending "I'm planning to take this course" is the limited public contribution requested by the feature, never automatic disclosure of a saved plan. Do not synchronize selections, send a module list, append profile attributes or encode academic state into the vote token. See [COMMUNITY_PULSE](COMMUNITY_PULSE.md).

Aggregate reads fetch the public term bundle, not only modules the student is taking. No cross-course stable voter identifier is stored. Application logs exclude tokens, request bodies, IPs and user agents. Infrastructure retention/redaction settings must be checked before enabling the feature; disclosure must say where unavoidable provider logs persist. If acceptable controls cannot be established, keep Pulse disabled. Do not add Supabase Auth, fingerprinting, student email or national-ID identity for duplicate mitigation.

## Privacy verification gates

Playwright intercepts fetch/XHR/WebSocket/sendBeacon and checks navigation/form requests during manual edits, PDF extraction/review/save, generation, what-if, plan application and export. None may transmit academic bytes or encoded equivalents. Use unique synthetic marker strings/grades in fixtures and assert they do not occur in any request URL, headers or body. This complements structural API allowlists; marker tests alone cannot detect every leak.

Test no-backend mode with internet blocked after assets load. Inspect production bundles and static output for raw source documents/student markers. Inspect local stores after cancel/reset. Test hostile imported notes rendered as text, future-schema restore rejection, multi-tab reset and stale-worker results. Community tests reject extra fields and batch academic payloads; no service secret is present in JS assets. These are mandatory P0/P1 gates, not an optional privacy checklist after deployment.
