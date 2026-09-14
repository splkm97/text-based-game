// 지금 열린 행동의 목록. 라벨은 CONTENT.actions의 정본을 읽고, 클릭은 규칙의 판정을
// 통하는 store.act 한 번으로만 흘러간다 — 여기서 guard를 다시 보지 않는다. 마지막
// 거부 사유(lastReason)가 있으면 목록 아래에 거부 문면으로 내보낸다.
//
// 거부 문면도 테두리 상자가 아니라 **왼쪽 2px 선**이다: 만질 수 있는 대상이 아니므로
// 대상을 두르는 상자를 쓰지 않는다(테두리 위계 — density.ts). 문면은 안내이므로 MUTED
// 크기(14px)에 경고색(blood)만 남긴다.

import { Button } from "../../../../shared/ui/Button";
import type { ActionId } from "../../ids";
import { useContent } from "../contentContext";
import { INNER_GAP } from "../density";

type ActionListProps = {
  readonly ids: readonly ActionId[];
  readonly onAct: (id: ActionId) => void;
  readonly reason: string | null;
};

export function ActionList({ ids, onAct, reason }: ActionListProps) {
  const content = useContent();
  return (
    <section aria-label="행동" className={`flex flex-col ${INNER_GAP}`}>
      {ids.map((id) => (
        <Button key={id} block onClick={() => onAct(id)}>
          {content.actions[id].label}
        </Button>
      ))}
      {reason !== null && (
        <p role="alert" className="border-l-2 border-blood pl-3 text-sm leading-prose text-blood">
          {reason}
        </p>
      )}
    </section>
  );
}
