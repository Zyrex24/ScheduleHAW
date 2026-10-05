import type {
  Curriculum,
  Requirement,
  StudentProfile,
  Truth,
  ModuleState,
  PlanAction,
  Eligibility,
  TermDataset,
} from "./types";
export function planningAvailability(
  id: string,
  c: Curriculum,
  p: StudentProfile,
  dataset: TermDataset | null,
) {
  const state = deriveModuleState(id, c, p),
    academicModule = c.modules.find((m) => m.id === id)!;
  if (state.completion === "met") return "completed";
  const eligibility = evaluateEligibility(
    {
      moduleId: id,
      componentIds: state.remainingComponentIds,
      mode: "complete_remaining",
      includeOptionalLectures: false,
    },
    c,
    p,
  );
  if (eligibility.status === "blocked") return "blocked";
  if (
    eligibility.status === "unknown" ||
    !dataset?.offerings.some(
      (o) => o.moduleId === id && o.availability === "offered",
    )
  )
    return "unknown";
  return c.firstYearModuleIds.includes(id) ||
    (academicModule.recommendedSemester !== null &&
      academicModule.recommendedSemester <= p.subjectSemester)
    ? "recommendedCourse"
    : "available";
}
export function evaluateRequirement(
  r: Requirement,
  c: Curriculum,
  p: StudentProfile,
  seen = new Set<string>(),
): Truth {
  if (r.kind === "unknown") return "unknown";
  if (r.kind === "component") {
    const status = p.progress.find(
      (x) => x.componentId === r.componentId,
    )?.status;
    return !status ? "unknown" : status === "passed" ? "met" : "unmet";
  }
  if (r.kind === "module" || r.kind === "milestone") {
    const key =
      r.kind + ":" + (r.kind === "module" ? r.moduleId : r.milestoneId);
    if (seen.has(key)) return "unknown";
    const entity =
      r.kind === "module"
        ? c.modules.find((x) => x.id === r.moduleId)?.completion
        : c.milestones.find((x) => x.id === r.milestoneId)?.requirement;
    return entity
      ? evaluateRequirement(entity, c, p, new Set(seen).add(key))
      : "unknown";
  }
  const values = r.items.map((x) => evaluateRequirement(x, c, p, seen));
  if (r.kind === "all")
    return values.includes("unmet")
      ? "unmet"
      : values.includes("unknown")
        ? "unknown"
        : "met";
  if (r.kind === "any")
    return values.includes("met")
      ? "met"
      : values.includes("unknown")
        ? "unknown"
        : "unmet";
  const met = values.filter((x) => x === "met").length,
    unknown = values.filter((x) => x === "unknown").length;
  return met >= r.count ? "met" : met + unknown < r.count ? "unmet" : "unknown";
}
export function requirementModules(
  r: Requirement,
  c: Curriculum,
  seen = new Set<string>(),
): string[] {
  if (r.kind === "module") return [r.moduleId];
  if (r.kind === "component") {
    const id = c.components.find((x) => x.id === r.componentId)?.moduleId;
    return id ? [id] : [];
  }
  if (r.kind === "milestone") {
    if (seen.has(r.milestoneId)) return [];
    const m = c.milestones.find((x) => x.id === r.milestoneId);
    return m
      ? requirementModules(m.requirement, c, new Set(seen).add(r.milestoneId))
      : [];
  }
  return "items" in r
    ? [...new Set(r.items.flatMap((x) => requirementModules(x, c, seen)))]
    : [];
}
/** Every minimal still-needed component path, preserving OR alternatives. */
export function remainingPaths(
  r: Requirement,
  c: Curriculum,
  p: StudentProfile,
): string[][] {
  if (evaluateRequirement(r, c, p) === "met") return [[]];
  if (r.kind === "component") return [[r.componentId]];
  if (r.kind === "unknown" || r.kind === "module" || r.kind === "milestone")
    return [];
  const paths = r.items.map((x) => remainingPaths(x, c, p));
  if (r.kind === "any") return paths.flat();
  const combine = (parts: string[][][]): string[][] =>
    parts.reduce<string[][]>(
      (acc, next) =>
        acc.flatMap((a) => next.map((b) => [...new Set([...a, ...b])])),
      [[]],
    );
  if (r.kind === "all") return combine(paths);
  const combinations: string[][][] = [];
  const choose = (i: number, picked: string[][][]) => {
    if (picked.length === r.count) {
      combinations.push(combine(picked));
      return;
    }
    if (i >= paths.length) return;
    choose(i + 1, [...picked, paths[i]]);
    choose(i + 1, picked);
  };
  choose(0, []);
  return combinations.flat();
}
export function deriveModuleState(
  id: string,
  c: Curriculum,
  p: StudentProfile,
): ModuleState {
  const m = c.modules.find((x) => x.id === id);
  if (!m) throw new Error("UNKNOWN_MODULE");
  const completion = evaluateRequirement(m.completion, c, p);
  const paths = remainingPaths(m.completion, c, p).sort(
    (a, b) => a.length - b.length || a.join().localeCompare(b.join()),
  );
  const remaining = paths[0] || [],
    records = m.componentIds.map((componentId) =>
      p.progress.find((x) => x.componentId === componentId),
    );
  const unknown = m.componentIds.filter(
    (id) => !p.progress.some((x) => x.componentId === id),
  );
  const kinds = remaining.map(
    (id) => c.components.find((x) => x.id === id)?.kind,
  );
  let badge: ModuleState["primaryBadge"] = "not_started";
  if (completion === "met") badge = "completed";
  else if (m.completion.kind === "unknown" || unknown.length)
    badge = "needs_review";
  else if (kinds.length && kinds.every((k) => k === "exam"))
    badge = "exam_only";
  else if (kinds.includes("lab")) badge = "lab_missing";
  else if (kinds.includes("exercise")) badge = "exercise_missing";
  else if (
    records.some(
      (x) => x && ["passed", "registered", "in_progress"].includes(x.status),
    )
  )
    badge = "in_progress";
  return {
    moduleId: id,
    completion,
    primaryBadge: badge,
    failedExam: records.some(
      (x) =>
        x?.status === "failed" &&
        c.components.find((a) => a.id === x.componentId)?.kind === "exam",
    ),
    remainingComponentIds: remaining,
    unknownComponentIds: unknown,
    earnedCredits: completion === "met" ? m.credits : 0,
  };
}
export function evaluateEligibility(
  action: PlanAction,
  c: Curriculum,
  p: StudentProfile,
): Eligibility {
  const missingRuleIds: string[] = [],
    warningRuleIds: string[] = [];
  let unknown = false,
    conditional = false;
  for (const r of c.rules) {
    if (
      r.appliesTo === "completion" ||
      !(
        (r.target.kind === "module" && r.target.id === action.moduleId) ||
        (r.target.kind === "component" &&
          action.componentIds.includes(r.target.id))
      )
    )
      continue;
    const truth = evaluateRequirement(r.requirement, c, p);
    if (truth === "met") continue;
    if (r.strength === "recommended") {
      warningRuleIds.push(r.id);
      continue;
    }
    if (!r.evidence.length || r.evidence.some((x) => x.state !== "verified")) {
      warningRuleIds.push(r.id);
      unknown = true;
      continue;
    }
    if (r.timing === "before_assessment") {
      warningRuleIds.push(r.id);
      conditional = true;
      continue;
    }
    missingRuleIds.push(r.id);
    unknown ||= truth === "unknown";
  }
  return {
    status: missingRuleIds.length
      ? unknown
        ? "unknown"
        : "blocked"
      : unknown
        ? "unknown"
        : conditional
          ? "conditional"
          : "eligible",
    missingRuleIds,
    warningRuleIds,
  };
}
