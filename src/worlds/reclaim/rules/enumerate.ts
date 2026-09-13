// 열거 — 데모 route-combined-demo.html enumerate()(239-267)의 타입드 직역. 순수 함수만 있다:
// React·zustand·DOM·Date·Math.random 금지. chances는 단조 감소, reviews는 단조 증가,
// stage는 전진만 하므로 비순환이 자명하지만 그 가정에 기대지 않고 경로 서명 집합의
// 재방문으로 순환을 검출한다(데모와 동일). 종결·도달 지표는 방문 횟수 기준이라
// terminalCounts가 곧 종결별 도달 경로 수다(계획 §6 보조 지표).

import type { EndingId } from "../ids";
import { ENDING_IDS } from "../ids";
import type { Content, Placement, RunState } from "../types";
import { applyAction, availableActions, startRun } from "./run";

export type EnumerationReport = {
  /** 서명 기준 고유 상태 수. 서명 = RunState의 원시 필드 + terminal(log 제외, placement 포함). */
  readonly states: number;
  /** 종결별 도달 경로 수 — 한 경로가 종결에 닿을 때마다 센다(데모와 동일). */
  readonly terminalCounts: Readonly<Record<EndingId, number>>;
  /** 종결이 아닌데 availableActions가 빈 상태(방문 기준). */
  readonly deadEnds: readonly RunState[];
  /** 경로 내 재방문으로 검출된 순환 — "서명 → 서명 → …" 문자열. */
  readonly cycles: readonly string[];
  /** 두식 종결 무대(venue)에 단서를 쥔 채 도달한 방문 수 — ru_first에서 구조적 배타로 0이어야 한다. */
  readonly venueWithClue: number;
  /** 루 접점(site)에 단서 없이 도달한 방문 수 — 단서 없이는 파견이 열리지 않으므로 항상 0이어야 한다. */
  readonly siteWithoutClue: number;
  /** 두 체인의 재료(문서·좌표·단서)를 모두 쥔 비종결 방문 수 — 보조 지표(하드 불변식 아님). */
  readonly bothChainsReady: number;
};

/** 고유 상태 수 안전 상한 — 상태 공간 폭발을 테스트 실패(throw)로 만든다. */
const STATE_LIMIT = 20_000;

/** 상태 서명 — 데모 sig()와 같은 축. log는 경로의 함수라 서명에서 뺀다. */
const signature = (run: RunState): string =>
  [
    run.placement,
    run.stage,
    run.terminal,
    run.dispatchTaesan,
    run.broadcast,
    run.documents,
    run.coord,
    run.gunLocked,
    run.clue,
    run.relic,
    run.banjangSeed,
    run.reviews,
    run.chances,
    run.contact,
  ].join("|");

export const enumerateRuns = (content: Content, placement: Placement): EnumerationReport => {
  const terminalCounts = Object.fromEntries(ENDING_IDS.map((id) => [id, 0] as const)) as Record<
    EndingId,
    number
  >;
  const deadEnds: RunState[] = [];
  const cycles: string[] = [];
  const signatures = new Set<string>();
  const all: RunState[] = [];

  const walk = (run: RunState, path: readonly string[]): void => {
    signatures.add(signature(run));
    if (signatures.size > STATE_LIMIT) {
      throw new Error(`열거가 고유 상태 상한 ${STATE_LIMIT}개를 넘었다 — 상태 공간 폭발`);
    }
    all.push(run);
    if (run.terminal !== null) {
      terminalCounts[run.terminal] += 1;
      return;
    }
    let moved = false;
    for (const id of availableActions(run)) {
      const outcome = applyAction(run, id, content);
      if (!outcome.ok) continue;
      moved = true;
      const sig = signature(outcome.run);
      if (path.includes(sig)) {
        cycles.push([...path, sig].join(" → "));
        continue;
      }
      walk(outcome.run, [...path, sig]);
    }
    if (!moved) deadEnds.push(run);
  };

  const root = startRun(content, placement);
  walk(root, [signature(root)]);

  return {
    states: signatures.size,
    terminalCounts,
    deadEnds,
    cycles,
    venueWithClue: all.filter((run) => run.stage === "venue" && run.clue).length,
    siteWithoutClue: all.filter((run) => run.stage === "site" && !run.clue).length,
    bothChainsReady: all.filter(
      (run) => run.documents && run.coord && run.clue && run.terminal === null,
    ).length,
  };
};
