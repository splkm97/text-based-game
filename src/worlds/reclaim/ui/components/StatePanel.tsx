// 회차 현황판 — 단계 제목, 회차 기록(최근 결과 문장), 잠금 신호.
//
// 진엔딩 플래그는 화면에 없다: 플레이어는 자기가 한 일과 그 결과 문장만 읽는다. 증거 트레이·
// 재등장 기회·방문 횟수 같은 수치는 두지 않는다 — 상실은 그 순간의 결과·거부 문면이 말하고
// (조용한 잠금 금지), 남은 절차는 열린 행동 목록이 말한다.

import type { RunState } from "../../types";
import { useContent } from "../contentContext";

type StatePanelProps = {
  readonly run: RunState;
};

/** Record lines stay short: the panel shows the tail of the run's own record, not a log viewer. */
const RECORD_LINES = 3;

export function StatePanel({ run }: StatePanelProps) {
  const content = useContent();
  const recent = run.log.slice(-RECORD_LINES);
  return (
    <section
      aria-label="현황"
      className="flex flex-col gap-2 border-2 border-slate bg-ink-deep p-3"
    >
      <h2 className="text-base text-parchment">{content.stages[run.stage].title}</h2>
      {recent.length === 0 ? null : (
        <ol aria-label="회차 기록" className="flex flex-col gap-1 text-xs leading-prose text-ash">
          {recent.map((entry) => (
            <li key={entry.text}>{entry.text}</li>
          ))}
        </ol>
      )}
      {run.gunLocked ? (
        <p className="text-xs text-ember">군 경로가 잠겼다. 다른 창구로 가야 한다.</p>
      ) : null}
    </section>
  );
}
