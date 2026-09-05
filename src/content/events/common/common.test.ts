import { describe, expect, test } from "vitest";
import type {
  Choice,
  Condition,
  Effect,
  GameEvent,
  OutcomeText,
  StatId,
} from "../../../engine/types";
import { STAT_IDS } from "../../../engine/types";
import { FALLBACK_EVENT_ID, ITEM_IDS, MONSTER_IDS, TRAIT_IDS } from "../../ids";
import { COMMON_EVENTS } from "./index";
import { MYSTIC_EVENTS } from "./mystic";
import { MYSTIC_MORE_EVENTS } from "./mystic-more";
import { ROAD_EVENTS } from "./road";
import { ROAD_MORE_EVENTS } from "./road-more";
import { RUINS_EVENTS } from "./ruins";
import { RUINS_MORE_EVENTS } from "./ruins-more";
import { TOWN_EVENTS } from "./town";
import { TOWN_MORE_EVENTS } from "./town-more";
import { WILDS_EVENTS } from "./wilds";
import { WILDS_MORE_EVENTS } from "./wilds-more";

/** Each themed file holds five events; `nextEvent` may only target the same file. */
const THEME_FILES: readonly (readonly GameEvent[])[] = [
  ROAD_EVENTS,
  ROAD_MORE_EVENTS,
  TOWN_EVENTS,
  TOWN_MORE_EVENTS,
  WILDS_EVENTS,
  WILDS_MORE_EVENTS,
  RUINS_EVENTS,
  RUINS_MORE_EVENTS,
  MYSTIC_EVENTS,
  MYSTIC_MORE_EVENTS,
];
const TOWN_FILES: readonly GameEvent[] = [...TOWN_EVENTS, ...TOWN_MORE_EVENTS];
const ITEM_SET: ReadonlySet<string> = new Set(ITEM_IDS);
const MONSTER_SET: ReadonlySet<string> = new Set(MONSTER_IDS);
const TRAIT_SET: ReadonlySet<string> = new Set(TRAIT_IDS);
const THEMED = COMMON_EVENTS.filter((event) => event.id !== FALLBACK_EVENT_ID);
const CHOICES: readonly Choice[] = COMMON_EVENTS.flatMap((event) => event.choices);
const CONDITIONS: readonly Condition[] = CHOICES.flatMap((choice) => choice.requires);

/** Every text-with-effects leaf of an outcome, labelled by which path it is. */
type Leaf = {
  readonly path: "direct" | "success" | "failure" | "win" | "flee" | "leave";
  readonly leaf: OutcomeText;
};
const leavesOf = (choice: Choice): readonly Leaf[] => {
  const outcome = choice.outcome;
  switch (outcome.kind) {
    case "direct":
      return [{ path: "direct", leaf: outcome.result }];
    case "check":
      return [
        { path: "success", leaf: outcome.success },
        { path: "failure", leaf: outcome.failure },
      ];
    case "combat":
      return [
        { path: "win", leaf: outcome.win },
        { path: "flee", leaf: outcome.flee },
      ];
    case "shop":
      return [{ path: "leave", leaf: outcome.leave }];
  }
};
const effectsOf = (event: GameEvent): readonly Effect[] =>
  event.choices.flatMap((choice) => leavesOf(choice).flatMap((entry) => entry.leaf.effects));
const hasDelta = (
  effects: readonly Effect[],
  kind: "hp" | "sanity" | "gold",
  sign: -1 | 1,
): boolean => effects.some((effect) => effect.kind === kind && Math.sign(effect.delta) === sign);

