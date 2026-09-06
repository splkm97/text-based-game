import { describe, expect, test } from "vitest";
import { EngineError } from "./errors";
import {
  chooseOption,
  consumeItem,
  continueRun,
  equipItem,
  spendStatPoint,
  startRun,
  unequipItem,
} from "./run";
import { constantRng, fixedRolls, makeHero, makeRun, TEST_CONTENT } from "./testContent";
import type { RunState } from "./types";

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

const resolved = (overrides: Partial<RunState> = {}): RunState =>
  makeRun({ phase: { kind: "resolution", text: "끝", effectsLog: [] }, ...overrides });

describe("startRun", () => {
  test("day 1, origin flags, first event picked and marked seen", () => {
    const run = startRun(
      { character: makeHero(), hardMode: true, journeys: ["journey_circus"] },
      TEST_CONTENT,
      constantRng(0),
    );
    expect(run).toMatchObject({
      day: 1,
      kills: 0,
      loadCount: 0,
      hardMode: true,
      journeys: ["journey_circus"],
      flags: ["mercenary"],
      queuedEvent: null,
      pendingEnding: null,
      phase: { kind: "event", event: "ev_crossroad" },
    });
    expect(run.seenEvents).toEqual(["ev_crossroad"]);
  });
});

describe("chooseOption", () => {
  test("rejects a wrong phase, an out-of-range index, and an unavailable choice", () => {
    expect(codeOf(() => chooseOption(resolved(), 0, TEST_CONTENT, constantRng(0)))).toBe(
      "INVALID_PHASE",
    );
    expect(codeOf(() => chooseOption(makeRun(), 9, TEST_CONTENT, constantRng(0)))).toBe(
      "INVALID_CHOICE",
    );
    expect(codeOf(() => chooseOption(makeRun(), 4, TEST_CONTENT, constantRng(0)))).toBe(
      "INVALID_CHOICE",
    );
  });

  test("rejects an event id missing from content", () => {
    const run = makeRun({ phase: { kind: "event", event: "ev_missing" } });
    expect(codeOf(() => chooseOption(run, 0, TEST_CONTENT, constantRng(0)))).toBe("UNKNOWN_ID");
  });

  test("direct outcome applies effects and enters resolution", () => {
    const run = chooseOption(makeRun(), 0, TEST_CONTENT, constantRng(0));
    expect(run.phase).toEqual({
      kind: "resolution",
      text: "잠시 쉬었다.",
      effectsLog: ["경험치 +5", "체력 -3"],
    });
    expect(run.character.hp).toBe(27);
    expect(run.character.xp).toBe(5);
    expect(run.log.map((entry) => entry.text)).toEqual(["잠시 쉬었다.", "경험치 +5", "체력 -3"]);
  });

  test("check outcome rolls against the effective stat and logs the roll", () => {
    const success = chooseOption(makeRun(), 1, TEST_CONTENT, fixedRolls(2));
    expect(success.phase).toMatchObject({
      kind: "resolution",
      text: "바위를 들어 올렸다.",
      effectsLog: ["힘 판정 (d20 2): 성공", "골드 +10"],
    });
    const failure = chooseOption(makeRun(), 1, TEST_CONTENT, fixedRolls(1));
    expect(failure.phase).toMatchObject({ kind: "resolution", text: "허리를 삐끗했다." });
    expect(failure.character.hp).toBe(28);
  });

  test("combat outcome enters the combat phase", () => {
    const run = chooseOption(makeRun(), 2, TEST_CONTENT, constantRng(0));
    expect(run.phase).toMatchObject({ kind: "combat", combat: { monster: "wild_boar" } });
  });

  test("shop outcome enters the shop phase with the stock", () => {
    const run = chooseOption(makeRun(), 3, TEST_CONTENT, constantRng(0));
    expect(run.phase).toMatchObject({
      kind: "shop",
      shop: { stock: ["healing_salve", "kite_shield"] },
    });
  });
});

