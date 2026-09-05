// Common event pool: every themed file plus the engine's fallback rest event.

import type { GameEvent } from "../../../engine/types";
import { FALLBACK_EVENT_ID } from "../../ids";
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

/** Chosen by the engine when no other event qualifies. Weight 0 keeps it out of random draws. */
export const FALLBACK_REST_EVENT: GameEvent = {
  id: FALLBACK_EVENT_ID,
  title: "조용한 하루",
  text: "길은 비어 있고 하늘은 무심하다. 아무도 당신을 부르지 않고, 아무것도 당신을 노리지 않는다. 이런 날은 드물다.",
  pool: { kind: "common" },
  weight: 0,
  once: false,
  requires: [],
  choices: [
    {
      text: "불을 피우고 쉰다",
      requires: [],
      outcome: {
        kind: "direct",
        result: {
          text: "상처가 아물고 머릿속이 조금 맑아진다. 내일은 내일의 일이다.",
          effects: [
            { kind: "hp", delta: 2 },
            { kind: "sanity", delta: 2 },
          ],
        },
      },
    },
    {
      text: "그래도 걷는다",
      requires: [],
      outcome: {
        kind: "direct",
        result: {
          text: "발은 아프지만 길은 줄었다. 그것도 배움이라면 배움이다.",
          effects: [{ kind: "xp", delta: 1 }],
        },
      },
    },
  ],
};

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
