import type { GameEvent } from "../../../engine/types";
import { CIRCUS_EVENTS } from "./circus";
import { DEBT_EVENTS } from "./debt";
import { LIGHTHOUSE_EVENTS } from "./lighthouse";

export const JOURNEY_EVENTS: readonly GameEvent[] = [
  ...CIRCUS_EVENTS,
  ...LIGHTHOUSE_EVENTS,
  ...DEBT_EVENTS,
];
