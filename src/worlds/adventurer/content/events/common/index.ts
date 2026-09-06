// Common event pool: every themed file plus the engine's fallback rest event.

import type { GameEvent } from "../../../engine/types";
import { FALLBACK_REST_EVENT } from "./fallback";
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

export const COMMON_EVENTS: readonly GameEvent[] = [
  ...ROAD_EVENTS,
  ...ROAD_MORE_EVENTS,
  ...TOWN_EVENTS,
  ...TOWN_MORE_EVENTS,
  ...WILDS_EVENTS,
  ...WILDS_MORE_EVENTS,
  ...RUINS_EVENTS,
  ...RUINS_MORE_EVENTS,
  ...MYSTIC_EVENTS,
  ...MYSTIC_MORE_EVENTS,
  FALLBACK_REST_EVENT,
];
