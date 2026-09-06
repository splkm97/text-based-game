// The single content registry a store injects into the rules.

import type { Content, EventId, ObserveEvent } from "../types";
import { CONFRONTATIONS } from "./confrontations";
import { CREW } from "./crew";
import { ENDINGS } from "./endings";
import { EVENTS } from "./events";
import { MESSAGES } from "./messages";
import { SYMPTOMS } from "./symptoms";

/** Keys events by id. Throws when two events share an id: a silent overwrite would hide content. */
const eventsById = (events: readonly ObserveEvent[]): Readonly<Record<EventId, ObserveEvent>> => {
  const ids = events.map((event) => event.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    throw new Error(`duplicate event id: ${[...new Set(duplicates)].join(", ")}`);
  }
  return Object.fromEntries(events.map((event) => [event.id, event]));
};

export const CONTENT: Content = {
  crew: CREW,
  symptoms: SYMPTOMS,
  messages: MESSAGES,
  events: eventsById(EVENTS),
  confrontations: CONFRONTATIONS,
  endings: ENDINGS,
};
