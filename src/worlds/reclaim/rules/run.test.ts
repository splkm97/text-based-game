// 리듀서 계약 테스트 — 일감 구조(2026-09-14): 시작 상태, office→briefing→party→cleanup→site
// 전이, 뒷정리 미니게임의 순서 등급, 인원 선택 가드, 일감 완료의 인물 증감, 체인 대기 FIFO와
// 배치 라우팅, 라디오 아침, 종결 단방향, 상한·하한 단조성.

import { describe, expect, test } from "vitest";
import type { ActionId, CharacterId, CleanupTaskId, TalkChoice } from "../ids";
import { ACTION_IDS, CLEANUP_TASK_IDS } from "../ids";
import type { RunState } from "../types";
import {
  applyAction,
  availableActions,
  cleanupGrade,
  RECHANCE_LIMIT,
  REVIEW_LIMIT,
  startRun,
} from "./run";
import { makeRun, TEST_CONTENT, zeroCharacters } from "./testContent";

/** 성공을 가정한 액션 적용 — 실패하면 사유와 함께 테스트를 때린다. */
const act = (run: RunState, id: ActionId): RunState => {
  const outcome = applyAction(run, id, TEST_CONTENT);
  expect(outcome.ok, `${id}: ${outcome.reason ?? ""}`).toBe(true);
  return outcome.run;
};

/** 뒷정리 작업 → 그 작업을 세우는 액션 id. */
const CLEANUP_PICKS: Readonly<Record<CleanupTaskId, ActionId>> = {
  sign: "cleanup_pick_sign",
  power: "cleanup_pick_power",
  search: "cleanup_pick_search",
  photo: "cleanup_pick_photo",
};

/** 뒷정리 미니게임을 순서대로 마친다 — 현장 앞의 필수 절차다. `order`를 주면 그 순서로 고른다. */
const cleanupThrough = (
  run: RunState,
  order: readonly CleanupTaskId[] = CLEANUP_TASK_IDS,
): RunState => {
  let next = run;
  for (const task of order) next = act(next, CLEANUP_PICKS[task]);
  return act(next, "cleanup_finish");
};

