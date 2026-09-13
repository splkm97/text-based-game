// 액션 가드 표 계약 테스트 — 43개 액션 각각에 대해 열리는 상태가 최소 하나 존재함을
// 확인하는 총체성 테스트가 본체다. 키 집합 일치는 ACTION_SPECS: Readonly<Record<ActionId,
// ActionSpec>> 타입이, 열림 상태 표는 Record<ActionId, RunState> 타입이 컴파일로 강제한다
// — 하나라도 빠지면 런타임이 아니라 타입이 먼저 막는다. 열림 여부는 when·require를
// 각각 단언하고, 실제로 적용까지 통과하는지 applyAction으로 확인한다(공허한 통과 없음).

import { describe, expect, test } from "vitest";
import type { ActionId } from "../ids";
import { ACTION_IDS } from "../ids";
import type { RunState } from "../types";
import { ACTION_SPECS, REVIEW_LIMIT } from "./actions";
import { applyAction } from "./run";
import { makeRun, TEST_CONTENT } from "./testContent";

/** 각 액션이 열리는 대표 상태 — when과 require가 동시에 참이어야 한다. */
const OPEN_STATES: Readonly<Record<ActionId, RunState>> = {
  office_printer: makeRun(),
  briefing_ack: makeRun({ jobStep: "briefing" }),
  party_pick_dusik: makeRun({ jobStep: "party" }),
  party_pick_ru: makeRun({ jobStep: "party" }),
  party_pick_banjang: makeRun({ jobStep: "party" }),
  party_pick_taesan: makeRun({ jobStep: "party" }),
  party_reset: makeRun({ jobStep: "party" }),
  party_go: makeRun({ jobStep: "party", party: ["dusik"] }),
  call_respond: makeRun({ jobIndex: 0, jobStep: "site" }),
  dispatch_send_taesan: makeRun({ jobIndex: 1, jobStep: "office" }),
  dispatch_send_other: makeRun({ jobIndex: 1, jobStep: "office" }),
  obs_send_ru_alone: makeRun({ jobIndex: 1, jobStep: "site", party: ["ru"] }),
  obs_boss_joins: makeRun({ jobIndex: 1, jobStep: "site" }),
  obs_send_other: makeRun({ jobIndex: 1, jobStep: "site", party: ["dusik"] }),
  radio_morning_on: makeRun({ jobIndex: 2, jobStep: "office", dispatchTaesan: true }),
  radio_business_only: makeRun({ jobIndex: 2, jobStep: "office", dispatchTaesan: true }),
  archive_with_dusik: makeRun({ jobIndex: 2, jobStep: "site", party: ["dusik"] }),
  archive_with_ru: makeRun({ jobIndex: 2, jobStep: "site", party: ["ru"] }),
  archive_with_taesan: makeRun({ jobIndex: 2, jobStep: "site", party: ["taesan"] }),
  archive_alone: makeRun({ jobIndex: 2, jobStep: "site", party: ["banjang"] }),
  archive_leave: makeRun({ jobIndex: 2, jobStep: "site", reviews: 1 }),
  xcheck_compare: makeRun({ chainStep: "xcheck", broadcast: true, documents: true }),
  xcheck_skip: makeRun({ chainStep: "xcheck" }),
  gate_dispatch: makeRun({ chainStep: "gate", clue: true }),
  gate_hold: makeRun({ chainStep: "gate", clue: true }),
  gate_reopen: makeRun({ chainStep: "gate", clue: false, chances: 1 }),
  gate_to_venue: makeRun({ placement: "ru_first", chainStep: "gate", clue: false }),
  site_hold: makeRun({ jobIndex: 3, jobStep: "site", clue: true }), // 관찰 유보는 단서를 쥔 회차에만
  site_process: makeRun({ jobIndex: 3, jobStep: "site" }),
  site_with_taesan: makeRun({ jobIndex: 3, jobStep: "site", party: ["taesan"] }),
  night_use: makeRun({ chainStep: "night", relic: true }),
  night_not_use: makeRun({ chainStep: "night" }),
  night_no_item: makeRun({ chainStep: "night", relic: false }),
  venue_military: makeRun({ chainStep: "venue", documents: true, broadcast: true, coord: true }),
  venue_association: makeRun({ chainStep: "venue", documents: true }),
  venue_government: makeRun({ chainStep: "venue", documents: true }),
  venue_press: makeRun({ chainStep: "venue", documents: true }),
  venue_silence: makeRun({ chainStep: "venue" }),
  venue_no_stage: makeRun({ chainStep: "venue", documents: false }),
  gun_with_taesan: makeRun({ chainStep: "gun" }),
  gun_with_banjang: makeRun({ chainStep: "gun" }),
  submit_original: makeRun({ chainStep: "submit" }),
  submit_copy: makeRun({ chainStep: "submit" }),
};

test("43개 액션 전체에 열리는 상태가 존재하고 실제로 적용까지 통과한다", () => {
  expect(ACTION_IDS).toHaveLength(43);
  for (const id of ACTION_IDS) {
    const run = OPEN_STATES[id];
    const spec = ACTION_SPECS[id];
    expect(spec.when(run), `${id} when`).toBe(true);
    if (spec.require !== undefined) {
      expect(spec.require(run), `${id} require`).toBe(true);
    }
    const outcome = applyAction(run, id, TEST_CONTENT);
    expect(outcome.ok, `${id}: ${outcome.reason ?? ""}`).toBe(true);
  }
});

describe("관문 단계 술어 — 배치를 따른다(데모 gateStage)", () => {
  test("gate_dispatch는 gate에서는 항상, venue에서는 dusik_first에서만 연다", () => {
    expect(ACTION_SPECS.gate_dispatch.when(makeRun({ chainStep: "gate" }))).toBe(true);
    expect(
      ACTION_SPECS.gate_dispatch.when(makeRun({ chainStep: "venue", placement: "dusik_first" })),
    ).toBe(true);
    expect(
      ACTION_SPECS.gate_dispatch.when(makeRun({ chainStep: "venue", placement: "ru_first" })),
    ).toBe(false);
  });

  test("gate_to_venue는 ru_first의 gate에서만, 단서 없이 열린다", () => {
    expect(
      ACTION_SPECS.gate_to_venue.when(makeRun({ chainStep: "gate", placement: "ru_first" })),
    ).toBe(true);
    expect(
      ACTION_SPECS.gate_to_venue.when(makeRun({ chainStep: "gate", placement: "dusik_first" })),
    ).toBe(false);
    expect(
      ACTION_SPECS.gate_to_venue.when(makeRun({ chainStep: "venue", placement: "ru_first" })),
    ).toBe(false);
    expect(
      ACTION_SPECS.gate_to_venue.when(makeRun({ chainStep: "venue", placement: "dusik_first" })),
    ).toBe(false);
  });
});

describe("본부 방문 상한", () => {
  test("방문 액션은 REVIEW_LIMIT 미만에서만 목록에 선다", () => {
    expect(
      ACTION_SPECS.archive_with_ru.when(
        makeRun({ jobIndex: 2, jobStep: "site", reviews: REVIEW_LIMIT - 1 }),
      ),
    ).toBe(true);
    expect(
      ACTION_SPECS.archive_with_ru.when(
        makeRun({ jobIndex: 2, jobStep: "site", reviews: REVIEW_LIMIT }),
      ),
    ).toBe(false);
  });
});
