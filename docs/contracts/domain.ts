/** Executable specification only; no runtime code. Canonical target for lib/domain/types.ts. */
export type ID = string;
export type DateISO = string; // Runtime schema: real YYYY-MM-DD, not Date.parse alone.
export type InstantISO = string; // UTC ISO-8601 timestamp.
export type Locale = 'en' | 'de';
export type Localized = { en: string; de: string };
export type ComponentStatus = 'not_started' | 'registered' | 'in_progress' | 'passed' | 'failed';
export type ComponentKind = 'exam' | 'lab' | 'exercise' | 'project' | 'presentation' | 'case_study' | 'other_pvl';
export interface Evidence {
  sourceId: ID;
  locator: string; // Page/section or local path+line; never student excerpts.
  checkedOn: DateISO;
  state: 'verified' | 'provisional' | 'disputed';
}
export interface Source {
  id: ID;
  title: string;
  uri: string;
  publishedOn: DateISO | null;
  accessedOn: DateISO;
}
export type Requirement =
  | { kind: 'module'; moduleId: ID }
  | { kind: 'component'; componentId: ID }
  | { kind: 'milestone'; milestoneId: ID }
  | { kind: 'all'; items: Requirement[] }
  | { kind: 'any'; items: Requirement[] }
  | { kind: 'at_least'; count: number; items: Requirement[] }
  | { kind: 'unknown'; issueId: ID };
export interface Component {
  id: ID; // Globally unique, e.g. ma2.exercise; stable across terms.
  moduleId: ID;
  name: Localized;
  kind: ComponentKind;
  isPVL: boolean;
  estimatedRemainingHours: number | null;
  estimateSource: 'official' | 'product_default' | 'unknown';
  evidence: Evidence[];
}
export interface Module {
  id: ID; // Internal stable identity, e.g. ma2; not a schedule code.
  officialCodes: string[];
  aliases: string[];
  name: Localized;
  credits: number | null;
  recommendedSemester: number | null;
  type: 'required' | 'elective' | 'project' | 'internship' | 'thesis';
  theme: string; // Existing display palette, no academic semantics.
  componentIds: ID[];
  completion: Requirement;
  evidence: Evidence[];
}
export interface Rule {
  id: ID;
  curriculumVersion: string;
  target: { kind: 'module' | 'component' | 'milestone'; id: ID };
  appliesTo: 'participation' | 'assessment' | 'completion';
  timing: 'before_term' | 'before_assessment';
  strength: 'hard' | 'recommended';
  requirement: Requirement;
  evidence: Evidence[];
}
export interface Milestone {
  id: ID;
  name: Localized;
  requirement: Requirement;
  ruleIds: ID[];
  effect: 'internship' | 'graduation' | 'other';
  exceptionNoteKey: string | null; // Information, never automatically granted.
  evidence: Evidence[];
}
export interface DegreeSlot {
  id: ID;
  name: Localized;
  eligibleModuleIds: ID[];
  requiredCount: number | null;
  requiredCredits: number | null;
  evidence: Evidence[];
}
export interface Curriculum {
  schemaVersion: 1;
  id: 'haw-ie-bsc';
  version: string;
  regulationLabel: string;
  sources: Source[];
  modules: Module[];
  components: Component[];
  rules: Rule[];
  milestones: Milestone[];
  degreeSlots: DegreeSlot[];
  firstYearModuleIds: ID[]; // Explicit, reviewed roster, not schedule IE1/IE2 inference.
  dataIssues: DataIssue[];
}
export interface DataIssue {
  id: ID;
  entityIds: ID[];
  severity: 'warning' | 'quarantine';
  code: string;
  evidence: Evidence[];
  resolution: string | null;
}
export type TermCatalogEntry =
  | { id: ID; label: Localized; status: 'unavailable' }
  | { id: ID; label: Localized; status: 'published'; version: string; packageUrl: string; sha256: string };
