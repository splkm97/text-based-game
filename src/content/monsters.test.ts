import { describe, expect, test } from "vitest";
import { ITEM_IDS, MONSTER_IDS } from "./ids";
import { MONSTERS } from "./monsters";

const ordered = MONSTER_IDS.map((id) => MONSTERS[id]);

const expectWithin = (value: number, min: number, max: number): void => {
  expect(Number.isInteger(value)).toBe(true);
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
};

describe("MONSTERS catalog shape", () => {
  test("every id in MONSTER_IDS has an entry whose id equals its key, and nothing else", () => {
    for (const id of MONSTER_IDS) {
      expect(MONSTERS[id].id).toBe(id);
    }
    expect(Object.keys(MONSTERS).toSorted()).toEqual([...MONSTER_IDS].toSorted());
  });

  test("every entry has non-empty name and description", () => {
    for (const monster of ordered) {
      expect(monster.name.length).toBeGreaterThan(0);
      expect(monster.description.length).toBeGreaterThan(0);
    }
  });
});

describe("balance", () => {
  test("every stat stays within its binding range", () => {
    for (const monster of ordered) {
      expectWithin(monster.hp, 4, 60);
      expectWithin(monster.attack, 1, 12);
      expectWithin(monster.defense, 8, 22);
      expectWithin(monster.fleeDc, 8, 20);
      expectWithin(monster.xpReward, 2, 30);
      expectWithin(monster.goldReward, 0, 120);
    }
  });

  test("hp and attack never decrease along MONSTER_IDS order", () => {
    for (let i = 1; i < ordered.length; i += 1) {
      const previous = ordered[i - 1];
      const current = ordered[i];
      if (previous === undefined || current === undefined) {
        throw new Error("MONSTER_IDS index out of range");
      }
      expect(current.hp).toBeGreaterThanOrEqual(previous.hp);
      expect(current.attack).toBeGreaterThanOrEqual(previous.attack);
    }
  });

  test("dragon_of_ash is the pinned apex", () => {
    expect(MONSTERS.dragon_of_ash).toMatchObject({
      hp: 60,
      attack: 12,
      defense: 22,
      fleeDc: 20,
      xpReward: 30,
      goldReward: 120,
    });
  });

  test("about half the monsters drop a catalogued item; the drop key is absent otherwise", () => {
    const dropping = ordered.filter((monster) => "drop" in monster);
    expect(dropping.length).toBeGreaterThanOrEqual(8);
    expect(dropping.length).toBeLessThanOrEqual(12);
    for (const monster of dropping) {
      expect(ITEM_IDS).toContain(monster.drop);
    }
  });
});
