// localStorage boundary. A missing or throwing storage (private mode, quota, no DOM) degrades to
// a no-op: loads return null and writes return normally, so the game runs without persistence.

import type { MetaState, RunState } from "../engine/types";
import { parseMeta, parseRun } from "./schemas";

export const RUN_KEY = "lia.run.v1";
export const META_KEY = "lia.meta.v1";

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export type Persistence = {
  readonly loadRun: () => RunState | null;
  readonly saveRun: (run: RunState) => void;
  readonly clearRun: () => void;
  readonly loadMeta: () => MetaState | null;
  readonly saveMeta: (meta: MetaState) => void;
};

const attempt = (write: () => void): void => {
  try {
    write();
  } catch {
    // Storage refused the write: the in-memory state stays authoritative.
  }
};

const read = <T>(
  storage: StorageLike | null,
  key: string,
  parse: (json: string) => T | null,
): T | null => {
  try {
    const raw = storage?.getItem(key) ?? null;
    return raw === null ? null : parse(raw);
  } catch {
    return null;
  }
};

export const createPersistence = (storage: StorageLike | null): Persistence => ({
  loadRun: () => read(storage, RUN_KEY, parseRun),
  saveRun: (run) => attempt(() => storage?.setItem(RUN_KEY, JSON.stringify(run))),
  clearRun: () => attempt(() => storage?.removeItem(RUN_KEY)),
  loadMeta: () => read(storage, META_KEY, parseMeta),
  saveMeta: (meta) => attempt(() => storage?.setItem(META_KEY, JSON.stringify(meta))),
});

/** Accessing `localStorage` itself can throw when a browser blocks site data. */
const browserStorage = (): StorageLike | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

export const persistence: Persistence = createPersistence(browserStorage());
