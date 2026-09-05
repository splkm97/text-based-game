// In-memory and failing `Storage` stand-ins for persistence and store tests.

import type { StorageLike } from "./persistence";

export type MemoryStorage = StorageLike & { readonly data: ReadonlyMap<string, string> };

export const memoryStorage = (): MemoryStorage => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
};

/** Mimics private mode: every access throws. */
export const throwingStorage = (): StorageLike => {
  const fail = (): never => {
    throw new DOMException("access denied", "SecurityError");
  };
  return { getItem: fail, setItem: fail, removeItem: fail };
};
