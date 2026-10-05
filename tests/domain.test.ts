import { describe, it, expect } from "vitest";
import { recoveryInput, rule } from "./fixture";
import {
  deriveModuleState,
  evaluateRequirement,
  evaluateEligibility,
  remainingPaths,
} from "@/lib/domain/requirements";
import {
  candidateActions,
  scoreAction,
  rankWithoutTimetable,
  hypothetical,
} from "@/lib/planner";
import { validateProfile, parseEnvelope } from "@/lib/domain/schemas";
describe("Component-aware academics", () => {
  it("keeps absence unknown and gives full credits only after module completion", () => {
    const i = recoveryInput();
    i.profile.progress = [];
    expect(deriveModuleState("ma2", i.curriculum, i.profile).completion).toBe(
      "unknown",
    );
    expect(
      deriveModuleState("ma2", i.curriculum, i.profile).earnedCredits,
    ).toBe(0);
    i.profile.progress = [
      {
        componentId: "ma2.exam",
        status: "passed",
        source: "manual",
        updatedAt: i.profile.updatedAt,
      },
    ];
    expect(
      deriveModuleState("ma2", i.curriculum, i.profile).earnedCredits,
    ).toBe(0);
  });
  it("recognizes the six recovery exam-only modules; failed EL2 still needs a lab", () => {
    const i = recoveryInput();
    for (const id of ["ma2", "ee1", "ss1", "di", "ad", "os"])
      expect(deriveModuleState(id, i.curriculum, i.profile).primaryBadge).toBe(
        "exam_only",
      );
    expect(deriveModuleState("el2", i.curriculum, i.profile).primaryBadge).toBe(
      "lab_missing",
    );
    expect(deriveModuleState("ma2", i.curriculum, i.profile).failedExam).toBe(
      true,
    );
  });
  it("keeps recommended warnings distinct from hard restrictions and assessment timing", () => {
    const i = recoveryInput(),
      a = candidateActions(i).actions.find((a) => a.moduleId === "el1")!;
    i.curriculum.rules = [rule("el1")];
    expect(evaluateEligibility(a, i.curriculum, i.profile).status).toBe(
      "blocked",
    );
    i.curriculum.rules = [rule("el1", "recommended")];
    expect(evaluateEligibility(a, i.curriculum, i.profile)).toMatchObject({
      status: "eligible",
      warningRuleIds: ["rule-el1"],
    });
    i.curriculum.rules = [rule("el1", "hard", "before_assessment")];
    expect(evaluateEligibility(a, i.curriculum, i.profile).status).toBe(
      "conditional",
    );
  });
  it("prioritizes all four unfinished first-year modules without allocating old labs", () => {
    const i = recoveryInput(),
      rank = rankWithoutTimetable(i.curriculum, i.profile);
    expect(new Set(rank.slice(0, 4).map((x) => x.moduleId))).toEqual(
      new Set(["ma2", "ee1", "ee2", "el1"]),
    );
    const a = candidateActions(i).actions.find((a) => a.moduleId === "ee1")!;
    expect(a.componentIds).toEqual(["ee1.exam"]);
    expect(
      scoreAction(a, i.curriculum, i.profile).reasons.some(
        (r) => r.code === "reason.firstYear",
      ),
    ).toBe(true);
    expect(
      evaluateRequirement(
        i.curriculum.milestones[0].requirement,
        i.curriculum,
        hypothetical(i.profile, candidateActions(i).actions),
      ),
    ).toBe("met");
  });
  it("handles OR and at-least requirements without double credit", () => {
    const i = recoveryInput(),
      c = i.curriculum,
      p = i.profile;
    const any = {
      kind: "any" as const,
      items: [
        { kind: "component" as const, componentId: "ee1.lab" },
        { kind: "component" as const, componentId: "el2.lab" },
      ],
    };
    expect(evaluateRequirement(any, c, p)).toBe("met");
    expect(remainingPaths(any, c, p)).toEqual([[]]);
    expect(
      evaluateRequirement(
        { kind: "at_least", count: 2, items: any.items },
        c,
        p,
      ),
    ).toBe("unmet");
  });
  it("rejects duplicate components, unknown fields and incompatible curriculum imports", () => {
    const i = recoveryInput();
    expect(() =>
      validateProfile(
        {
          ...i.profile,
          progress: [...i.profile.progress, i.profile.progress[0]],
        },
        i.curriculum,
      ),
    ).toThrow();
    expect(() =>
      validateProfile({ ...i.profile, studentId: "secret" }, i.curriculum),
    ).toThrow();
    expect(() =>
      parseEnvelope(
        JSON.stringify({
          format: "schedulehaw-profile",
          schemaVersion: 1,
          exportedAt: i.profile.updatedAt,
          profile: { ...i.profile, curriculumVersion: "other" },
        }),
        i.curriculum,
      ),
    ).toThrow();
  });
});
