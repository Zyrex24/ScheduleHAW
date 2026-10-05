import { it, expect } from "vitest";
import {
  pulseVote,
  pulseIdentity,
  publicAggregate,
  pulseTieBreak,
} from "@/lib/pulse/contracts";
import { generatePlans } from "@/lib/planner";
import { recoveryInput } from "./fixture";
it("accepts only narrow explicit course votes and validates every value", () => {
  const identity = {
    courseId: "ma2",
    termId: "2025-ws",
    token: "a".repeat(64),
  };
  expect(
    pulseVote.safeParse({ ...identity, type: "intent", value: 1 }).success,
  ).toBe(true);
  for (const extra of [{ profile: {} }, { grade: "5.0" }, { instructor: "x" }])
    expect(
      pulseVote.safeParse({ ...identity, type: "intent", value: 1, ...extra })
        .success,
    ).toBe(false);
  expect(
    pulseVote.safeParse({ ...identity, type: "workload", value: 4 }).success,
  ).toBe(false);
  expect(pulseIdentity.safeParse({ ...identity, type: "intent" }).success).toBe(
    false,
  );
});
it("suppresses low-count signals independently and excludes stale popularity from tie-breaks", () => {
  const row = {
      course_id: "ma2",
      term_id: "2025-ws",
      intent_count: 4,
      recommend_yes: 4,
      recommend_total: 5,
      workload_light: 1,
      workload_moderate: 1,
      workload_heavy: 1,
      updated_at: "2026-10-01T00:00:00Z",
    },
    a = publicAggregate(row);
  expect(a.intentCount).toBe(null);
  expect(a.recommendPercent).toBe(80);
  expect(a.workloadCounts).toBe(null);
  expect(pulseTieBreak(["ma2"], "2025-ws", [a], "2026-10-05")).toBe(0);
  a.recommendCount = 20;
  expect(pulseTieBreak(["ma2"], "2025-ws", [a], "2026-10-05")).toBe(0.8);
  expect(pulseTieBreak(["ma2"], "2025-ws", [a], "2026-12-05")).toBe(0);
});
it("cannot change hard eligibility or first-year academic priorities", () => {
  const i = recoveryInput(),
    a = generatePlans(i, "a", 100000);
  i.pulse = [
    {
      courseId: "ds",
      termId: i.dataset.term.id,
      intentCount: 1000,
      recommendCount: 1000,
      recommendPercent: 100,
      workloadCounts: [100, 0, 0],
      updatedAt: "2026-10-05T00:00:00Z",
    },
  ];
  expect(generatePlans(i, "b", 100000).plans.map((p) => p.actions)).toEqual(
    a.plans.map((p) => p.actions),
  );
});
