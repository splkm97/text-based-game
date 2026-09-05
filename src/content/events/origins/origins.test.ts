import { describe, expect, test } from "vitest";
import type { Condition, Effect, GameEvent, Outcome, OutcomeText } from "../../../engine/types";
import { ENDING_IDS, ITEM_IDS, MONSTER_IDS, ORIGIN_IDS, type OriginId } from "../../ids";
import { ORIGINS } from "../../origins";
import { ORIGIN_EVENTS } from "./index";

type Short = "mercenary" | "monk" | "heir";
const SHORT: Readonly<Record<OriginId, Short>> = {
  origin_mercenary: "mercenary",
  origin_monk: "monk",
  origin_heir: "heir",
};
const GOOD: Readonly<Record<Short, string>> = {
  mercenary: "mercenary_banner",
  monk: "monk_absolution",
  heir: "heir_restored",
};
const BAD: Readonly<Record<Short, string>> = {
  mercenary: "mercenary_betrayal",
  monk: "monk_heresy",
  heir: "heir_exile",
};

const STEPS = [1, 2, 3, 4, 5, 6] as const;

/** Every text the player can land on after picking a choice. */
function leaves(outcome: Outcome): readonly OutcomeText[] {
  switch (outcome.kind) {
    case "direct":
      return [outcome.result];
    case "check":
      return [outcome.success, outcome.failure];
    case "combat":
      return [outcome.win, outcome.flee];
    case "shop":
      return [outcome.leave];
  }
}

function effects(event: GameEvent): readonly Effect[] {
  return event.choices.flatMap((c) => leaves(c.outcome).flatMap((l) => l.effects));
}

function conditions(event: GameEvent): readonly Condition[] {
  return [...event.requires, ...event.choices.flatMap((c) => c.requires)];
}

function flagsSet(event: GameEvent): ReadonlySet<string> {
  return new Set(effects(event).flatMap((e) => (e.kind === "flag" ? [e.flag] : [])));
}

function chainOf(origin: OriginId): readonly GameEvent[] {
  const short = SHORT[origin];
  return STEPS.map((k) => {
    const prefix = `origin_${short}_${k}_`;
    const found = ORIGIN_EVENTS.filter((e) => e.id.startsWith(prefix));
    expect(found, `exactly one event with prefix ${prefix}`).toHaveLength(1);
    const event = found[0];
    if (event === undefined) throw new Error(prefix);
    return event;
  });
}

describe("ORIGIN_EVENTS", () => {
  test("holds 18 events with unique ids", () => {
    expect(ORIGIN_EVENTS).toHaveLength(18);
    expect(new Set(ORIGIN_EVENTS.map((e) => e.id)).size).toBe(18);
  });

  test("references only catalog item and monster ids", () => {
    const items = new Set<string>(ITEM_IDS);
    const monsters = new Set<string>(MONSTER_IDS);
    for (const event of ORIGIN_EVENTS) {
      for (const e of effects(event)) {
        if (e.kind === "item" || e.kind === "removeItem") expect(items.has(e.item)).toBe(true);
        if (e.kind === "end") expect(ENDING_IDS).toContain(e.ending);
      }
      for (const c of conditions(event)) {
        if (c.kind === "item") expect(items.has(c.item)).toBe(true);
      }
      for (const choice of event.choices) {
        if (choice.outcome.kind === "combat")
          expect(monsters.has(choice.outcome.monster)).toBe(true);
      }
    }
  });
});

describe.each(ORIGIN_IDS)("%s chain", (origin) => {
  const short = SHORT[origin];
  const chain = chainOf(origin);

  test("origin start flag opens event 1", () => {
    expect(ORIGINS[origin].startingFlags).toContain(`${short}.start`);
  });

  test("every event is a once-only origin-pool event with 2-4 choices", () => {
    for (const event of chain) {
      expect(event.pool).toEqual({ kind: "origin", origin });
      expect(event.once).toBe(true);
      expect(event.weight).toBe(6);
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      expect(event.choices.length).toBeLessThanOrEqual(4);
    }
  });

  test.each(STEPS)("event %i is gated on the previous step flag", (k) => {
    const event = chain[k - 1];
    const gate = k === 1 ? `${short}.start` : `${short}.step${k - 1}`;
    expect(event?.requires).toEqual([{ kind: "flag", flag: gate }]);
  });

  test.each([1, 2, 3, 4, 5] as const)("event %i sets its step flag on every path", (k) => {
    const event = chain[k - 1];
    if (event === undefined) throw new Error(String(k));
    for (const choice of event.choices) {
      for (const leaf of leaves(choice.outcome)) {
        const flags = leaf.effects.filter((e) => e.kind === "flag").map((e) => e.flag);
        expect(flags, `${event.id} / ${choice.text} / ${leaf.text}`).toContain(`${short}.step${k}`);
        expect(leaf.effects.some((e) => e.kind === "end")).toBe(false);
      }
    }
  });

  test("event 6 ends the run on every path, reaching both endings", () => {
    const event = chain[5];
    if (event === undefined) throw new Error("event 6");
    const endings = new Set<string>();
    for (const choice of event.choices) {
      for (const leaf of leaves(choice.outcome)) {
        const ends = leaf.effects.filter((e) => e.kind === "end");
        expect(ends, `${event.id} / ${choice.text} / ${leaf.text}`).toHaveLength(1);
        for (const e of ends) endings.add(e.ending);
      }
    }
    expect(endings).toEqual(new Set([GOOD[short], BAD[short]]));
  });

  test("every required flag was set earlier in the chain", () => {
    const known = new Set<string>([`${short}.start`]);
    for (const event of chain) {
      for (const c of conditions(event)) {
        if (c.kind === "flag") expect(known.has(c.flag), `${event.id} needs ${c.flag}`).toBe(true);
      }
      for (const flag of flagsSet(event)) known.add(flag);
    }
  });

  test("has at least one combat and one item- or gold-gated choice", () => {
    const choices = chain.flatMap((e) => e.choices);
    expect(choices.some((c) => c.outcome.kind === "combat")).toBe(true);
    expect(
      choices.some((c) => c.requires.some((r) => r.kind === "item" || r.kind === "gold")),
    ).toBe(true);
  });
});