export interface AcademicAlias {
  value: string;
  curriculumVersion: string;
  target: { kind: 'module'; moduleId: ID } | { kind: 'component'; componentId: ID };
  scope: 'official_code' | 'legacy_schedule_code' | 'transcript_name';
  evidence: Evidence[];
}
export interface Term {
  id: ID; // YYYY-ws or YYYY-ss, e.g. 2025-ws.
  version: string;
  label: Localized;
  timezone: 'Europe/Berlin';
  start: DateISO;
  endExclusive: DateISO;
  teachingWeekStarts: DateISO[]; // Ordered ISO Mondays; retain zero-session weeks.
  breaks: { start: DateISO; endExclusive: DateISO; name: Localized }[];
  publication: 'verified' | 'historical' | 'unavailable';
  evidence: Evidence[];
}
export interface Occurrence {
  id: ID;
  date: DateISO;
  startMinute: number; // 0..1439 in Europe/Berlin; no host timezone arithmetic.
  endMinute: number; // 1..1440, greater than startMinute. Split overnight sessions.
}
export interface SessionSeries {
  id: ID;
  termId: ID;
  offeringId: ID;
  componentIds: ID[]; // Empty allowed for optional supporting lectures.
  kind: 'lecture' | 'lab' | 'exercise' | 'project' | 'exam' | 'other';
  attendance: 'mandatory' | 'optional' | 'unknown';
  location: string;
  campusId: ID | null;
  delivery: 'campus' | 'online' | 'unknown';
  instructors: string[];
  occurrences: Occurrence[];
  evidence: Evidence[];
}
export interface GroupOption {
  id: ID; // Opaque globally scoped ID; display group '02' remains a string.
  label: string;
  sourceCodes: string[];
  sessionIds: ID[]; // Entire bundle including one-off introductory meetings.
}
export interface GroupChoice {
  id: ID;
  componentIds: ID[];
  min: 0 | 1;
  max: 1;
  options: GroupOption[];
}
export interface Offering {
  id: ID;
  termId: ID;
  moduleId: ID;
  availability: 'offered' | 'not_offered' | 'unknown';
  componentAvailability: { componentId: ID; state: 'offered' | 'not_offered' | 'unknown' }[];
  sharedSessionIds: ID[];
  groupChoices: GroupChoice[];
  compatibility: { choiceA: ID; choiceB: ID; allowedPairs: [ID, ID][] }[];
  registration: { opensAt: InstantISO; closesAt: InstantISO; source: Evidence } | null;
  evidence: Evidence[];
}
export interface TermDataset {
  term: Term;
  curriculumVersion: string;
  offerings: Offering[];
  sessions: SessionSeries[];
  issues: DataIssue[];
}
export interface ProgressRecord {
  componentId: ID;
  status: ComponentStatus;
  grade?: string; // Preserved display value; no inferred GPA or pass threshold.
  attempts?: number;
  notes?: string;
  completedOn?: DateISO;
  source: 'manual' | 'confirmed_import';
  updatedAt: InstantISO;
}
export type Goal = 'internship' | 'credits' | 'bank_pvl' | 'backlog' | 'curriculum' | 'custom';
export type Intensity = 'safe' | 'balanced' | 'aggressive';
export interface Preferences {
  goal: Goal;
  selectedMilestoneId: ID;
  preferredIntensity: Intensity;
  maxNewLabs: 2 | 3 | 4 | 5 | 6;
  maxWorkloadHours: number | null;
  scheduleStyle: 'even' | 'compressed';
  campus: 'fewer_days' | 'neutral';
  lectures: 'high' | 'medium' | 'low';
  avoidBeforeMinute: number | null;
  avoidAfterMinute: number | null;
  avoidWeekdays: number[]; // ISO 1..7; soft preferences, labelled as such.
  friendModuleIds: ID[]; // No friend identity.
  preferredGroupIds: ID[];
  customModulePriority: Record<ID, number>; // Integers 0..5, academic tier unchanged.
}
export interface PlanAction {
  moduleId: ID;
  componentIds: ID[];
  mode: 'complete_remaining' | 'bank_components' | 'exam_only';
  includeOptionalLectures: boolean;
}
export interface ScheduleSelection {
  termId: ID;
  termVersion: string;
  revision: number;
  planId: ID | null;
  actions: PlanAction[];
  groupIds: ID[];
  sessionIds: ID[];
}
export interface StudentProfile {
  schemaVersion: 1;
  curriculumId: 'haw-ie-bsc';
  curriculumVersion: string;
  revision: number;
  subjectSemester: number;
  progress: ProgressRecord[]; // Absence = unknown/not reviewed; not failed.
  degreeAssignments: { moduleId: ID; slotId: ID }[];
  preferences: Preferences;
  selections: ScheduleSelection[];
  updatedAt: InstantISO;
}
export type Truth = 'met' | 'unmet' | 'unknown';
export interface Eligibility {
  status: 'eligible' | 'blocked' | 'conditional' | 'unknown';
  missingRuleIds: ID[];
  warningRuleIds: ID[];
}
export interface ModuleState {
  moduleId: ID;
  completion: Truth;
  primaryBadge: 'completed' | 'exam_only' | 'lab_missing' | 'exercise_missing' | 'in_progress' | 'not_started' | 'needs_review';
  failedExam: boolean;
  remainingComponentIds: ID[];
  unknownComponentIds: ID[];
  earnedCredits: number | null;
}
export interface Reason {
  code: string; // Typed key union generated from reason registry in implementation.
  entityIds: ID[];
  ruleIds: ID[];
  params: Record<string, string | number>;
  points: number;
  category: 'academic' | 'workload' | 'schedule' | 'social' | 'warning';
}
export interface Conflict {
  occurrenceA: ID;
  occurrenceB: ID;
  date: DateISO;
  overlapMinutes: number;
  severity: 'hard' | 'soft' | 'uncertain';
}
export interface ScheduleMetrics {
  hardConflicts: number;
  softConflicts: number;
  overlappingPairs: number;
  campusDates: DateISO[];
  heavyDates: DateISO[];
  heavyWeekStarts: DateISO[];
  longestCampusDayMinutes: number;
  idleMinutes: number;
  fragmentation: number;
  weeklyContactMinutes: Record<DateISO, number>;
  activeWeeks: number;
  contactMinutes: number;
}
export interface Plan {
  id: ID;
  intensity: Intensity;
  applicability: 'ready' | 'conditional' | 'data_incomplete';
  actions: PlanAction[];
  groupIds: ID[];
  sessionIds: ID[];
  newLabs: number;
  newOtherPVLs: number;
  examOnlyModuleIds: ID[];
  potentialCredits: number;
  unknownCreditModuleIds: ID[];
  estimatedHours: number;
  conflicts: Conflict[];
  metrics: ScheduleMetrics;
  milestonePreview: { id: ID; actual: Truth; ifAllPassed: Truth; remainingNow: ID[]; remainingIfPassed: ID[] }[];
  unlocks: { targetId: ID; kind: 'hard' | 'recommended'; conditional: true }[];
  reasons: Reason[];
  warnings: Reason[];
  omissions?: { moduleId: ID; reasons: Reason[] }[];
}
export interface PlannerInput {
  curriculum: Curriculum;
  dataset: TermDataset;
  profile: StudentProfile;
  pulse: PulseAggregate[]; // Empty by default; cannot alter eligibility.
  algorithmVersion: string;
  asOf: DateISO;
}
export interface PlanResult {
  requestId: ID;
  inputDigest: string; // Local only, never telemetry.
  profileRevision: number;
  curriculumVersion: string;
  termVersion: string;
  algorithmVersion: string;
  plans: Plan[];
  conditionalProposal?: Plan; // Separate preview; never accepted by applyPlan.
  search: { complete: boolean; exploredNodes: number; budget: number; duplicateIntensities: Intensity[] };
  excluded: { moduleId: ID; reasons: Reason[] }[];
}
export type WorkerRequest = { type: 'generate'; requestId: ID; input: PlannerInput; nodeBudget: number } | { type: 'cancel'; requestId: ID };
export type WorkerResponse = { type: 'progress'; requestId: ID; exploredNodes: number } | { type: 'result'; result: PlanResult } | { type: 'error'; requestId: ID; code: string };
export interface ExportEnvelope {
  format: 'schedulehaw-profile';
  schemaVersion: 1;
  exportedAt: InstantISO;
  profile: StudentProfile;
}
export interface ProfileRepository {
  load(): Promise<StudentProfile | null>;
  save(profile: StudentProfile, expectedRevision: number): Promise<StudentProfile>;
  export(): Promise<ExportEnvelope>;
  restore(envelope: ExportEnvelope, expectedRevision: number): Promise<StudentProfile>;
  clear(): Promise<void>;
}
export interface TextItem { page: number; x: number; y: number; width: number; text: string }
export interface ImportProposal {
  rowId: ID;
  componentId: ID | null;
  moduleId: ID | null;
  proposedStatus: ComponentStatus | null;
  grade?: string;
  attempts?: number;
  confidence: number; // Deterministic match quality, not probability.
  reasonCodes: string[];
  sourcePage: number;
  sourceLine: string; // Memory only, never persisted.
  resolution: 'review' | 'accepted' | 'ignored';
}
export interface TranscriptAdapter {
  id: ID;
  version: string;
  detect(items: TextItem[]): number;
  parse(items: TextItem[], curriculum: Curriculum): ImportProposal[];
}
export type PulseVote =
  | { courseId: ID; termId: ID; type: 'intent'; value: 1 }
  | { courseId: ID; termId: ID; type: 'recommend'; value: 0 | 1 }
  | { courseId: ID; termId: ID; type: 'workload'; value: 1 | 2 | 3 };
