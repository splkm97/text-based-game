// Cross-file referential integrity of the assembled registry. Per-domain shape rules
// (counts, price ranges, id schemes, chain order) live in each domain's own test file.

import { describe, expect, test, vi } from "vitest";
import type {
  Condition,
  Effect,
  EndingId,
  EventPool,
  GameEvent,
  Outcome,
  OutcomeText,
} from "../engine/types";
import { FALLBACK_EVENT_ID } from "./ids";
import { CONTENT } from "./index";

const EVENTS: readonly GameEvent[] = Object.values(CONTENT.events);

type RefKind = "item" | "monster" | "trait" | "ending" | "event" | "origin" | "journey";
/** One id mention, tagged with where it was found so a failure names the culprit. */
type Ref = { readonly source: string; readonly kind: RefKind; readonly id: string };

const REGISTRY_KEYS: Readonly<Record<RefKind, ReadonlySet<string>>> = {
  item: new Set(Object.keys(CONTENT.items)),
  monster: new Set(Object.keys(CONTENT.monsters)),
  trait: new Set(Object.keys(CONTENT.traits)),
  ending: new Set(Object.keys(CONTENT.endings)),
  event: new Set(Object.keys(CONTENT.events)),
  origin: new Set(Object.keys(CONTENT.origins)),
  journey: new Set(Object.keys(CONTENT.journeys)),
};

