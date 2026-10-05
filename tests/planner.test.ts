import { it, expect } from "vitest";
import { recoveryInput, session } from "./fixture";
import {
  generatePlans,
  applyPlan,
  candidateActions,
  groupVariants,
} from "@/lib/planner";
import { detectConflicts, overlapMinutes } from "@/lib/schedule/overlap";
import { scheduleMetrics, scheduleCost } from "@/lib/schedule/metrics";
it("detects 90 minutes of partial overlap only on shared dates; adjacent sessions are safe", () => {
  const a = session("a", "2026-10-19", 490, 685),
    b = session("b", "2026-10-19", 595, 820);
  expect(detectConflicts([a, b])[0].overlapMinutes).toBe(90);
  b.occurrences[0].date = "2026-10-26";
  expect(detectConflicts([a, b])).toEqual([]);
  expect(
    overlapMinutes(a.occurrences[0], {
      ...a.occurrences[0],
      startMinute: 685,
      endMinute: 700,
    }),
  ).toBe(0);
});
it("joint search avoids the tempting colliding first groups and respects every cap", () => {
  const i = recoveryInput();
  i.profile.preferences.maxNewLabs = 5;
  const result = generatePlans(i, "test", 100000);
  expect(result.plans).toHaveLength(3);
  for (const p of result.plans) {
    expect(p.conflicts.filter((c) => c.severity === "hard")).toEqual([]);
    expect(p.newLabs).toBeLessThanOrEqual(
      { safe: 2, balanced: 4, aggressive: 5 }[p.intensity],
    );
    expect(
      p.actions
        .filter((a) => a.mode === "exam_only")
        .flatMap((a) => a.componentIds)
        .some((x) => x.endsWith(".lab")),
    ).toBe(false);
    expect(p.milestonePreview[0].remainingIfPassed.length).toBeLessThan(
      p.milestonePreview[0].remainingNow.length,
    );
  }
  const p = result.plans[2];
  expect(
    p.groupIds.includes("ee2:lab:01") && p.groupIds.includes("el1:lab:01"),
  ).toBe(false);
  expect(
    new Set(result.plans.map((p) => JSON.stringify(p.actions))).size,
  ).toBeGreaterThan(1);
});
it("retains complete intro bundles, excludes quarantine, and invalidates stale results", () => {
  const i = recoveryInput(),
    a = candidateActions(i).actions.find(
      (a) => a.moduleId === "ee2" && a.mode === "complete_remaining",
    )!,
    o = i.dataset.offerings.find((o) => o.moduleId === "ee2")!;
  const intro = session("intro", "2026-10-06", 720, 780, "mandatory", o.id, [
    "ee2.lab",
  ]);
  i.dataset.sessions.push(intro);
  o.groupChoices[0].options[0].sessionIds.push("intro");
  expect(groupVariants(a, i)[0].sessions.some((s) => s.id === "intro")).toBe(
    true,
  );
  const r = generatePlans(i, "apply", 50000);
  expect(applyPlan(r, r.plans[0].id, i).sessionIds).toEqual(
    r.plans[0].sessionIds,
  );
  i.profile.subjectSemester++;
  expect(() => applyPlan(r, r.plans[0].id, i)).toThrow("STALE_PLAN");
});
it("reports bounded search honestly and remains deterministic with reordered data", () => {
  const i = recoveryInput();
  expect(generatePlans(i, "small", 20).search.complete).toBe(false);
  const a = generatePlans(i, "a", 100000);
  i.dataset.sessions.reverse();
  i.dataset.offerings.reverse();
  expect(generatePlans(i, "b", 100000).plans.map((p) => p.id)).toEqual(
    a.plans.map((p) => p.id),
  );
});
it("uses union contact minutes, idle gaps and zero teaching weeks in schedule scoring", () => {
  const i = recoveryInput(),
    s = [
      session("one", "2026-10-05", 480, 540),
      session("two", "2026-10-05", 600, 660, "optional"),
    ];
  const m = scheduleMetrics(s, i.dataset.term);
  expect(m.contactMinutes).toBe(120);
  expect(m.idleMinutes).toBe(60);
  expect(Object.values(m.weeklyContactMinutes)).toContain(0);
  const even = scheduleCost(
      m,
      { ...i.profile.preferences, scheduleStyle: "even" },
      s,
    ),
    compressed = scheduleCost(
      m,
      { ...i.profile.preferences, scheduleStyle: "compressed" },
      s,
    );
  expect(even).not.toBe(compressed);
});
