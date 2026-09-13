// 리듀서 계약 테스트 — 일감 구조(2026-09-14): 시작 상태, office→briefing→party→site 전이,
// 인원 선택 가드, 일감 완료의 인물 증감, 체인 대기 FIFO와 배치 라우팅, 라디오 아침,
// 종결 단방향, 상한·하한 단조성.

import { describe, expect, test } from "vitest";
import { ACTION_IDS } from "../ids";
import type { ActionId } from "../ids";
import type { RunState } from "../types";
import { applyAction, availableActions, RECHANCE_LIMIT, REVIEW_LIMIT, startRun } from "./run";
import { makeRun, TEST_CONTENT, zeroCharacters } from "./testContent";

/** 성공을 가정한 액션 적용 — 실패하면 사유와 함께 테스트를 때린다. */
const act = (run: RunState, id: ActionId): RunState => {
  const outcome = applyAction(run, id, TEST_CONTENT);
  expect(outcome.ok, `${id}: ${outcome.reason ?? ""}`).toBe(true);
  return outcome.run;
};

describe("startRun — 시작 상태 계약(표 「공통」)", () => {
  test("첫 일감(gwanak) 사무실, 빈 동행, 균일 인물, 빈 체인 대기", () => {
    const run = startRun(TEST_CONTENT);
    expect(run).toEqual(makeRun());
    expect(run.placement).toBe("ru_first");
    expect(run.jobIndex).toBe(0);
    expect(run.jobStep).toBe("office");
    expect(run.party).toEqual([]);
    expect(run.characters).toEqual(zeroCharacters());
    expect(run.pendingChain).toEqual([]);
    expect(run.chainStep).toBeNull();
    expect(run.terminal).toBeNull();
    expect(run.chances).toBe(RECHANCE_LIMIT);
    expect(run.reviews).toBe(0);
    expect(run.log).toEqual([]);
  });

  test("배치를 지정하면 그 배치로 시작한다", () => {
    expect(startRun(TEST_CONTENT, "dusik_first").placement).toBe("dusik_first");
  });

  test("시작 사무실에서 열리는 액션은 프린터 하나뿐이다", () => {
    expect(availableActions(startRun(TEST_CONTENT))).toEqual(["office_printer"]);
  });
});

describe("사무실 → 공문 → 인원 선택 → 현장 — 모든 일감이 같은 순서를 탄다", () => {
  test("첫 일감의 네 단계를 지나 완료하면 다음 일감 사무실에 선다", () => {
    let run = startRun(TEST_CONTENT);
    expect(availableActions(run)).toEqual(["office_printer"]);
    run = act(run, "office_printer");
    expect(run.jobStep).toBe("briefing");
    expect(availableActions(run)).toEqual(["briefing_ack"]);
    run = act(run, "briefing_ack");
    expect(run.jobStep).toBe("party");
    expect(availableActions(run)).toEqual([
      "party_pick_dusik",
      "party_pick_ru",
      "party_pick_banjang",
      "party_pick_taesan",
      "party_reset",
      "party_go",
    ]);
    run = act(run, "party_pick_dusik");
    run = act(run, "party_go");
    expect(run.jobStep).toBe("site");
    expect(availableActions(run)).toEqual(["call_respond"]);
    run = act(run, "call_respond");
    expect(run.jobIndex).toBe(1);
    expect(run.jobStep).toBe("office");
    expect(run.party).toEqual([]);
    // 둘째 일감 사무실 — 파견 선택이 함께 열린다
    expect(availableActions(run)).toEqual([
      "office_printer",
      "dispatch_send_taesan",
      "dispatch_send_other",
    ]);
    run = act(run, "dispatch_send_taesan");
    expect(run.dispatchTaesan).toBe(true);
    expect(run.jobStep).toBe("briefing");
  });

  test("로그에는 액션이 일어난 일감 위치와 결과 문면이 남는다", () => {
    let run = startRun(TEST_CONTENT);
    run = act(run, "office_printer");
    run = act(run, "briefing_ack");
    run = act(run, "party_pick_ru");
    run = act(run, "party_go");
    run = act(run, "call_respond");
    expect(run.log).toHaveLength(5);
    expect(run.log[0]).toEqual({
      place: { kind: "job", job: "gwanak" },
      text: "결과 office_printer",
    });
    expect(run.log.at(-1)).toEqual({
      place: { kind: "job", job: "gwanak" },
      text: "결과 call_respond",
    });
  });
});

