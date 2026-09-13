// 동행 한 줄 — 인물 이름과 그 대사. 이름은 CONTENT.characters의 정본을 읽고, 대사는
// 단계 카드의 partyLines 정본을 그대로 내보인다. 목록 항목으로 쓴다.

import type { CharacterId } from "../../ids";
import { useContent } from "../contentContext";

type PartyRowProps = {
  readonly character: CharacterId;
  readonly text: string;
};

export function PartyRow({ character, text }: PartyRowProps) {
  const content = useContent();
  return (
    <li className="border-2 border-slate bg-ink-deep p-2">
      <p className="text-sm text-ember">{content.characters[character].name}</p>
      <p className="text-sm leading-prose text-parchment">{text}</p>
    </li>
  );
}
