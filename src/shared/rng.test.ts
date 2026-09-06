import { describe, expect, test } from "vitest";
import { createRng, pickWeighted, rollD20 } from "./rng";

describe("createRng", () => {
  test("same seed yields the same sequence", () => {
    const a = createRng(20260905);
    const b = createRng(20260905);
    const seqA = Array.from({ length: 100 }, () => a());
    const seqB = Array.from({ length: 100 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  test("different seeds yield different sequences", () => {
    const a = createRng(1);
    const b = createRng(2);
    const seqA = Array.from({ length: 20 }, () => a());
    const seqB = Array.from({ length: 20 }, () => b());
    expect(seqA).not.toEqual(seqB);
  });

  test("values stay within [0, 1)", () => {
    const rng = createRng(7);
    for (let i = 0; i < 10_000; i += 1) {
      const value = rng();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe("rollD20", () => {
  test("stays within 1..20 and hits both ends across 10k rolls", () => {
    const rng = createRng(42);
    const seen = new Set<number>();
    for (let i = 0; i < 10_000; i += 1) {
      const roll = rollD20(rng);
      expect(Number.isInteger(roll)).toBe(true);
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(20);
      seen.add(roll);
    }
    expect(seen.has(1)).toBe(true);
    expect(seen.has(20)).toBe(true);
  });
});

describe("pickWeighted", () => {
  type Entry = { readonly name: string; readonly weight: number };
  const weightOf = (entry: Entry): number => entry.weight;

  test("never picks a zero-weight item", () => {
    const items: readonly Entry[] = [
      { name: "never-first", weight: 0 },
      { name: "sometimes", weight: 1 },
      { name: "never-middle", weight: 0 },
      { name: "often", weight: 3 },
      { name: "never-last", weight: 0 },
    ];
    const rng = createRng(99);
    const picked = new Set<string>();
    for (let i = 0; i < 5_000; i += 1) {
      picked.add(pickWeighted(items, weightOf, rng).name);
    }
    expect(picked).toEqual(new Set(["sometimes", "often"]));
  });

  test("returns the only positive-weight item", () => {
    const items: readonly Entry[] = [{ name: "solo", weight: 5 }];
    expect(pickWeighted(items, weightOf, createRng(3)).name).toBe("solo");
  });

  test("throws RangeError on empty input", () => {
    expect(() => pickWeighted([], weightOf, createRng(1))).toThrow(RangeError);
  });

  test("throws RangeError when every weight is zero", () => {
    const items: readonly Entry[] = [
      { name: "a", weight: 0 },
      { name: "b", weight: 0 },
    ];
    expect(() => pickWeighted(items, weightOf, createRng(1))).toThrow(RangeError);
  });
});
