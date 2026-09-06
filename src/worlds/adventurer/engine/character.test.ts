import { describe, expect, test } from "vitest";
import {
  allocateStatPoint,
  createCharacter,
  deriveStats,
  effectiveStats,
  equip,
  removeFromInventory,
  unequip,
} from "./character";
import { EngineError } from "./errors";
import { makeHero, TEST_ALLOCATION, TEST_CONTENT } from "./testContent";

const create = (allocation = TEST_ALLOCATION) =>
  createCharacter(
    { name: "용병", origin: "origin_mercenary", trait: "strong_arms", allocation },
    TEST_CONTENT,
  );

const codeOf = (fn: () => void): string => {
  try {
    fn();
  } catch (error) {
    if (error instanceof EngineError) {
      return error.code;
    }
    throw error;
  }
  return "no error";
};

describe("createCharacter", () => {
  test("applies trait bonus after allocation, fills hp/sanity, takes origin items and gold", () => {
    const hero = create();
    expect(hero.stats).toEqual({ str: 10, agi: 6, int: 4, cha: 4, con: 10, wis: 10 });
    expect(hero.hp).toBe(30);
    expect(hero.sanity).toBe(30);
    expect(hero.xp).toBe(0);
    expect(hero.gold).toBe(30);
    expect(hero.inventory).toEqual(["rusty_sword"]);
    expect(hero.equipment).toEqual({ mainHand: null, offHand: null, armor: null, relic: null });
    expect(hero.pendingStatPoints).toBe(0);
    expect(hero.levelUps).toBe(0);
  });

  test("trait bonus may push a stat past the creation cap of 10", () => {
    const hero = create({ str: 10, agi: 4, int: 4, cha: 4, con: 10, wis: 10 });
    expect(hero.stats.str).toBe(12);
  });

  test("rejects a total other than 42", () => {
    expect(codeOf(() => create({ str: 8, agi: 6, int: 4, cha: 4, con: 10, wis: 9 }))).toBe(
      "INVALID_ALLOCATION",
    );
  });

  test("rejects a stat above 10 or below 4", () => {
    expect(codeOf(() => create({ str: 11, agi: 5, int: 4, cha: 4, con: 8, wis: 10 }))).toBe(
      "INVALID_ALLOCATION",
    );
    expect(codeOf(() => create({ str: 10, agi: 10, int: 10, cha: 3, con: 5, wis: 4 }))).toBe(
      "INVALID_ALLOCATION",
    );
  });

  test("rejects non-integer points", () => {
    expect(codeOf(() => create({ str: 7.5, agi: 6.5, int: 4, cha: 4, con: 10, wis: 10 }))).toBe(
      "INVALID_ALLOCATION",
    );
  });
});

describe("deriveStats", () => {
  test("unarmed: attack 1 + floor(str/2) + trait bonus, defense floor(agi/3)", () => {
    expect(deriveStats(makeHero(), TEST_CONTENT)).toEqual({
      maxHp: 30,
      maxSanity: 30,
      inventorySlots: 7,
      attack: 7,
      defense: 2,
    });
  });

  test("physical weapon scales with str, shield and armor add defense", () => {
    const hero = makeHero({
      inventory: ["rusty_sword", "kite_shield", "travel_cloak"],
      equipment: {
        mainHand: "rusty_sword",
        offHand: "kite_shield",
        armor: "travel_cloak",
        relic: null,
      },
    });
    const derived = deriveStats(hero, TEST_CONTENT);
    expect(derived.attack).toBe(9);
    expect(derived.defense).toBe(5);
  });

  test("magic weapon scales with int, ranged weapon with agi", () => {
    const wand = makeHero({
      inventory: ["apprentice_wand"],
      equipment: { mainHand: "apprentice_wand", offHand: null, armor: null, relic: null },
    });
    expect(deriveStats(wand, TEST_CONTENT).attack).toBe(5);
    const bow = makeHero({
      inventory: ["short_bow"],
      equipment: { mainHand: "short_bow", offHand: null, armor: null, relic: null },
    });
    expect(deriveStats(bow, TEST_CONTENT).attack).toBe(7);
  });

  test("relic stat bonus feeds derived stats", () => {
    const hero = makeHero({
      inventory: ["lucky_coin"],
      equipment: { mainHand: null, offHand: null, armor: null, relic: "lucky_coin" },
    });
    expect(effectiveStats(hero, TEST_CONTENT).con).toBe(12);
    expect(deriveStats(hero, TEST_CONTENT).maxHp).toBe(34);
  });
});

