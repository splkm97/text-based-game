// 저장 경계의 유일한 검증 — zod. localStorage가 이 월드의 신뢰 경계다: 페이로드는 규칙이
// 보기 전에 여기서 통과해야 한다. 구·손상 페이로드는 거부가 정답이고 마이그레이션은 없다
// (반쯤 로드하지 않는다). parse 함수의 반환 타입 주석이 추론 결과가 `RunState`·`MetaState`로
// 대입 가능함을 증명한다 — id union이 늘면 누락된 키가 컴파일 오류로 돌아온다.

import { z } from "zod";
import {
  CHAIN_STEP_IDS,
  CHARACTER_IDS,
  ENDING_IDS,
  type EndingId,
  JOB_IDS,
  JOB_STEP_IDS,
} from "../ids";
import { RECHANCE_LIMIT, REVIEW_LIMIT } from "../rules/run";
import type { RunState } from "../types";

const jobId = z.enum(JOB_IDS);
const jobStepId = z.enum(JOB_STEP_IDS);
const chainStepId = z.enum(CHAIN_STEP_IDS);
const characterId = z.enum(CHARACTER_IDS);
const endingId = z.enum(ENDING_IDS);
const count = z.number().int().nonnegative();

/** 인물 상태 4축 — fatigue·suspicion·trust는 음수가 없고 injured는 플래그다. */
const characterState = z.object({
  fatigue: count,
  injured: z.boolean(),
  suspicion: count,
  trust: count,
});

/**
 * 로그 위치 판별 유니온 — kind는 "job" | "chain" 둘뿐이다(union total). 일감 로그는
 * JOB_IDS enum으로, 체인 로그는 CHAIN_STEP_IDS enum으로 각각 닫힌다.
 */
const logPlace = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("job"), job: jobId }),
  z.object({ kind: z.literal("chain"), chain: chainStepId }),
]);
const logEntry = z.object({ place: logPlace, text: z.string() });

const runState = z.object({
  placement: z.enum(["ru_first", "dusik_first"]),
  jobIndex: z
    .number()
    .int()
    .min(0)
    .max(JOB_IDS.length - 1), // JOB_IDS 위치 전체
  jobStep: jobStepId,
  // 인원 선택은 1~2명(설계 §5) — 선택 전 빈 배열까지 포함해 최대 2다.
  party: z.array(characterId).max(2),
  // characters: CHARACTER_IDS 네 키를 리터럴로 전부 나열 — union total이 컴파일로 강제된다.
  characters: z.object({
    dusik: characterState,
    ru: characterState,
    banjang: characterState,
    taesan: characterState,
  }),
  pendingChain: z.array(chainStepId),
  chainStep: chainStepId.nullable(),
  terminal: endingId.nullable(),
  dispatchTaesan: z.boolean(),
  broadcast: z.boolean(),
  documents: z.boolean(),
  coord: z.boolean(),
  gunLocked: z.boolean(),
  clue: z.boolean(),
  relic: z.boolean(),
  banjangSeed: z.boolean(),
  reviews: z.number().int().min(0).max(REVIEW_LIMIT),
  chances: z.number().int().min(0).max(RECHANCE_LIMIT),
  contact: z.boolean(),
  log: z.array(logEntry),
});

/** `MetaState`의 저장 형태. 회차 간 기록: 종결별 도달 수와 시작한 회차 수. */
export type MetaState = {
  readonly endingsSeen: Readonly<Record<EndingId, number>>;
  readonly runs: number;
  readonly updatedAt: string;
};

// endingsSeen: ENDING_IDS 일곱 키를 리터럴로 전부 나열 — union total이 컴파일로 강제된다.
const metaState = z.object({
  endingsSeen: z.object({
    true_ru: count,
    true_dusik: count,
    death: count,
    gov: count,
    press: count,
    general: count,
    routine: count,
  }),
  runs: count,
  updatedAt: z.string(),
});

/** `JSON.parse` 실패와 스키마 실패는 같은 뜻이다: 쓸 수 있는 세이브가 없다. */
export const parseRun = (json: string): RunState | null => {
  try {
    const result = runState.safeParse(JSON.parse(json));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const parseMeta = (json: string): MetaState | null => {
  try {
    const result = metaState.safeParse(JSON.parse(json));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};