describe("인원 선택 가드", () => {
  test("결장 인물은 고를 수 없다", () => {
    const run = makeRun({
      jobStep: "party",
      characters: { ...zeroCharacters(), ru: { fatigue: 0, injured: true, suspicion: 0, trust: 0 } },
    });
    const outcome = applyAction(run, "party_pick_ru", TEST_CONTENT);
    expect(outcome.ok).toBe(false);
    expect(outcome.reason).toBe("거부 party_pick_ru");
    expect(outcome.run).toBe(run);
  });

  test("정원은 2명 — 2명 찬 자리에 셋째는 거부된다", () => {
    const run = makeRun({ jobStep: "party", party: ["dusik", "ru"] });
    const outcome = applyAction(run, "party_pick_banjang", TEST_CONTENT);
    expect(outcome.ok).toBe(false);
    expect(outcome.run.party).toEqual(["dusik", "ru"]);
  });

  test("중복 선택은 거부된다", () => {
    const run = makeRun({ jobStep: "party", party: ["dusik"] });
    expect(applyAction(run, "party_pick_dusik", TEST_CONTENT).ok).toBe(false);
  });

  test("빈 동행으로는 출발할 수 없다 — 한 명 이상이면 현장으로 간다", () => {
    const run = makeRun({ jobStep: "party" });
    expect(applyAction(run, "party_go", TEST_CONTENT).ok).toBe(false);
    const ready = act(run, "party_pick_banjang");
    expect(availableActions(ready)).toContain("party_go");
    expect(act(ready, "party_go").jobStep).toBe("site");
  });

  test("초기화하면 동행이 비워진다", () => {
    const run = makeRun({ jobStep: "party", party: ["taesan", "ru"] });
    expect(act(run, "party_reset").party).toEqual([]);
  });
});

describe("일감 완료 — 인물 상태 증감(표 「공통」)", () => {
  test("동행은 fatigue·trust가 오르고 비동행은 fatigue가 내린다(0 하한)", () => {
    const run = makeRun({
      jobIndex: 0,
      jobStep: "site",
      party: ["dusik", "ru"],
      characters: {
        ...zeroCharacters(),
        banjang: { fatigue: 1, injured: false, suspicion: 0, trust: 0 },
      },
    });
    const after = act(run, "call_respond");
    expect(after.characters.dusik).toEqual({ fatigue: 1, injured: false, suspicion: 0, trust: 1 });
    expect(after.characters.ru).toEqual({ fatigue: 1, injured: false, suspicion: 0, trust: 1 });
    expect(after.characters.banjang.fatigue).toBe(0); // 1 − 1
    expect(after.characters.taesan.fatigue).toBe(0); // 0 − 1 → 0 하한
  });
});

describe("체인 대기 — 일감 완료 시점 평가, FIFO 소진", () => {
  test("A(ru_first): 방송·문서·단서를 쥔 본부 완료는 xcheck → gate 순서로 세워 night까지 간다", () => {
    const run = makeRun({
      jobIndex: 2,
      jobStep: "site",
      reviews: 1,
      broadcast: true,
      documents: true,
      clue: true,
      placement: "ru_first",
    });
    const left = act(run, "archive_leave");
    expect(left.chainStep).toBe("xcheck"); // FIFO 머리
    expect(left.pendingChain).toEqual(["gate"]); // 대기열 뒤
    expect(left.jobIndex).toBe(3); // 다음 일감(폐허) 사무실이 그 아래 깔려 있다
    expect(left.jobStep).toBe("office");
    const compared = act(left, "xcheck_compare");
    expect(compared.coord).toBe(true);
    expect(compared.chainStep).toBe("gate");
    const dispatched = act(compared, "gate_dispatch");
    expect(dispatched.chainStep).toBe("night"); // gate_dispatch는 night을 넣고 pop
    expect(act(dispatched, "night_not_use").terminal).toBe("general");
  });

  test("체인 결과는 체인 위치로 기록된다", () => {
    const after = act(makeRun({ chainStep: "xcheck" }), "xcheck_skip");
    expect(after.log.at(-1)).toEqual({
      place: { kind: "chain", chain: "xcheck" },
      text: "결과 xcheck_skip",
    });
  });

  test("A: 단서 없이 문서만 있으면 gate 대신 venue가 바로 선다", () => {
    // A의 venue 대기 조건은 documents && !clue — 단서가 없으니 수신자 무대가 직접 온다.
    const left = act(
      makeRun({ jobIndex: 2, jobStep: "site", reviews: 1, documents: true }),
      "archive_leave",
    );
    expect(left.chainStep).toBe("venue");
    expect(left.pendingChain).toEqual([]);
  });

  test("B는 증거가 없어도 수신자 허브를 대기열에 넣는다 — 무대는 그 자리에서 열린다", () => {
    const run = makeRun({ placement: "dusik_first", jobIndex: 2, jobStep: "site", reviews: 1 });
    const left = act(run, "archive_leave");
    expect(left.chainStep).toBe("venue");
    expect(left.pendingChain).toEqual([]);
  });

  test("gate_reopen은 관측소 site로 되돌려 재대조를 대기열에 넣는다", () => {
    const run = makeRun({
      placement: "dusik_first",
      chainStep: "venue",
      documents: true,
      chances: 1,
    });
    const reopened = act(run, "gate_reopen");
    expect(reopened.jobIndex).toBe(1);
    expect(reopened.jobStep).toBe("site");
    expect(reopened.chainStep).toBeNull();
    expect(reopened.pendingChain).toEqual(["xcheck"]);
    expect(reopened.chances).toBe(0);
  });

  test("gun_with_banjang은 군 경로를 잠그고 수신자 무대로 되돌린다", () => {
    const back = act(makeRun({ chainStep: "gun" }), "gun_with_banjang");
    expect(back.gunLocked).toBe(true);
    expect(back.chainStep).toBe("venue");
  });
});

