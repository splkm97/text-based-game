import { describe, expect, test } from "vitest";
import { makeRun } from "../engine/testContent";
import type { MetaState } from "../engine/types";
import { createPersistence, META_KEY, RUN_KEY } from "./persistence";
import { memoryStorage, throwingStorage } from "./testStorage";

const meta: MetaState = {
  codex: { endings: [], monsters: ["wild_boar"], items: [] },
  ranking: [],
};

describe("createPersistence with a working storage", () => {
  test("saves and loads the run under the versioned key, and clears it", () => {
    const storage = memoryStorage();
    const persistence = createPersistence(storage);
    const run = makeRun();
    expect(persistence.loadRun()).toBeNull();
    persistence.saveRun(run);
    expect(storage.data.has(RUN_KEY)).toBe(true);
    expect(persistence.loadRun()).toEqual(run);
    persistence.clearRun();
    expect(storage.data.has(RUN_KEY)).toBe(false);
    expect(persistence.loadRun()).toBeNull();
  });

  test("saves and loads meta under the versioned key", () => {
    const storage = memoryStorage();
    const persistence = createPersistence(storage);
    expect(persistence.loadMeta()).toBeNull();
    persistence.saveMeta(meta);
    expect(storage.data.has(META_KEY)).toBe(true);
    expect(persistence.loadMeta()).toEqual(meta);
  });

  test("treats a corrupt payload as no save", () => {
    const storage = memoryStorage();
    storage.setItem(RUN_KEY, '{"day":');
    storage.setItem(META_KEY, '{"codex":{}}');
    const persistence = createPersistence(storage);
    expect(persistence.loadRun()).toBeNull();
    expect(persistence.loadMeta()).toBeNull();
  });
});

describe("createPersistence without a usable storage", () => {
  test.each([
    ["throwing storage", throwingStorage()],
    ["no storage", null],
  ])("%s: loads return null and writes return normally", (_label, storage) => {
    const persistence = createPersistence(storage);
    expect(persistence.loadRun()).toBeNull();
    expect(persistence.loadMeta()).toBeNull();
    expect(() => persistence.saveRun(makeRun())).not.toThrow();
    expect(() => persistence.saveMeta(meta)).not.toThrow();
    expect(() => persistence.clearRun()).not.toThrow();
    expect(persistence.loadRun()).toBeNull();
  });
});
