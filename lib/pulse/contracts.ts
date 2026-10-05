import { z } from "zod";
import type { PulseAggregate } from "@/lib/domain/types";
export const pulseIdentity = z
  .object({
    courseId: z.string().min(1).max(180),
    termId: z.string().min(1).max(180),
    token: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export const pulseVote = pulseIdentity
  .extend({
    type: z.enum(["intent", "recommend", "workload"]),
    value: z.number().int(),
  })
  .strict()
  .refine((x) =>
    x.type === "intent"
      ? x.value === 1
      : x.type === "recommend"
        ? [0, 1].includes(x.value)
        : [1, 2, 3].includes(x.value),
  );
export interface AggregateRow {
  course_id: string;
  term_id: string;
  intent_count: number;
  recommend_yes: number;
  recommend_total: number;
  workload_light: number;
  workload_moderate: number;
  workload_heavy: number;
  updated_at: string | Date;
}
export function publicAggregate(row: AggregateRow): PulseAggregate {
  const workload = [
    row.workload_light,
    row.workload_moderate,
    row.workload_heavy,
  ] as [number, number, number];
  return {
    courseId: row.course_id,
    termId: row.term_id,
    intentCount: row.intent_count >= 5 ? row.intent_count : null,
    recommendCount: row.recommend_total >= 5 ? row.recommend_total : null,
    recommendPercent:
      row.recommend_total >= 5
        ? Math.round((100 * row.recommend_yes) / row.recommend_total)
        : null,
    workloadCounts: workload.reduce((a, b) => a + b, 0) >= 5 ? workload : null,
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}
export function pulseTieBreak(
  courseIds: string[],
  termId: string,
  pulse: PulseAggregate[],
  asOf: string,
) {
  return Math.min(
    3,
    courseIds.reduce((score, id) => {
      const a = pulse.find((a) => a.courseId === id && a.termId === termId),
        age = a
          ? (Date.parse(asOf) - Date.parse(a.updatedAt)) / 86400000
          : Infinity;
      return (
        score +
        (a && (a.recommendCount ?? 0) >= 20 && age >= 0 && age <= 30
          ? (a.recommendPercent ?? 0) / 100
          : 0)
      );
    }, 0),
  );
}
