// 체인 절차 화면 — 조건이 서서 일감 사이에 끼어든 절차(chainStep) 하나를 처리한다. 절차의
// 문서(chains[chainStep].document)와 지시, 회사 사람들의 목소리를 놓고, 그 절차에서 열린 행동을
// 규칙의 목록 그대로 내보낸다. 절차가 끝나면 규칙이 다음 일감의 사무실이나 종결로 보낸다 —
// 화면은 결과를 예측하지 않는다.
//
// 절차의 대사는 현장과 달리 **거르지 않는다**: 체인 절차는 동행과 무관하게 회사가 움직이는
// 자리라서, 여기서 말하는 사람은 배차표가 아니라 그 방에 있는 사람이다(types.ts의 계약).

import type { ChainCard, RunState } from "../../types";
import { ActionList } from "../components/ActionList";
import { BriefingPanel } from "../components/BriefingPanel";
import { PartyRow } from "../components/PartyRow";
import { StatePanel } from "../components/StatePanel";
import { useRunStore } from "../runStoreContext";

type ChainScreenProps = {
  readonly run: RunState;
  readonly chain: ChainCard;
};

export function ChainScreen({ run, chain }: ChainScreenProps) {
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  return (
    <section aria-label="절차" className="flex flex-1 flex-col gap-3 p-3">
      <h2 className="text-base text-parchment">{chain.title}</h2>
      <BriefingPanel document={chain.document} />
      <p className="text-sm leading-prose text-parchment">{chain.prompt}</p>
      {chain.partyLines.length > 0 && (
        <ul aria-label="방 대사" className="flex flex-col gap-2">
          {chain.partyLines.map((line) => (
            <PartyRow key={line.character} character={line.character} text={line.text} />
          ))}
        </ul>
      )}
      <StatePanel run={run} />
      <ActionList ids={available} onAct={act} reason={lastReason} />
    </section>
  );
}
