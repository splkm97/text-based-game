// The run save slot of this world. A missing or throwing storage degrades to a no-op inside
// `createSlot`, so the game runs without persistence.

import { browserStorage, createSlot, type Slot, type StorageLike } from "../../../shared/storage";
import type { RunState } from "../types";
import { parseRun } from "./schemas";

const RUN_KEY = "lia.voyage.run.v1";

export type Persistence = Slot<RunState>;

export const createPersistence = (storage: StorageLike | null): Persistence =>
  createSlot(storage, RUN_KEY, parseRun);

export const persistence: Persistence = createPersistence(browserStorage());
