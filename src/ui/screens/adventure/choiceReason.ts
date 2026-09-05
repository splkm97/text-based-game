// Why a choice is greyed out: the first failing condition, worded for the button's reason line.
// Condition logic stays in the engine; this only names what `conditionHolds` rejected.

import { conditionHolds, type EventContext } from "../../../engine/events";
import {
  type Choice,
  type Condition,
  type ContentRegistry,
  STAT_NAMES,
} from "../../../engine/types";

const describe = (condition: Condition, content: ContentRegistry): string => {
  switch (condition.kind) {
    case "stat":
      return `${STAT_NAMES[condition.stat]} ${condition.min} 필요`;
    case "item":
      return `아이템 필요: ${content.items[condition.item].name}`;
    case "gold":
      return `골드 ${condition.min} 필요`;
    case "trait":
      return `특성 필요: ${content.traits[condition.trait].name}`;
    case "hardMode":
      return "어려움 전용";
    case "flag":
    case "notFlag":
      return "조건 미충족";
  }
};

/** `null` when every requirement holds. */
export const unavailableReason = (
  run: EventContext,
  choice: Choice,
  content: ContentRegistry,
): string | null => {
  const failing = choice.requires.find((condition) => !conditionHolds(run, condition, content));
  return failing === undefined ? null : describe(failing, content);
};
