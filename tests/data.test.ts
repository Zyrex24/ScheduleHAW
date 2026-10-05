import { it, expect } from "vitest";
import { curriculum, historicalDataset, termCatalog } from "@/lib/data/loaders";
import { execFileSync } from "node:child_process";
import { emptyProfile } from "@/lib/persistence/repository";
import {
  candidateActions,
  groupVariants,
  ALGORITHM_VERSION,
} from "@/lib/planner";
import en from "@/messages/en.json";
import de from "@/messages/de.json";
it("validates every migrated source row and exact published occurrence", () => {
  expect(
    execFileSync(process.execPath, ["scripts/validate-data.cjs"], {
      encoding: "utf8",
    }),
  ).toContain("all 212 migration rows");
  expect(historicalDataset.sessions).toHaveLength(212);
  expect(termCatalog.find((t) => t.id === "2026-ws")?.status).toBe(
    "unavailable",
  );
  expect(new Set(curriculum.components.map((c) => c.id)).size).toBe(
    curriculum.components.length,
  );
});
it("keeps source quarantines out of all usable optimizer group variants", () => {
  const input = {
    curriculum,
    dataset: historicalDataset,
    profile: emptyProfile(curriculum),
    pulse: [],
    algorithmVersion: ALGORITHM_VERSION,
    asOf: "2026-10-05",
  };
  for (const a of candidateActions(input).actions)
    for (const v of groupVariants(a, input))
      for (const s of v.sessions)
        expect(
          (s as { quarantinedDates?: string[] }).quarantinedDates || [],
        ).toEqual([]);
});
it("has complete bilingual key and placeholder parity", () => {
  expect(Object.keys(en).sort()).toEqual(Object.keys(de).sort());
  for (const key of Object.keys(en) as (keyof typeof en)[])
    expect(en[key].match(/\{\w+\}/g) || []).toEqual(
      de[key].match(/\{\w+\}/g) || [],
    );
});
