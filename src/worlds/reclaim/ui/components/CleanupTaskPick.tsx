// 뒷정리 작업 카드 — 지침서의 작업 하나를 고르는 자리. 버튼의 이름은 세계 공통의 작업
// 이름(`CONTENT.cleanupTasks`)이고, 이미 고른 작업은 비활성으로 남아 몇 번째로 골랐는지가
// 그 옆에 붙는다(고른 차례가 곧 결과를 가르는 미니게임이라 차례가 화면에 있어야 한다).
//
// 고른 차례는 회차 상태(`run.cleanupPicks`)가 정본이다 — 버튼은 그 값을 비추기만 하고,
// 지침 순서와 맞는지는 판정하지 않는다(등급은 규칙 내부의 값이고 화면에 오르지 않는다).
// 카드의 읽는 순서는 작업 이름(버튼) → 고른 차례다.

import { Button } from "../../../../shared/ui/Button";
import type { ActionId, CleanupTaskId } from "../../ids";
import { useContent } from "../contentContext";
import { INNER_GAP, META } from "../density";

/** 뒷정리 작업 → 선택 액션. id 카탈로그의 이름이 화면과 만나는 유일한 자리다. */
export const CLEANUP_PICK_ACTIONS: Readonly<Record<CleanupTaskId, ActionId>> = {
  sign: "cleanup_pick_sign",
  power: "cleanup_pick_power",
  search: "cleanup_pick_search",
  photo: "cleanup_pick_photo",
};

/** 화면이 목록 대신 카드로 그리는 액션 — 뒷정리 화면이 행동 목록에서 빼낸다. */
export const CLEANUP_PICK_IDS: readonly ActionId[] = [
  CLEANUP_PICK_ACTIONS.sign,
  CLEANUP_PICK_ACTIONS.power,
  CLEANUP_PICK_ACTIONS.search,
  CLEANUP_PICK_ACTIONS.photo,
];

/**
 * 작업 버튼의 **고정 표시 순서** — 지침 순서(`CLEANUP_TASK_IDS`: 안전 → 차단 → 확인 → 기록)와
 * **달라야 한다**. 같으면 배치만 보고 정답을 읽을 수 있어 미니게임이 사라진다: 순서는 지침서
 * 문서를 읽어서 알아내는 것이고, 화면은 그걸 알려주지 않는다. 무작위는 쓰지 않는다(같은 회차를
 * 다시 열어도 같은 자리에 서야 하기 때문). 이 불변식은 ui/screens/PlayScreen.test.tsx가 잡는다.
 */
export const CLEANUP_DISPLAY_ORDER: readonly CleanupTaskId[] = ["search", "photo", "sign", "power"];

type CleanupTaskPickProps = {
  readonly task: CleanupTaskId;
  /** 이 작업을 고른 차례(1부터). 아직 안 골랐으면 null. */
  readonly order: number | null;
  readonly onPick: (id: ActionId) => void;
};

export function CleanupTaskPick({ task, order, onPick }: CleanupTaskPickProps) {
  const content = useContent();
  const pickId = CLEANUP_PICK_ACTIONS[task];
  return (
    <li className={`flex flex-col ${INNER_GAP}`}>
      <Button block disabled={order !== null} onClick={() => onPick(pickId)}>
        {content.cleanupTasks[task]}
      </Button>
      {order !== null && <p className={META}>{order}번째로 골랐다</p>}
    </li>
  );
}