export interface PulseAggregate {
  courseId: ID;
  termId: ID;
  intentCount: number | null;
  recommendCount: number | null;
  recommendPercent: number | null;
  workloadCounts: [number, number, number] | null;
  updatedAt: InstantISO;
}
export interface AcademicPriority {
  moduleId: ID;
  tier: 'A' | 'B' | 'C';
  points: number;
  reasons: Reason[];
}
export interface AcademicEngine {
  deriveModuleState(moduleId: ID, curriculum: Curriculum, profile: StudentProfile): ModuleState;
  evaluateRequirement(requirement: Requirement, curriculum: Curriculum, profile: StudentProfile): Truth;
  evaluateEligibility(action: PlanAction, input: PlannerInput): Eligibility;
  rankWithoutTimetable(curriculum: Curriculum, profile: StudentProfile): AcademicPriority[];
  generatePlans(input: PlannerInput, requestId: ID, nodeBudget: number): PlanResult;
  resolveSelection(selection: ScheduleSelection, dataset: TermDataset): SessionSeries[];
  applyPlan(result: PlanResult, planId: ID, input: PlannerInput):
    | { ok: true; selection: ScheduleSelection }
    | { ok: false; code: 'STALE_PLAN' | 'INFEASIBLE_PLAN' | 'DATA_INCOMPLETE'; reasons: Reason[] };
}
