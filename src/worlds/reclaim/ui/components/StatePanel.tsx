// 회차 현황판 — 단계 제목, 증거 트레이(미확보는 흐리게), 재등장 기회·본부 방문 수치,
// 군 경로 잠금, 기록 건수. 수치·잠금은 전부 상태에서 렌더한다: 문면에 숫자를 박지
// 않는다(콘텐츠 계약). 상한은 규칙의 상수를 그대로 읽는다.

import { PixelSprite } from "../../../../shared/art/PixelSprite";
import { EVIDENCE_IDS, type EvidenceId } from "../../ids";
import { RECHANCE_LIMIT, REVIEW_LIMIT } from "../../rules/run";
import { ICONS } from "../../sprites/icons";
import { THEME } from "../../theme";
import type { RunState } from "../../types";
import { useContent } from "../contentContext";

type StatePanelProps = {
  readonly run: RunState;
};

const CHIP = "flex items-center gap-1 border-2 border-slate px-1 text-xs tabular-nums";

export function StatePanel({ run }: StatePanelProps) {
  const content = useContent();
  return (
    <section
      aria-label="현황"
      className="flex flex-col gap-2 border-2 border-slate bg-ink-deep p-3"
    >
      <h2 className="text-base text-parchment">{content.stages[run.stage].title}</h2>
      <ul aria-label="증거" className="flex flex-wrap gap-1">
        {EVIDENCE_IDS.map((id: EvidenceId) => {
          const held: boolean = run[id];
          const label = content.evidence[id];
          const icon = held ? (
            <PixelSprite sprite={ICONS[id]} title={label} scale={2} />
          ) : (
            <PixelSprite
              sprite={ICONS[id]}
              title={label}
              scale={2}
              monochrome={THEME.tokens.dusk}
            />
          );
          return (
            <li key={id} className={`${CHIP} ${held ? "text-parchment" : "text-dusk"}`}>
              {icon}
              {label}
            </li>
          );
        })}
      </ul>
      <ul
        aria-label="수치"
        className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-ash tabular-nums"
      >
        <li>
          재등장 기회 {run.chances}/{RECHANCE_LIMIT}
        </li>
        <li>
          본부 방문 {run.reviews}/{REVIEW_LIMIT}
        </li>
        <li>군 경로 {run.gunLocked ? "잠김" : "열림"}</li>
        <li>기록 {run.log.length}건</li>
      </ul>
    </section>
  );
}
