// Korean line for each engine error code the store surfaces in `lastError`.

import type { EngineErrorCode } from "../../../engine/errors";

export const ERROR_TEXT: Readonly<Record<EngineErrorCode, string>> = {
  INVALID_ALLOCATION: "능력치 배분이 잘못됐어요.",
  NO_STAT_POINTS: "남은 능력치 포인트가 없어요.",
  ITEM_NOT_IN_INVENTORY: "가방에 없는 아이템이에요.",
  INVALID_ITEM: "지금은 쓸 수 없는 아이템이에요.",
  SLOT_BLOCKED: "양손 무기를 든 채로는 방패를 들 수 없어요.",
  INVENTORY_FULL: "가방이 가득 찼어요.",
  NOT_ENOUGH_GOLD: "골드가 부족해요.",
  INVALID_PHASE: "지금은 할 수 없어요.",
  INVALID_CHOICE: "고를 수 없는 선택이에요.",
  UNKNOWN_ID: "알 수 없는 문제가 생겼어요.",
};
