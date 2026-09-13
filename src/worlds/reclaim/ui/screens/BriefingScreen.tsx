// 전체화면 공문 화면 — 그 일감의 조건과 마감을 담은 공문 한 장이 화면을 채운다. 문서는
// A안 서식(BriefingPanel: 발신명의 가운데·밑줄, 메타 줄, 번호 항목, 꼬리 줄) 그대로이고,
// 그 위에 어느 아침인지 알리는 장면 묘사(briefing.prompt)가, 그 아래에 공문을 받은 방의
// 대사(briefing.talk)와 접어 챙기는 버튼(briefing_ack)이 온다 — 화면은 언제나 장면 묘사 →
// 문서 → 대사 순으로 읽힌다.
//
// 지문이 아직 비어 있는 카드(빈 문자열)에서는 지문 자리를 비우고 화면 제목(job.title)이
// 첫 블록이 된다 — 대사로 화면을 시작하지 않는다는 규칙만은 카드 내용과 무관하게 지킨다.
//
// 기록 패널은 이 화면에 두지 않는다: 공문을 읽는 동안은 종이가 화면이다. 읽고 나서 접으면
// 다음 화면(인원 선택)이 기록과 함께 다시 열린다.

import type { JobCard } from "../../types";
import { ActionList } from "../components/ActionList";
import { BriefingPanel } from "../components/BriefingPanel";
import { PartyRow } from "../components/PartyRow";
import { useRunStore } from "../runStoreContext";

type BriefingScreenProps = {
  readonly job: JobCard;
};

export function BriefingScreen({ job }: BriefingScreenProps) {
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  const lead = job.briefing.prompt;
  return (
    <section aria-label="공문" className="flex flex-1 flex-col gap-3 p-3">
      <h2 className="text-base text-parchment">{job.title}</h2>
      {lead && <p className="whitespace-pre-line text-sm leading-prose text-parchment">{lead}</p>}
      <BriefingPanel document={job.briefing.document} fill />
      {job.briefing.talk.length > 0 && (
        <ul aria-label="공문 대사" className="flex flex-col gap-2">
          {job.briefing.talk.map((line) => (
            <PartyRow key={line.character} character={line.character} text={line.text} />
          ))}
        </ul>
      )}
      <ActionList ids={available} onAct={act} reason={lastReason} />
    </section>
  );
}
