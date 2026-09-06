// Korean line for each rules error code the store surfaces in `lastError`.

import type { RulesErrorCode } from "../../../rules/errors";

export const ERROR_TEXT: Readonly<Record<RulesErrorCode, string>> = {
  INVALID_PHASE: "지금은 할 수 없어요.",
  INVALID_CHOICE: "고를 수 없는 선택이에요.",
  INVALID_TARGET: "그 승무원에게는 할 수 없어요.",
  NO_AP: "오늘 쓸 행동 포인트가 없어요.",
  NO_RESOURCE: "남은 물자가 없어요.",
  UNKNOWN_ID: "알 수 없는 문제가 생겼어요.",
};
