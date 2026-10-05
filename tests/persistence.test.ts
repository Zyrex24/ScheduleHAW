import "fake-indexeddb/auto";
import { it, expect } from "vitest";
import { recoveryInput } from "./fixture";
import { IndexedProfileRepository } from "@/lib/persistence/repository";
import { parseEnvelope } from "@/lib/domain/schemas";
it("restores a lossless profile and rejects stale tab writes after save/reset", async () => {
  const i = recoveryInput(),
    a = new IndexedProfileRepository(i.curriculum),
    b = new IndexedProfileRepository(i.curriculum);
  await a.clear();
  await a.load();
  const saved = await a.save(i.profile, 0);
  await b.load();
  const envelope = await a.export();
  expect(parseEnvelope(JSON.stringify(envelope), i.curriculum).profile).toEqual(
    saved,
  );
  await a.save(saved, saved.revision);
  await expect(b.save(saved, saved.revision)).rejects.toThrow(
    "PROFILE_CONFLICT",
  );
  await b.load();
  await a.clear();
  await expect(b.save(saved, 2)).rejects.toThrow("PROFILE_CONFLICT");
  const restored = await a.restore(envelope, 0);
  expect(restored.progress).toEqual(saved.progress);
  expect(restored.revision).toBe(1);
});
