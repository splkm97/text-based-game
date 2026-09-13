// 저장 경계의 유일한 검증 — zod. localStorage가 이 월드의 신뢰 경계다: 페이로드는 규칙이
// 보기 전에 여기서 통과해야 한다. 구·손상 페이로드는 거부가 정답이고 마이그레이션은 없다
// (반쯤 로드하지 않는다). parse 함수의 반환 타입 주석이 추론 결과가 `RunState`·`MetaState`로
// 대입 가능함을 증명한다 — id union이 늘면 누락된 키가 컴파일 오류로 돌아온다.

import { z } from "zod";
import { ENDING_IDS, type EndingId, STAGE_IDS } from "../ids";
import { RECHANCE_LIMIT, REVIEW_LIMIT } from "../rules/run";
import type { RunState } from "../types";

const stageId = z.enum(STAGE_IDS);
const endingId = z.enum(ENDING_IDS);
const count = z.number().int().nonnegative();

const runState = z.object({
  placement: z.enum(["ru_first", "dusik_first"]),
  stage: stageId,
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
  log: z.array(z.object({ step: z.int().min(1), stage: stageId, text: z.string() })),
});

/** `MetaState`의 저장 형태. 회차 간 기록: 종결별 도달 수와 시작한 회차 수. */
export type MetaState = {
  readonly endingsSeen: Readonly<Record<EndingId, number>>;
  readonly runs: number;
  readonly updatedAt: string;
};

const metaState = z.object({
  endingsSeen: z.object({
    true_ru: count,
    true_dusik: count,
    death: count,
    gov: count,
    press: count,
    taesan: count,
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
