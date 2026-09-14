// 뒷정리 화면 — 일감을 끝낸 자리에서 지침서가 정한 순서대로 작업을 고르는 미니게임.
// 읽는 순서는 제목 → 지침서(site.document) → 그 자리의 지문(cleanup.prompt) → 고른 순서 →
// 작업 넷 → 마치는 버튼이다(현장·절차 화면과 같이 문서가 묘사보다 먼저 온다: 여기서 지침서가
// 곧 장면의 물건이다).
//
// 순서를 알아내는 자리는 **지침서 문서 하나뿐이다**: 작업 버튼은 고정 표시 순서
// (CLEANUP_DISPLAY_ORDER — 지침 순서와 일부러 다르다)로 서고, 무엇을 먼저 해야 하는지는 문서를
// 읽어서 안다. 화면은 작업 이름과 고른 차례만 보여주고 정답을 알려주지 않는다.
//
// 고른 차례는 회차 상태(run.cleanupPicks)가 정본이고 화면은 그걸 비출 뿐이다: 몇 번째로
// 골랐는지는 보이지만 지침 순서와 맞았는지는 판정하지 않는다 — 등급은 규칙 내부의 값이고
// 화면에는 숫자로도 문면으로도 오르지 않는다(설계 §4.1). 마치는 버튼도 행동 목록의 몫이라
// 화면은 가드를 다시 보지 않는다: 네 작업을 다 고르기 전에 누르면 규칙이 거부 문면으로 답한다.

import type { JobCard, RunState } from "../../types";
import { ActionList } from "../components/ActionList";
import { BriefingPanel } from "../components/BriefingPanel";
import {
  CLEANUP_DISPLAY_ORDER,
  CLEANUP_PICK_IDS,
  CleanupTaskPick,
} from "../components/CleanupTaskPick";
import { Prose } from "../components/Prose";
import { StatePanel } from "../components/StatePanel";
import { useContent } from "../contentContext";
import { INNER_GAP, META, MUTED, SCREEN_PAD, SECTION_GAP } from "../density";
import { useRunStore } from "../runStoreContext";

type CleanupScreenProps = {
  readonly run: RunState;
  readonly job: JobCard;
};

export function CleanupScreen({ run, job }: CleanupScreenProps) {
  const content = useContent();
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  const decisions = available.filter((id) => !CLEANUP_PICK_IDS.includes(id));
  return (
    <section aria-label="뒷정리" className={`flex flex-1 flex-col ${SECTION_GAP} ${SCREEN_PAD}`}>
      <h2 className="text-base text-parchment">{job.title}</h2>
      <BriefingPanel document={job.site.document} />
      <Prose text={job.cleanup.prompt} />
      {run.cleanupPicks.length > 0 && (
        <section
          aria-label="고른 순서"
          className={`flex flex-col ${INNER_GAP} border-t border-slate pt-2`}
        >
          <h3 className={META}>고른 순서</h3>
          <ol className={`flex list-decimal flex-col ${INNER_GAP} pl-4`}>
            {run.cleanupPicks.map((task) => (
              <li key={task} className={MUTED}>
                {content.cleanupTasks[task]}
              </li>
            ))}
          </ol>
        </section>
      )}
      <ul aria-label="작업" className={`flex flex-col ${INNER_GAP}`}>
        {CLEANUP_DISPLAY_ORDER.map((task) => {
          const order = run.cleanupPicks.indexOf(task);
          return (
            <CleanupTaskPick
              key={task}
              task={task}
              order={order === -1 ? null : order + 1}
              onPick={act}
            />
          );
        })}
      </ul>
      <StatePanel run={run} />
      <ActionList ids={decisions} onAct={act} reason={lastReason} />
    </section>
  );
}
