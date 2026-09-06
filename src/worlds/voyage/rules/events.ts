// Observe-phase event pool: condition evaluation and weighted selection.

import { pickWeighted } from "../../../shared/rng";
import { FALLBACK_EVENT_ID } from "../ids";
import type { Choice, Condition, Content, EventId, ObserveEvent, Rng, RunState } from "../types";
import { countOf, findCrew, hasStatus } from "./crew";
import { RulesError } from "./errors";

export const conditionHolds = (run: RunState, condition: Condition): boolean => {
  switch (condition.kind) {
    case "trust":
      return run.trust >= condition.min;
    case "day":
      return run.day >= condition.from && run.day <= condition.to;
    case "count":
      return countOf(run, condition.of) >= condition.min;
    case "crew":
      return hasStatus(findCrew(run, condition.crew), condition.status);
  }
};

const allHold = (run: RunState, conditions: readonly Condition[]): boolean =>
  conditions.every((condition) => conditionHolds(run, condition));

export const choiceAvailable = (run: RunState, choice: Choice): boolean =>
  allHold(run, choice.requires);

/** Weight 0 events are reachable only as the fallback. */
export const eligibleEvents = (run: RunState, content: Content): readonly ObserveEvent[] =>
  Object.values(content.events).filter(
    (event) =>
      event.weight > 0 &&
      !(event.once && run.seenEvents.includes(event.id)) &&
      allHold(run, event.requires),
  );

export const requireEvent = (id: EventId, content: Content): ObserveEvent => {
  const event = content.events[id];
  if (event === undefined) {
    throw new RulesError("UNKNOWN_ID", `event ${id} is not defined in content`);
  }
  return event;
};

/** Weighted random from the eligible pool, else `FALLBACK_EVENT_ID`. */
export const drawEvent = (run: RunState, content: Content, rng: Rng): EventId => {
  const pool = eligibleEvents(run, content);
  if (pool.length === 0) {
    return requireEvent(FALLBACK_EVENT_ID, content).id;
  }
  return pickWeighted(pool, (event) => event.weight, rng).id;
};