describe("common event set", () => {
  test("has 50 themed events plus the fallback, all ids unique", () => {
    expect(COMMON_EVENTS).toHaveLength(51);
    expect(THEMED).toHaveLength(50);
    expect(new Set(COMMON_EVENTS.map((event) => event.id)).size).toBe(51);
    for (const file of THEME_FILES) expect(file).toHaveLength(5);
  });

  test("fallback rest is weight 0, repeatable, and restores hp and sanity", () => {
    const fallback = COMMON_EVENTS.find((event) => event.id === FALLBACK_EVENT_ID);
    expect(fallback).toBeDefined();
    expect(fallback?.weight).toBe(0);
    expect(fallback?.once).toBe(false);
    const restoring = fallback?.choices.some((choice) =>
      leavesOf(choice).some(
        ({ leaf }) =>
          leaf.effects.some((e) => e.kind === "hp" && e.delta === 2) &&
          leaf.effects.some((e) => e.kind === "sanity" && e.delta === 2),
      ),
    );
    expect(restoring).toBe(true);
  });

  test("themed events follow the id scheme, pool, weight, and choice-count rules", () => {
    for (const event of THEMED) {
      expect(event.id).toMatch(/^common_(road|town|wilds|ruins|mystic)_[a-z0-9_]+$/);
      expect(event.pool).toEqual({ kind: "common" });
      expect(Number.isInteger(event.weight)).toBe(true);
      expect(event.weight).toBeGreaterThanOrEqual(1);
      expect(event.weight).toBeLessThanOrEqual(5);
      expect(event.title.length).toBeGreaterThan(0);
      expect(event.text.length).toBeGreaterThan(0);
    }
    for (const event of COMMON_EVENTS) {
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      expect(event.choices.length).toBeLessThanOrEqual(4);
      for (const choice of event.choices) expect(choice.text.length).toBeGreaterThan(0);
    }
  });

  test("every referenced item, monster, and trait id exists in the catalog", () => {
    for (const condition of CONDITIONS) {
      if (condition.kind === "item") expect(ITEM_SET.has(condition.item)).toBe(true);
      if (condition.kind === "trait") expect(TRAIT_SET.has(condition.trait)).toBe(true);
    }
    for (const choice of CHOICES) {
      const outcome = choice.outcome;
      if (outcome.kind === "combat") expect(MONSTER_SET.has(outcome.monster)).toBe(true);
      if (outcome.kind === "shop") {
        expect(outcome.stock.length).toBeGreaterThanOrEqual(3);
        expect(outcome.stock.length).toBeLessThanOrEqual(6);
        for (const item of outcome.stock) expect(ITEM_SET.has(item)).toBe(true);
      }
    }
    for (const event of COMMON_EVENTS) {
      for (const effect of effectsOf(event)) {
        if (effect.kind === "item" || effect.kind === "removeItem") {
          expect(ITEM_SET.has(effect.item)).toBe(true);
        }
        expect(effect.kind).not.toBe("end");
      }
    }
  });

  test("nextEvent targets stay inside the same themed file", () => {
    for (const file of THEME_FILES) {
      const ids = new Set(file.map((event) => event.id));
      for (const event of file) {
        for (const effect of effectsOf(event)) {
          if (effect.kind === "nextEvent") expect(ids.has(effect.event)).toBe(true);
        }
      }
    }
  });

  test("flags are namespaced, set by once-only events, and consumed only when set somewhere", () => {
    const setFlags = new Set<string>();
    for (const event of COMMON_EVENTS) {
      const flags = effectsOf(event).flatMap((e) => (e.kind === "flag" ? [e.flag] : []));
      for (const flag of flags) {
        expect(flag).toMatch(/^common\.[a-z0-9_]+$/);
        setFlags.add(flag);
      }
      if (flags.length > 0) expect(event.once).toBe(true);
    }
    for (const condition of CONDITIONS) {
      if (condition.kind === "flag" || condition.kind === "notFlag") {
        expect(setFlags.has(condition.flag)).toBe(true);
      }
    }
  });

  test("every path has effects (combat rewards may be empty) and every failure has a cost", () => {
    for (const choice of CHOICES) {
      for (const { path, leaf } of leavesOf(choice)) {
        expect(leaf.text.length).toBeGreaterThan(0);
        if (path !== "win" && path !== "flee") expect(leaf.effects.length).toBeGreaterThan(0);
        if (path === "failure") {
          const costly =
            hasDelta(leaf.effects, "hp", -1) ||
            hasDelta(leaf.effects, "sanity", -1) ||
            hasDelta(leaf.effects, "gold", -1) ||
            leaf.effects.some((e) => e.kind === "removeItem");
          expect(costly).toBe(true);
        }
      }
    }
  });

  test("every event keeps at least two reachable choices", () => {
    // A choice gated only by gold stays reachable: gold is a renewable resource, unlike a
    // fixed stat/trait/item gate chosen at chargen or found rarely. Counts toward the base
    // total alongside fully ungated choices; a flag/notFlag pair on the same flag adds one more.
    for (const event of COMMON_EVENTS) {
      const base = event.choices.filter(
        (choice) =>
          choice.requires.length === 0 ||
          choice.requires.every((condition) => condition.kind === "gold"),
      ).length;
      const flagged = new Set<string>();
      const negated = new Set<string>();
      for (const choice of event.choices) {
        for (const condition of choice.requires) {
          if (condition.kind === "flag") flagged.add(condition.flag);
          if (condition.kind === "notFlag") negated.add(condition.flag);
        }
      }
      const pairBonus = [...flagged].filter((flag) => negated.has(flag)).length;
      expect(base + pairBonus).toBeGreaterThanOrEqual(2);
    }
  });

  test("a direct outcome with a negative gold delta requires at least that much gold", () => {
    for (const choice of CHOICES) {
      if (choice.outcome.kind !== "direct") continue;
      const goldCost = choice.outcome.result.effects.find(
        (effect) => effect.kind === "gold" && effect.delta < 0,
      );
      if (goldCost?.kind !== "gold") continue;
      const goldGate = choice.requires.find((condition) => condition.kind === "gold");
      expect(goldGate).toBeDefined();
      if (goldGate?.kind === "gold") {
        expect(goldGate.min).toBeGreaterThanOrEqual(-goldCost.delta);
      }
    }
  });
});

