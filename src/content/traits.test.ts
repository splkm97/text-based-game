import { describe, expect, test } from "vitest";
import type { Trait } from "../engine/types";
import { TRAIT_IDS } from "./ids";
import { TRAITS } from "./traits";

const levelCurve = (trait: Trait): readonly number[] =>
  Array.from({ length: 8 }, (_, levelIndex) => trait.levelUpPoints(levelIndex));

describe("TRAITS catalog shape", () => {
  test("every id in TRAIT_IDS has an entry whose id equals its key, and nothing else", () => {
    for (const id of TRAIT_IDS) {
      expect(TRAITS[id].id).toBe(id);
    }
    expect(Object.keys(TRAITS).toSorted()).toEqual([...TRAIT_IDS].toSorted());
  });

  test("every entry has non-empty name and description", () => {
    for (const id of TRAIT_IDS) {
      expect(TRAITS[id].name.length).toBeGreaterThan(0);
      expect(TRAITS[id].description.length).toBeGreaterThan(0);
    }
  });
});

describe("trait values", () => {
  test("the six stat traits give exactly +2 to their stat and are otherwise neutral", () => {
    const statTraits = [
      ["strong_arms", "str"],
      ["quick_feet", "agi"],
      ["bookworm", "int"],
      ["silver_tongue", "cha"],
      ["iron_body", "con"],
      ["keen_eyes", "wis"],
    ] as const;
    for (const [id, stat] of statTraits) {
      const trait = TRAITS[id];
      expect(trait.statBonus).toEqual({ [stat]: 2 });
      expect(trait.goldMultiplier).toBe(1);
      expect(trait.attackBonus).toBe(0);
      expect(trait.defenseBonus).toBe(0);
      expect(trait.sanityLossReduction).toBe(0);
      expect(levelCurve(trait)).toEqual(Array(8).fill(3));
    }
  });

  test("miser multiplies gold by 1.2", () => {
    const trait = TRAITS.miser;
    expect(trait.statBonus).toEqual({});
    expect(trait.goldMultiplier).toBe(1.2);
    expect(trait.attackBonus).toBe(0);
    expect(trait.defenseBonus).toBe(0);
    expect(trait.sanityLossReduction).toBe(0);
    expect(levelCurve(trait)).toEqual(Array(8).fill(3));
  });

  test("late_bloomer grants 2 points for the first four level-ups and 5 afterwards", () => {
    const trait = TRAITS.late_bloomer;
    expect(trait.statBonus).toEqual({});
    expect(trait.goldMultiplier).toBe(1);
    expect(trait.attackBonus).toBe(0);
    expect(trait.defenseBonus).toBe(0);
    expect(trait.sanityLossReduction).toBe(0);
    expect(levelCurve(trait)).toEqual([2, 2, 2, 2, 5, 5, 5, 5]);
  });

  test("berserker trades 1 defense for 2 attack", () => {
    const trait = TRAITS.berserker;
    expect(trait.statBonus).toEqual({});
    expect(trait.goldMultiplier).toBe(1);
    expect(trait.attackBonus).toBe(2);
    expect(trait.defenseBonus).toBe(-1);
    expect(trait.sanityLossReduction).toBe(0);
    expect(levelCurve(trait)).toEqual(Array(8).fill(3));
  });

  test("steel_mind reduces every sanity loss by 1", () => {
    const trait = TRAITS.steel_mind;
    expect(trait.statBonus).toEqual({});
    expect(trait.goldMultiplier).toBe(1);
    expect(trait.attackBonus).toBe(0);
    expect(trait.defenseBonus).toBe(0);
    expect(trait.sanityLossReduction).toBe(1);
    expect(levelCurve(trait)).toEqual(Array(8).fill(3));
  });
});