describe("startRun — 시작 상태 계약(표 「공통」)", () => {
  test("첫 일감(gwanak) 사무실, 빈 동행, 균일 인물, 빈 체인 대기", () => {
    const run = startRun(TEST_CONTENT);
    expect(run).toEqual(makeRun());
    expect(run.placement).toBe("ru_first");
    expect(run.jobIndex).toBe(0);
    expect(run.jobStep).toBe("office");
    expect(run.officeStage).toBe("scene");
    expect(run.talks).toEqual([]);
    expect(run.interview).toBeNull();
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

  test("시작 사무실은 산문 화면이다 — 열리는 액션은 사람들 쪽으로 건너가는 하나뿐이다", () => {
    expect(availableActions(startRun(TEST_CONTENT))).toEqual(["office_next"]);
  });
});

describe("사무실 → 공문 → 인원 선택 → 뒷정리 → 현장 — 모든 일감이 같은 순서를 탄다", () => {
  test("첫 일감의 다섯 단계를 지나 완료하면 다음 일감 사무실에 선다", () => {
    let run = startRun(TEST_CONTENT);
    expect(availableActions(run)).toEqual(["office_next"]);
    run = act(run, "office_next");
    expect(run.officeStage).toBe("people");
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
    expect(run.jobStep).toBe("cleanup");
    expect(run.cleanupPicks).toEqual([]);
    expect(availableActions(run)).toEqual([
      "cleanup_pick_sign",
      "cleanup_pick_power",
      "cleanup_pick_search",
      "cleanup_pick_photo",
      "cleanup_finish",
    ]);
    run = cleanupThrough(run);
    expect(run.jobStep).toBe("site");
    expect(availableActions(run)).toEqual(["call_respond"]);
    run = act(run, "call_respond");
    expect(run.jobIndex).toBe(1);
    expect(run.jobStep).toBe("office");
    expect(run.party).toEqual([]);
    // 둘째 일감 사무실 — 산문 화면에서는 여전히 하나뿐이고, 사람들 화면에서 파견 선택이 열린다
    expect(availableActions(run)).toEqual(["office_next"]);
    run = act(run, "office_next");
    expect(availableActions(run)).toEqual([
      "office_printer",
      "talk_dusik",
      "talk_ru",
      "talk_banjang",
      "talk_taesan",
      "dispatch_send_taesan",
      "dispatch_send_other",
    ]);
    run = act(run, "dispatch_send_taesan");
    expect(run.dispatchTaesan).toBe(true);
    expect(run.jobStep).toBe("briefing");
  });

  test("로그에는 액션이 일어난 일감 위치와 결과 문면이 남는다", () => {
    let run = startRun(TEST_CONTENT);
    run = act(run, "office_next");
    run = act(run, "office_printer");
    run = act(run, "briefing_ack");
    run = act(run, "party_pick_ru");
    run = act(run, "party_go");
    run = act(run, "cleanup_pick_sign");
    run = cleanupThrough(run, ["power", "search", "photo"]);
    run = act(run, "call_respond");
    expect(run.log).toHaveLength(11);
    expect(run.log[0]).toEqual({
      place: { kind: "job", job: "gwanak" },
      text: "결과 office_next",
    });
    expect(run.log[1]).toEqual({
      place: { kind: "job", job: "gwanak" },
      text: "결과 office_printer",
    });
    expect(run.log[5]).toEqual({
      place: { kind: "job", job: "gwanak" },
      text: "결과 cleanup_pick_sign",
    });
    expect(run.log.at(-1)).toEqual({
      place: { kind: "job", job: "gwanak" },
      text: "결과 call_respond",
    });
  });
});

describe("아침 조회(면회실) — 장면 → 사람들 → 면담(응답 셋) → 프린터", () => {
  /** 사람들 화면에 선 회차 — 면담·프린터·파견이 모두 이 화면에서 나간다. */
  const atPeople = (overrides: Partial<RunState> = {}): RunState =>
    makeRun({ jobStep: "office", officeStage: "people", ...overrides });

  const REPLY: Readonly<Record<TalkChoice, ActionId>> = {
    work: "interview_reply_work",
    comfort: "interview_reply_comfort",
    joke: "interview_reply_joke",
  };

  /** 면담 하나를 연 상태에서 응답 하나를 고른 회차 — apply가 한 번만 지나간다. */
  const replied = (
    character: CharacterId,
    choice: TalkChoice,
    overrides: Partial<RunState> = {},
  ): RunState =>
    act(atPeople({ interview: { character, choice: null }, ...overrides }), REPLY[choice]);

  test("(a) 다섯 걸음이 이어진다 — 장면 → 사람들 → 면담 → 응답 → 닫기 → 프린터", () => {
    let run = startRun(TEST_CONTENT);
    expect(availableActions(run)).toEqual(["office_next"]);
    run = act(run, "office_next");
    expect(run.officeStage).toBe("people");
    run = act(run, "talk_ru");
    expect(run.interview).toEqual({ character: "ru", choice: null });
    run = act(run, "interview_reply_comfort");
    expect(run.interview).toEqual({ character: "ru", choice: "comfort" });
    run = act(run, "interview_close");
    expect(run.interview).toBeNull();
    expect(run.talks).toEqual(["ru"]);
    run = act(run, "office_printer");
    expect(run.jobStep).toBe("briefing");
  });

  test("(b) 하루 한 번 — 말을 걸면 그 사람은 오늘의 명단에 들고, 다시 두드리면 거부 문면이 답한다", () => {
    const talking = act(atPeople(), "talk_ru");
    // 면담이 열려 있는 동안에는 다른 사람의 문도 닫힌다 — 갈아 끼우면 앞 대화가 응답 없이 버려진다.
    expect(availableActions(talking)).not.toContain("talk_ru");
    expect(availableActions(talking)).not.toContain("talk_dusik");
    const talked = act(act(talking, "interview_reply_work"), "interview_close");
    expect(talked.talks).toEqual(["ru"]);
    const again = applyAction(talked, "talk_ru", TEST_CONTENT);
    expect(again.ok).toBe(false);
    expect(again.reason).toBe(TEST_CONTENT.actions.talk_ru.deny); // "오늘은 이미 이야기를 나눴다…"
    expect(again.run).toBe(talked);
    expect(availableActions(talked)).toContain("talk_ru"); // 버튼은 남고 require가 사유를 답한다
    expect(applyAction(talked, "talk_dusik", TEST_CONTENT).ok).toBe(true); // 다른 사람은 열린다
  });

  test("(c) 응답 셋의 효과는 그 상대에게만 간다 — work suspicion−1 · comfort trust+1 · joke fatigue−1", () => {
    const characters = {
      ...zeroCharacters(),
      dusik: { fatigue: 2, injured: false, suspicion: 0, trust: 0 },
      ru: { fatigue: 0, injured: false, suspicion: 3, trust: 0 },
    };
    const work = replied("dusik", "work", { characters });
    expect(work.characters.dusik.suspicion).toBe(0); // 0 하한 — 이미 0이다
    expect(work.characters.ru.suspicion).toBe(3); // 다른 사람은 그대로다
    expect(work.characters.dusik).toEqual({
      fatigue: 2,
      injured: false,
      suspicion: 0,
      trust: 0,
    });
    expect(replied("ru", "work", { characters }).characters.ru.suspicion).toBe(2); // 3 − 1

    const comfort = replied("dusik", "comfort", { characters });
    expect(comfort.characters.dusik.trust).toBe(1);
    expect(comfort.characters.ru.trust).toBe(0);
    expect(comfort.characters.dusik.fatigue).toBe(2); // 다른 축은 건드리지 않는다

    expect(replied("ru", "joke", { characters }).characters.ru.fatigue).toBe(0); // 0 하한
    expect(replied("dusik", "joke", { characters }).characters.dusik.fatigue).toBe(1); // 2 − 1
    expect(replied("dusik", "joke", { characters }).characters.ru.fatigue).toBe(0);
  });

  test("(d) 면담 밖의 응답과 응답 없는 닫기는 거부된다 — 사유는 그 카드의 문면", () => {
    const outside = atPeople();
    const replies: readonly ActionId[] = [
      "interview_reply_work",
      "interview_reply_comfort",
      "interview_reply_joke",
      "interview_close",
    ];
    for (const id of replies) {
      const outcome = applyAction(outside, id, TEST_CONTENT);
      expect(outcome.ok, `${id}가 면담 밖에서 성사됐다`).toBe(false);
      expect(outcome.reason).toBe(TEST_CONTENT.actions[id].deny);
      expect(outcome.run).toBe(outside); // 상태를 그대로 돌려준다
    }
    const open = act(outside, "talk_banjang");
    const unanswered = applyAction(open, "interview_close", TEST_CONTENT);
    expect(unanswered.ok).toBe(false);
    expect(unanswered.reason).toBe(TEST_CONTENT.actions.interview_close.deny); // "아직 대답을 듣지 않았다…"
    expect(unanswered.run).toBe(open);
    const answered = act(open, "interview_reply_joke");
    expect(answered.interview).toEqual({ character: "banjang", choice: "joke" });
    const twice = applyAction(answered, "interview_reply_joke", TEST_CONTENT);
    expect(twice.ok).toBe(false);
    expect(twice.reason).toBe(TEST_CONTENT.actions.interview_reply_joke.deny);
    expect(answered.characters.banjang.fatigue).toBe(0); // 효과는 한 번만 남는다
  });

  test("(e) 사무실 밖 불변식 — 나가는 다섯 문 전부가 세 축을 초기값으로 되돌린다", () => {
    const exits: readonly (readonly [RunState, ActionId])[] = [
      [atPeople(), "office_printer"],
      [atPeople({ jobIndex: 1 }), "dispatch_send_taesan"],
      [atPeople({ jobIndex: 1 }), "dispatch_send_other"],
      [atPeople({ jobIndex: 2 }), "radio_morning_on"],
      [atPeople({ jobIndex: 2 }), "radio_business_only"],
    ];
    for (const [before, id] of exits) {
      const left = act(before, id);
      expect(left.jobStep, id).toBe("briefing");
      expect([left.officeStage, left.talks, left.interview], id).toEqual(["scene", [], null]);
    }
    // 면담까지 마친 회차도 같다 — 오늘의 명단은 사무실 안에서만 뜻이 있다.
    const talked = act(
      act(act(act(startRun(TEST_CONTENT), "office_next"), "talk_taesan"), "interview_reply_joke"),
      "interview_close",
    );
    expect(talked.talks).toEqual(["taesan"]);
    const out = act(talked, "office_printer");
    expect([out.officeStage, out.talks, out.interview]).toEqual(["scene", [], null]);
  });

  test("면담 중에는 사무실의 다른 문이 전부 닫힌다 — 두 화면이 겹치지 않는다", () => {
    const doors: readonly ActionId[] = [
      "office_next",
      "office_printer",
      "dispatch_send_taesan",
      "dispatch_send_other",
      "radio_morning_on",
      "radio_business_only",
    ];
    const open = act(
      atPeople({ jobIndex: 2, dispatchTaesan: true, officeStage: "people" }),
      "talk_dusik",
    );
    expect(open.interview).toEqual({ character: "dusik", choice: null });
    for (const id of doors) {
      expect(availableActions(open), `${id}가 면담 화면 위로 샜다`).not.toContain(id);
      expect(applyAction(open, id, TEST_CONTENT).ok, id).toBe(false);
    }
  });
});

describe("인원 선택 가드", () => {
  test("결장 인물은 고를 수 없다", () => {
    const run = makeRun({
      jobStep: "party",
      characters: {
        ...zeroCharacters(),
        ru: { fatigue: 0, injured: true, suspicion: 0, trust: 0 },
      },
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

  test("빈 동행으로는 출발할 수 없다 — 한 명 이상이면 뒷정리로 간다", () => {
    const run = makeRun({ jobStep: "party" });
    expect(applyAction(run, "party_go", TEST_CONTENT).ok).toBe(false);
    const ready = act(run, "party_pick_banjang");
    expect(availableActions(ready)).toContain("party_go");
    expect(act(ready, "party_go").jobStep).toBe("cleanup");
  });

  test("초기화하면 동행이 비워진다", () => {
    const run = makeRun({ jobStep: "party", party: ["taesan", "ru"] });
    expect(act(run, "party_reset").party).toEqual([]);
  });
});

describe("뒷정리 미니게임 — 지침서 순서 맞추기", () => {
  test("지침서 순서대로 넷을 고르면 perfect로 현장에 선다", () => {
    let run = makeRun({ jobStep: "party", party: ["dusik"] });
    run = act(run, "party_go");
    expect(run.jobStep).toBe("cleanup");
    expect(run.cleanupPicks).toEqual([]);
    expect(cleanupGrade(run)).toBeNull(); // 아직 등급이 없다 — 다 고르기 전에는 null

    for (const [index, task] of CLEANUP_TASK_IDS.entries()) {
      run = act(run, CLEANUP_PICKS[task]);
      expect(run.cleanupPicks).toEqual(CLEANUP_TASK_IDS.slice(0, index + 1));
      // 지침서에서 한 줄씩 지워 나간다 — 남은 작업 셋·둘·하나 + 완료 버튼.
      expect(availableActions(run)).toHaveLength(CLEANUP_TASK_IDS.length - index);
    }
    expect(cleanupGrade(run)).toBe("perfect");
    run = act(run, "cleanup_finish");
    expect(run.jobStep).toBe("site");
    expect(run.cleanupPicks).toEqual([...CLEANUP_TASK_IDS]); // 등급은 현장까지 따라간다
  });

  test("고른 작업은 목록에서 사라진다 — 같은 줄을 두 번 세우지 않는다", () => {
    const atCleanup = makeRun({ jobStep: "cleanup" });
    const afterSign = act(atCleanup, "cleanup_pick_sign");
    expect(availableActions(afterSign)).not.toContain("cleanup_pick_sign");
    expect(availableActions(afterSign)).toEqual([
      "cleanup_pick_power",
      "cleanup_pick_search",
      "cleanup_pick_photo",
      "cleanup_finish",
    ]);
    // 그래도 직접 두드리면 그 카드의 거부 문면으로 답한다(숨은 버튼도 사유를 갖는다).
    const again = applyAction(afterSign, "cleanup_pick_sign", TEST_CONTENT);
    expect(again.ok).toBe(false);
    expect(again.reason).toBe(TEST_CONTENT.actions.cleanup_pick_sign.deny);
    expect(again.run).toBe(afterSign);
  });

  test("순서를 섞으면 등급이 내려간다 — 앞 둘이 제자리면 partial, 아니면 poor", () => {
    const graded = (picks: readonly CleanupTaskId[]) =>
      cleanupGrade(makeRun({ cleanupPicks: picks }));
    expect(graded(["sign", "power", "search"])).toBeNull(); // 셋만 고른 회차는 등급이 없다
    expect(graded(["sign", "power", "search", "photo"])).toBe("perfect");
    expect(graded(["sign", "power", "photo", "search"])).toBe("partial");
    expect(graded(["power", "sign", "search", "photo"])).toBe("poor");
    expect(graded(["sign", "search", "power", "photo"])).toBe("poor");
  });

  test("cleanup_finish는 작업 넷을 다 고르기 전에는 거부된다", () => {
    const run = makeRun({ jobStep: "cleanup", cleanupPicks: ["sign", "power", "search"] });
    const outcome = applyAction(run, "cleanup_finish", TEST_CONTENT);
    expect(outcome.ok).toBe(false);
    expect(outcome.reason).toBe(TEST_CONTENT.actions.cleanup_finish.deny);
    expect(outcome.run).toBe(run); // 상태를 그대로 돌려준다
    expect(availableActions(run)).toContain("cleanup_finish"); // 그래도 목록에는 남는다(사유가 붙는다)
  });

  test("gate_reopen으로 돌아온 뒤 party_go가 순서를 비운다", () => {
    const atVenue = makeRun({
      placement: "dusik_first",
      chainStep: "venue",
      documents: true,
      chances: 1,
      cleanupPicks: [...CLEANUP_TASK_IDS],
    });
    const reopened = act(atVenue, "gate_reopen");
    expect(reopened.jobStep).toBe("party");
    expect(reopened.cleanupPicks).toEqual([...CLEANUP_TASK_IDS]); // 복귀 시점에는 이전 일감의 순서가 남아 있다
    const going = act(act(reopened, "party_pick_ru"), "party_go");
    expect(going.jobStep).toBe("cleanup");
    expect(going.cleanupPicks).toEqual([]); // 새 일감의 뒷정리는 빈 순서에서 시작한다
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
  test("A(ru_first): 방송·문서·단서를 쥔 본부 완료는 xcheck → gate 순서로 세우고, 파견 뒤 폐허 일감이 열린다", () => {
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
    expect(dispatched.chainStep).toBeNull(); // 관문을 닫고 폐허 일감으로 넘긴다
    expect(dispatched.pendingChain).toEqual([]);
    expect(dispatched.jobIndex).toBe(3);
    expect(dispatched.jobStep).toBe("office");
    // 폐허 현장의 관찰 유보가 밤을 세우고, 그 밤이 루 진엔딩으로 닫힌다.
    const atRuins = act(
      { ...dispatched, jobStep: "site", party: ["ru"], relic: true },
      "site_hold",
    );
    expect(atRuins.chainStep).toBe("night");
    expect(act(atRuins, "night_use").terminal).toBe("true_ru");
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

  test("gate_reopen은 조합을 다시 고를 수 있는 자리(일감 1 인원 선택)로 되돌린다", () => {
    const run = makeRun({
      placement: "dusik_first",
      chainStep: "venue",
      documents: true,
      chances: 1,
    });
    const reopened = act(run, "gate_reopen");
    expect(reopened.jobIndex).toBe(1);
    expect(reopened.jobStep).toBe("party"); // 기회는 고를 수 있는 디스패치에서만 소모된다
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
      makeRun({ jobIndex: 2, jobStep: "office", officeStage: "people", dispatchTaesan: true }),
      "radio_morning_on",
    );
    expect(dispatched.broadcast).toBe(true);
    expect(dispatched.jobStep).toBe("briefing");
    const stayed = act(
      makeRun({ jobIndex: 2, jobStep: "office", officeStage: "people", dispatchTaesan: false }),
      "radio_morning_on",
    );
    expect(stayed.broadcast).toBe(false);
  });

  test("radio_business_only는 좌표를 흘려보낸다 — broadcast는 false로 남는다", () => {
    const run = act(
      makeRun({ jobIndex: 2, jobStep: "office", officeStage: "people", dispatchTaesan: true }),
      "radio_business_only",
    );
    expect(run.broadcast).toBe(false);
    expect(run.jobStep).toBe("briefing");
  });

  test("hq 사무실에서는 프린터가 열리지 않는다", () => {
    expect(availableActions(makeRun({ jobIndex: 2, jobStep: "office" }))).toEqual(["office_next"]);
    expect(
      availableActions(makeRun({ jobIndex: 2, jobStep: "office", officeStage: "people" })),
    ).toEqual([
      "talk_dusik",
      "talk_ru",
      "talk_banjang",
      "talk_taesan",
      "radio_morning_on",
      "radio_business_only",
    ]);
  });

  test("다른 일감 사무실에서는 라디오가 열리지 않는다", () => {
    const atPeople = makeRun({
      jobIndex: 1,
      jobStep: "office",
      officeStage: "people",
      dispatchTaesan: true,
    });
    expect(availableActions(atPeople)).toContain("office_printer");
    expect(availableActions(atPeople)).not.toContain("radio_morning_on");
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
    expect(after.characters.banjang).toEqual({
      fatigue: 2,
      injured: false,
      suspicion: 2,
      trust: 1,
    });
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

  test("부상은 뒷정리 등급이 가른다 — perfect면 안전 조치가 먼저 서 있어 다치지 않는다", () => {
    // 관측소는 subset 종류다 — sign·search·photo만 필수, power를 얹으면 partial이 된다.
    const obsPerfect: readonly CleanupTaskId[] = ["sign", "search", "photo"];
    const obsPartial: readonly CleanupTaskId[] = ["sign", "search", "photo", "power"];
    const atObs = (cleanupPicks: readonly CleanupTaskId[]) =>
      makeRun({
        jobIndex: 1,
        jobStep: "site",
        party: ["dusik", "banjang"],
        chances: 2,
        cleanupPicks,
      });

    // perfect — 상실 신호(의심·신뢰)는 그대로 남고 부상만 면제된다.
    const safe = act(atObs(obsPerfect), "obs_send_other");
    expect(safe.characters.dusik).toEqual({ fatigue: 1, injured: false, suspicion: 1, trust: 1 });
    expect(safe.chances).toBe(1);
    // partial — 같은 위험 선택이 동행의 첫 사람을 다치게 한다.
    const risky = act(atObs(obsPartial), "obs_send_other");
    expect(risky.characters.dusik).toEqual({
      fatigue: 1,
      injured: true,
      suspicion: 1,
      trust: 1,
    });
    // 본부는 exclude 종류다 — search는 금지 작업이라 손대면 그것만으로 poor다(partial은 없다).
    const hqPerfect: readonly CleanupTaskId[] = ["sign", "power", "photo"];
    const hqPoor: readonly CleanupTaskId[] = ["sign", "power", "photo", "search"];
    const atArchive = (cleanupPicks: readonly CleanupTaskId[]) =>
      makeRun({ jobIndex: 2, jobStep: "site", party: ["taesan"], cleanupPicks });
    expect(act(atArchive(hqPerfect), "archive_with_taesan").characters.taesan.injured).toBe(false);
    expect(act(atArchive(hqPoor), "archive_with_taesan").characters.taesan.injured).toBe(true);
  });
});

describe("폐허 — 마지막 일감은 체인으로 닫는다", () => {
  test("site_hold는 contact를 남기고 night을 세워 완료한다", () => {
    const run = makeRun({
      jobIndex: 3,
      jobStep: "site",
      party: ["banjang"],
      clue: true,
      relic: true,
    });
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
      applyAction(
        makeRun({ jobIndex: 3, jobStep: "site", party: ["taesan"] }),
        "site_with_taesan",
        TEST_CONTENT,
      ).ok,
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
