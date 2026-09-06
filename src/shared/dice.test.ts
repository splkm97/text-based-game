import { describe, expect, test } from "vitest";
import { resolveCheck } from "./dice";
import type { Rng } from "./rng";

/** Rng whose next d20 result is `roll`. */
const fixedRolls =
  (roll: number): Rng =>
  () =>
    (roll - 0.5) / 20;

describe("resolveCheck", () => {
  test("natural 20 succeeds even against an impossible dc", () => {
    expect(resolveCheck(1, 99, fixedRolls(20))).toEqual({ roll: 20, success: true });
  });

  test("natural 1 fails even against a trivial dc", () => {
    expect(resolveCheck(50, 2, fixedRolls(1))).toEqual({ roll: 1, success: false });
  });

  test("otherwise succeeds iff roll + stat >= dc", () => {
    expect(resolveCheck(6, 12, fixedRolls(6))).toEqual({ roll: 6, success: true });
    expect(resolveCheck(6, 12, fixedRolls(5))).toEqual({ roll: 5, success: false });
  });
});