describe("continueRun", () => {
  test("throws INVALID_PHASE outside resolution", () => {
    expect(codeOf(() => continueRun(makeRun(), TEST_CONTENT, constantRng(0)))).toBe(
      "INVALID_PHASE",
    );
  });

  test("advances the day and picks the next event, marking it seen", () => {
    const run = continueRun(resolved(), TEST_CONTENT, constantRng(0));
    expect(run.day).toBe(2);
    expect(run.phase).toEqual({ kind: "event", event: "ev_crossroad" });
    expect(run.seenEvents).toEqual(["ev_crossroad"]);
  });

  test("uses the queued follow-up event and clears the queue", () => {
    const shrine = makeRun({ phase: { kind: "event", event: "ev_shrine" } });
    const prayed = chooseOption(shrine, 0, TEST_CONTENT, constantRng(0));
    expect(prayed.queuedEvent).toBe("ev_followup");
    const next = continueRun(prayed, TEST_CONTENT, constantRng(0.5));
    expect(next.phase).toEqual({ kind: "event", event: "ev_followup" });
    expect(next.queuedEvent).toBeNull();
  });

  test("finalizes a pending story ending over death, and death over retire", () => {
    const story = continueRun(
      resolved({ pendingEnding: "mercenary_banner", character: makeHero({ hp: 0 }) }),
      TEST_CONTENT,
      constantRng(0),
    );
    expect(story.phase).toMatchObject({ kind: "ended", ending: "mercenary_banner" });
    const dead = continueRun(
      resolved({ character: makeHero({ hp: 0, xp: 100 }) }),
      TEST_CONTENT,
      constantRng(0),
    );
    expect(dead.phase).toMatchObject({ kind: "ended", ending: "death" });
  });

  test("xp 100 retires the hero with the ending score", () => {
    const run = continueRun(
      resolved({ character: makeHero({ xp: 100 }) }),
      TEST_CONTENT,
      constantRng(0),
    );
    expect(run.phase).toEqual({ kind: "ended", ending: "retire", score: 1082, ranked: true });
  });

  test("a story ending chosen through an event ends the run on continue", () => {
    const followup = makeRun({ phase: { kind: "event", event: "ev_followup" } });
    const chosen = chooseOption(followup, 0, TEST_CONTENT, constantRng(0));
    expect(chosen.pendingEnding).toBe("mercenary_banner");
    const ended = continueRun(chosen, TEST_CONTENT, constantRng(0));
    expect(ended.phase).toMatchObject({ kind: "ended", ending: "mercenary_banner", score: 132 });
    expect(ended.pendingEnding).toBeNull();
  });
});

describe("character actions", () => {
  test("equip, unequip, and spend a stat point keep the phase", () => {
    const equipped = equipItem(makeRun(), "rusty_sword", TEST_CONTENT);
    expect(equipped.character.equipment.mainHand).toBe("rusty_sword");
    expect(equipped.phase).toEqual(makeRun().phase);
    const bare = unequipItem(equipped, "mainHand", TEST_CONTENT);
    expect(bare.character.equipment.mainHand).toBeNull();
    const stronger = spendStatPoint(
      makeRun({ character: makeHero({ pendingStatPoints: 1 }) }),
      "str",
    );
    expect(stronger.character.stats.str).toBe(11);
  });

  test("actions are allowed in event, resolution, and shop, but not in combat or after the end", () => {
    const combat = chooseOption(makeRun(), 2, TEST_CONTENT, constantRng(0));
    expect(codeOf(() => equipItem(combat, "rusty_sword", TEST_CONTENT))).toBe("INVALID_PHASE");
    expect(codeOf(() => spendStatPoint(combat, "str"))).toBe("INVALID_PHASE");
    expect(codeOf(() => equipItem(resolved(), "rusty_sword", TEST_CONTENT))).toBe("no error");
    const ended = makeRun({ phase: { kind: "ended", ending: "death", score: 0, ranked: true } });
    expect(codeOf(() => equipItem(ended, "rusty_sword", TEST_CONTENT))).toBe("INVALID_PHASE");
  });

  test("consumeItem outside combat applies the consumable, keeps the phase, and journals it", () => {
    const run = makeRun({ character: makeHero({ hp: 20, inventory: ["healing_salve"] }), day: 3 });
    const used = consumeItem(run, "healing_salve", TEST_CONTENT);
    expect(used.character.hp).toBe(25);
    expect(used.phase).toEqual(run.phase);
    expect(used.log).toEqual([
      { day: 3, text: "치유 연고 사용" },
      { day: 3, text: "체력 +5" },
    ]);
  });

  test("consumeItem outside combat ends the run when the consumable drains hp to 0", () => {
    const run = resolved({ character: makeHero({ hp: 1, inventory: ["strong_wine"] }), day: 4 });
    const ended = consumeItem(run, "strong_wine", TEST_CONTENT);
    expect(ended.phase).toMatchObject({ kind: "ended", ending: "death" });
    expect(ended.character.hp).toBe(0);
    expect(ended.log.at(-1)).toEqual({ day: 4, text: TEST_CONTENT.endings.death.title });
  });

  test("consumeItem in combat costs the action: the monster attacks once", () => {
    const run = makeRun({ character: makeHero({ hp: 20, inventory: ["healing_salve"] }) });
    const combat = chooseOption(run, 2, TEST_CONTENT, constantRng(0));
    const used = consumeItem(combat, "healing_salve", TEST_CONTENT);
    expect(used.character.hp).toBe(24);
    expect(used.phase.kind).toBe("combat");
  });
});
