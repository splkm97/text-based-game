// 인원 선택 카드 — 인물 하나를 배차표에 올리는 자리. 카드의 내용은 그 일감의 인물 반응
// (party.notes)이고, 선택 버튼의 이름은 행동 정본(`party_pick_*`)의 라벨이다.
//
// 결장한 인물은 **사유 문면과 함께** 잠긴다(설계 §4.1): 눌리지 않고, 왜 못 세우는지가 카드에
// 남는다. 그 사유는 화면이 지어내지 않고 행동 정본의 거부 문면을 그대로 쓴다 — 상태 축은
// 숫자·게이지가 아니라 문면으로만 드러난다. 이미 올린 인물은 버튼 대신 선택 표시를 내보낸다
// (같은 이름을 두 번 올리는 자리가 아니다).
//
// 카드의 읽는 순서는 이름 → 결장 사유 → 대사 → 선택 버튼이다(장면 묘사 → 문서 → 대사 순서의
// 카드판): 누가 서 있고, 서지 못하는 까닭은 무엇이고, 그 사람이 무슨 말을 했고, 그다음에 고른다.

import { useId } from "react";
import { Button } from "../../../../shared/ui/Button";
import type { ActionId, CharacterId } from "../../ids";
import { useContent } from "../contentContext";

/** 인물 → 동행 선택 액션. id 카탈로그의 이름이 화면과 만나는 유일한 자리다. */
export const PARTY_PICK_ACTIONS: Readonly<Record<CharacterId, ActionId>> = {
  dusik: "party_pick_dusik",
  ru: "party_pick_ru",
  banjang: "party_pick_banjang",
  taesan: "party_pick_taesan",
};

/** 화면이 목록 대신 카드로 그리는 액션 — 인원 선택 화면이 행동 목록에서 빼낸다. */
export const PARTY_PICK_IDS: readonly ActionId[] = [
  PARTY_PICK_ACTIONS.dusik,
  PARTY_PICK_ACTIONS.ru,
  PARTY_PICK_ACTIONS.banjang,
  PARTY_PICK_ACTIONS.taesan,
];

type PartyPickProps = {
  readonly character: CharacterId;
  /** 그 일감에서 이 인물이 한 말(party.notes). 없으면 이름만 있는 카드다. */
  readonly note: string | null;
  readonly selected: boolean;
  /** 잠긴 사유의 문면 — null이면 세울 수 있다. */
  readonly reason: string | null;
  readonly onPick: (id: ActionId) => void;
};

export function PartyPick({ character, note, selected, reason, onPick }: PartyPickProps) {
  const content = useContent();
  const reasonId = useId();
  const pickId = PARTY_PICK_ACTIONS[character];
  return (
    <li className="flex flex-col gap-2 border-2 border-slate bg-ink-deep p-2">
      <p className="text-sm text-ember">{content.characters[character].name}</p>
      {reason !== null && (
        <p id={reasonId} className="text-xs leading-prose text-dusk">
          {reason}
        </p>
      )}
      {note !== null && <p className="text-sm leading-prose text-parchment">{note}</p>}
      {selected ? (
        <p className="text-xs text-ash">배차표에 올랐다</p>
      ) : (
        <Button
          block
          disabled={reason !== null}
          aria-describedby={reason === null ? undefined : reasonId}
          onClick={() => onPick(pickId)}
        >
          {content.actions[pickId].label}
        </Button>
      )}
    </li>
  );
}