describe("allocateStatPoint", () => {
  test("spends one pending point on the stat", () => {
    const hero = allocateStatPoint(makeHero({ pendingStatPoints: 2 }), "con");
    expect(hero.stats.con).toBe(11);
    expect(hero.pendingStatPoints).toBe(1);
  });

  test("throws NO_STAT_POINTS when nothing is pending", () => {
    expect(codeOf(() => allocateStatPoint(makeHero(), "str"))).toBe("NO_STAT_POINTS");
  });
});

describe("equip / unequip", () => {
  test("equips a weapon from inventory into mainHand; the item stays in inventory", () => {
    const hero = equip(makeHero(), "rusty_sword", TEST_CONTENT);
    expect(hero.equipment.mainHand).toBe("rusty_sword");
    expect(hero.inventory).toEqual(["rusty_sword"]);
  });

  test("throws ITEM_NOT_IN_INVENTORY for an item the hero does not carry", () => {
    expect(codeOf(() => equip(makeHero(), "kite_shield", TEST_CONTENT))).toBe(
      "ITEM_NOT_IN_INVENTORY",
    );
  });

  test("throws INVALID_ITEM for a consumable", () => {
    const hero = makeHero({ inventory: ["healing_salve"] });
    expect(codeOf(() => equip(hero, "healing_salve", TEST_CONTENT))).toBe("INVALID_ITEM");
  });

  test("equipping into an occupied slot swaps; the old item remains in inventory", () => {
    const hero = equip(
      equip(makeHero({ inventory: ["rusty_sword", "short_bow"] }), "rusty_sword", TEST_CONTENT),
      "short_bow",
      TEST_CONTENT,
    );
    expect(hero.equipment.mainHand).toBe("short_bow");
    expect(hero.inventory).toEqual(["rusty_sword", "short_bow"]);
  });

  test("a two-handed weapon blocks the offHand slot", () => {
    const armed = equip(
      makeHero({ inventory: ["giant_cleaver", "kite_shield"] }),
      "giant_cleaver",
      TEST_CONTENT,
    );
    expect(codeOf(() => equip(armed, "kite_shield", TEST_CONTENT))).toBe("SLOT_BLOCKED");
  });

  test("equipping a two-handed weapon unequips a held shield", () => {
    const shielded = equip(
      makeHero({ inventory: ["giant_cleaver", "kite_shield"] }),
      "kite_shield",
      TEST_CONTENT,
    );
    const armed = equip(shielded, "giant_cleaver", TEST_CONTENT);
    expect(armed.equipment).toEqual({
      mainHand: "giant_cleaver",
      offHand: null,
      armor: null,
      relic: null,
    });
  });

  test("unequipping a relic clamps hp to the lowered max", () => {
    const hero = makeHero({
      inventory: ["lucky_coin"],
      equipment: { mainHand: null, offHand: null, armor: null, relic: "lucky_coin" },
      hp: 34,
    });
    const bare = unequip(hero, "relic", TEST_CONTENT);
    expect(bare.equipment.relic).toBeNull();
    expect(bare.hp).toBe(30);
  });
});

describe("removeFromInventory", () => {
  test("removes one copy and unequips it when no copy remains", () => {
    const hero = equip(makeHero(), "rusty_sword", TEST_CONTENT);
    const bare = removeFromInventory(hero, "rusty_sword", TEST_CONTENT);
    expect(bare.inventory).toEqual([]);
    expect(bare.equipment.mainHand).toBeNull();
  });

  test("keeps the equipment when a duplicate copy remains", () => {
    const hero = equip(
      makeHero({ inventory: ["rusty_sword", "rusty_sword"] }),
      "rusty_sword",
      TEST_CONTENT,
    );
    const one = removeFromInventory(hero, "rusty_sword", TEST_CONTENT);
    expect(one.inventory).toEqual(["rusty_sword"]);
    expect(one.equipment.mainHand).toBe("rusty_sword");
  });
});