describe("배치 delta — 관문과 수신자 무대의 순서가 갈린다", () => {
  const base = {
    jobIndex: 2,
    jobStep: "site",
    reviews: 1,
    broadcast: true,
    documents: true,
    clue: true,
  } as const;

  test("A는 gate가 venue보다 먼저 서고 단서를 쥔 채 venue에 설 수 없다", () => {
    const left = act(makeRun({ ...base, placement: "ru_first" }), "archive_leave");
    expect(left.pendingChain).toEqual(["gate"]);
    const atGate = act(left, "xcheck_skip");
    expect(atGate.chainStep).toBe("gate");
    expect(availableActions(atGate)).not.toContain("venue_government");
    expect(availableActions(atGate)).toEqual(
      expect.arrayContaining(["gate_dispatch", "gate_hold"]),
    );
  });

  test("B는 venue가 먼저 서서 그 단계에서 gate_*와 venue_*가 함께 열린다", () => {
    const left = act(makeRun({ ...base, placement: "dusik_first" }), "archive_leave");
    expect(left.pendingChain).toEqual(["venue"]); // gate는 대기열에 넣지 않는다
    const atVenue = act(left, "xcheck_skip");
    expect(atVenue.chainStep).toBe("venue");
    expect(atVenue.clue).toBe(true); // B는 단서를 쥔 채 venue에 오른다
    const listed = availableActions(atVenue);
    expect(listed).toEqual(
      expect.arrayContaining(["gate_dispatch", "gate_hold", "venue_government", "venue_silence"]),
    );
    expect(act(atVenue, "venue_government").terminal).toBe("gov");
  });
});

describe("라디오 아침 — hq 사무실은 프린터 대신 라디오 두 갈래다", () => {
  test("파견됐으면 radio_morning_on이 좌표를 적고, 아니면 흘려보낸다", () => {
    const dispatched = act(
      makeRun({ jobIndex: 2, jobStep: "office", dispatchTaesan: true }),
      "radio_morning_on",
    );
    expect(dispatched.broadcast).toBe(true);
    expect(dispatched.jobStep).toBe("briefing");
    const stayed = act(
      makeRun({ jobIndex: 2, jobStep: "office", dispatchTaesan: false }),
      "radio_morning_on",
    );
    expect(stayed.broadcast).toBe(false);
  });

  test("radio_business_only는 좌표를 흘려보낸다 — broadcast는 false로 남는다", () => {
    const run = act(
      makeRun({ jobIndex: 2, jobStep: "office", dispatchTaesan: true }),
      "radio_business_only",
    );
    expect(run.broadcast).toBe(false);
    expect(run.jobStep).toBe("briefing");
  });

  test("hq 사무실에서는 프린터가 열리지 않는다", () => {
    expect(availableActions(makeRun({ jobIndex: 2, jobStep: "office" }))).toEqual([
      "radio_morning_on",
      "radio_business_only",
    ]);
  });

  test("다른 일감 사무실에서는 라디오가 열리지 않는다", () => {
    expect(
      availableActions(makeRun({ jobIndex: 1, jobStep: "office", dispatchTaesan: true })),
    ).toEqual(expect.arrayContaining(["office_printer"]));
    expect(
      availableActions(makeRun({ jobIndex: 1, jobStep: "office", dispatchTaesan: true })),
    ).not.toContain("radio_morning_on");
  });
});

