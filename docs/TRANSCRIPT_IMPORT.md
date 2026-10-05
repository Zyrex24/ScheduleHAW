# Local transcript import architecture

P1 after manual progress. Implement the extraction/review framework before claiming a real HAW transcript adapter. Existing portal markdown demonstrates codes and labels but is not a representative transcript PDF. No private source document is copied into tests. A synthetic layout fixture validates the pipeline; a separately obtained, permitted and irreversibly anonymized representative sample is needed to claim supported production formats.

## Pipeline

1. User selects a local PDF through File API. The implementation caps input at 10 MiB, 80 pages and 50,000 text items; PDF.js validates PDF bytes. Reject unsupported input without upload. Encrypted PDFs currently use manual fallback; password and filename are never persisted/logged.
2. Lazy-load same-origin PDF.js library/worker. Feed Uint8Array directly to `getDocument`, disable PDF JavaScript/actions/external links and evaluation where supported. Extract text items with page/x/y/width; do not render arbitrary embedded content. Worker has no transcript-fetch endpoint. Cancel destroys document/loading task, terminates extraction if needed and releases references.
3. Reconstruct reading order by page, baseline tolerance and column geometry, not a single `items.map(text).join(' ')`. Handle repeated headers, wrapped names, hyphenation and Unicode normalization (NFKC); preserve minus, digits and original excerpt in memory. Normalize whitespace/case for matching only. Never strip the distinction between MA1/MA2 or DI/DS.
4. Adapter registry detects supported layouts from public header/column patterns. Highest confidence >=0.8 with >=0.1 margin wins; otherwise use review-only generic code matcher. `hawTextTableV1` targets assessment tables with code/name/status columns; `hawPortalTextV1` explicitly handles known portal structures if pasted text is supported. Detection does not rely on the student's name/ID. No viable text (<30 non-whitespace characters across pages) -> image-only fallback to manual entry, not OCR upload.
5. Match exact assessment/component code first, then official module code + explicit component label, then alias/name + explicit component label. Resolve via reviewed curriculum-version aliases. Module-level rows and subcomponent rows have different scopes. A catalog "admitted" status means Registered, never Passed. Do not infer Failed solely from a grade or a missing status; a status mapping must be documented for the detected format. German decimal grades are preserved strings.
6. Emit proposals; never write progress from parser code. Deduplicate identical proposals for the same component, preserving evidence in memory. Contradictory pass/fail entries or retakes are separate review conflicts; neither "last PDF line wins" nor "always passed wins" is safe without validated chronological semantics. Imported attempts do not silently increment existing attempt counts.
7. Review/correct/ignore proposals and compare with existing profile. A confirmed import cannot overwrite an existing passed component with failed without an explicit changed-value review. On Save, recheck current revision and atomically apply accepted component updates; source is confirmed_import. Reject stale reviews with a new diff. Destroy transient text/proposals after save/cancel/navigation.

## Deterministic match quality

Exact component code + explicit supported result: 0.99. Exact module code + unambiguous component/result: 0.95. Exact reviewed name/alias + explicit component/result: 0.90. Fuzzy name similarity alone: maximum 0.60 and unresolved component. Ambiguous status -0.30; competing module candidate -0.30; contradictory outcome forces review regardless of numerical score. Clamp 0..1. High >=0.90, Check 0.70–0.89, Unresolved <0.70. These are ranking heuristics, not calibrated probabilities.

All rows require a confirmation action. "Accept all high-confidence matches" selects only conflict-free matches for the final review; it does not save. Unknown component remains null until mapped. Fuzzy names never auto-complete an entire module. Source excerpts may contain personal information and stay memory-only; show only the minimum assessment row needed for review.

## Adapter test contract

Fixtures specify `TextItem[]`, adapter/version, expected row scopes, candidate component IDs, explicit statuses and confidence reasons. Cover multicolumn order, repeated headers, umlauts, decimal commas, module summaries, PVL rows, passed/failed retakes, missing result, unknown aliases, password/corrupt/image-only PDFs and bounds/cancel. Synthetic PDF generated from a known invented table must exercise actual PDF.js extraction in browser, not just a mocked parser. No real student number, name, grade history or copied raw source page belongs in tests.

For the recovery example, explicit MAE2 pass + MA2 exam fail proposals lead to ma2.exercise passed and ma2.exam failed after confirmation. EEL1 pass cannot be matched to ELL1 (Electronics 1); string similarity is insufficient. Unknown status/alias leaves existing progress untouched. Integration test records all requests and asserts PDF bytes, extracted text, filename and accepted progress never leave the browser.

## Shipping format coverage

Publish supported adapter ID/version and known limitations in the import UI. Until a representative HAW transcript has been validated, label the feature "Preview — check every match" and keep the manual route equally available. Framework completion does not satisfy the P1 real-format acceptance gate by itself. Do not block the P0 planner on this missing sample.
