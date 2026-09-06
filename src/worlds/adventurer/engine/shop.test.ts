import { describe, expect, test } from "vitest";
import { EngineError } from "./errors";
import { buyItem, buyPrice, leaveShop, sellItem, sellPrice } from "./shop";
import { makeHero, makeRun, TEST_CONTENT } from "./testContent";
import type { RunState } from "./types";

const SHIELD = TEST_CONTENT.items.kite_shield;
const LEAVE = { text: "헤어졌다.", effects: [{ kind: "flag", flag: "left" }] } as const;

const inShop = (overrides: Partial<RunState> = {}): RunState =>
  makeRun({
    phase: { kind: "shop", shop: { stock: ["healing_salve", "kite_shield"], onLeave: LEAVE } },
    ...overrides,
  });

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

describe("prices", () => {
  test("buy price drops 10% per 10 cha, floored, never below 1", () => {
    expect(buyPrice(SHIELD, 4)).toBe(30);
    expect(buyPrice(SHIELD, 10)).toBe(27);
    expect(buyPrice(TEST_CONTENT.items.bread_loaf, 100)).toBe(1);
    expect(buyPrice({ ...SHIELD, price: 1 }, 90)).toBe(1);
  });

  test("sell price is half, rising 10% per 10 cha, floored", () => {
    expect(sellPrice(SHIELD, 4)).toBe(15);
    expect(sellPrice(SHIELD, 10)).toBe(16);
  });

  test("prices follow the formula exactly where float factors would drift", () => {
    expect(buyPrice({ ...SHIELD, price: 90 }, 30)).toBe(63);
    expect(sellPrice({ ...SHIELD, price: 90 }, 40)).toBe(63);
  });
});

describe("buyItem", () => {
  test("moves gold to the merchant and the item into the bag", () => {
    const run = buyItem(inShop(), "kite_shield", TEST_CONTENT);
    expect(run.character.gold).toBe(0);
    expect(run.character.inventory).toEqual(["rusty_sword", "kite_shield"]);
    expect(run.phase.kind).toBe("shop");
  });

  test("uses the relic-boosted cha for the price", () => {
    const rich = inShop({
      character: makeHero({
        inventory: ["kings_signet"],
        equipment: { mainHand: null, offHand: null, armor: null, relic: "kings_signet" },
      }),
    });
    expect(buyItem(rich, "kite_shield", TEST_CONTENT).character.gold).toBe(3);
  });

  test("rejects items not in stock, missing gold, and a full bag", () => {
    expect(codeOf(() => buyItem(inShop(), "rusty_sword", TEST_CONTENT))).toBe("INVALID_ITEM");
    const poor = inShop({ character: makeHero({ gold: 29 }) });
    expect(codeOf(() => buyItem(poor, "kite_shield", TEST_CONTENT))).toBe("NOT_ENOUGH_GOLD");
    const full = inShop({
      character: makeHero({ inventory: Array.from({ length: 7 }, () => "bread_loaf" as const) }),
    });
    expect(codeOf(() => buyItem(full, "healing_salve", TEST_CONTENT))).toBe("INVENTORY_FULL");
  });

  test("throws INVALID_PHASE outside the shop", () => {
    expect(codeOf(() => buyItem(makeRun(), "healing_salve", TEST_CONTENT))).toBe("INVALID_PHASE");
  });
});

describe("sellItem", () => {
  test("unequips, removes the item, and pays the sell price", () => {
    const armed = inShop({
      character: makeHero({
        equipment: { mainHand: "rusty_sword", offHand: null, armor: null, relic: null },
      }),
    });
    const run = sellItem(armed, "rusty_sword", TEST_CONTENT);
    expect(run.character.inventory).toEqual([]);
    expect(run.character.equipment.mainHand).toBeNull();
    expect(run.character.gold).toBe(40);
  });

  test("rejects an item the hero does not carry", () => {
    expect(codeOf(() => sellItem(inShop(), "kite_shield", TEST_CONTENT))).toBe(
      "ITEM_NOT_IN_INVENTORY",
    );
  });
});

describe("leaveShop", () => {
  test("applies the leave outcome and enters resolution", () => {
    const run = leaveShop(inShop(), TEST_CONTENT);
    expect(run.phase).toMatchObject({ kind: "resolution", text: "헤어졌다." });
    expect(run.flags).toContain("left");
  });
});
