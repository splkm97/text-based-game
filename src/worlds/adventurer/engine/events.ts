// Event pool filtering, weighted selection, and condition evaluation.

import { pickWeighted } from "../../../shared/rng";
import { FALLBACK_EVENT_ID } from "../content/ids";
import { effectiveStats } from "./character";
import { EngineError } from "./errors";
import type {
  Choice,
  Condition,
  ContentRegistry,
  EventId,
  EventPool,
  GameEvent,
  Rng,
  RunState,
} from "./types";

/** The run fields event selection reads; `RunState` satisfies it, and so does a run without a phase yet. */
export type EventContext = Pick<
  RunState,
  "character" | "flags" | "journeys" | "hardMode" | "seenEvents" | "queuedEvent"
>;

export const conditionHolds = (
  run: EventContext,
  condition: Condition,
  content: ContentRegistry,
): boolean => {
  switch (condition.kind) {
    case "stat":
      return effectiveStats(run.character, content)[condition.stat] >= condition.min;
    case "item":
      return run.character.inventory.includes(condition.item);
    case "flag":
      return run.flags.includes(condition.flag);
    case "notFlag":
      return !run.flags.includes(condition.flag);
    case "gold":
      return run.character.gold >= condition.min;
    case "trait":
      return run.character.trait === condition.trait;
    case "hardMode":
      return run.hardMode;
  }
};

const allHold = (run: EventContext, conditions: readonly Condition[], content: ContentRegistry) =>
  conditions.every((condition) => conditionHolds(run, condition, content));

export const choiceAvailable = (
  run: EventContext,
  choice: Choice,
  content: ContentRegistry,
): boolean => allHold(run, choice.requires, content);

const poolMatches = (run: EventContext, pool: EventPool): boolean => {
  switch (pool.kind) {
    case "common":
      return true;
    case "origin":
      return run.character.origin === pool.origin;
    case "journey":
      return run.journeys.includes(pool.journey);
  }
};

/** Weight 0 events are reachable only through `nextEvent` or as the fallback. */
export const eligibleEvents = (run: EventContext, content: ContentRegistry): readonly GameEvent[] =>
  Object.values(content.events).filter(
    (event) =>
      event.weight > 0 &&
      poolMatches(run, event.pool) &&
      !(event.once && run.seenEvents.includes(event.id)) &&
      allHold(run, event.requires, content),
  );

const requireEvent = (id: EventId, content: ContentRegistry): EventId => {
  if (content.events[id] === undefined) {
    throw new EngineError("UNKNOWN_ID", `event ${id} is not defined in content`);
  }
  return id;
};

/** Queued event > weighted random from the eligible pool > `FALLBACK_EVENT_ID`. */
export const pickNextEvent = (run: EventContext, content: ContentRegistry, rng: Rng): EventId => {
  if (run.queuedEvent !== null) {
    return requireEvent(run.queuedEvent, content);
  }
  const pool = eligibleEvents(run, content);
  if (pool.length === 0) {
    return requireEvent(FALLBACK_EVENT_ID, content);
  }
  return pickWeighted(pool, (event) => event.weight, rng).id;
};
