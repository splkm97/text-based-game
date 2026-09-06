import { describe, expect, test } from "vitest";
import { applyConsumable, applyEffects } from "./effects";
import { EngineError } from "./errors";
import { makeHero, makeRun, TEST_CONTENT } from "./testContent";
import type { Effect } from "./types";

const apply = (effects: readonly Effect[], run = makeRun()) =>
  applyEffects(run, effects, TEST_CONTENT);

describe("hp and sanity", () => {
  test("hp loss clamps at 0 and logs the delta", () => {
    const { run, log } = apply([{ kind: "hp", delta: -40 }]);
    expect(run.character.hp).toBe(0);
    expect(log).toEqual(["체력 -40"]);
  });

  test("hp gain clamps at maxHp", () => {
    const { run } = apply(
      [{ kind: "hp", delta: 10 }],
      makeRun({ character: makeHero({ hp: 25 }) }),
    );
    expect(run.character.hp).toBe(30);
  });

  test("sanity loss is reduced by the trait and raised by hard mode", () => {
    const miser = makeRun({ character: makeHero({ trait: "miser" }) });
    expect(apply([{ kind: "sanity", delta: -3 }], miser).run.character.sanity).toBe(28);
    const hard = makeRun({ character: makeHero({ trait: "miser" }), hardMode: true });
    const { run, log } = apply([{ kind: "sanity", delta: -3 }], hard);
    expect(run.character.sanity).toBe(27);
    expect(log).toEqual(["정신력 -3"]);
  });

  test("sanity loss modifiers never turn a loss into a gain, and gains are untouched", () => {
    const miser = makeRun({ character: makeHero({ trait: "miser", sanity: 20 }) });
    const absorbed = apply([{ kind: "sanity", delta: -1 }], miser);
    expect(absorbed.run).toEqual(miser);
    expect(absorbed.log).toEqual([]);
    expect(apply([{ kind: "sanity", delta: 5 }], miser).run.character.sanity).toBe(25);
    const hard = makeRun({ character: makeHero({ sanity: 20 }), hardMode: true });
    expect(apply([{ kind: "sanity", delta: 5 }], hard).run.character.sanity).toBe(25);
  });
});

describe("gold", () => {
  test("positive gains apply the trait multiplier then hard mode 0.75, floored", () => {
    const miser = makeRun({ character: makeHero({ trait: "miser" }) });
    expect(apply([{ kind: "gold", delta: 10 }], miser).run.character.gold).toBe(45);
    const hardMiser = makeRun({ character: makeHero({ trait: "miser" }), hardMode: true });
    const { run, log } = apply([{ kind: "gold", delta: 10 }], hardMiser);
    expect(run.character.gold).toBe(41);
    expect(log).toEqual(["골드 +11"]);
  });

  test("losses ignore multipliers and clamp at 0", () => {
    const hard = makeRun({ character: makeHero({ trait: "miser" }), hardMode: true });
    expect(apply([{ kind: "gold", delta: -10 }], hard).run.character.gold).toBe(20);
    expect(apply([{ kind: "gold", delta: -100 }], hard).run.character.gold).toBe(0);
  });
});

describe("xp and level-ups", () => {
  test("each threshold crossed grants 3 points by default", () => {
    const { run, log } = apply([{ kind: "xp", delta: 25 }]);
    expect(run.character.xp).toBe(25);
    expect(run.character.pendingStatPoints).toBe(6);
    expect(run.character.levelUps).toBe(2);
    expect(log).toEqual(["경험치 +25", "레벨 업! 능력치 포인트 +3", "레벨 업! 능력치 포인트 +3"]);
  });

  test("late_bloomer grants 2 for the first four level-ups and 5 afterwards", () => {
    const bloomer = makeRun({ character: makeHero({ trait: "late_bloomer" }) });
    const first = apply([{ kind: "xp", delta: 45 }], bloomer).run;
    expect(first.character.pendingStatPoints).toBe(8);
    const fifth = apply([{ kind: "xp", delta: 10 }], first).run;
    expect(fifth.character.pendingStatPoints).toBe(13);
    expect(fifth.character.levelUps).toBe(5);
  });

  test("xp caps at 100 and grants at most nine level-ups", () => {
    const { run } = apply([{ kind: "xp", delta: 250 }]);
    expect(run.character.xp).toBe(100);
    expect(run.character.levelUps).toBe(9);
    expect(run.character.pendingStatPoints).toBe(27);
  });

  test("a threshold already granted is not granted again after an xp drop", () => {
    const up = apply([{ kind: "xp", delta: 12 }]).run;
    const down = apply([{ kind: "xp", delta: -5 }], up).run;
    const again = apply([{ kind: "xp", delta: 5 }], down).run;
    expect(again.character.pendingStatPoints).toBe(3);
    expect(again.character.levelUps).toBe(1);
  });
});

