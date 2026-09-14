// 기록 화면 — 회차 간 기록(meta)의 종결별 도달 수와 시작한 회차 수를 보여준다.
//
// 종결 이름은 **달성한 뒤에만** 보인다: 미달성 슬롯은 자리와 횟수만 남기고 이름을 감춘다
// (`???`). 이 화면과 회차 기록 어디에도 미달성 종결의 이름·조건은 나타나지 않는다 —
// 이름을 읽는 순간이 곧 그 결말에 도달한 순간이다.
//
// 뒤로 가기는 화면을 타이틀로 되돌린다 — 회차 상태에 따라 타이틀 또는 종결 화면이 다시 열린다.

import { Button } from "../../../../shared/ui/Button";
import { ENDING_IDS } from "../../ids";
import { useContent } from "../contentContext";
import { META, MUTED, SCREEN_PAD, SECTION_GAP } from "../density";
import { useMetaStore } from "../metaStoreContext";
import { useScreenStore } from "../screenStore";

/** 미달성 슬롯의 이름 자리. 제목이 아니라 자리만 알린다(스크린리더 포함). */
const UNSEEN = "???";

export function RecordsScreen() {
  const go = useScreenStore((state) => state.go);
  const runs = useMetaStore((state) => state.runs);
  const endingsSeen = useMetaStore((state) => state.endingsSeen);
  const content = useContent();

  return (
    <section aria-label="회차 기록" className={`flex flex-1 flex-col ${SECTION_GAP} ${SCREEN_PAD}`}>
      <h2 className="text-base text-parchment">기록</h2>
      <p className={MUTED}>시작한 회차 {runs}회</p>
      <ul aria-label="종결 기록" className="flex flex-col">
        {ENDING_IDS.map((id) => {
          const seen = endingsSeen[id];
          const achieved = seen > 0;
          const title = content.endings[id].title;
          return (
            <li
              key={id}
              aria-label={achieved ? title : "미달성 종결"}
              className="flex min-h-11 items-center justify-between gap-3 border-b border-slate last:border-b-0"
            >
              <span className={achieved ? META : "text-xs leading-prose text-slate"}>
                {achieved ? title : UNSEEN}
              </span>
              <span className="tabular-nums text-sm text-parchment">
                {achieved ? `${seen}회` : "—"}
              </span>
            </li>
          );
        })}
      </ul>
      <Button block onClick={() => go("title")}>
        뒤로 가기
      </Button>
    </section>
  );
}
