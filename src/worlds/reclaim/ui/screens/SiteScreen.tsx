// 현장 화면 — 그 장소에 도착한 뒤의 화면. 사건 제목(site.title), 현장에서 보는 문서
// (site.document), 1인칭 지시(site.prompt), 동행 대사(site.partyLines)를 놓고, 그 현장에서
// 열린 행동을 규칙의 목록 그대로 내보낸다(가드 재구현 없음).
//
// 현장 대사는 **동행 기준으로 거른다**: 데려가지 않은 사람은 이 자리에 없으므로 말하지 않는다
// (사무실 잡담은 반대로 전원이 그 자리에 있으므로 걸러지지 않는다). 거른 결과가 0줄이어도
// 정상이다 — 현장에는 지문과 문서가 있다.

import type { JobCard, RunState } from "../../types";
import { ActionList } from "../components/ActionList";
import { BriefingPanel } from "../components/BriefingPanel";
import { PartyRow } from "../components/PartyRow";
import { Prose } from "../components/Prose";
import { StatePanel } from "../components/StatePanel";
import { INNER_GAP, SCREEN_PAD, SECTION_GAP } from "../density";
import { useRunStore } from "../runStoreContext";

type SiteScreenProps = {
  readonly run: RunState;
  readonly job: JobCard;
};

export function SiteScreen({ run, job }: SiteScreenProps) {
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  const partyLines = job.site.partyLines.filter((line) => run.party.includes(line.character));
  return (
    <section aria-label="현장" className={`flex flex-1 flex-col ${SECTION_GAP} ${SCREEN_PAD}`}>
      <h2 className="text-base text-parchment">{job.site.title}</h2>
      <BriefingPanel document={job.site.document} />
      <Prose text={job.site.prompt} />
      {partyLines.length > 0 && (
        <ul aria-label="동행" className={`flex flex-col ${INNER_GAP}`}>
          {partyLines.map((line) => (
            <PartyRow key={line.character} character={line.character} text={line.text} />
          ))}
        </ul>
      )}
      <StatePanel run={run} />
      <ActionList ids={available} onAct={act} reason={lastReason} />
    </section>
  );
}
