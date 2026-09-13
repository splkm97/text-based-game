// 이관 계약 검증 — 현 단계들이 일감·순서·체인 절차로 정직하게 대응되는가.
//
// 여기서 잡으려는 것은 두 가지다: (1) 모든 단계가 대응을 갖는가(타입이 이미 강제하지만
// 런타임에서도 확인한다), (2) 일감이 선형으로 한 번씩 나오고 각 일감의 순서가
// office → briefing → party → site를 지키는가 — 재편의 핵심 전제다.

import { expect, test } from "vitest";
import type { JobId, JobStepId } from "../ids";
import { CHAIN_STEP_IDS, JOB_IDS, JOB_STEP_IDS, STAGE_IDS } from "../ids";
import type { StagePlacement } from "./placement";
import { STAGE_PLACEMENT } from "./placement";

/** 현 단계 순서 — 회차가 실제로 지나가는 순서. 이관 표가 이 순서를 뒤집지 않아야 한다. */
const STAGE_ORDER = STAGE_IDS;

const chainsOf = (): readonly Extract<StagePlacement, { kind: "chain" }>[] =>
  STAGE_ORDER.map((stage) => STAGE_PLACEMENT[stage]).filter(
    (placement): placement is Extract<StagePlacement, { kind: "chain" }> =>
      placement.kind === "chain",
  );

test("모든 단계가 일감 또는 체인 절차에 대응한다", () => {
  const missing = STAGE_ORDER.filter((stage) => STAGE_PLACEMENT[stage] === undefined);
  expect(missing, `대응이 없는 단계: ${missing.join(", ") || "없음"}`).toEqual([]);
});

test("일감 대응은 JOB_IDS 순서를 지키고, 각 일감의 순서는 JOB_STEP_IDS 순서를 지킨다", () => {
  const jobSteps = new Map<JobId, JobStepId[]>();
  let lastJobIndex = -1;
  for (const stage of STAGE_ORDER) {
    const placement = STAGE_PLACEMENT[stage];
    if (placement.kind !== "job") continue;
    const jobIndex = JOB_IDS.indexOf(placement.job);
    expect(
      jobIndex,
      `단계 순서가 일감 목록을 거슬러 올라간다: ${stage}(${placement.job})`,
    ).toBeGreaterThanOrEqual(lastJobIndex);
    lastJobIndex = jobIndex;
    const steps = jobSteps.get(placement.job) ?? [];
    steps.push(placement.step);
    jobSteps.set(placement.job, steps);
  }
  for (const [job, steps] of jobSteps) {
    const ordered = [...steps].sort((a, b) => JOB_STEP_IDS.indexOf(a) - JOB_STEP_IDS.indexOf(b));
    expect(steps, `${job} 일감의 순서가 JOB_STEP_IDS를 거스른다`).toEqual(ordered);
  }
});

test("체인 대응은 CHAIN_STEP_IDS 안에 있다", () => {
  const unknown = chainsOf()
    .filter((placement) => !CHAIN_STEP_IDS.includes(placement.chain))
    .map((placement) => placement.chain);
  expect(unknown, `알 수 없는 체인 절차: ${unknown.join(", ") || "없음"}`).toEqual([]);
});
