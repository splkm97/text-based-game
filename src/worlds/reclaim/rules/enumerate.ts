// 열거 — 데모 route-combined-demo.html enumerate()의 직계 후손. 순수 함수만 있다:
// React·zustand·DOM·Date·Math.random 금지. 2026-09-14 일감 재편: 서명 축과 지표를
// 일감 구조 필드(jobIndex·jobStep·chainStep·pendingChain·party)로 재매핑했다. 모듈 API
// (enumerateRuns·EnumerationReport)는 유지 — ENG-11이 새 그래프 불변식(설계 §6)을
// 재정의할 때까지의 잠정판이다.
//
// 새 그래프는 합류점이 많다(본부 방문 순서·인원 선택 순서가 갈라졌다 합쳐진다). 데모의
// 경로 따라가기(경로 내 재방문만 차단)로는 같은 상태를 지수적으로 다시 펼치므로, 각
// 서명을 정확히 한 번 확장하는 메모이즈드 DFS로 바꿨다. 지표는 방문 수가 아니라 고유
// 상태 수 기준이고, 순환은 현재 경로로의 되돌아감(백 에지) 중에서도 흐름이 화면을
// 거슬러 되돌아가는 것만 기록한다 — 같은 화면 안의 상호작용 루프(인원 선택의
// pick↔reset)는 진행 순환이 아니다. jobIndex는 gate_reopen으로 되돌아가지만 chances가
// 단조 감소하므로 되돌아간 경로는 유한하다.

import type { CleanupTaskId, EndingId } from "../ids";
import { CLEANUP_TASK_IDS, ENDING_IDS, JOB_IDS } from "../ids";
import type { Content, Placement, RunState } from "../types";
import { CLEANUP_KINDS } from "./cleanupKinds";
import { applyAction, availableActions, cleanupGrade, startRun } from "./run";

export type EnumerationReport = {
  /** 서명 기준 고유 상태 수. 서명 = RunState의 원시 필드 + terminal(log 제외, placement 포함). */
  readonly states: number;
  /** 종결별로 도달한 고유 종결 상태 수 — 0이면 그 종결에 도달하는 경로가 없다는 뜻이다. */
  readonly terminalCounts: Readonly<Record<EndingId, number>>;
  /** 종결이 아닌데 availableActions가 빈 고유 상태. */
  readonly deadEnds: readonly RunState[];
  /** 현재 경로로 되돌아가는 백 에지 중 화면을 거슬러 되돌아가는 것 — "서명 → 서명" 문자열. */
  readonly cycles: readonly string[];
  /** 두식 종결 무대(venue)에 단서를 쥔 고유 상태 수 — ru_first에서 구조적 배타로 0이어야 한다. */
  readonly venueWithClue: number;
  /** 폐허 현장(마지막 일감의 site)에 단서 없이 도달한 고유 상태 수. */
  readonly siteWithoutClue: number;
  /** 두 체인의 재료(문서·좌표·단서)를 모두 쥔 비종결 고유 상태 수 — 보조 지표(하드 불변식 아님). */
  readonly bothChainsReady: number;
};

/** 고유 상태 수 안전 상한 — 상태 공간 폭발을 테스트 실패(throw)로 만든다.
 * 실측(2026-09-14, TEST_CONTENT, 뒷정리 축 투영 + 아침 조회 축): ru_first 65,775 ·
 * dusik_first 335,052 상태, 각 260ms·1,432ms. 아침 조회(면담)가 사무실 단계에 축을 더해
 * 이전 실측(57,855·298,332)에서 약 1.14배가 됐으므로, 상한을 실측 최대의 약 3배로 둔다
 * (그 이상은 새 축이 곱해진 폭발로 본다). */
const STATE_LIMIT = 1_000_000;

/** 상태 서명 — 데모 sig()와 같은 역할의 축. log는 경로의 함수라 서명에서 뺀다.
 * 인물 상태 축(fatigue·injured·suspicion·trust)도 뺀다: 가드가 읽는 유일한 인물 축인
 * injured의 분기는 party 축에 대표되므로, 같은 서명의 미래 분기는 동일하게 보존된다.
 * 면담 응답의 효과(work suspicion−1·comfort trust+1·joke fatigue−1)와 고른 값 자체도
 * 가드가 읽지 않으므로 뺀다 — 면담에서 미래를 가르는 것은 "응답을 골랐는가"뿐이다.
 * 뒷정리 순서도 단계별로 접어 넣는다(cleanupAxis) — 원시 배열을 그대로 넣으면 순서 24가지가
 * 전 단계에 곱해져 열거가 실측 267k/1.24M로 폭발한다(2026-09-14). */