describe("stat", () => {
  test("changes the base stat and clamps resources to the new max", () => {
    const { run, log } = apply([{ kind: "stat", stat: "con", delta: -2 }]);
    expect(run.character.stats.con).toBe(8);
    expect(run.character.hp).toBe(26);
    expect(log).toEqual(["건강 -2"]);
  });
});

describe("items", () => {
  test("adds an item when there is room", () => {
    const { run, log } = apply([{ kind: "item", item: "healing_salve" }]);
    expect(run.character.inventory).toEqual(["rusty_sword", "healing_salve"]);
    expect(log).toEqual(["아이템 획득: 치유 연고"]);
  });

  test("drops the item with a log line when the bag is full", () => {
    const full = makeRun({
      character: makeHero({ inventory: Array.from({ length: 7 }, () => "bread_loaf" as const) }),
    });
    const { run, log } = apply([{ kind: "item", item: "healing_salve" }], full);
    expect(run.character.inventory).toHaveLength(7);
    expect(log).toEqual(["가방이 가득 차 아이템을 놓쳤다: 치유 연고"]);
  });

  test("a str drop below the bag's needs removes nothing, but refuses new items", () => {
    const full = makeRun({
      character: makeHero({ inventory: Array.from({ length: 7 }, () => "bread_loaf" as const) }),
    });
    const { run, log } = apply(
      [
        { kind: "stat", stat: "str", delta: -6 },
        { kind: "item", item: "healing_salve" },
      ],
      full,
    );
    expect(run.character.stats.str).toBe(4);
    expect(run.character.inventory).toHaveLength(7);
    expect(log).toEqual(["힘 -6", "가방이 가득 차 아이템을 놓쳤다: 치유 연고"]);
  });

  test("removeItem removes one copy and is a silent no-op when absent", () => {
    const { run, log } = apply([{ kind: "removeItem", item: "rusty_sword" }]);
    expect(run.character.inventory).toEqual([]);
    expect(log).toEqual(["아이템 잃음: 녹슨 검"]);
    const absent = apply([{ kind: "removeItem", item: "kite_shield" }]);
    expect(absent.run).toEqual(makeRun());
    expect(absent.log).toEqual([]);
  });
});

describe("flags, queue, endings", () => {
  test("flag is idempotent", () => {
    const { run } = apply([
      { kind: "flag", flag: "x" },
      { kind: "flag", flag: "x" },
    ]);
    expect(run.flags).toEqual(["mercenary", "x"]);
  });

  test("nextEvent queues a known event and rejects an unknown one", () => {
    expect(apply([{ kind: "nextEvent", event: "ev_followup" }]).run.queuedEvent).toBe(
      "ev_followup",
    );
    expect(() => apply([{ kind: "nextEvent", event: "ev_missing" }])).toThrow(EngineError);
  });

  test("end sets pendingEnding; a later end overwrites", () => {
    const { run } = apply([
      { kind: "end", ending: "retire" },
      { kind: "end", ending: "mercenary_banner" },
    ]);
    expect(run.pendingEnding).toBe("mercenary_banner");
  });
});

describe("applyConsumable", () => {
  test("removes the item and applies its effects", () => {
    const run = makeRun({ character: makeHero({ hp: 20, inventory: ["healing_salve"] }) });
    const used = applyConsumable(run, "healing_salve", TEST_CONTENT);
    expect(used.run.character.inventory).toEqual([]);
    expect(used.run.character.hp).toBe(25);
    expect(used.log).toEqual(["치유 연고 사용", "체력 +5"]);
  });

  test("rejects an item not carried or not consumable", () => {
    expect(() => applyConsumable(makeRun(), "healing_salve", TEST_CONTENT)).toThrow(EngineError);
    expect(() => applyConsumable(makeRun(), "rusty_sword", TEST_CONTENT)).toThrow(EngineError);
  });
});
