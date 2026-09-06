// The run and meta save slots of this world. A missing or throwing storage degrades to a no-op
// inside `createSlot`, so the game runs without persistence.

import { browserStorage, createSlot, type StorageLike } from "../../../shared/storage";
import type { MetaState, RunState } from "../engine/types";
import { parseMeta, parseRun } from "./schemas";

const RUN_KEY = "lia.adventurer.run.v1";
const META_KEY = "lia.adventurer.meta.v1";

export type Persistence = {
  readonly loadRun: () => RunState | null;
  readonly saveRun: (run: RunState) => void;
  readonly clearRun: () => void;
  readonly loadMeta: () => MetaState | null;
  readonly saveMeta: (meta: MetaState) => void;
};

export const createPersistence = (storage: StorageLike | null): Persistence => {
  const run = createSlot(storage, RUN_KEY, parseRun);
  const meta = createSlot(storage, META_KEY, parseMeta);
  return {
    loadRun: run.load,
    saveRun: run.save,
    clearRun: run.clear,
    loadMeta: meta.load,
    saveMeta: meta.save,
  };
};

export const persistence: Persistence = createPersistence(browserStorage());
