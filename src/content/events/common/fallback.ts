// The engine's fallback rest event, in its own file so the editor can locate and save its text.

import type { GameEvent } from "../../../engine/types";

/** Chosen by the engine when no other event qualifies. Weight 0 keeps it out of random draws. */
export const FALLBACK_REST_EVENT: GameEvent = {
  id: "fallback_rest",
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