const leavesOf = (outcome: Outcome): readonly OutcomeText[] => {
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

const effectsOf = (event: GameEvent): readonly Effect[] =>
  event.choices.flatMap((choice) => leavesOf(choice.outcome).flatMap((leaf) => leaf.effects));

const conditionsOf = (event: GameEvent): readonly Condition[] => [
  ...event.requires,
  ...event.choices.flatMap((choice) => choice.requires),
];

const effectRefs = (source: string, effects: readonly Effect[]): readonly Ref[] =>
  effects.flatMap((effect): readonly Ref[] => {
    switch (effect.kind) {
      case "item":
      case "removeItem":
        return [{ source, kind: "item", id: effect.item }];
      case "nextEvent":
        return [{ source, kind: "event", id: effect.event }];
      case "end":
        return [{ source, kind: "ending", id: effect.ending }];
      default:
        return [];
    }
  });

const conditionRefs = (source: string, conditions: readonly Condition[]): readonly Ref[] =>
  conditions.flatMap((condition): readonly Ref[] => {
    switch (condition.kind) {
      case "item":
        return [{ source, kind: "item", id: condition.item }];
      case "trait":
        return [{ source, kind: "trait", id: condition.trait }];
      default:
        return [];
    }
  });

const poolRefs = (source: string, pool: EventPool): readonly Ref[] => {
  switch (pool.kind) {
    case "common":
      return [];
    case "origin":
      return [{ source, kind: "origin", id: pool.origin }];
    case "journey":
      return [{ source, kind: "journey", id: pool.journey }];
  }
};

const outcomeRefs = (source: string, outcome: Outcome): readonly Ref[] => {
  const leafRefs = leavesOf(outcome).flatMap((leaf) => effectRefs(source, leaf.effects));
  switch (outcome.kind) {
    case "combat":
      return [{ source, kind: "monster", id: outcome.monster }, ...leafRefs];
    case "shop":
      return [...outcome.stock.map((id): Ref => ({ source, kind: "item", id })), ...leafRefs];
    default:
      return leafRefs;
  }
};

const eventRefs = (event: GameEvent): readonly Ref[] => [
  ...poolRefs(event.id, event.pool),
  ...conditionRefs(event.id, conditionsOf(event)),
  ...event.choices.flatMap((choice) => outcomeRefs(event.id, choice.outcome)),
];

const ALL_REFS: readonly Ref[] = [
  ...EVENTS.flatMap(eventRefs),
  ...Object.values(CONTENT.origins).flatMap((origin) =>
    origin.startingItems.map((id): Ref => ({ source: origin.id, kind: "item", id })),
  ),
  ...Object.values(CONTENT.monsters).flatMap((monster): readonly Ref[] =>
    monster.drop === undefined ? [] : [{ source: monster.id, kind: "item", id: monster.drop }],
  ),
  ...Object.values(CONTENT.items).flatMap((item) =>
    item.kind === "consumable" ? effectRefs(item.id, item.effects) : [],
  ),
];

const describeRef = (ref: Ref): string => `${ref.source} -> ${ref.kind} ${ref.id}`;

describe("content registry", () => {
  test("holds all 84 events keyed by their own id", () => {
    expect(EVENTS).toHaveLength(84);
    for (const [key, event] of Object.entries(CONTENT.events)) {
      expect(event.id).toBe(key);
    }
  });

  test("module init throws when two events share an id", async () => {
    vi.resetModules();
    vi.doMock("./events/journeys", async (importOriginal) => {
      const original = await importOriginal<typeof import("./events/journeys")>();
      return { JOURNEY_EVENTS: [...original.JOURNEY_EVENTS, ...original.JOURNEY_EVENTS] };
    });
    await expect(import("./index")).rejects.toThrow(/duplicate event id/);
    vi.doUnmock("./events/journeys");
  });

  test("fallback rest exists with weight 0", () => {
    expect(CONTENT.events[FALLBACK_EVENT_ID]?.weight).toBe(0);
  });

  test("every referenced id resolves in the registry", () => {
    const dangling = ALL_REFS.filter((ref) => !REGISTRY_KEYS[ref.kind].has(ref.id));
    expect(dangling.map(describeRef)).toEqual([]);
  });

  test("every flag a condition reads is set by some effect or an origin's startingFlags", () => {
    const set = new Set<string>([
      ...Object.values(CONTENT.origins).flatMap((origin) => origin.startingFlags),
      ...EVENTS.flatMap((event) =>
        effectsOf(event).flatMap((effect) => (effect.kind === "flag" ? [effect.flag] : [])),
      ),
    ]);
    const neverSet = EVENTS.flatMap((event) =>
      conditionsOf(event).flatMap((condition) =>
        (condition.kind === "flag" || condition.kind === "notFlag") && !set.has(condition.flag)
          ? [`${event.id} -> ${condition.kind} ${condition.flag}`]
          : [],
      ),
    );
    expect(neverSet).toEqual([]);
  });
});

describe("event structure across all pools", () => {
  test.each(EVENTS.map((event) => [event.id, event] as const))(
    "%s has 2..4 choices and a positive weight unless once-only",
    (_id, event) => {
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
      expect(event.choices.length).toBeLessThanOrEqual(4);
      if (!event.once && event.id !== FALLBACK_EVENT_ID) {
        expect(event.weight).toBeGreaterThanOrEqual(1);
      }
    },
  );
});

describe("ending reachability", () => {
  /** Story endings and the id of the only origin or journey whose events may fire them. */
  const OWNER: Readonly<Record<Exclude<EndingId, "death" | "madness" | "retire">, string>> = {
    mercenary_banner: "origin_mercenary",
    mercenary_betrayal: "origin_mercenary",
    monk_absolution: "origin_monk",
    monk_heresy: "origin_monk",
    heir_restored: "origin_heir",
    heir_exile: "origin_heir",
    circus_finale: "journey_circus",
    lighthouse_keeper: "journey_lighthouse",
    debt_settled: "journey_debt",
  };
  const ownerOf = new Map<string, string>(Object.entries(OWNER));
  const poolOwner = (pool: EventPool): string => {
    switch (pool.kind) {
      case "common":
        return "common";
      case "origin":
        return pool.origin;
      case "journey":
        return pool.journey;
    }
  };
  const endEffects = EVENTS.flatMap((event) =>
    effectsOf(event).flatMap((effect) =>
      effect.kind === "end" ? [{ event, ending: effect.ending }] : [],
    ),
  );

  test("every story ending is fired by at least one end effect", () => {
    const fired = new Set<string>(endEffects.map(({ ending }) => ending));
    const unreachable = [...ownerOf.keys()].filter((ending) => !fired.has(ending));
    expect(unreachable).toEqual([]);
  });

  test("each story ending is fired only from its own origin or journey pool", () => {
    const misplaced = endEffects.filter(
      ({ event, ending }) => ownerOf.get(ending) !== poolOwner(event.pool),
    );
    expect(misplaced.map(({ event, ending }) => `${event.id} -> ${ending}`)).toEqual([]);
  });
});
