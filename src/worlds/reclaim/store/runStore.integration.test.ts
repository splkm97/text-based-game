// 실기계-스토어 통합 — `runStore.test.ts`는 기계를 스텁하므로(중간 초록 유지용),
// 여기서는 **실제 규칙·실제 콘텐츠**로 스토어를 관통한다: 저장, 거부 문면, 종결 시 세이브 비움과
// onEnding. 웨이브 리뷰가 "실기계로 종결에 도달하는 검증이 스위트 어디에도 없다"고 지적한 자리다.

import { expect, test } from "vitest";
import { memoryStorage } from "../../../shared/storage";
import { CONTENT } from "../content";
import type { ActionId, EndingId } from "../ids";
import { createPersistence } from "./persistence";
import { createRunStore } from "./runStore";

const RUN_KEY = "lia.reclaim.run.v5";

test("실제 규칙으로: 시작 → 저장 → 거부(문면) → 종결 → 세이브 비움 + onEnding", () => {
  const storage = memoryStorage();
  const endings: EndingId[] = [];
  const store = createRunStore({
    content: CONTENT,
    persistence: createPersistence(storage),
    onStart: () => {},
    onEnding: (ending) => endings.push(ending),
  });

  store.getState().start();
  expect(store.getState().run?.jobStep).toBe("office");
  expect(storage.data.has(RUN_KEY)).toBe(true);

  store.getState().act("office_next"); // 산문 화면 → 사람들
  store.getState().act("office_printer");
  expect(store.getState().run?.jobStep).toBe("briefing");
  expect(createPersistence(storage).load()?.jobStep).toBe("briefing");

  // 지금 단계가 아닌 액션: 사유만 남고 상태·세이브는 그대로다.
  const before = store.getState().run;
  store.getState().act("archive_leave");
  expect(store.getState().run).toBe(before);
  expect(store.getState().lastReason).toBe(CONTENT.actions.archive_leave.deny);

  // 실 회차를 일상 엔딩까지 몰아 종결 처리를 관통한다(문서를 챙기지 않는 길).
  const walk: readonly ActionId[] = [
    "briefing_ack",
    "party_pick_dusik",
    "party_go",
    // 뒷정리 미니게임 — 지침 순서대로 작업 넷을 고르고 현장을 연다.
    "cleanup_pick_sign",
    "cleanup_pick_power",
    "cleanup_pick_search",
    "cleanup_pick_photo",
    "cleanup_finish",
    "call_respond", // 관악구 완료
    "office_next", // 산문 화면을 덮고 사람들 쪽으로
    "office_printer",
    "briefing_ack",
    "party_pick_dusik",
    "party_go",
    // 뒷정리 미니게임 — 지침 순서대로 작업 넷을 고르고 현장을 연다.
    "cleanup_pick_sign",
    "cleanup_pick_power",
    "cleanup_pick_search",
    "cleanup_pick_photo",
    "cleanup_finish",
    "obs_boss_joins", // 관측소 완료(단서 없음)
    "office_next", // 산문 화면을 덮고 사람들 쪽으로
    "radio_business_only", // 본부 사무실 — 라디오를 업무로만 처리한다
    "briefing_ack",
    "party_pick_banjang",
    "party_go",
    // 뒷정리 미니게임 — 지침 순서대로 작업 넷을 고르고 현장을 연다.
    "cleanup_pick_sign",
    "cleanup_pick_power",
    "cleanup_pick_search",
    "cleanup_pick_photo",
    "cleanup_finish",
    "archive_alone", // 최 반장의 조사 재료만 챙긴다(문서 사본 없음)
    "archive_leave",
    "venue_no_stage", // 수신자 허브 — 무대 미개방
  ];
  for (const id of walk) {
    store.getState().act(id);
    expect(store.getState().lastReason, `${id}가 거부되었다`).toBeNull();
  }

  expect(store.getState().run?.terminal).toBe("routine");
  expect(endings).toEqual(["routine"]);
  expect(storage.data.has(RUN_KEY)).toBe(false); // 종결은 세이브를 비운다
});
