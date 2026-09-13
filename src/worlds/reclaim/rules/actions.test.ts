// 액션 가드 표 계약 테스트 — 배치가 갈라는 유일한 간선, 관문 단계 술어, 본부 방문 상한.
// 키 집합 일치는 ACTION_SPECS: Readonly<Record<ActionId, ActionSpec>> 타입이 컴파일로 이미
// 강제하므로 런타임 단언을 두지 않는다(W2 리뷰 발견 4 — 공허 통과).

import { describe, expect, test } from "vitest";
import { ACTION_SPECS, REVIEW_LIMIT } from "./actions";
import { makeRun } from "./testContent";

describe("배치 delta — 교차 대조 뒤의 목적지", () => {
  test("ru_first는 gate로, dusik_first는 venue로 갈라진다", () => {
    expect(
      ACTION_SPECS.xcheck_compare.apply(makeRun({ stage: "xcheck", placement: "ru_first" })).stage,
    ).toBe("gate");
    expect(
      ACTION_SPECS.xcheck_compare.apply(makeRun({ stage: "xcheck", placement: "dusik_first" }))
        .stage,
    ).toBe("venue");
    expect(
      ACTION_SPECS.xcheck_skip.apply(makeRun({ stage: "xcheck", placement: "dusik_first" })).stage,
    ).toBe("venue");
  });
});

describe("관문 단계 술어", () => {
  test("gate_dispatch는 gate에서는 항상, venue에서는 dusik_first에서만 열린다", () => {
    expect(ACTION_SPECS.gate_dispatch.when(makeRun({ stage: "gate" }))).toBe(true);
    expect(
      ACTION_SPECS.gate_dispatch.when(makeRun({ stage: "venue", placement: "dusik_first" })),
    ).toBe(true);
    expect(
      ACTION_SPECS.gate_dispatch.when(makeRun({ stage: "venue", placement: "ru_first" })),
    ).toBe(false);
  });

  test("gate_to_venue는 ru_first의 gate에서만 열린다", () => {
    expect(ACTION_SPECS.gate_to_venue.when(makeRun({ stage: "gate", placement: "ru_first" }))).toBe(
      true,
    );
    expect(
      ACTION_SPECS.gate_to_venue.when(makeRun({ stage: "gate", placement: "dusik_first" })),
    ).toBe(false);
    expect(
      ACTION_SPECS.gate_to_venue.when(makeRun({ stage: "venue", placement: "ru_first" })),
    ).toBe(false);
    expect(
      ACTION_SPECS.gate_to_venue.when(makeRun({ stage: "venue", placement: "dusik_first" })),
    ).toBe(false);
  });
});

describe("본부 방문 상한", () => {
  test("방문 액션은 REVIEW_LIMIT 미만에서만 목록에선다", () => {
    expect(
      ACTION_SPECS.archive_with_ru.when(makeRun({ stage: "archive", reviews: REVIEW_LIMIT - 1 })),
    ).toBe(true);
    expect(
      ACTION_SPECS.archive_with_ru.when(makeRun({ stage: "archive", reviews: REVIEW_LIMIT })),
    ).toBe(false);
  });
});
