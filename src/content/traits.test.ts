import { describe, expect, test } from "vitest";
import type { Trait } from "../engine/types";
import { TRAIT_IDS } from "./ids";
import { TRAITS } from "./traits";

const NEUTRAL: Omit<Trait, "id" | "name" | "description" | "levelUpPoints"> = {
  statBonus: {},
  goldMultiplier: 1,
  attackBonus: 0,
  defenseBonus: 0,
  sanityLossReduction: 0,
};

const levelCurve = (trait: Trait): readonly number[] =>
  Array.from({ length: 9 }, (_, levelIndex) => trait.levelUpPoints(levelIndex));

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
      expect(trait).toMatchObject({ ...NEUTRAL, statBonus: { [stat]: 2 } });
      expect(levelCurve(trait)).toEqual(Array(9).fill(3));
    }
  });

  test("miser multiplies gold by 1.2", () => {
    expect(TRAITS.miser).toMatchObject({ ...NEUTRAL, goldMultiplier: 1.2 });
    expect(levelCurve(TRAITS.miser)).toEqual(Array(9).fill(3));
  });

  test("late_bloomer grants 2 points for the first four level-ups and 5 afterwards", () => {
    expect(TRAITS.late_bloomer).toMatchObject(NEUTRAL);
    expect(levelCurve(TRAITS.late_bloomer)).toEqual([2, 2, 2, 2, 5, 5, 5, 5, 5]);
  });

  test("berserker trades 1 defense for 2 attack", () => {
    expect(TRAITS.berserker).toMatchObject({ ...NEUTRAL, attackBonus: 2, defenseBonus: -1 });
    expect(levelCurve(TRAITS.berserker)).toEqual(Array(9).fill(3));
  });

  test("steel_mind reduces every sanity loss by 1", () => {
    expect(TRAITS.steel_mind).toMatchObject({ ...NEUTRAL, sanityLossReduction: 1 });
    expect(levelCurve(TRAITS.steel_mind)).toEqual(Array(9).fill(3));
  });
});
