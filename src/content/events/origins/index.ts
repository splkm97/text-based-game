import type { GameEvent } from "../../../engine/types";
import { HEIR_EVENTS } from "./heir";
import { MERCENARY_EVENTS } from "./mercenary";
import { MONK_EVENTS } from "./monk";

/** All 18 origin story events, three chains of six. */
export const ORIGIN_EVENTS: readonly GameEvent[] = [
  ...MERCENARY_EVENTS,
  ...MONK_EVENTS,
  ...HEIR_EVENTS,
];