describe("상실 신호 — 위험 선택은 동행자 전원에게 소문난다(결정적 규칙)", () => {
  test("obs_send_other: 신호를 깐 뒤 완료 처리 — 동행 전원 suspicion+1·trust−1(0 하한)", () => {
    const base = zeroCharacters();
    const run = makeRun({
      jobIndex: 1,
      jobStep: "site",
      party: ["dusik", "banjang"],
      chances: 1,
      characters: {
        ...base,
        dusik: { fatigue: 0, injured: false, suspicion: 0, trust: 2 },
        banjang: { fatigue: 1, injured: false, suspicion: 1, trust: 0 },
      },
    });
    const after = act(run, "obs_send_other");
    expect(after.chances).toBe(0);
    // 신호(trust −1) → 완료(trust +1) — 표의 화살표 순서. 그리고 동행의 첫 사람이 다친다.
    expect(after.characters.dusik).toEqual({ fatigue: 1, injured: true, suspicion: 1, trust: 2 });
    expect(after.characters.banjang).toEqual({ fatigue: 2, injured: false, suspicion: 2, trust: 1 });
    expect(after.characters.ru).toEqual(base.ru);
    expect(after.characters.taesan).toEqual(base.taesan);
  });

  test("archive_with_taesan: 완료 처리 없이 신호만 남긴다", () => {
    const run = makeRun({ jobIndex: 2, jobStep: "site", party: ["taesan"] });
    const after = act(run, "archive_with_taesan");
    expect(after.jobStep).toBe("site");
    expect(after.reviews).toBe(1);
    expect(after.chances).toBe(RECHANCE_LIMIT - 1);
    expect(after.characters.taesan).toEqual({
      fatigue: 0,
      injured: true,
      suspicion: 1,
      trust: 0,
    });
  });
});

describe("폐허 — 마지막 일감은 체인으로 닫는다", () => {
  test("site_hold는 contact를 남기고 night을 세워 완료한다", () => {
    const run = makeRun({ jobIndex: 3, jobStep: "site", party: ["banjang"], relic: true });
    const held = act(run, "site_hold");
    expect(held.contact).toBe(true);
    expect(held.chainStep).toBe("night");
    expect(held.jobIndex).toBe(3); // 일감 흐름은 닫혔다 — 위치는 마지막 site에 머문다
    expect(act(held, "night_use").terminal).toBe("true_ru");
  });

  test("처리 요청으로 닫으면 일반 종결이다", () => {
    expect(act(makeRun({ jobIndex: 3, jobStep: "site" }), "site_process").terminal).toBe("general");
  });

  test("배태산과 들어가는 길은 배태산이 동행할 때만 열린다", () => {
    expect(
      applyAction(makeRun({ jobIndex: 3, jobStep: "site", party: ["taesan"] }), "site_with_taesan", TEST_CONTENT).ok,
    ).toBe(true);
    expect(
      applyAction(makeRun({ jobIndex: 3, jobStep: "site" }), "site_with_taesan", TEST_CONTENT).ok,
    ).toBe(false);
  });
});

describe("거부 — 상태를 그대로 돌려주고 사유를 붙인다", () => {
  test("단계가 아닌 액션은 그 카드의 deny로 거부된다", () => {
    const run = startRun(TEST_CONTENT);
    const outcome = applyAction(run, "briefing_ack", TEST_CONTENT);
    expect(outcome.ok).toBe(false);
    expect(outcome.reason).toBe("거부 briefing_ack");
    expect(outcome.run).toBe(run);
  });

  test("require 불충족 — 대조는 방송·문서가, 관문 파견은 단서가 필요하다", () => {
    expect(applyAction(makeRun({ chainStep: "xcheck" }), "xcheck_compare", TEST_CONTENT).ok).toBe(
      false,
    );
    expect(applyAction(makeRun({ chainStep: "gate" }), "gate_dispatch", TEST_CONTENT).ok).toBe(
      false,
    );
  });
});

