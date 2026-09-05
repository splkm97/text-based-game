// The single content registry the store injects into the engine.

import type { ContentRegistry, EventId, GameEvent } from "../engine/types";
import { ENDINGS } from "./endings";
import { COMMON_EVENTS } from "./events/common";
import { JOURNEY_EVENTS } from "./events/journeys";
import { ORIGIN_EVENTS } from "./events/origins";
import { ITEMS } from "./items";
import { JOURNEYS } from "./journeys";
import { MONSTERS } from "./monsters";
import { ORIGINS } from "./origins";
import { TRAITS } from "./traits";

/** Keys events by id. Throws when two events share an id: a silent overwrite would hide content. */
const eventsById = (events: readonly GameEvent[]): Readonly<Record<EventId, GameEvent>> => {
  const ids = events.map((event) => event.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    throw new Error(`duplicate event id: ${[...new Set(duplicates)].join(", ")}`);
  }
  return Object.fromEntries(events.map((event) => [event.id, event]));
};

export const CONTENT: ContentRegistry = {
  items: ITEMS,
  monsters: MONSTERS,
  traits: TRAITS,
  origins: ORIGINS,
  journeys: JOURNEYS,
  endings: ENDINGS,
  events: eventsById([...COMMON_EVENTS, ...ORIGIN_EVENTS, ...JOURNEY_EVENTS]),
};
