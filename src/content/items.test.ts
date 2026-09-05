import { describe, expect, test } from "vitest";
import type { Effect, Item } from "../engine/types";
import { ITEM_IDS } from "./ids";
import { ITEMS } from "./items";

const entries = ITEM_IDS.map((id) => ITEMS[id]);
const ofKind = <K extends Item["kind"]>(kind: K): readonly Extract<Item, { kind: K }>[] =>
  entries.filter((item): item is Extract<Item, { kind: K }> => item.kind === kind);

const expectWithin = (value: number, min: number, max: number): void => {
  expect(Number.isInteger(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
};

describe("ITEMS catalog shape", () => {
  test("every id in ITEM_IDS has an entry whose id equals its key, and nothing else", () => {
    for (const id of ITEM_IDS) {
      expect(ITEMS[id].id).toBe(id);
    }
    expect(Object.keys(ITEMS).toSorted()).toEqual([...ITEM_IDS].toSorted());
  });

  test("every entry has non-empty Korean name and description and a positive integer price", () => {
    for (const item of entries) {
      expect(item.name.length).toBeGreaterThan(0);
      expect(item.description.length).toBeGreaterThan(0);
      expect(Number.isInteger(item.price)).toBe(true);
      expect(item.price).toBeGreaterThan(0);
    }
  });

  test("kind counts match the content volume", () => {
    expect(ofKind("weapon")).toHaveLength(14);
    expect(ofKind("shield")).toHaveLength(4);
    expect(ofKind("armor")).toHaveLength(6);
    expect(ofKind("relic")).toHaveLength(6);
    expect(ofKind("consumable")).toHaveLength(10);
  });
});

describe("weapons", () => {
  test("attack stays within the range of its category and price within 15..400", () => {
    for (const weapon of ofKind("weapon")) {
      expectWithin(weapon.price, 15, 400);
      if (weapon.twoHanded) {
        expect(weapon.weaponKind).toBe("physical");
        expectWithin(weapon.attack, 5, 9);
      } else if (weapon.weaponKind === "physical") {
        expectWithin(weapon.attack, 2, 7);
      } else {
        expectWithin(weapon.attack, 3, 6);
      }
    }
  });

  test("category split is 6 one-hand physical, 3 two-hand, 2 magic, 3 ranged", () => {
    const weapons = ofKind("weapon");
    const count = (predicate: (weapon: (typeof weapons)[number]) => boolean): number =>
      weapons.filter(predicate).length;
    expect(count((w) => w.twoHanded)).toBe(3);
    expect(count((w) => !w.twoHanded && w.weaponKind === "physical")).toBe(6);
    expect(count((w) => w.weaponKind === "magic")).toBe(2);
    expect(count((w) => w.weaponKind === "ranged")).toBe(3);
  });
});

describe("shields and armor", () => {
  test("shield defense within 1..4", () => {
    for (const shield of ofKind("shield")) {
      expectWithin(shield.defense, 1, 4);
    }
  });

  test("armor defense within 1..5; knight_plate is 5 and costs 350 or more", () => {
    for (const armor of ofKind("armor")) {
      expectWithin(armor.defense, 1, 5);
    }
    const plate = ITEMS.knight_plate;
    expect(plate.kind).toBe("armor");
    if (plate.kind === "armor") {
      expect(plate.defense).toBe(5);
    }
    expect(plate.price).toBeGreaterThanOrEqual(350);
  });
});

describe("relics", () => {
  test("boost one or two stats by +1..+2 and cost 120..500", () => {
    for (const relic of ofKind("relic")) {
      expectWithin(relic.price, 120, 500);
      const bonuses = Object.values(relic.statBonus);
      expect(bonuses.length).toBeGreaterThanOrEqual(1);
      expect(bonuses.length).toBeLessThanOrEqual(2);
      for (const bonus of bonuses) {
        expectWithin(bonus, 1, 2);
      }
    }
  });
});

describe("consumables", () => {
  const expected: Readonly<Record<string, readonly Effect[]>> = {
    bread_loaf: [{ kind: "hp", delta: 3 }],
    healing_salve: [{ kind: "hp", delta: 8 }],
    strong_wine: [
      { kind: "sanity", delta: 4 },
      { kind: "hp", delta: -1 },
    ],
    calming_tea: [{ kind: "sanity", delta: 6 }],
    antidote: [{ kind: "hp", delta: 4 }],
    torch: [{ kind: "xp", delta: 2 }],
    rope: [{ kind: "xp", delta: 2 }],
    holy_water: [{ kind: "sanity", delta: 8 }],
    dream_powder: [
      { kind: "sanity", delta: 10 },
      { kind: "hp", delta: -3 },
    ],
    elixir_of_vigor: [
      { kind: "hp", delta: 15 },
      { kind: "sanity", delta: 5 },
    ],
  };

  test("effects match the balance table and prices stay within 5..120", () => {
    for (const consumable of ofKind("consumable")) {
      expectWithin(consumable.price, 5, 120);
      expect(consumable.effects).toEqual(expected[consumable.id]);
    }
  });
});
