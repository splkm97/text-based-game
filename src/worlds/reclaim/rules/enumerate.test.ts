// 열거 테스트 — 두 배치 각각의 전체 상태 공간을 DFS로 돌려 계획 §6의 불변식을 증명한다.
// 단언값은 리포트에서 읽는다(수치 하드코딩 금지). 예외는 계획이 요구하는 0/0 초과 구분:
// siteWithoutClue === 0(두 배치 공통), venueWithClue는 ru_first 0 · dusik_first 0 초과.

import { describe, expect, test } from "vitest";
import { ENDING_IDS } from "../ids";
import type { Placement } from "../types";
import type { EnumerationReport } from "./enumerate";
import { enumerateRuns } from "./enumerate";
import { TEST_CONTENT } from "./testContent";

const PLACEMENTS: readonly Placement[] = ["ru_first", "dusik_first"];

const reports: Readonly<Record<Placement, EnumerationReport>> = {
  ru_first: enumerateRuns(TEST_CONTENT, "ru_first"),
  dusik_first: enumerateRuns(TEST_CONTENT, "dusik_first"),
};

/** 부가 지표 — 단언 대상이 아니라 실패 메시지로 보고하는 값이다(계획 §6 보조 지표). */
const aux = (placement: Placement): string => {
  const report = reports[placement];
  const counts = ENDING_IDS.map((id) => `${id}:${report.terminalCounts[id]}`).join(" ");
  return `부가 지표(단언 아님) states=${report.states} bothChainsReady=${report.bothChainsReady} terminalCounts={${counts}}`;
};

describe.each(PLACEMENTS)("배치 %s — 전체 상태 공간 열거", (placement) => {
  test("DFS가 상태 공간을 끝까지 마른다 — 순환 0, 막다른 비종결 상태 0", () => {
    const report = reports[placement];
    expect(report.cycles, `경로 내 상태 재방문이 없다. ${aux(placement)}`).toEqual([]);
    expect(report.deadEnds, `비종결 상태에서 선택지가 막히지 않는다. ${aux(placement)}`).toEqual(
      [],
    );
  });

  test("종결 8종 전부에 도달 경로가 있다 — terminalCounts가 끝 id마다 1 이상", () => {
    const report = reports[placement];
    for (const id of ENDING_IDS) {
      expect(
        report.terminalCounts[id],
        `종결 ${id}의 도달 경로 수. ${aux(placement)}`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  test("site에는 단서를 쥔 채로만 도달한다 — siteWithoutClue는 0(두 배치 공통)", () => {
    const report = reports[placement];
    expect(report.siteWithoutClue, `단서 없는 site 방문. ${aux(placement)}`).toBe(0);
  });
});

describe("배타 — 배치에 따라 다르게 성립한다(계획 §6)", () => {
  test("ru_first는 단서를 쥔 채 두식 무대(venue)에 설 수 없다 — venueWithClue는 0", () => {
    expect(reports.ru_first.venueWithClue, aux("ru_first")).toBe(0);
  });

  test("dusik_first는 venue에서 루 관문 액션이 함께 열려 단서+venue 상태가 존재한다 — venueWithClue는 0 초과", () => {
    expect(reports.dusik_first.venueWithClue, aux("dusik_first")).toBeGreaterThan(0);
  });
});
