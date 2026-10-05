import { expect, it } from "vitest";
import { recoveryInput } from "./fixture";
import {
  generatePlans,
  candidateActions,
  groupVariants,
  scoreAction,
  actionHours,
  applyPlan,
} from "@/lib/planner";
import { detectConflicts } from "@/lib/schedule/overlap";
import { scheduleCost, scheduleMetrics } from "@/lib/schedule/metrics";
import type { PlanAction, SessionSeries } from "@/lib/domain/types";

it("agrees with an independent exhaustive Cartesian oracle under every workload policy", () => {
  for (const style of ["even", "compressed"] as const) {
    const input = recoveryInput();
    const ids = ["ee2", "el1", "el2"];
    input.dataset.offerings = input.dataset.offerings.filter((o) =>
      ids.includes(o.moduleId),
    );
    input.profile.preferences.scheduleStyle = style;
    input.profile.preferences.maxNewLabs = 3;
    const candidates = candidateActions(input).actions;
    const alternatives = ids.map((id) => [
      null,
      ...candidates
        .filter((a) => a.moduleId === id)
        .flatMap((action) =>
          groupVariants(action, input).map((v) => ({ action, ...v })),
        ),
    ]);
    const combinations = alternatives.reduce<
      Array<Array<(typeof alternatives)[number][number]>>
    >(
      (sets, choices) =>
        sets.flatMap((set) => choices.map((choice) => [...set, choice])),
      [[]],
    );
    const result = generatePlans(input, "oracle", 100000);
    expect(result.search.complete).toBe(true);
    for (const plan of result.plans) {
      const cap = { safe: 2, balanced: 3, aggressive: 3 }[plan.intensity];
      const hoursCap = { safe: 360, balanced: 540, aggressive: 720 }[
        plan.intensity
      ];
      const scored = combinations.flatMap((combination) => {
        const selected = combination.filter(
          (v): v is NonNullable<typeof v> => !!v,
        );
        const actions = selected.map((v) => v.action);
        const sessions = selected.flatMap((v) => v.sessions);
        const labs = actions
          .flatMap((a) => a.componentIds)
          .filter(
            (id) =>
              input.curriculum.components.find((c) => c.id === id)?.kind ===
              "lab",
          ).length;
        const hours = selected.reduce(
          (n, v) => n + actionHours(v.action, v.sessions, input.curriculum),
          0,
        );
        if (
          !actions.length ||
          labs > cap ||
          hours > hoursCap ||
          detectConflicts(sessions).some((c) => c.severity !== "soft")
        )
          return [];
        return [
          { actions, sessions, groups: selected.flatMap((v) => v.groupIds) },
        ];
      });
      const academic = (actions: PlanAction[]) =>
        actions.reduce(
          (tuple, a) => {
            const score = scoreAction(a, input.curriculum, input.profile);
            tuple[{ A: 0, B: 1, C: 2 }[score.tier]] += score.points;
            return tuple;
          },
          [0, 0, 0],
        );
      const cost = (sessions: SessionSeries[]) =>
        scheduleCost(
          scheduleMetrics(sessions, input.dataset.term),
          input.profile.preferences,
          sessions,
        );
      scored.sort((a, b) => {
        const left = academic(a.actions),
          right = academic(b.actions);
        return (
          right[0] - left[0] ||
          right[1] - left[1] ||
          right[2] - left[2] ||
          cost(a.sessions) - cost(b.sessions)
        );
      });
      expect(academic(plan.actions)).toEqual(academic(scored[0].actions));
      const sessions = input.dataset.sessions.filter((s) =>
        plan.sessionIds.includes(s.id),
      );
      expect(cost(sessions)).toBe(cost(scored[0].sessions));
    }
  }
});

it("keeps a bounded collision preview separate, rejects applying it and never relaxes the lab cap", () => {
  const i = recoveryInput();
  const ids = ["ee2", "el1"];
  i.dataset.offerings = i.dataset.offerings.filter((o) =>
    ids.includes(o.moduleId),
  );
  for (const o of i.dataset.offerings)
    o.groupChoices[0].options = [o.groupChoices[0].options[0]];
  const sessions = i.dataset.offerings.map((o) =>
    i.dataset.sessions.find(
      (s) => s.id === o.groupChoices[0].options[0].sessionIds[0],
    )!,
  );
  sessions[0].occurrences[0] = {
    ...sessions[0].occurrences[0],
    date: "2026-10-19",
    startMinute: 480,
    endMinute: 540,
  };
  sessions[1].occurrences[0] = {
    ...sessions[1].occurrences[0],
    date: "2026-10-19",
    startMinute: 520,
    endMinute: 580,
  };
  i.profile.preferences.maxNewLabs = 2;
  const r = generatePlans(i);
  expect(r.plans.every((p) => p.conflicts.length === 0)).toBe(true);
  expect(r.conditionalProposal).toMatchObject({
    applicability: "conditional",
    newLabs: 2,
  });
  expect(r.conditionalProposal!.conflicts[0].overlapMinutes).toBe(20);
  expect(() => applyPlan(r, r.conditionalProposal!.id, i)).toThrow(
    "INFEASIBLE_PLAN",
  );
  i.profile.preferences.maxWorkloadHours = 80;
  expect(generatePlans(i).conditionalProposal).toBeUndefined();
  i.profile.preferences.maxWorkloadHours = null;
  sessions[1].occurrences[0].startMinute = 490;
  expect(generatePlans(i).conditionalProposal).toBeUndefined();
});
