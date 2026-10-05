import { openDB } from "idb";
import type {
  Curriculum,
  StudentProfile,
  ProfileRepository,
  ExportEnvelope,
} from "@/lib/domain/types";
import { validateProfile } from "@/lib/domain/schemas";
export function emptyProfile(c: Curriculum): StudentProfile {
  return {
    schemaVersion: 1,
    curriculumId: "haw-ie-bsc",
    curriculumVersion: c.version,
    revision: 0,
    subjectSemester: 1,
    progress: [],
    degreeAssignments: [],
    preferences: {
      goal: "internship",
      selectedMilestoneId: "internship-eligibility",
      preferredIntensity: "balanced",
      maxNewLabs: 4,
      maxWorkloadHours: null,
      scheduleStyle: "even",
      campus: "neutral",
      lectures: "medium",
      avoidBeforeMinute: null,
      avoidAfterMinute: null,
      avoidWeekdays: [],
      friendModuleIds: [],
      preferredGroupIds: [],
      customModulePriority: {},
    },
    selections: [],
    updatedAt: new Date().toISOString(),
  };
}
export class IndexedProfileRepository implements ProfileRepository {
  private epoch: number | null = null;
  constructor(private c: Curriculum) {}
  private db() {
    return openDB("schedulehaw-local", 1, {
      upgrade(db) {
        db.createObjectStore("profile");
        db.createObjectStore("meta");
      },
    });
  }
  async load() {
    const db = await this.db();
    const tx = db.transaction(["profile", "meta"]);
    this.epoch = (await tx.objectStore("meta").get("epoch")) || 0;
    const p = await tx.objectStore("profile").get("active");
    await tx.done;
    return p ? validateProfile(p, this.c) : null;
  }
  async save(profile: StudentProfile, expectedRevision: number) {
    validateProfile(profile, this.c);
    const db = await this.db();
    const tx = db.transaction(["profile", "meta"], "readwrite");
    const epoch = (await tx.objectStore("meta").get("epoch")) || 0;
    const prior = (await tx.objectStore("profile").get("active")) as
      StudentProfile | undefined;
    if (
      (this.epoch !== null && epoch !== this.epoch) ||
      (prior?.revision || 0) !== expectedRevision
    ) {
      tx.abort();
      try {
        await tx.done;
      } catch {}
      throw new Error("PROFILE_CONFLICT");
    }
    const next = {
      ...profile,
      revision: expectedRevision + 1,
      updatedAt: new Date().toISOString(),
    };
    await tx.objectStore("profile").put(next, "active");
    await tx.done;
    this.epoch = epoch;
    return next;
  }
  async export(): Promise<ExportEnvelope> {
    const p = await this.load();
    if (!p) throw new Error("NO_PROFILE");
    return {
      format: "schedulehaw-profile",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      profile: p,
    };
  }
  async restore(e: ExportEnvelope, expectedRevision: number) {
    return this.save(validateProfile(e.profile, this.c), expectedRevision);
  }
  async clear() {
    const db = await this.db();
    const tx = db.transaction(["profile", "meta"], "readwrite");
    await tx.objectStore("profile").clear();
    const epoch = ((await tx.objectStore("meta").get("epoch")) || 0) + 1;
    await tx.objectStore("meta").put(epoch, "epoch");
    await tx.done;
    this.epoch = epoch;
  }
}
