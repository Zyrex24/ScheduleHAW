import type {
  PlannerInput,
  PlanAction,
  Reason,
  Plan,
  PlanResult,
  SessionSeries,
  Intensity,
  StudentProfile,
  Curriculum,
  AcademicPriority,
  ScheduleSelection,
} from "@/lib/domain/types";
import {
  deriveModuleState,
  evaluateRequirement,
  evaluateEligibility,
  remainingPaths,
  requirementModules,
} from "@/lib/domain/requirements";
import { detectConflicts } from "@/lib/schedule/overlap";
import { scheduleMetrics, scheduleCost } from "@/lib/schedule/metrics";
import { pulseTieBreak } from "@/lib/pulse/contracts";
export const ALGORITHM_VERSION = "planner-v1";
const cmp = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
const hash = (s: string) => {
  let n = 2166136261;
  for (let i = 0; i < s.length; i++)
    n = Math.imul(n ^ s.charCodeAt(i), 16777619);
  return (n >>> 0).toString(16);
};
function dependencyTargets(
  id: string,
  c: Curriculum,
  strength: "hard" | "recommended",
) {
  const reached = new Set<string>(),
    queue = [id];
  while (queue.length) {
    const prior = queue.shift()!;
    for (const r of c.rules.filter(
      (r) =>
        r.strength === strength &&
        requirementModules(r.requirement, c).includes(prior),
    )) {
      const target =
        r.target.kind === "component"
          ? c.components.find((x) => x.id === r.target.id)?.moduleId
          : r.target.kind === "module"
            ? r.target.id
            : undefined;
      if (target && target !== id && !reached.has(target)) {
        reached.add(target);
        queue.push(target);
      }
    }
  }
  return [...reached];
}
export const reason = (
  code: string,
  entityIds: string[] = [],
  points = 0,
  category: Reason["category"] = "academic",
  ruleIds: string[] = [],
): Reason => ({ code, entityIds, ruleIds, params: {}, points, category });
export function hypothetical(
  p: StudentProfile,
  actions: PlanAction[],
): StudentProfile {
  const targeted = new Set(actions.flatMap((a) => a.componentIds));
  return {
    ...p,
    progress: [
      ...p.progress.filter((x) => !targeted.has(x.componentId)),
      ...Array.from(targeted).map((componentId) => ({
        componentId,
        status: "passed" as const,
        source: "manual" as const,
        updatedAt: p.updatedAt,
      })),
    ],
  };
}
export function scoreAction(
  action: PlanAction,
  c: Curriculum,
  p: StudentProfile,
): AcademicPriority {
  const m = c.modules.find((m) => m.id === action.moduleId)!;
  const reasons: Reason[] = [];
  const first = c.firstYearModuleIds.includes(m.id),
    failed = action.componentIds.some((id) =>
      p.progress.some((x) => x.componentId === id && x.status === "failed"),
    );
  const milestone = c.milestones.find(
    (x) => x.id === p.preferences.selectedMilestoneId,
  );
  const blocks =
    milestone && requirementModules(milestone.requirement, c).includes(m.id);
  const add = (code: string, points: number) =>
    reasons.push(reason(code, [m.id], points));
  if (blocks)
    add(
      "reason.milestone",
      1000 * (p.preferences.goal === "internship" ? 2 : 1),
    );
  if (first)
    add(
      "reason.firstYear",
      800 * (p.preferences.goal === "internship" ? 2 : 1),
    );
  const future = dependencyTargets(m.id, c, "hard");
  const recommendations = dependencyTargets(m.id, c, "recommended");
  if (future.length) add("reason.unlock", Math.min(300, 60 * future.length));
  if (
    evaluateRequirement(m.completion, c, hypothetical(p, [action])) === "met"
  ) {
    add("reason.completion", 150 * (p.preferences.goal === "credits" ? 2 : 1));
    if (p.preferences.goal === "credits" && m.credits !== null)
      add("reason.credits", Math.min(200, 20 * m.credits));
  }
  const pvls = action.componentIds.filter(
    (id) => c.components.find((x) => x.id === id)?.isPVL,
  ).length;
  if (pvls)
    add(
      "reason.pvl",
      Math.min(240, 120 * pvls) * (p.preferences.goal === "bank_pvl" ? 2 : 1),
    );
  if (failed)
    add("reason.recovery", 100 * (p.preferences.goal === "backlog" ? 2 : 1));
  if (action.mode === "exam_only")
    add("reason.examOnly", 80 * (p.preferences.goal === "backlog" ? 2 : 1));
  if (
    m.recommendedSemester !== null &&
    m.recommendedSemester <= p.subjectSemester
  )
    add("reason.semester", 70 * (p.preferences.goal === "curriculum" ? 2 : 1));
  if (recommendations.length)
    add("reason.preparation", Math.min(100, 25 * recommendations.length));
  if (m.type === "project") add("reason.project", 60);
  if (
    p.preferences.goal === "custom" &&
    p.preferences.customModulePriority[m.id]
  )
    add("reason.custom", 20 * p.preferences.customModulePriority[m.id]);
  const tier: AcademicPriority["tier"] =
    p.preferences.goal === "internship" && (first || blocks)
      ? "A"
      : failed || pvls || future.length
        ? "B"
        : "C";
  return {
    moduleId: m.id,
    tier,
    points: reasons.reduce((n, r) => n + r.points, 0),
    reasons,
  };
}
export function rankWithoutTimetable(
  c: Curriculum,
  p: StudentProfile,
): AcademicPriority[] {
  return c.modules
    .filter((m) => deriveModuleState(m.id, c, p).completion !== "met")
    .map((m) =>
      scoreAction(
        {
          moduleId: m.id,
          componentIds: deriveModuleState(m.id, c, p).remainingComponentIds,
          mode: "complete_remaining",
          includeOptionalLectures: false,
        },
        c,
        p,
      ),
    )
    .sort(
      (a, b) =>
        cmp(a.tier, b.tier) ||
        b.points - a.points ||
        cmp(a.moduleId, b.moduleId),
    );
}
export function candidateActions(input: PlannerInput) {
  const { curriculum: c, profile: p, dataset: d } = input;
  const excluded: PlanResult["excluded"] = [],
    actions: PlanAction[] = [];
  for (const m of c.modules) {
    if (deriveModuleState(m.id, c, p).completion === "met") continue;
    const o = d.offerings.find(
      (x) => x.moduleId === m.id && x.availability === "offered",
    );
    if (!o) {
      excluded.push({
        moduleId: m.id,
        reasons: [reason("reason.notOffered", [m.id], 0, "warning")],
      });
      continue;
    }
    for (const path of remainingPaths(m.completion, c, p)) {
      if (!path.length) continue;
      const practical = path.filter(
        (id) => c.components.find((x) => x.id === id)?.kind !== "exam",
      );
      const available = practical.filter((id) =>
        o.componentAvailability.some(
          (x) => x.componentId === id && x.state === "offered",
        ),
      );
      const full: PlanAction = {
        moduleId: m.id,
        componentIds: path,
        mode: practical.length ? "complete_remaining" : "exam_only",
        includeOptionalLectures:
          practical.length > 0 || p.preferences.lectures === "high",
      };
      const eligibility = evaluateEligibility(full, c, p);
      if (["blocked", "unknown"].includes(eligibility.status)) {
        excluded.push({
          moduleId: m.id,
          reasons: [
            reason(
              "reason.blocked",
              [m.id],
              0,
              "warning",
              eligibility.missingRuleIds,
            ),
          ],
        });
        continue;
      }
      if (practical.every((id) => available.includes(id))) actions.push(full);
      if (available.length && available.length < path.length)
        actions.push({
          ...full,
          componentIds: available,
          mode: "bank_components",
        });
    }
  }
  return {
    actions: actions.filter(
      (a, i, all) =>
        all.findIndex((b) => JSON.stringify(a) === JSON.stringify(b)) === i,
    ),
    excluded,
  };
}
export function groupVariants(
  action: PlanAction,
  input: PlannerInput,
): { groupIds: string[]; sessions: SessionSeries[] }[] {
  const o = input.dataset.offerings.find(
    (x) => x.moduleId === action.moduleId,
  )!;
  const sessions = input.dataset.sessions;
  const wanted = new Set(action.componentIds);
  const shared = o.sharedSessionIds
    .map((id) => sessions.find((s) => s.id === id)!)
    .filter(
      (s) =>
        s &&
        (s.kind !== "lecture"
          ? s.componentIds.some((id) => wanted.has(id))
          : action.includeOptionalLectures),
    );
  let variants = [{ groupIds: [] as string[], sessions: shared }];
  const choices = o.groupChoices
    .filter(
      (c) =>
        c.componentIds.some((id) => wanted.has(id)) ||
        (action.includeOptionalLectures &&
          c.options.some((g) =>
            g.sessionIds.some(
              (id) => sessions.find((s) => s.id === id)?.kind === "lecture",
            ),
          )),
    )
    .sort((a, b) => a.options.length - b.options.length || cmp(a.id, b.id));
  for (const choice of choices) {
    const next: typeof variants = [];
    for (const v of variants)
      for (const group of [...choice.options].sort((a, b) => cmp(a.id, b.id))) {
        const selected = [...v.groupIds, group.id];
        const incompatible = o.compatibility.some((pair) => {
          const ca = o.groupChoices.find((c) => c.id === pair.choiceA),
            cb = o.groupChoices.find((c) => c.id === pair.choiceB),
            a = ca?.options.find((g) => selected.includes(g.id))?.id,
            b = cb?.options.find((g) => selected.includes(g.id))?.id;
          return (
            a && b && !pair.allowedPairs.some(([x, y]) => x === a && y === b)
          );
        });
        if (incompatible) continue;
        const added = group.sessionIds
          .map((id) => sessions.find((s) => s.id === id)!)
          .filter(Boolean);
        if (
          added.some(
            (s) =>
              (s as SessionSeries & { quarantinedDates?: string[] })
                .quarantinedDates?.length,
          )
        )
          continue;
        next.push({ groupIds: selected, sessions: [...v.sessions, ...added] });
      }
    variants = next;
  }
  return variants.filter(
    (v) =>
      !v.sessions.some(
        (s) =>
          (s as SessionSeries & { quarantinedDates?: string[] })
            .quarantinedDates?.length,
      ) && !detectConflicts(v.sessions).some((x) => x.severity !== "soft"),
  );
}
export function actionHours(
  action: PlanAction,
  sessions: SessionSeries[],
  c: Curriculum,
) {
  let hours = 0;
  for (const id of action.componentIds) {
    const comp = c.components.find((x) => x.id === id)!;
    const contact = sessions
      .filter((s) => s.componentIds.includes(id))
      .flatMap((s) => s.occurrences)
      .reduce((n, o) => n + (o.endMinute - o.startMinute) / 60, 0);
    hours +=
      comp.estimatedRemainingHours ??
      (comp.kind === "exam"
        ? 75
        : comp.kind === "lab"
          ? Math.max(45, contact * 2)
          : comp.kind === "exercise"
            ? Math.max(30, contact * 1.5)
            : comp.kind === "project"
              ? 120
              : comp.kind === "presentation"
                ? 30
                : comp.kind === "case_study"
                  ? 60
                  : 45);
  }
  hours += sessions
    .filter((s) => s.kind === "lecture")
    .flatMap((s) => s.occurrences)
    .reduce((n, o) => n + (o.endMinute - o.startMinute) / 60, 0);
  return Math.ceil(hours);
}
function summarize(
  actions: PlanAction[],
  groups: string[],
  sessions: SessionSeries[],
  input: PlannerInput,
  intensity: Intensity,
): Plan {
  const { curriculum: c, profile: p, dataset: d } = input;
  const future = hypothetical(p, actions),
    ids = [...new Set(actions.flatMap((a) => a.componentIds))];
  const targeted = actions
    .map((a) => c.modules.find((m) => m.id === a.moduleId)!)
    .filter((m) => evaluateRequirement(m.completion, c, future) === "met");
  const conflicts = detectConflicts(sessions);
  const reasons = actions.flatMap((a) => scoreAction(a, c, p).reasons),
    warnings: Reason[] = [];
  for (const a of actions) {
    const o = d.offerings.find((o) => o.moduleId === a.moduleId)!;
    for (const ruleId of evaluateEligibility(a, c, p).warningRuleIds)
      warnings.push(
        reason("reason.recommendedMissing", [a.moduleId], 0, "warning", [
          ruleId,
        ]),
      );
    if (
      a.componentIds.some(
        (id) =>
          c.components.find((x) => x.id === id)?.kind === "exam" &&
          !o.componentAvailability.some(
            (x) => x.componentId === id && x.state === "offered",
          ),
      )
    )
      warnings.push(
        reason("reason.examDateUnknown", [a.moduleId], 0, "warning"),
      );
  }
  if (d.term.publication === "historical")
    warnings.push(reason("reason.historical", [], 0, "warning"));
  const signature =
    actions
      .map((a) => a.moduleId + ":" + a.componentIds.join(","))
      .sort()
      .join("|") +
    "#" +
    [...groups].sort().join("|");
  return {
    id: hash(d.term.id + ":" + d.term.version + signature),
    intensity,
    applicability: "ready",
    actions,
    groupIds: [...groups].sort(),
    sessionIds: [...new Set(sessions.map((s) => s.id))].sort(),
    newLabs: ids.filter(
      (id) => c.components.find((x) => x.id === id)?.kind === "lab",
    ).length,
    newOtherPVLs: ids.filter((id) => {
      const x = c.components.find((x) => x.id === id);
      return x?.isPVL && x.kind !== "lab";
    }).length,
    examOnlyModuleIds: actions
      .filter((a) => a.mode === "exam_only")
      .map((a) => a.moduleId),
    potentialCredits: targeted.reduce((n, m) => n + (m.credits || 0), 0),
    unknownCreditModuleIds: targeted
      .filter((m) => m.credits === null)
      .map((m) => m.id),
    estimatedHours: actions.reduce(
      (n, a) =>
        n +
        actionHours(
          a,
          sessions.filter(
            (s) =>
              d.offerings.find((o) => o.moduleId === a.moduleId)?.id ===
              s.offeringId,
          ),
          c,
        ),
      0,
    ),
    conflicts,
    metrics: scheduleMetrics(sessions, d.term),
    milestonePreview: c.milestones.map((m) => ({
      id: m.id,
      actual: evaluateRequirement(m.requirement, c, p),
      ifAllPassed: evaluateRequirement(m.requirement, c, future),
      remainingNow: requirementModules(m.requirement, c).filter(
        (id) => deriveModuleState(id, c, p).completion !== "met",
      ),
      remainingIfPassed: requirementModules(m.requirement, c).filter(
        (id) => deriveModuleState(id, c, future).completion !== "met",
      ),
    })),
    unlocks: c.rules
      .filter(
        (r) =>
          evaluateRequirement(r.requirement, c, p) !== "met" &&
          evaluateRequirement(r.requirement, c, future) === "met",
      )
      .map((r) => ({
        targetId: r.target.id,
        kind: r.strength,
        conditional: true,
      })),
    reasons,
    warnings,
    omissions: c.modules
      .filter(
        (m) =>
          !actions.some((a) => a.moduleId === m.id) &&
          deriveModuleState(m.id, c, p).completion !== "met",
      )
      .map((m) => ({
        moduleId: m.id,
        reasons: candidateActions(input).excluded.find(
          (x) => x.moduleId === m.id,
        )?.reasons || [reason("reason.planOmission", [m.id], 0, "warning")],
      })),
  };
}
type Scored = {
  actions: PlanAction[];
  groups: string[];
  sessions: SessionSeries[];
  tuple: number[];
  cost: number;
  social: number;
  signature: string;
};
const compare = (a: Scored, b: Scored) => {
  for (let i = 0; i < 3; i++)
    if (a.tuple[i] !== b.tuple[i]) return b.tuple[i] - a.tuple[i];
  return (
    a.cost - b.cost || b.social - a.social || cmp(a.signature, b.signature)
  );
};
export function generatePlans(
  input: PlannerInput,
  requestId = "local",
  nodeBudget = 200000,
  onProgress?: (n: number) => void,
): PlanResult {
  const { actions, excluded } = candidateActions(input),
    c = input.curriculum,
    p = input.profile;
  let complete = true,
    explored = 0;
  const plans: Plan[] = [];
  let conditionalProposal: Plan | undefined;
  const modules = [...new Set(actions.map((a) => a.moduleId))]
    .map((id) => ({
      id,
      choices: actions
        .filter((a) => a.moduleId === id)
        .map((a) => ({
          a,
          score: scoreAction(a, c, p),
          variants: groupVariants(a, input),
        }))
        .sort(
          (a, b) => b.score.points - a.score.points || cmp(a.a.mode, b.a.mode),
        ),
    }))
    .sort(
      (a, b) =>
        cmp(a.choices[0].score.tier, b.choices[0].score.tier) ||
        b.choices[0].score.points - a.choices[0].score.points ||
        cmp(a.id, b.id),
    );
  for (const policy of [
    "safe",
    "balanced",
    "aggressive",
    "conditional",
  ] as const) {
    const preview = policy === "conditional";
    const intensity: Intensity = preview ? "aggressive" : policy;
    let nodes = 0;
    const retained: Scored[] = [];
    const cap = Math.min(
        p.preferences.maxNewLabs,
        intensity === "safe" ? 2 : intensity === "balanced" ? 4 : 6,
      ),
      hoursCap = Math.min(
        p.preferences.maxWorkloadHours ?? Infinity,
        { safe: 360, balanced: 540, aggressive: 720 }[intensity],
      );
    const suffix: number[][] = Array.from(
      { length: modules.length + 1 },
      () => [0, 0, 0],
    );
    for (let i = modules.length - 1; i >= 0; i--) {
      suffix[i] = [...suffix[i + 1]];
      for (let tier = 0; tier < 3; tier++)
        suffix[i][tier] += Math.max(
          0,
          ...modules[i].choices
            .filter((x) => ({ A: 0, B: 1, C: 2 })[x.score.tier] === tier)
            .map((x) => x.score.points),
        );
    }
    const dfs = (
      index: number,
      chosen: PlanAction[],
      groups: string[],
      sessions: SessionSeries[],
      labs: number,
      hours: number,
      tuple: number[],
    ) => {
      if (nodes >= nodeBudget) {
        complete = false;
        return;
      }
      nodes++;
      explored++;
      if (nodes % 2000 === 0) onProgress?.(explored);
      if (labs > cap || hours > hoursCap) return;
      if (retained.length >= 20) {
        const upper = tuple.map((x, i) => x + suffix[index][i]),
          last = retained[retained.length - 1];
        let worse = false;
        for (let i = 0; i < 3; i++) {
          if (upper[i] < last.tuple[i]) {
            worse = true;
            break;
          }
          if (upper[i] > last.tuple[i]) break;
        }
        if (worse) return;
      }
      if (index === modules.length) {
        if (!chosen.length) return;
        if (
          preview &&
          !detectConflicts(sessions).some((c) => c.severity === "hard")
        )
          return;
        const signature =
          chosen
            .map(
              (a) =>
                a.moduleId +
                ":" +
                a.mode +
                ":" +
                [...a.componentIds].sort().join(","),
            )
            .sort()
            .join("|") +
          "#" +
          [...groups].sort().join("|");
        if (retained.some((r) => r.signature === signature)) return;
        const metrics = scheduleMetrics(sessions, input.dataset.term);
        const social = Math.min(
          12,
          chosen.filter((a) =>
            p.preferences.friendModuleIds.includes(a.moduleId),
          ).length +
            2 *
              groups.filter((g) => p.preferences.preferredGroupIds.includes(g))
                .length +
            pulseTieBreak(
              chosen.map((a) => a.moduleId),
              input.dataset.term.id,
              input.pulse,
              input.asOf,
            ),
        );
        retained.push({
          actions: chosen,
          groups,
          sessions,
          tuple,
          cost:
            scheduleCost(metrics, p.preferences, sessions) *
            (intensity === "safe" ? 2 : 1),
          social,
          signature,
        });
        retained.sort(compare);
        if (retained.length > 20) retained.pop();
        return;
      }
      for (const choice of modules[index].choices) {
        const newLabs = choice.a.componentIds.filter(
          (id) => c.components.find((x) => x.id === id)?.kind === "lab",
        ).length;
        if (labs + newLabs > cap) continue;
        for (const v of choice.variants) {
          const h = hours + actionHours(choice.a, v.sessions, c);
          if (h > hoursCap) continue;
          const combined = [...sessions, ...v.sessions];
          const collisions = detectConflicts(combined).filter(
            (x) => x.severity !== "soft",
          );
          if (
            collisions.length &&
            (!preview ||
              collisions.length !== 1 ||
              collisions[0].severity !== "hard" ||
              collisions[0].overlapMinutes > 30)
          )
            continue;
          const next = [...tuple];
          next[{ A: 0, B: 1, C: 2 }[choice.score.tier]] += choice.score.points;
          dfs(
            index + 1,
            [...chosen, choice.a],
            [...groups, ...v.groupIds],
            combined,
            labs + newLabs,
            h,
            next,
          );
        }
      }
      dfs(index + 1, chosen, groups, sessions, labs, hours, tuple);
    };
    dfs(0, [], [], [], 0, 0, [0, 0, 0]);
    const best = retained[0];
    if (best) {
      const plan = summarize(
        best.actions,
        best.groups,
        best.sessions,
        input,
        intensity,
      );
      if (preview)
        conditionalProposal = {
          ...plan,
          applicability: "conditional",
          warnings: [
            ...plan.warnings,
            reason("reason.conditionalCollision", [], 0, "warning"),
          ],
        };
      else plans.push(plan);
    }
  }
  const duplicateIntensities = plans
    .filter((x, i) => plans.findIndex((y) => y.id === x.id) < i)
    .map((x) => x.intensity);
  return {
    requestId,
    inputDigest: hash(JSON.stringify(input)),
    profileRevision: p.revision,
    curriculumVersion: c.version,
    termVersion: input.dataset.term.version,
    algorithmVersion: ALGORITHM_VERSION,
    plans,
    ...(conditionalProposal ? { conditionalProposal } : {}),
    search: {
      complete,
      exploredNodes: explored,
      budget: nodeBudget,
      duplicateIntensities,
    },
    excluded,
  };
}
export function applyPlan(
  result: PlanResult,
  planId: string,
  input: PlannerInput,
): ScheduleSelection {
  if (
    result.profileRevision !== input.profile.revision ||
    result.curriculumVersion !== input.curriculum.version ||
    result.termVersion !== input.dataset.term.version ||
    result.algorithmVersion !== ALGORITHM_VERSION ||
    result.inputDigest !== hash(JSON.stringify(input))
  )
    throw new Error("STALE_PLAN");
  const plan = result.plans.find((x) => x.id === planId);
  if (
    !plan ||
    plan.applicability !== "ready" ||
    plan.actions.some((a) =>
      ["blocked", "unknown"].includes(
        evaluateEligibility(a, input.curriculum, input.profile).status,
      ),
    )
  )
    throw new Error("INFEASIBLE_PLAN");
  const sessions = plan.sessionIds.map((id) =>
    input.dataset.sessions.find((s) => s.id === id)!,
  );
  if (
    sessions.some((s) => !s) ||
    detectConflicts(sessions).some((x) => x.severity !== "soft") ||
    plan.newLabs > input.profile.preferences.maxNewLabs
  )
    throw new Error("INFEASIBLE_PLAN");
  return {
    termId: input.dataset.term.id,
    termVersion: input.dataset.term.version,
    revision: input.profile.revision + 1,
    planId,
    actions: plan.actions,
    groupIds: plan.groupIds,
    sessionIds: plan.sessionIds,
  };
}
