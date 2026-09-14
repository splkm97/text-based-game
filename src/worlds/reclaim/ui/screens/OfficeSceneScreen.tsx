// 아침 조회의 첫 화면(산문) — 하루가 시작되는 자리의 1인칭 지문(office.prompt)과 협회 발표
// 뉴스 한 줄(office.news)만 놓는다. 사람·잡담·프린터·현황은 이 화면에 없다: 여기는 읽는
// 화면이고, 유일한 행동은 자리에서 일어나 사람들 쪽으로 건너가는 office_next 하나다.
//
// 뉴스는 상자가 아니라 무게로 위계를 준다(MUTED) — 만질 수 있는 대상이 아니기 때문이다
// (density.ts의 테두리 위계: 2px는 프린터·문서처럼 손에 잡히는 것만 두른다).
//
// 행동 목록은 규칙의 몫이다: 화면은 availableActions에서 office_next만 떼어 그릴 뿐
// 가드를 다시 보지 않는다(거부도 예외가 아니라 문면이다).

import type { JobCard } from "../../types";
import { ActionList } from "../components/ActionList";
import { Prose } from "../components/Prose";
import { MUTED, SCREEN_PAD, SECTION_GAP } from "../density";
import { useRunStore } from "../runStoreContext";

type OfficeSceneScreenProps = {
  readonly job: JobCard;
};

export function OfficeSceneScreen({ job }: OfficeSceneScreenProps) {
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  return (
    <section aria-label="사무실" className={`flex flex-1 flex-col ${SECTION_GAP} ${SCREEN_PAD}`}>
      <h2 className="text-base text-parchment">{job.title}</h2>
      <Prose text={job.office.prompt} />
      <p className={MUTED}>{job.office.news}</p>
      <ActionList
        ids={available.filter((id) => id === "office_next")}
        onAct={act}
        reason={lastReason}
      />
    </section>
  );
}
