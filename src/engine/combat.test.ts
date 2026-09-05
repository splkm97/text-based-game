import { describe, expect, test } from "vitest";
import { attemptFlee, combatRound, consumeItemInCombat, startCombat } from "./combat";
import { EngineError } from "./errors";
import { fixedRolls, makeHero, makeRun, TEST_CONTENT } from "./testContent";
import type { CombatState, MonsterId, RunState } from "./types";

const WIN = { text: "이겼다.", effects: [{ kind: "flag", flag: "won" }] } as const;
const FLEE = { text: "달아났다.", effects: [{ kind: "sanity", delta: -2 }] } as const;

/** Hero with the rusty sword equipped: attack 9, defense 2. */
const armed = (overrides: Partial<RunState> = {}): RunState =>
  makeRun({
    character: makeHero({
      equipment: { mainHand: "rusty_sword", offHand: null, armor: null, relic: null },
    }),
    ...overrides,
  });

const fight = (monster: MonsterId, run = armed()): RunState =>
  startCombat(run, monster, WIN, FLEE, TEST_CONTENT);

const combatOf = (run: RunState): CombatState => {
  if (run.phase.kind !== "combat") {
    throw new Error(`expected combat phase, got ${run.phase.kind}`);
  }
  return run.phase.combat;
};

describe("startCombat", () => {
  test("enters the combat phase with the monster at full hp", () => {
    const combat = combatOf(fight("dragon_of_ash"));
    expect(combat).toMatchObject({
      monster: "dragon_of_ash",
      monsterHp: 40,
      monsterMaxHp: 40,
      round: 1,
    });
    expect(combat.onWin).toEqual(WIN);
  });

  test("hard mode scales monster hp by 1.25 rounded up", () => {
    const combat = combatOf(fight("dragon_of_ash", armed({ hardMode: true })));
    expect(combat.monsterHp).toBe(50);
    expect(combat.monsterMaxHp).toBe(50);
  });
});

describe("combatRound", () => {
  test("throws INVALID_PHASE outside combat", () => {
    expect(() => combatRound(makeRun(), TEST_CONTENT, fixedRolls(10))).toThrow(EngineError);
  });

  test("hit: roll + attack >= defense deals attack damage, then the monster retaliates", () => {
    const next = combatRound(fight("dragon_of_ash"), TEST_CONTENT, fixedRolls(9));
    const combat = combatOf(next);
    expect(combat.monsterHp).toBe(31);
    expect(combat.round).toBe(2);
    expect(next.character.hp).toBe(22);
  });

  test("miss: no damage dealt, monster still retaliates", () => {
    const next = combatRound(fight("dragon_of_ash"), TEST_CONTENT, fixedRolls(8));
    expect(combatOf(next).monsterHp).toBe(40);
    expect(next.character.hp).toBe(22);
  });

  test("hard mode monsters attack with +1", () => {
    const next = combatRound(
      fight("dragon_of_ash", armed({ hardMode: true })),
      TEST_CONTENT,
      fixedRolls(8),
    );
    expect(next.character.hp).toBe(21);
  });

  test("critical: natural 20 kills the monster outright and no retaliation follows", () => {
    const next = combatRound(fight("dragon_of_ash"), TEST_CONTENT, fixedRolls(20));
    expect(next.phase.kind).toBe("resolution");
    expect(next.character.hp).toBe(30);
    expect(next.kills).toBe(1);
  });

  test("fumble: natural 1 deals nothing; double attack ignoring defense replaces the retaliation", () => {
    const next = combatRound(fight("wild_boar"), TEST_CONTENT, fixedRolls(1));
    const combat = combatOf(next);
    expect(combat.monsterHp).toBe(8);
    expect(next.character.hp).toBe(24);
    expect(combat.log.slice(1)).toEqual(["실수! 허점을 찔려 6 피해를 입었다."]);
  });

  test("win applies xp, gold, drop, kill count, and the win outcome; phase becomes resolution", () => {
    const next = combatRound(fight("wild_boar"), TEST_CONTENT, fixedRolls(5));
    expect(next.phase).toMatchObject({ kind: "resolution", text: "이겼다." });
    expect(next.character.xp).toBe(5);
    expect(next.character.gold).toBe(40);
    expect(next.character.inventory).toEqual(["rusty_sword", "healing_salve"]);
    expect(next.kills).toBe(1);
    expect(next.flags).toContain("won");
    if (next.phase.kind === "resolution") {
      expect(next.phase.effectsLog).toContain("아이템 획득: 치유 연고");
    }
  });

  test("win in hard mode multiplies gold by 0.75 floored", () => {
    const next = combatRound(
      fight("wild_boar", armed({ hardMode: true })),
      TEST_CONTENT,
      fixedRolls(20),
    );
    expect(next.character.gold).toBe(37);
  });

  test("drop is lost with a log line when the bag is full", () => {
    const full = armed({
      character: makeHero({
        inventory: ["rusty_sword", ...Array.from({ length: 6 }, () => "bread_loaf" as const)],
        equipment: { mainHand: "rusty_sword", offHand: null, armor: null, relic: null },
      }),
    });
    const next = combatRound(fight("wild_boar", full), TEST_CONTENT, fixedRolls(5));
    expect(next.character.inventory).toHaveLength(7);
    if (next.phase.kind === "resolution") {
      expect(next.phase.effectsLog).toContain("가방이 가득 차 아이템을 놓쳤다: 치유 연고");
    }
  });

  test("player death ends the run with the death ending and a score", () => {
    const weak = armed({ character: makeHero({ hp: 5 }) });
    const next = combatRound(fight("dragon_of_ash", weak), TEST_CONTENT, fixedRolls(8));
    expect(next.character.hp).toBe(0);
    expect(next.phase).toMatchObject({ kind: "ended", ending: "death", ranked: true });
  });
});

