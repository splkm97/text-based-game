// 아침 조회의 첫 화면(산문) — 하루가 시작되는 자리의 1인칭 지문(office.prompt)을 **두 장**으로
// 나눠 읽는다(사용자 지시): 첫 장은 그 장소의 도트 일러스트와 함께 아침 풍경·세계를, 둘째 장은
// 오늘 할 일(마감·순서·책상)을 싣는다. 나누는 자리는 콘텐츠가 정한다(office.pageBreak) —
// 화면이 문장을 임의로 자르지 않는다.
//
// 쪽 넘김은 화면 로컬 상태다: 회차 상태도 저장도 건드리지 않는다(같은 장면을 다시 열면 첫 장부터).
// 일러스트는 만질 수 있는 대상이 아니므로 **테두리를 두르지 않는다**(density.ts의 위계: 2px는
// 프린터·초상처럼 손에 잡히는 것만). 뉴스는 둘째 장 끝에 무게로만 앉는다(MUTED).
//
// 행동 목록은 규칙의 몫이다: 화면은 availableActions에서 office_next만 떼어 그릴 뿐
// 가드를 다시 보지 않는다(거부도 예외가 아니라 문면이다).

import { useState } from "react";
import { PixelSprite } from "../../../../shared/art/PixelSprite";
import { SCENES } from "../../sprites/scenes";
import type { JobCard } from "../../types";
import { ActionList } from "../components/ActionList";
import { Prose } from "../components/Prose";
import { MUTED, SCREEN_PAD, SECTION_GAP } from "../density";
import { useRunStore } from "../runStoreContext";

type OfficeSceneScreenProps = {
  readonly job: JobCard;
};

/** 지문을 콘텐츠가 정한 자리에서 두 장으로 가른다(0이면 한 장). */
export const scenePages = (job: JobCard): readonly string[] => {
  const paragraphs = job.office.prompt.split("\n\n");
  const at = job.office.pageBreak;
  if (at <= 0 || at >= paragraphs.length) return [job.office.prompt];
  return [paragraphs.slice(0, at).join("\n\n"), paragraphs.slice(at).join("\n\n")];
};

export function OfficeSceneScreen({ job }: OfficeSceneScreenProps) {
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  const [page, setPage] = useState(0);
  const pages = scenePages(job);
  const last = page >= pages.length - 1;
  return (
    <section aria-label="사무실" className={`flex flex-1 flex-col ${SECTION_GAP} ${SCREEN_PAD}`}>
      <h2 className="text-base text-parchment">{job.title}</h2>
      {page === 0 && (
        <PixelSprite sprite={SCENES[job.id]} title={job.title} scale={5} className="self-center" />
      )}
      <Prose text={pages[page] ?? job.office.prompt} />
      {last ? (
        <>
          <p className={MUTED}>{job.office.news}</p>
          <ActionList
            ids={available.filter((id) => id === "office_next")}
            onAct={act}
            reason={lastReason}
          />
        </>
      ) : (
        <button
          type="button"
          className="min-h-11 self-end px-2 text-base leading-prose text-parchment underline"
          onClick={() => setPage((current) => current + 1)}
        >
          계속
        </button>
      )}
    </section>
  );
}
