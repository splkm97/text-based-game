import { describe, expect, test } from "vitest";
import { makeRun } from "../engine/testContent";
import type { MetaState, RunState } from "../engine/types";
import { parseMeta, parseRun } from "./schemas";

const combatRun: RunState = makeRun({
  journeys: ["journey_circus"],
  seenEvents: ["ev_crossroad"],
  queuedEvent: "ev_followup",
  pendingEnding: "mercenary_banner",
  phase: {
    kind: "combat",
    combat: {
      monster: "wild_boar",
      monsterHp: 5,
      monsterMaxHp: 8,
      round: 2,
      log: ["멧돼지이(가) 나타났다!"],
      onWin: {
        text: "이겼다.",
        effects: [
          { kind: "flag", flag: "boar_slayer" },
          { kind: "stat", stat: "str", delta: 1 },
          { kind: "item", item: "healing_salve" },
        ],
      },
      onFlee: { text: "달아났다.", effects: [{ kind: "end", ending: "death" }] },
    },
  },
  log: [{ day: 1, text: "시작" }],
});

const meta: MetaState = {
  codex: { endings: ["death"], monsters: ["wild_boar"], items: ["rusty_sword"] },
  ranking: [
    {
      id: "r1",
      name: "테스트",
      origin: "origin_mercenary",
      ending: "retire",
      score: 120,
      day: 12,
      hardMode: true,
      ranked: true,
      finishedAt: "2026-09-06T00:00:00.000Z",
    },
  ],
};

describe("parseRun", () => {
  test("round-trips a run through JSON", () => {
    expect(parseRun(JSON.stringify(combatRun))).toEqual(combatRun);
  });

  test("returns null for tampered payloads and malformed JSON", () => {
    const withUnknownItem = {
      ...combatRun,
      character: { ...combatRun.character, inventory: ["excalibur"] },
    };
    expect(parseRun(JSON.stringify(withUnknownItem))).toBeNull();
    expect(parseRun(JSON.stringify({ ...combatRun, phase: { kind: "victory" } }))).toBeNull();
    expect(parseRun(JSON.stringify({ ...combatRun, day: "1" }))).toBeNull();
    expect(parseRun(JSON.stringify({ ...combatRun, pendingEnding: undefined }))).toBeNull();
    expect(parseRun("{not json")).toBeNull();
    expect(parseRun("null")).toBeNull();
  });

  test("rejects a fractional gold value", () => {
    const withFractionalGold = {
      ...combatRun,
      character: { ...combatRun.character, gold: combatRun.character.gold + 0.5 },
    };
    expect(parseRun(JSON.stringify(withFractionalGold))).toBeNull();
  });
});

describe("parseMeta", () => {
  test("round-trips meta through JSON", () => {
    expect(parseMeta(JSON.stringify(meta))).toEqual(meta);
  });

  test("returns null for unknown ids", () => {
    const withUnknownEnding = { ...meta, codex: { ...meta.codex, endings: ["nirvana"] } };
    expect(parseMeta(JSON.stringify(withUnknownEnding))).toBeNull();
    expect(parseMeta(JSON.stringify({ ...meta, ranking: [{ id: "x" }] }))).toBeNull();
  });
});
