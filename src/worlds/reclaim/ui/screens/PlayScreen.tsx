// 플레이 화면 — 문서(BriefingPanel)·장면 서술·동행(PartyRow)·현황(StatePanel)·행동
// (ActionList)의 조립만 한다. 문면과 가드는 content·rules의 정본을 쓴다. 종결 상태에서는
// null을 돌려준다 — 종결 화면은 App의 EndingScreen이 그린다(계약). 저장·이어하기·
// 나가기 버튼도 App이 소유하므로 여기에 두지 않는다.

import { ActionList } from "../components/ActionList";
import { BriefingPanel } from "../components/BriefingPanel";
import { PartyRow } from "../components/PartyRow";
import { StatePanel } from "../components/StatePanel";
import { useContent } from "../contentContext";
import { useRunStore } from "../runStoreContext";

export function PlayScreen() {
  const run = useRunStore((state) => state.run);
  const availableActions = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  const content = useContent();

  if (run === null || run.terminal !== null) {
    return null;
  }
  const stage = content.stages[run.stage];
  return (
    <section aria-label="복구 현장" className="flex flex-1 flex-col gap-3 p-3">
      <BriefingPanel document={stage.document} />
      <p className="text-sm leading-prose text-parchment">{stage.prompt}</p>
      {stage.partyLines.length > 0 && (
        <ul aria-label="동행" className="flex flex-col gap-2">
          {stage.partyLines.map((line) => (
            <PartyRow key={line.character} character={line.character} text={line.text} />
          ))}
        </ul>
      )}
      <StatePanel run={run} />
      <ActionList ids={availableActions} onAct={act} reason={lastReason} />
    </section>
  );
}