describe("종결 — 단방향이다", () => {
  test("종결 후에는 모든 액션이 안내로 거부되고 목록도 비었다", () => {
    const run = makeRun({ terminal: "general" });
    expect(availableActions(run)).toEqual([]);
    for (const id of ACTION_IDS) {
      const outcome = applyAction(run, id, TEST_CONTENT);
      expect(outcome.ok).toBe(false);
      expect(outcome.reason).toBe("회차가 이미 종결되었다");
    }
  });

  test("실제 종결 진입 뒤에도 terminal은 바뀌지 않는다", () => {
    const ended = act(makeRun({ chainStep: "night" }), "night_not_use");
    expect(ended.terminal).toBe("general");
    expect(applyAction(ended, "office_printer", TEST_CONTENT).ok).toBe(false);
    expect(applyAction(ended, "office_printer", TEST_CONTENT).run.terminal).toBe("general");
  });
});

describe("상한·하한 단조성", () => {
  test("chances는 0 아래로 내려가지 않는다", () => {
    const run = makeRun({ jobIndex: 1, jobStep: "site", party: ["dusik"], chances: 0 });
    expect(act(run, "obs_send_other").chances).toBe(0);
  });

  test("reviews는 REVIEW_LIMIT 위로 올라가지 않고, 한도에 닿으면 방문 액션이 닫힌다", () => {
    const run = makeRun({ jobIndex: 2, jobStep: "site", party: ["dusik"], reviews: REVIEW_LIMIT });
    expect(availableActions(run)).toEqual(["archive_leave"]);
    expect(act(run, "archive_leave").reviews).toBe(REVIEW_LIMIT);
  });
});

describe("일상 엔딩 경로와 부상 경로 — 표의 대기 조건·위험 선택", () => {
  test("문서 없이 본부를 마친 A 회차는 수신자 허브에 서고 일상 엔딩으로 닫힌다", () => {
    const prep = makeRun({
      placement: "ru_first",
      jobIndex: 2,
      jobStep: "site",
      party: ["dusik"],
      reviews: 1,
    });
    const atVenue = act(prep, "archive_leave");
    expect(atVenue.chainStep).toBe("venue");
    // 무대가 열리지 않은 회차: 알릴 것이 없어 그 자리에서 닫힌다(원장 종결 라우팅 3항).
    expect(act(atVenue, "venue_no_stage").terminal).toBe("routine");
  });

  test("A에서 단서를 쥔 회차는 수신자 허브에 서지 못한다 — 대기열이 관문으로 간다", () => {
    const prep = makeRun({
      placement: "ru_first",
      jobIndex: 2,
      jobStep: "site",
      party: ["ru"],
      clue: true,
      documents: true,
      reviews: 1,
    });
    const after = act(prep, "archive_leave");
    expect(after.chainStep).toBe("gate");
    expect(after.pendingChain).not.toContain("venue");
  });

  test("B에서 단서를 쥔 회차도 수신자 허브에 선다 — 두 체인이 그 자리에서 함께 열린다", () => {
    const prep = makeRun({
      placement: "dusik_first",
      jobIndex: 2,
      jobStep: "site",
      party: ["ru"],
      clue: true,
      reviews: 1,
    });
    const after = act(prep, "archive_leave");
    expect(after.chainStep).toBe("venue");
    expect(availableActions(after)).toContain("gate_dispatch");
  });

  test("위험 선택은 동행의 첫 사람을 다치게 하고, 그는 한 일감을 결장한 뒤 돌아온다", () => {
    const atObs = makeRun({ jobIndex: 1, jobStep: "site", party: ["dusik", "taesan"] });
    const afterRisk = act(atObs, "obs_send_other");
    expect(afterRisk.characters.dusik.injured).toBe(true);
    expect(afterRisk.characters.taesan.injured).toBe(false);

    const atParty = makeRun({ jobIndex: 2, jobStep: "party", characters: afterRisk.characters });
    const blocked = applyAction(atParty, "party_pick_dusik", TEST_CONTENT);
    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toBe(TEST_CONTENT.actions.party_pick_dusik.deny);

    const rested = act(
      { ...atParty, jobStep: "site", party: ["taesan"], reviews: 1 },
      "archive_leave",
    );
    expect(rested.characters.dusik.injured).toBe(false);
  });
});
