import { describe, expect, test } from "vitest";
import type { Effect, GameEvent, Outcome, OutcomeText } from "../../../engine/types";
import { ENDING_IDS, ITEM_IDS, JOURNEY_IDS, MONSTER_IDS } from "../../ids";
import { JOURNEYS } from "../../journeys";
import { JOURNEY_EVENTS } from "./index";

const JOURNEY_NAMES = ["circus", "lighthouse", "debt"] as const;
type JourneyName = (typeof JOURNEY_NAMES)[number];
const FINAL_ENDING: Readonly<Record<JourneyName, string>> = {
  circus: "circus_finale",
  lighthouse: "lighthouse_keeper",
  debt: "debt_settled",
};
const CHAIN_LENGTH = 5;
const ID_PATTERN = /^journey_(circus|lighthouse|debt)_([1-5])_[a-z_]+$/;

const parseId = (id: string): { name: JourneyName; step: number } => {
  const match = ID_PATTERN.exec(id);
  expect(match, `id ${id} does not match journey_<name>_<k>_<slug>`).not.toBeNull();
  const name = match?.[1] as JourneyName;
  return { name, step: Number(match?.[2]) };
};

const leaves = (outcome: Outcome): readonly OutcomeText[] => {
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
};

const allLeaves = (event: GameEvent): readonly OutcomeText[] =>
  event.choices.flatMap((choice) => leaves(choice.outcome));

const hasEffect = (leaf: OutcomeText, predicate: (effect: Effect) => boolean): boolean =>
  leaf.effects.some(predicate);

const chainOf = (name: JourneyName): readonly GameEvent[] =>
  JOURNEY_EVENTS.filter((event) => parseId(event.id).name === name).toSorted(
    (a, b) => parseId(a.id).step - parseId(b.id).step,
  );

describe("JOURNEYS", () => {
  test("all three journeys exist with id === key", () => {
    for (const id of JOURNEY_IDS) {
      expect(JOURNEYS[id].id).toBe(id);
      expect(JOURNEYS[id].name.length).toBeGreaterThan(0);
      expect(JOURNEYS[id].description.length).toBeGreaterThan(0);
    }
  });
});

describe("JOURNEY_EVENTS", () => {
  test("15 events with unique ids", () => {
    expect(JOURNEY_EVENTS).toHaveLength(JOURNEY_NAMES.length * CHAIN_LENGTH);
    expect(new Set(JOURNEY_EVENTS.map((event) => event.id)).size).toBe(JOURNEY_EVENTS.length);
  });

  test("every event is a once-only weight-4 event in its own journey pool", () => {
    for (const event of JOURNEY_EVENTS) {
      const { name } = parseId(event.id);
      expect(event.pool).toEqual({ kind: "journey", journey: `journey_${name}` });
      expect(event.weight).toBe(4);
      expect(event.once).toBe(true);
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      expect(event.choices.length).toBeLessThanOrEqual(4);
    }
  });

  test("referenced item and monster ids exist in the catalog", () => {
    const items = new Set<string>(ITEM_IDS);
    const monsters = new Set<string>(MONSTER_IDS);
    for (const event of JOURNEY_EVENTS) {
      for (const choice of event.choices) {
        for (const condition of [...event.requires, ...choice.requires]) {
          if (condition.kind === "item") expect(items).toContain(condition.item);
        }
        if (choice.outcome.kind === "combat") expect(monsters).toContain(choice.outcome.monster);
        if (choice.outcome.kind === "shop") {
          for (const item of choice.outcome.stock) expect(items).toContain(item);
        }
        for (const leaf of leaves(choice.outcome)) {
          for (const effect of leaf.effects) {
            if (effect.kind === "item" || effect.kind === "removeItem") {
              expect(items).toContain(effect.item);
            }
            if (effect.kind === "end") expect(ENDING_IDS).toContain(effect.ending);
          }
        }
      }
    }
  });

  describe.each(JOURNEY_NAMES)("chain %s", (name) => {
    const chain = chainOf(name);

    test("has steps 1..5 in order", () => {
      expect(chain.map((event) => parseId(event.id).step)).toEqual([1, 2, 3, 4, 5]);
    });

    test("event 1 is unconditional; event k>1 requires step k-1", () => {
      expect(chain[0]?.requires).toEqual([]);
      for (const event of chain.slice(1)) {
        const { step } = parseId(event.id);
        expect(event.requires).toContainEqual({ kind: "flag", flag: `${name}.step${step - 1}` });
      }
    });

    test("events 1-4 set the step flag on every resolving path and never end the run", () => {
      for (const event of chain.slice(0, CHAIN_LENGTH - 1)) {
        const { step } = parseId(event.id);
        for (const leaf of allLeaves(event)) {
          expect(
            hasEffect(leaf, (e) => e.kind === "flag" && e.flag === `${name}.step${step}`),
            `${event.id} path "${leaf.text.slice(0, 20)}" misses ${name}.step${step}`,
          ).toBe(true);
          expect(hasEffect(leaf, (e) => e.kind === "end")).toBe(false);
        }
      }
    });

    test("final event ends with the journey ending on some path and continues on another", () => {
      const final = chain[CHAIN_LENGTH - 1];
      const paths = final ? allLeaves(final) : [];
      const isEnd = (leaf: OutcomeText): boolean => hasEffect(leaf, (e) => e.kind === "end");
      expect(paths.filter(isEnd).length).toBeGreaterThan(0);
      expect(paths.filter((leaf) => !isEnd(leaf)).length).toBeGreaterThan(0);
      for (const leaf of paths.filter(isEnd)) {
        expect(leaf.effects).toContainEqual({ kind: "end", ending: FINAL_ENDING[name] });
      }
    });

    test("has at least one combat and one item- or gold-gated choice", () => {
      const choices = chain.flatMap((event) => event.choices);
      expect(choices.some((choice) => choice.outcome.kind === "combat")).toBe(true);
      expect(
        choices.some((choice) =>
          choice.requires.some((c) => c.kind === "item" || c.kind === "gold"),
        ),
      ).toBe(true);
    });
  });
});