const signature = (run: RunState): string =>
  [
    run.placement,
    run.jobIndex,
    run.jobStep,
    // 아침 조회의 세 축 — office 단계에서만 값을 갖는다(떠날 때 초기값으로 돌아간다).
    run.officeStage,
    // 면담의 미래를 가르는 것은 **응답을 골랐는가**뿐이다: 셋(work·comfort·joke) 중 무엇을
    // 골랐는지는 어떤 가드도 읽지 않는다(효과는 위에서 뺀 인물 축으로만 간다). 그래서
    // choice는 고른 값이 아니라 open/answered로 접는다 — close의 require가 그 경계다.
    run.interview === null
      ? "-"
      : `${run.interview.character}:${run.interview.choice === null ? "open" : "answered"}`,
    [...run.talks].sort().join(","),
    run.chainStep,
    run.terminal,
    run.party.join(","),
    cleanupAxis(run),
    run.pendingChain.join(","),
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

/**
 * 지침 접두 일치 수 — order 종류에서만 쓴다. picks[0..n-1]이 CLEANUP_TASK_IDS와 같고
 * 그다음이 다른 최대 n. 전부 일치하면 길이 자체다. 관악(gwanak)의 완주 등급
 * (perfect/partial/poor)이 이 값과 집합만으로 정해진다 — 집합만 담으면 같은 집합의 두 순서
 * ([sign,power,search] 대 [search,sign,power])가 한 서명으로 접혀, 메모이즈가 대표 하나만
 * 확장해 탐험되는 등급이 ACTION_IDS 반복 순서에 종속된다(리뷰 실측: 48순열 중 44런에서
 * site 등급이 poor만 발견됨, 2026-09-14). pfx를 더한 뒤에는 48순열 전부가 등급 3종을 덮는다.
 */
const prefixMatches = (picks: readonly CleanupTaskId[]): number => {
  const mismatch = picks.findIndex((task, index) => task !== CLEANUP_TASK_IDS[index]);
  return mismatch === -1 ? picks.length : mismatch;
};

/**
 * 서명의 뒷정리 축 — order 종류(관악)만 지침 접두 일치 수(pfx)가 필요하다: 등급이 순서
 * 자체에 좌우되기 때문이다. 나머지 종류(subset·exclude·count)는 등급과 이후 가능한 액션이
 * 오직 **고른 집합**에만 좌우된다(가드도 등급도 순서를 읽지 않는다) — 그래서 집합만으로
 * 충분한 quotient다. 넷을 다 고른 뒤(현장까지)에는 어느 종류든 **등급**만이 미래를 가른다.
 */
export const cleanupAxis = (run: RunState): string => {
  if (run.chainStep !== null) return "-";
  if (run.jobStep === "cleanup") {
    if (run.cleanupPicks.length === CLEANUP_TASK_IDS.length) {
      return `grade:${cleanupGrade(run)}`;
    }
    const job = JOB_IDS[run.jobIndex];
    const kind = job === undefined ? undefined : CLEANUP_KINDS[job];
    const set = [...run.cleanupPicks].sort().join(",");
    return kind === "order" ? `set:${set}:pfx${prefixMatches(run.cleanupPicks)}` : `set:${set}`;
  }
  if (run.jobStep === "site") return `grade:${cleanupGrade(run) ?? "none"}`;
  return "-";
};

/** 흐름 위치 — 체인 절차거나 (일감, 순서)다. 같은 위치 안의 백 에지는 화면 루프다. */
const position = (run: RunState): string =>
  run.chainStep !== null ? `chain:${run.chainStep}` : `job:${run.jobIndex}|${run.jobStep}`;

export const enumerateRuns = (content: Content, placement: Placement): EnumerationReport => {
  const terminalCounts = Object.fromEntries(ENDING_IDS.map((id) => [id, 0] as const)) as Record<
    EndingId,
    number
  >;
  const deadEnds: RunState[] = [];
  const cycles: string[] = [];
  const all: RunState[] = [];
  /** 한 번이라도 본 서명 — 종결 상태를 포함해 각 서명을 최대 한 번 확장한다. */
  const seen = new Set<string>();
  /** 확장 중인 경로 위의 서명 — 백 에지(순환) 검출에만 쓴다. */
  const onPath = new Set<string>();

  const walk = (run: RunState): void => {
    const sig = signature(run);
    seen.add(sig);
    if (seen.size > STATE_LIMIT) {
      throw new Error(`열거가 고유 상태 상한 ${STATE_LIMIT}개를 넘었다 — 상태 공간 폭발`);
    }
    all.push(run);
    if (run.terminal !== null) {
      terminalCounts[run.terminal] += 1;
      return;
    }
    onPath.add(sig);
    let moved = false;
    for (const id of availableActions(run)) {
      const outcome = applyAction(run, id, content);
      if (!outcome.ok) continue;
      moved = true;
      const nextSig = signature(outcome.run);
      if (onPath.has(nextSig)) {
        // 같은 화면 위의 루프는 진행 순환이 아니다 — 흐름 순환만 기록한다.
        if (position(outcome.run) !== position(run)) cycles.push(`${sig} → ${nextSig}`);
        continue;
      }
      if (!seen.has(nextSig)) walk(outcome.run);
    }
    onPath.delete(sig);
    if (!moved) deadEnds.push(run);
  };

  walk(startRun(content, placement));

  return {
    states: seen.size,
    terminalCounts,
    deadEnds,
    cycles,
    venueWithClue: all.filter((run) => run.chainStep === "venue" && run.clue).length,
    siteWithoutClue: all.filter(
      (run) =>
        run.jobIndex === JOB_IDS.length - 1 &&
        run.jobStep === "site" &&
        run.chainStep === null &&
        !run.clue,
    ).length,
    bothChainsReady: all.filter(
      (run) => run.documents && run.coord && run.clue && run.terminal === null,
    ).length,
  };
};
