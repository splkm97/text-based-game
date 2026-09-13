// 기록 화면 — 회차 간 기록(meta)의 종결별 도달 수와 시작한 회차 수를 보여준다.
// 종결 줄은 id 카탈로그 순서로 전부 나열한다. 뒤로 가기는 화면을 타이틀로 되돌린다 —
// 회차 상태에 따라 타이틀 또는 종결 화면이 다시 열린다.

import { Button } from "../../../../shared/ui/Button";
import { ENDING_IDS } from "../../ids";
import { useContent } from "../contentContext";
import { useMetaStore } from "../metaStoreContext";
import { useScreenStore } from "../screenStore";

export function RecordsScreen() {
  const go = useScreenStore((state) => state.go);
  const runs = useMetaStore((state) => state.runs);
  const endingsSeen = useMetaStore((state) => state.endingsSeen);
  const content = useContent();

  return (
    <section aria-label="복구 기록" className="flex flex-1 flex-col gap-3 p-4">
      <h2 className="text-base text-parchment">기록</h2>
      <p className="text-sm text-ash">시작한 회차 {runs}회</p>
      <ul aria-label="종결 기록" className="flex flex-col gap-2">
        {ENDING_IDS.map((id) => (
          <li
            key={id}
            className="flex min-h-11 items-center justify-between gap-3 border-2 border-slate px-3"
          >
            <span className="text-xs text-ash">{content.endings[id].title}</span>
            <span className="tabular-nums text-sm text-parchment">{endingsSeen[id]}회</span>
          </li>
        ))}
      </ul>
      <Button block onClick={() => go("title")}>
        뒤로 가기
      </Button>
    </section>
  );
}