describe("common event coverage quotas", () => {
  const outcomes = CHOICES.map((choice) => choice.outcome);
  const countWhere = (predicate: (condition: Condition) => boolean): number =>
    CONDITIONS.filter(predicate).length;

  test("at least 20 checks spread over all six stats", () => {
    const checks = outcomes.filter((o) => o.kind === "check");
    expect(checks.length).toBeGreaterThanOrEqual(20);
    const covered = new Set<StatId>(checks.map((o) => o.stat));
    for (const stat of STAT_IDS) expect(covered.has(stat)).toBe(true);
    for (const check of checks) {
      expect(check.dc).toBeGreaterThanOrEqual(12);
      expect(check.dc).toBeLessThanOrEqual(18);
    }
  });

  test("at least 12 combats against at least 12 distinct monsters", () => {
    const combats = outcomes.filter((o) => o.kind === "combat");
    expect(combats.length).toBeGreaterThanOrEqual(12);
    expect(new Set(combats.map((o) => o.monster)).size).toBeGreaterThanOrEqual(12);
  });

  test("at least 4 shops in town", () => {
    const shopsInTown = TOWN_FILES.flatMap((e) => e.choices).filter(
      (c) => c.outcome.kind === "shop",
    );
    expect(shopsInTown.length).toBeGreaterThanOrEqual(4);
  });

  test("gated choices: item 6, stat 6 (min 6..10), gold 2, trait 2, hardMode 1", () => {
    expect(countWhere((c) => c.kind === "item")).toBeGreaterThanOrEqual(6);
    const statGates = CONDITIONS.filter((c) => c.kind === "stat");
    expect(statGates.length).toBeGreaterThanOrEqual(6);
    for (const gate of statGates) {
      expect(gate.min).toBeGreaterThanOrEqual(6);
      expect(gate.min).toBeLessThanOrEqual(10);
    }
    expect(countWhere((c) => c.kind === "gold")).toBeGreaterThanOrEqual(2);
    expect(countWhere((c) => c.kind === "trait")).toBeGreaterThanOrEqual(2);
    expect(countWhere((c) => c.kind === "hardMode")).toBeGreaterThanOrEqual(1);
  });

  test("at least 4 flag/notFlag pairs where a later event reacts to an earlier one", () => {
    const setterOf = new Map<string, string>();
    for (const event of COMMON_EVENTS) {
      for (const effect of effectsOf(event)) {
        if (effect.kind === "flag") setterOf.set(effect.flag, event.id);
      }
    }
    const reacting = new Set<string>();
    const negated = new Set<string>();
    for (const event of COMMON_EVENTS) {
      for (const choice of event.choices) {
        for (const condition of choice.requires) {
          if (condition.kind === "flag" && setterOf.get(condition.flag) !== event.id) {
            reacting.add(condition.flag);
          }
          if (condition.kind === "notFlag") negated.add(condition.flag);
        }
      }
    }
    expect(reacting.size).toBeGreaterThanOrEqual(4);
    expect([...reacting].filter((flag) => negated.has(flag)).length).toBeGreaterThanOrEqual(4);
  });

  test("at least 8 events drain sanity and at least 10 grant xp 3..8 on a success path", () => {
    const draining = THEMED.filter((event) => hasDelta(effectsOf(event), "sanity", -1));
    expect(draining.length).toBeGreaterThanOrEqual(8);
    const rewarding = THEMED.filter((event) =>
      event.choices.some((choice) =>
        leavesOf(choice).some(
          ({ path, leaf }) =>
            path !== "failure" &&
            path !== "flee" &&
            leaf.effects.some((e) => e.kind === "xp" && e.delta >= 3 && e.delta <= 8),
        ),
      ),
    );
    expect(rewarding.length).toBeGreaterThanOrEqual(10);
  });
});
