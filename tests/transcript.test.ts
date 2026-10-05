import { it, expect } from "vitest";
import {
  parseTranscript,
  detectStatus,
  textLines,
} from "@/lib/transcript/adapter";
import { curriculum, academicAliases } from "@/lib/data/loaders";
import type { TextItem } from "@/lib/domain/types";
const item = (text: string, y = 100, x = 0): TextItem => ({
  page: 1,
  y,
  x,
  width: 100,
  text,
});
it("matches exact practical and assessment codes with explicit bilingual outcomes", () => {
  const rows = parseTranscript(
    [
      item("1IE-MAE2.VL BE passed"),
      item("1IE-MA2.PL NB Note 5,0", 80),
      item("1IE-EEL1.VL Bestanden", 60),
    ],
    curriculum,
    academicAliases,
  );
  expect(rows.map((r) => [r.componentId, r.proposedStatus])).toEqual([
    ["ma2.exercise", "passed"],
    ["ma2.exam", "failed"],
    ["ee1.lab", "passed"],
  ]);
  expect(rows[1].grade).toBe("5,0");
  expect(rows.every((r) => r.resolution === "review")).toBe(true);
});
it("does not infer passes from grades or silently trust module-only/duplicate rows", () => {
  expect(detectStatus("Note 1,0")).toBe(null);
  expect(detectStatus("nicht bestanden")).toBe("failed");
  const rows = parseTranscript(
    [
      item("Mathematics 2 Note 1,0"),
      item("1IE-MA2.PL BE", 80),
      item("1IE-MA2.PL NB", 60),
    ],
    curriculum,
    academicAliases,
  );
  expect(rows[0].componentId).toBe(null);
  expect(rows[0].proposedStatus).toBe(null);
  expect(rows[1].confidence).toBeLessThanOrEqual(40);
  expect(rows[2].reasonCodes).toContain("duplicate_or_conflicting_rows");
  expect(parseTranscript([], curriculum, academicAliases)).toEqual([]);
});
it("reconstructs geometry rows across PDF fragments and isolates source excerpts from profile DTOs", () => {
  expect(
    textLines([item("BE", 100, 200), item("1IE-MAE2.VL", 101, 0)]).map(
      (x) => x.text,
    ),
  ).toEqual(["1IE-MAE2.VL BE"]);
});
