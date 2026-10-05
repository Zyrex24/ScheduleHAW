import recovery from "@/docs/fixtures/recovery-scenario.json";
import { emptyProfile } from "@/lib/persistence/repository";
import type {
  Curriculum,
  PlannerInput,
  SessionSeries,
  Rule,
  ComponentStatus,
} from "@/lib/domain/types";
export function recoveryInput(): PlannerInput {
  const c: Curriculum = {
    schemaVersion: 1,
    id: "haw-ie-bsc",
    version: "fixture-v1",
    regulationLabel: "Synthetic",
    sources: [],
    modules: [],
    components: [],
    rules: [],
    milestones: [],
    degreeSlots: [],
    firstYearModuleIds: [
      ...recovery.firstYearRemaining,
      ...recovery.otherFirstYearExplicitlyPassed,
    ],
    dataIssues: [],
  };
  for (const row of recovery.progress) {
    const ids = Object.keys(row.components).map(
      (kind) => row.moduleId + "." + kind,
    );
    for (const kind of Object.keys(row.components))
      c.components.push({
        id: row.moduleId + "." + kind,
        moduleId: row.moduleId,
        name: { en: kind, de: kind },
        kind: kind as "exam" | "lab" | "exercise",
        isPVL: kind !== "exam",
        estimatedRemainingHours: kind === "exam" ? 35 : 45,
        estimateSource: "product_default",
        evidence: [],
      });
    c.modules.push({
      id: row.moduleId,
      officialCodes: [],
      aliases: [],
      name: { en: row.moduleId, de: row.moduleId },
      credits: 6,
      recommendedSemester: 2,
      type: "required",
      theme: "general",
      componentIds: ids,
      completion: {
        kind: "all",
        items: ids.map((componentId) => ({ kind: "component", componentId })),
      },
      evidence: [],
    });
  }
  for (const id of recovery.otherFirstYearExplicitlyPassed) {
    c.components.push({
      id: id + ".exam",
      moduleId: id,
      name: { en: "exam", de: "exam" },
      kind: "exam",
      isPVL: false,
      estimatedRemainingHours: 35,
      estimateSource: "product_default",
      evidence: [],
    });
    c.modules.push({
      id,
      officialCodes: [],
      aliases: [],
      name: { en: id, de: id },
      credits: 6,
      recommendedSemester: 1,
      type: "required",
      theme: "general",
      componentIds: [id + ".exam"],
      completion: { kind: "component", componentId: id + ".exam" },
      evidence: [],
    });
  }
  c.milestones = [
    {
      id: "internship-eligibility",
      name: { en: "Internship", de: "Praxis" },
      requirement: {
        kind: "all",
        items: c.firstYearModuleIds.map((moduleId) => ({
          kind: "module",
          moduleId,
        })),
      },
      ruleIds: [],
      effect: "internship",
      exceptionNoteKey: null,
      evidence: [],
    },
  ];
  const p = emptyProfile(c);
  p.subjectSemester = 6;
  p.progress = [
    ...recovery.progress.flatMap((row) =>
      Object.entries(row.components)
        .filter(([, status]) => status)
        .map(([kind, status]) => ({
          componentId: row.moduleId + "." + kind,
          status: status as ComponentStatus,
          source: "manual" as const,
          updatedAt: p.updatedAt,
        })),
    ),
    ...recovery.otherFirstYearExplicitlyPassed.map((id) => ({
      componentId: id + ".exam",
      status: "passed" as const,
      source: "manual" as const,
      updatedAt: p.updatedAt,
    })),
  ];
  const d: PlannerInput["dataset"] = {
    curriculumVersion: c.version,
    term: {
      id: recovery.termId,
      version: "fixture-v1",
      label: { en: "Synthetic", de: "Synthetic" },
      timezone: "Europe/Berlin",
      start: "2026-10-05",
      endExclusive: "2027-02-01",
      teachingWeekStarts: [
        "2026-10-05",
        "2026-10-12",
        "2026-10-19",
        "2026-10-26",
      ],
      breaks: [],
      publication: "verified",
      evidence: [],
    },
    offerings: [],
    sessions: [],
    issues: [],
  };
  for (const m of c.modules) {
    const oid = "offer:" + m.id;
    const options = [];
    const practical = c.components.filter(
      (x) => x.moduleId === m.id && x.kind !== "exam",
    );
    for (const component of practical) {
      for (const group of ["01", "02"]) {
        const id = m.id + ":" + component.kind + ":" + group;
        const candidate = recovery.syntheticGroupCases.find((x) => x.id === id);
        const index = recovery.progress.findIndex((x) => x.moduleId === m.id);
        const date =
          candidate?.date || "2026-10-" + String(5 + index).padStart(2, "0");
        const start = candidate
          ? Number(candidate.start.slice(0, 2)) * 60 +
            Number(candidate.start.slice(3))
          : 480;
        const end = candidate
          ? Number(candidate.end.slice(0, 2)) * 60 +
            Number(candidate.end.slice(3))
          : 540;
        d.sessions.push(
          session(id, date, start, end, "mandatory", oid, [component.id]),
        );
        options.push({ id, label: group, sourceCodes: [id], sessionIds: [id] });
      }
    }
    d.offerings.push({
      id: oid,
      termId: d.term.id,
      moduleId: m.id,
      availability: "offered",
      componentAvailability: m.componentIds.map((componentId) => ({
        componentId,
        state: "offered",
      })),
      sharedSessionIds: [],
      groupChoices: practical.length
        ? [
            {
              id: oid + ":choice",
              componentIds: practical.map((x) => x.id),
              min: 1,
              max: 1,
              options,
            },
          ]
        : [],
      compatibility: [],
      registration: null,
      evidence: [],
    });
  }
  return {
    curriculum: c,
    profile: p,
    dataset: d,
    pulse: [],
    algorithmVersion: "planner-v1",
    asOf: "2026-10-05",
  };
}
export function session(
  id: string,
  date: string,
  start: number,
  end: number,
  attendance: SessionSeries["attendance"] = "mandatory",
  offeringId = "offer",
  componentIds: string[] = [],
): SessionSeries {
  return {
    id,
    termId: "fixture-2026-ws",
    offeringId,
    componentIds,
    kind: attendance === "optional" ? "lecture" : "lab",
    attendance,
    location: "BT7",
    campusId: "bt",
    delivery: "campus",
    instructors: [],
    occurrences: [
      { id: id + ":" + date, date, startMinute: start, endMinute: end },
    ],
    evidence: [],
  };
}
export function rule(
  target: string,
  strength: Rule["strength"] = "hard",
  timing: Rule["timing"] = "before_term",
): Rule {
  return {
    id: "rule-" + target,
    curriculumVersion: "fixture-v1",
    target: { kind: "module", id: target },
    strength,
    timing,
    appliesTo: "participation",
    requirement: { kind: "module", moduleId: "ee2" },
    evidence: [
      {
        sourceId: "fixture",
        locator: "test",
        checkedOn: "2026-10-05",
        state: "verified",
      },
    ],
  };
}
