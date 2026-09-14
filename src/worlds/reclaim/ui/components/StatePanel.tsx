// 회차 현황판 — 회차 기록(최근 결과 문장)과 잠금 신호.
//
// 인물의 상태 축(피로·부상·의심·신뢰)은 여기에 숫자로도 게이지로도 오르지 않는다(설계 §4.1):
// 플레이어는 자기가 한 일과 그 결과 문장만 읽고, 사람의 상태는 사무실 잡담·현장 대사·잠긴
// 선택지의 사유 문면으로만 드러난다. 증거 트레이·재등장 기회·방문 횟수 같은 수치도 두지
// 않는다 — 상실은 그 순간의 결과·거부 문면이 말하고, 남은 절차는 열린 행동 목록이 말한다.

import type { RunState } from "../../types";
import { INNER_GAP, META } from "../density";

type StatePanelProps = {
  readonly run: RunState;
};

/** Record lines stay short: the panel shows the tail of the run's own record, not a log viewer. */
const RECORD_LINES = 3;

export function StatePanel({ run }: StatePanelProps) {
  const recent = run.log.slice(-RECORD_LINES);
  // 아직 남긴 기록도 잠금 신호도 없으면 패널을 세우지 않는다 — 빈 상자는 자리만 차지한다.
  if (recent.length === 0 && !run.gunLocked) {
    return null;
  }
  // 상자가 아니라 **위쪽 헤어라인**이다: 기록은 읽는 문면이고 만질 수 있는 대상이 아니다.
  return (
    <section aria-label="현황" className={`flex flex-col ${INNER_GAP} border-t border-slate pt-2`}>
      {recent.length === 0 ? null : (
        <ol aria-label="회차 기록" className={`flex flex-col ${INNER_GAP} ${META}`}>
          {recent.map((entry, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 기록은 append-only 고정 순서이고 항목에 자식 상태가 없다. 반복 행동은 같은 result 문면을 남기므로 문면 키는 충돌한다.
            <li key={index}>{entry.text}</li>
          ))}
        </ol>
      )}
      {run.gunLocked ? (
        <p className="text-xs leading-prose text-ember">군 경로가 잠겼다. 다른 창구로 가야 한다.</p>
      ) : null}
    </section>
  );
}
