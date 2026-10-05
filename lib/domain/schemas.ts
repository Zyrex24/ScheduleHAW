import { z } from "zod";
import type { StudentProfile, Curriculum, ExportEnvelope } from "./types";
const id = z.string().min(1).max(180),
  instant = z.string().datetime(),
  minute = z.number().int().min(0).max(1440);
const dateISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const d = new Date(value + "T00:00:00Z");
    return (
      Number.isFinite(d.getTime()) && d.toISOString().slice(0, 10) === value
    );
  });
export const preferencesSchema = z
  .object({
    goal: z.enum([
      "internship",
      "credits",
      "bank_pvl",
      "backlog",
      "curriculum",
      "custom",
    ]),
    selectedMilestoneId: id,
    preferredIntensity: z.enum(["safe", "balanced", "aggressive"]),
    maxNewLabs: z.union([
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
      z.literal(6),
    ]),
    maxWorkloadHours: z.number().positive().max(3000).nullable(),
    scheduleStyle: z.enum(["even", "compressed"]),
    campus: z.enum(["fewer_days", "neutral"]),
    lectures: z.enum(["high", "medium", "low"]),
    avoidBeforeMinute: minute.nullable(),
    avoidAfterMinute: minute.nullable(),
    avoidWeekdays: z.array(z.number().int().min(1).max(7)).max(7),
    friendModuleIds: z.array(id).max(200),
    preferredGroupIds: z.array(id).max(500),
    customModulePriority: z.record(id, z.number().int().min(0).max(5)),
  })
  .strict();
export const actionSchema = z
  .object({
    moduleId: id,
    componentIds: z.array(id).max(100),
    mode: z.enum(["complete_remaining", "bank_components", "exam_only"]),
    includeOptionalLectures: z.boolean(),
  })
  .strict();
export const profileSchema = z
  .object({
    schemaVersion: z.literal(1),
    curriculumId: z.literal("haw-ie-bsc"),
    curriculumVersion: id,
    revision: z.number().int().nonnegative(),
    subjectSemester: z.number().int().min(1).max(30),
    progress: z
      .array(
        z
          .object({
            componentId: id,
            status: z.enum([
              "not_started",
              "registered",
              "in_progress",
              "passed",
              "failed",
            ]),
            grade: z.string().max(32).optional(),
            attempts: z.number().int().min(0).max(99).optional(),
            notes: z.string().max(2000).optional(),
            completedOn: dateISO.optional(),
            source: z.enum(["manual", "confirmed_import"]),
            updatedAt: instant,
          })
          .strict(),
      )
      .max(10000),
    degreeAssignments: z
      .array(z.object({ moduleId: id, slotId: id }).strict())
      .max(200),
    preferences: preferencesSchema,
    selections: z
      .array(
        z
          .object({
            termId: id,
            termVersion: id,
            revision: z.number().int().nonnegative(),
            planId: id.nullable(),
            actions: z.array(actionSchema).max(200),
            groupIds: z.array(id).max(1000),
            sessionIds: z.array(id).max(2000),
          })
          .strict(),
      )
      .max(100),
    updatedAt: instant,
  })
  .strict();
export const envelopeSchema = z
  .object({
    format: z.literal("schedulehaw-profile"),
    schemaVersion: z.literal(1),
    exportedAt: instant,
    profile: profileSchema,
  })
  .strict();
export function validateProfile(value: unknown, c: Curriculum): StudentProfile {
  const p = profileSchema.parse(value) as StudentProfile;
  if (p.curriculumVersion !== c.version)
    throw new Error("CURRICULUM_VERSION_MISMATCH");
  if (
    !c.milestones.some((m) => m.id === p.preferences.selectedMilestoneId) ||
    p.preferences.friendModuleIds.some(
      (id) => !c.modules.some((m) => m.id === id),
    ) ||
    Object.keys(p.preferences.customModulePriority).some(
      (id) => !c.modules.some((m) => m.id === id),
    )
  )
    throw new Error("INVALID_PREFERENCES");
  const known = new Set(c.components.map((x) => x.id));
  const seen = new Set<string>();
  for (const x of p.progress) {
    if (!known.has(x.componentId) || seen.has(x.componentId))
      throw new Error("INVALID_COMPONENT");
    seen.add(x.componentId);
  }
  const assigned = new Set<string>();
  for (const x of p.degreeAssignments) {
    const slot = c.degreeSlots.find((s) => s.id === x.slotId);
    if (
      !slot ||
      !slot.eligibleModuleIds.includes(x.moduleId) ||
      assigned.has(x.moduleId)
    )
      throw new Error("INVALID_DEGREE_ASSIGNMENT");
    assigned.add(x.moduleId);
  }
  for (const s of p.selections)
    for (const a of s.actions) {
      const m = c.modules.find((m) => m.id === a.moduleId);
      if (!m || a.componentIds.some((id) => !m.componentIds.includes(id)))
        throw new Error("INVALID_SELECTION");
    }
  return p;
}
export function parseEnvelope(text: string, c: Curriculum): ExportEnvelope {
  if (new TextEncoder().encode(text).length > 5 * 1024 * 1024)
    throw new Error("PROFILE_TOO_LARGE");
  const e = envelopeSchema.parse(JSON.parse(text));
  return { ...e, profile: validateProfile(e.profile, c) };
}
