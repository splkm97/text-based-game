// 동행 한 줄 — 인물 이름과 그 대사. 이름은 CONTENT.characters의 정본을 읽고, 대사는
// 단계 카드의 partyLines 정본을 그대로 내보인다. 목록 항목으로 쓴다.
//
// 테두리가 아니라 **헤어라인 구분선**(1px)으로 줄을 가른다: 잡담은 만질 수 있는 대상이
// 아니라 읽는 문면이라, 2px 상자를 두르면 문서·프린터와 같은 무게가 되어 위계가 사라진다
// (density.ts의 확정 리듬). 대사는 MUTED(14px) — 지문(PROSE 16px) 다음 단계다.

import type { CharacterId } from "../../ids";
import { useContent } from "../contentContext";
import { INNER_GAP } from "../density";
import { VoicedLine } from "./VoicedLine";

type PartyRowProps = {
  readonly character: CharacterId;
  readonly text: string;
};

export function PartyRow({ character, text }: PartyRowProps) {
  const content = useContent();
  return (
    <li
      className={`flex flex-col ${INNER_GAP} border-b border-slate pb-2 last:border-b-0 last:pb-0`}
    >
      <p className="text-sm leading-prose text-ember">{content.characters[character].name}</p>
      <VoicedLine character={character} text={text} />
    </li>
  );
}
