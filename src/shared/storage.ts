// localStorage boundary. A missing or throwing storage (private mode, quota, no DOM) degrades to
// a no-op: loads return null and writes return normally, so a game runs without persistence.

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

/** Accessing `localStorage` itself can throw when a browser blocks site data. */
export const browserStorage = (): StorageLike | null => {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
};

/** One versioned key: `parse` rejects a payload of another shape by returning null. */
export type Slot<T> = {
  readonly load: () => T | null;
  readonly save: (value: T) => void;
  readonly clear: () => void;
};

const attempt = (write: () => void): void => {
  try {
    write();
  } catch {
    // Storage refused the write: the in-memory state stays authoritative.
  }
};

export const createSlot = <T>(
  storage: StorageLike | null,
  key: string,
  parse: (json: string) => T | null,
): Slot<T> => ({
  load: () => {
    try {
      const raw = storage?.getItem(key) ?? null;
      return raw === null ? null : parse(raw);
    } catch {
      return null;
    }
  },
  save: (value) => attempt(() => storage?.setItem(key, JSON.stringify(value))),
  clear: () => attempt(() => storage?.removeItem(key)),
});

// In-memory and failing `Storage` stand-ins for persistence and store tests.

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