describe("attemptFlee", () => {
  test("success: agi check passes, flee outcome applies, phase is resolution, no reward", () => {
    const next = attemptFlee(fight("wild_boar"), TEST_CONTENT, fixedRolls(4));
    expect(next.phase).toMatchObject({ kind: "resolution", text: "달아났다." });
    expect(next.character.sanity).toBe(28);
    expect(next.kills).toBe(0);
    expect(next.character.xp).toBe(0);
  });

  test("failure: monster strikes and combat continues", () => {
    const next = attemptFlee(fight("wild_boar"), TEST_CONTENT, fixedRolls(3));
    expect(combatOf(next).round).toBe(2);
    expect(next.character.hp).toBe(29);
  });

  test("failure can kill the player", () => {
    const weak = armed({ character: makeHero({ hp: 1 }) });
    const next = attemptFlee(fight("wild_boar", weak), TEST_CONTENT, fixedRolls(3));
    expect(next.phase).toMatchObject({ kind: "ended", ending: "death" });
  });
});

describe("consumeItemInCombat", () => {
  test("applies the consumable, then the monster attacks once", () => {
    const hurt = armed({
      character: makeHero({
        hp: 20,
        inventory: ["rusty_sword", "healing_salve"],
        equipment: { mainHand: "rusty_sword", offHand: null, armor: null, relic: null },
      }),
    });
    const next = consumeItemInCombat(fight("dragon_of_ash", hurt), "healing_salve", TEST_CONTENT);
    expect(next.character.inventory).toEqual(["rusty_sword"]);
    expect(next.character.hp).toBe(17);
    expect(combatOf(next).log).toContain("치유 연고 사용");
  });

  test("the retaliation can kill the player", () => {
    const dying = armed({
      character: makeHero({
        hp: 1,
        inventory: ["rusty_sword", "strong_wine"],
        equipment: { mainHand: "rusty_sword", offHand: null, armor: null, relic: null },
      }),
    });
    const next = consumeItemInCombat(fight("dragon_of_ash", dying), "strong_wine", TEST_CONTENT);
    expect(next.phase).toMatchObject({ kind: "ended", ending: "death" });
  });
});
