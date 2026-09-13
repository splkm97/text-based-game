// 인원 선택 화면 — 배차표에 올릴 이름을 1~2명 고른다. 인물 4명의 카드가 모두 서고, 그 일감에서
// 그 인물이 한 말(party.notes)이 카드의 내용이 된다. 결장한 인물의 카드는 사유 문면과 함께
// 잠긴다(PartyPick) — 부상은 숫자가 아니라 못 세우는 까닭으로 드러난다(설계 §4.1).
//
// 선택 버튼과 결정(비우기/현장으로)은 규칙의 목록을 따른다: 화면은 가드를 다시 보지 않는다.
// 고른 이름은 배차표로 따로 세워 두고, 카드에는 선택 표시가 붙는다 — 같은 이름을 두 번 올리는
// 자리가 아니기 때문이다(두 번째 클릭은 규칙이 거부 문면으로 답한다).

import { CHARACTER_IDS } from "../../ids";
import type { JobCard, RunState } from "../../types";
import { ActionList } from "../components/ActionList";
import { PARTY_PICK_ACTIONS, PARTY_PICK_IDS, PartyPick } from "../components/PartyPick";
import { StatePanel } from "../components/StatePanel";
import { useContent } from "../contentContext";
import { useRunStore } from "../runStoreContext";

type PartyScreenProps = {
  readonly run: RunState;
  readonly job: JobCard;
};

export function PartyScreen({ run, job }: PartyScreenProps) {
  const content = useContent();
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  const decisions = available.filter((id) => !PARTY_PICK_IDS.includes(id));
  return (
    <section aria-label="인원 선택" className="flex flex-1 flex-col gap-3 p-3">
      <h2 className="text-base text-parchment">{job.title}</h2>
      <p className="text-sm leading-prose text-parchment">{job.party.prompt}</p>
      <ul aria-label="인물" className="flex flex-col gap-2">
        {CHARACTER_IDS.map((character) => (
          <PartyPick
            key={character}
            character={character}
            note={job.party.notes.find((line) => line.character === character)?.text ?? null}
            selected={run.party.includes(character)}
            // 결장 사유는 행동 정본의 거부 문면이다 — 화면이 지어내지 않는다.
            reason={
              run.characters[character].injured
                ? content.actions[PARTY_PICK_ACTIONS[character]].deny
                : null
            }
            onPick={act}
          />
        ))}
      </ul>
      {run.party.length > 0 && (
        <section aria-label="선택한 인원" className="border-2 border-slate bg-ink-deep p-2">
          <h3 className="text-xs text-ash">배차표</h3>
          <ul className="flex flex-col gap-1">
            {run.party.map((character) => (
              <li key={character} className="text-sm text-parchment">
                {content.characters[character].name}
              </li>
            ))}
          </ul>
        </section>
      )}
      <StatePanel run={run} />
      <ActionList ids={decisions} onAct={act} reason={lastReason} />
    </section>
  );
}
