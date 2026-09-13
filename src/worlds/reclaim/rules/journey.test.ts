// 실제 콘텐츠로 회차를 끝까지 몰아 본다 — 규칙 단위 테스트(TEST_CONTENT)가 놓치는
// "그래프가 실제로 이어져 있는가"를 잡는 자리다. 웨이브 리뷰가 이 공백을 지적했다:
// 폐허 일감이 통째로 도달 불가였는데도 단위 스위트는 초록이었다.

import { describe, expect, test } from "vitest";
import { CONTENT } from "../content";
import type { ActionId, ChainStepId, CharacterId, CleanupTaskId, JobId, JobStepId } from "../ids";
import { CHARACTER_IDS, CLEANUP_TASK_IDS, JOB_IDS, JOB_STEP_IDS } from "../ids";
import type { Placement, RunState } from "../types";
import { cleanupAxis } from "./enumerate";
import { applyAction, availableActions, startRun } from "./run";

const PLACEMENTS: readonly Placement[] = ["ru_first", "dusik_first"];
/** 상태 폭발 방어 — 실측(2026-09-14, 실 CONTENT, 뒷정리 축 투영 후) ru_first 39,446 ·
 * dusik_first 258,305 상태(0.14s·0.84s)의 여유 배수(약 4배). 뒷정리 미니게임이 현장 등급을
 * 셋으로 갈라 이전 실측(2.6만)의 약 10배가 됐다. */
const STATE_LIMIT = 1_000_000;

type Signature = string;

const signature = (run: RunState): Signature =>
  [
    run.placement,
    run.jobIndex,
    run.jobStep,
    run.chainStep,
    run.terminal,
    run.party.join(","),
    // 뒷정리 축은 열거와 같은 투영을 쓴다 — 순서 24가지를 그대로 넣으면 서명이 폭발한다(순서가
    // 아니라 집합·등급만이 미래를 가른다). 부상 축은 여기서는 남긴다: 이 테스트의 불변식이다.
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
    run.characters.dusik.injured,
    run.characters.ru.injured,
    run.characters.banjang.injured,
    run.characters.taesan.injured,
  ].join("|");

type Reach = {
  readonly states: readonly RunState[];
  readonly actions: ReadonlySet<ActionId>;
  readonly jobSteps: ReadonlySet<string>;
  readonly terminals: ReadonlySet<string>;
};

/** 공개 API만으로 도달 가능한 상태를 모은다(시그니처 중복 제거 BFS). */
const reachable = (placement: Placement): Reach => {
  const states: RunState[] = [];
  const actions = new Set<ActionId>();
  const jobSteps = new Set<string>();
  const terminals = new Set<string>();
  const seen = new Set<Signature>();
  const frontier: RunState[] = [startRun(CONTENT, placement)];
  seen.add(signature(frontier[0] as RunState));
  while (frontier.length > 0) {
    const run = frontier.pop() as RunState;
    states.push(run);
    jobSteps.add(`${run.jobIndex}:${run.jobStep}`);
    if (run.terminal !== null) {
      terminals.add(run.terminal);
      continue;
    }
    if (seen.size > STATE_LIMIT) throw new Error("도달 상태 상한 초과 — 상태 공간 폭발");
    for (const id of availableActions(run)) {
      const outcome = applyAction(run, id, CONTENT);
      if (!outcome.ok) continue;
      actions.add(id);
      const sig = signature(outcome.run);
      if (seen.has(sig)) continue;
      seen.add(sig);
      frontier.push(outcome.run);
    }
  }
  return { states, actions, jobSteps, terminals };
};

const reachByPlacement: Readonly<Record<Placement, Reach>> = {
  ru_first: reachable("ru_first"),
  dusik_first: reachable("dusik_first"),
};

/** 지금 회차를 스크립트대로 몰아 간다 — 중간에 실패하면 그 이유를 띄운다. */
const playRun = (run: RunState, script: readonly ActionId[]): RunState => {
  let next = run;
  for (const id of script) {
    const outcome = applyAction(next, id, CONTENT);
    expect(outcome.ok, `${id}: ${outcome.reason ?? ""}`).toBe(true);
    next = outcome.run;
  }
  return next;
};

/** 실 CONTENT에서 일감 하나를 office → briefing → party(동행) → cleanup → site까지 지나 현장에
 * 세운다. `office`를 주면 그 일감의 사무실 액션으로 대신한다(파견 결정·라디오처럼 일감별 갈래).
 * 뒷정리는 지침서 순서대로 마친다 — 이 워크의 등급은 perfect다. */
const intoJob = (run: RunState, party: readonly CharacterId[], office?: ActionId): RunState => {
  const picks: Readonly<Record<CharacterId, ActionId>> = {
    dusik: "party_pick_dusik",
    ru: "party_pick_ru",
    banjang: "party_pick_banjang",
    taesan: "party_pick_taesan",
  };
  const cleanupPicks: Readonly<Record<CleanupTaskId, ActionId>> = {
    sign: "cleanup_pick_sign",
    power: "cleanup_pick_power",
    search: "cleanup_pick_search",
    photo: "cleanup_pick_photo",
  };
  // hq(jobIndex 2)의 사무실은 라디오 아침이라 프린터가 닫혀 있다.
  const openOffice: ActionId =
    office ?? (run.jobIndex === 2 ? "radio_business_only" : "office_printer");
  const script: readonly ActionId[] = [
    openOffice,
    "briefing_ack",
    ...party.map((id) => picks[id]),
    "party_go",
    ...CLEANUP_TASK_IDS.map((task) => cleanupPicks[task]),
    "cleanup_finish",
  ];
  let next = run;
  for (const id of script) {
    const outcome = applyAction(next, id, CONTENT);
    expect(outcome.ok, `${id}: ${outcome.reason ?? ""}`).toBe(true);
    next = outcome.run;
  }
  return next;
};

describe("실제 콘텐츠 도달성 — (일감 × 순서)가 전부 열리고, 48개 액션이 전부 제공된다", () => {
  test.each(PLACEMENTS)("%s: 네 일감 × 다섯 순서가 모두 도달한다", (placement) => {
    const missing: string[] = [];
    for (const job of JOB_IDS) {
      for (const step of JOB_STEP_IDS) {
        if (!reachByPlacement[placement].jobSteps.has(`${JOB_IDS.indexOf(job)}:${step}`)) {
          missing.push(`${job}.${step}`);
        }
      }
    }
    expect(missing, `도달하지 못한 (일감, 순서): ${missing.join(", ") || "없음"}`).toEqual([]);
  });

  test("두 배치 합집합에서 액션이 전부 열린다 — 문서화된 죽은 간선 하나만 제외", () => {
    const union = new Set<ActionId>([
      ...reachByPlacement.ru_first.actions,
      ...reachByPlacement.dusik_first.actions,
    ]);
    // gate_to_venue는 A의 관문이 clue를 함축하므로 구조적으로 열리지 않는 안전 밸브다(표 「체인」 절).
    const never = (Object.keys(CONTENT.actions) as ActionId[]).filter(
      (id) => id !== "gate_to_venue" && !union.has(id),
    );
    expect(never, `어느 도달 상태에서도 열리지 않는 액션: ${never.join(", ") || "없음"}`).toEqual(
      [],
    );
  });

  test.each(PLACEMENTS)("%s: 막다른 비종결 상태가 없고 종결 7종이 전부 도달한다", (placement) => {
    const reach = reachByPlacement[placement];
    const open = reach.states.filter((run) => run.terminal === null);
    const stuck = open.filter((run) => availableActions(run).length === 0);
    expect(stuck.length, `선택지가 막힌 비종결 상태 ${stuck.length}개`).toBe(0);
    const reached = [...reach.terminals].sort();
    expect(reached, "도달한 종결 집합").toEqual(
      ["death", "general", "gov", "press", "routine", "true_dusik", "true_ru"].sort(),
    );
  });

  test("A에서 단서를 쥔 회차는 수신자 허브에 서지 못하고, B에서는 선다", () => {
    const venueWithClue = (placement: Placement): number =>
      reachByPlacement[placement].states.filter((run) => run.chainStep === "venue" && run.clue)
        .length;
    expect(venueWithClue("ru_first")).toBe(0);
    expect(venueWithClue("dusik_first")).toBeGreaterThan(0);
  });
});

describe("실 회차 종단 워크 — 시작에서 종결까지 실제 콘텐츠로", () => {
  test("B 배치: 관악구 → 관측소 → 본부 → 폐허 → 수신자(군) → 제출 → 두식 진엔딩", () => {
    let run = startRun(CONTENT, "dusik_first");
    run = intoJob(run, ["dusik"]); // 관악구 현장
    run = playRun(run, ["call_respond"]);
    run = intoJob(run, ["dusik"], "dispatch_send_taesan"); // 관측소 — 배태산이 파견 중이라 라디오가 열린다
    run = playRun(run, ["obs_boss_joins"]);
    run = intoJob(run, ["dusik"], "radio_morning_on"); // 본부 — 라디오가 좌표를 남긴다
    run = playRun(run, ["archive_with_dusik", "archive_leave"]);
    expect(run.broadcast).toBe(true);
    expect(run.documents).toBe(true);
    run = playRun(run, ["xcheck_compare"]); // 좌표 일치
    expect(run.coord).toBe(true);
    run = playRun(run, ["venue_military"]);
    run = playRun(run, ["gun_with_taesan"]);
    const ended = playRun(run, ["submit_original"]);
    expect(ended.terminal).toBe("true_dusik");
  });

  test("A 배치: 관측소 단독 배치로 단서 → 본부 물건 → 관문 파견 → 폐허 관찰 유보 → 심야 → 루 진엔딩", () => {
    let run = startRun(CONTENT, "ru_first");
    run = intoJob(run, ["dusik"]); // 관악구
    run = playRun(run, ["call_respond"]);
    run = intoJob(run, ["ru"], "dispatch_send_taesan"); // 관측소 — 루가 문양을 읽는다
    run = playRun(run, ["obs_send_ru_alone"]);
    expect(run.clue).toBe(true);
    run = intoJob(run, ["ru"]); // 본부 — 목록 밖의 물건
    run = playRun(run, ["archive_with_ru", "archive_leave"]);
    expect(run.relic).toBe(true);
    expect(run.chainStep).toBe("gate"); // A는 관문이 먼저 선다
    run = playRun(run, ["gate_dispatch"]);
    run = intoJob(run, ["ru"]); // 폐허 — 관찰 유보
    run = playRun(run, ["site_hold"]);
    expect(run.chainStep).toBe("night");
    expect(playRun(run, ["night_use"]).terminal).toBe("true_ru");
  });

  test("문서를 놓친 회차는 수신자 허브에서 일상 엔딩으로 닫힌다", () => {
    let run = startRun(CONTENT, "ru_first");
    run = intoJob(run, ["dusik"]);
    run = playRun(run, ["call_respond"]);
    run = intoJob(run, ["dusik"], "dispatch_send_other");
    run = playRun(run, ["obs_boss_joins"]);
    run = intoJob(run, ["banjang"]);
    // 최 반장과만 들어가 그의 조사 재료만 남기고 나온다 — 문서 사본도 방송도 없다.
    run = playRun(run, ["archive_alone", "archive_leave"]);
    expect(run.chainStep).toBe("venue");
    expect(playRun(run, ["venue_no_stage"]).terminal).toBe("routine");
  });

  test("단서를 쥔 채 파견하지 않으면 회차는 사망으로 닫힌다", () => {
    let run = startRun(CONTENT, "ru_first");
    run = intoJob(run, ["dusik"]);
    run = playRun(run, ["call_respond"]);
    run = intoJob(run, ["ru"], "dispatch_send_taesan");
    run = playRun(run, ["obs_send_ru_alone"]);
    run = intoJob(run, ["banjang"]);
    run = playRun(run, ["archive_alone", "archive_leave"]);
    expect(run.chainStep).toBe("gate");
    expect(playRun(run, ["gate_hold"]).terminal).toBe("death");
  });
});

describe("체인 서명 도달성 — 여섯 절차가 모두 열린다", () => {
  test("두 배치 합집합에서 xcheck·gate·night·venue·gun·submit이 전부 chainStep으로 등장한다", () => {
    const chains = new Set<string>();
    for (const placement of PLACEMENTS) {
      for (const state of reachByPlacement[placement].states) {
        if (state.chainStep !== null) chains.add(state.chainStep);
      }
    }
    const expected: readonly ChainStepId[] = ["xcheck", "gate", "night", "venue", "gun", "submit"];
    const missing = expected.filter((chain) => !chains.has(chain));
    expect(missing, `한 번도 열리지 않은 체인 절차: ${missing.join(", ") || "없음"}`).toEqual([]);
  });
});

describe("일감 경계 — 폐허는 반드시 지나간다", () => {
  test("폐허(jobIndex 3)의 site가 도달 목록에 있다", () => {
    const jobs: readonly JobId[] = JOB_IDS;
    expect(jobs[3]).toBe("ruins");
    expect(reachByPlacement.ru_first.jobSteps.has("3:site")).toBe(true);
    expect(reachByPlacement.dusik_first.jobSteps.has("3:site")).toBe(true);
  });

  test("(일감, 순서) 키는 JOB_STEP_IDS 밖의 값을 만들지 않는다", () => {
    const steps = new Set<JobStepId>(JOB_STEP_IDS);
    for (const run of reachByPlacement.ru_first.states) {
      expect(steps.has(run.jobStep)).toBe(true);
    }
  });
});

describe("인물 축 불변식 — 하한, 부상 결장, 인원 선택의 막다른 상태 없음", () => {
  const allStates = [...reachByPlacement.ru_first.states, ...reachByPlacement.dusik_first.states];
  const pickOf = (id: CharacterId): ActionId => {
    const picks: Readonly<Record<CharacterId, ActionId>> = {
      dusik: "party_pick_dusik",
      ru: "party_pick_ru",
      banjang: "party_pick_banjang",
      taesan: "party_pick_taesan",
    };
    return picks[id];
  };
  const partyStates = allStates.filter((run) => run.chainStep === null && run.jobStep === "party");

  test("네 축은 0 아래로 내려가지 않는다", () => {
    // 상태 수가 수십만이라 단언을 상태마다 걸면 시간이 터진다 — 위반만 모아 한 번에 단언한다.
    const below: string[] = [];
    for (const run of allStates) {
      for (const id of CHARACTER_IDS) {
        const c = run.characters[id];
        const axes = [
          ["fatigue", c.fatigue],
          ["suspicion", c.suspicion],
          ["trust", c.trust],
        ] as const;
        for (const [axis, value] of axes) {
          if (value < 0) below.push(`${run.jobIndex}:${run.jobStep} ${id}.${axis}=${value}`);
        }
      }
    }
    expect(below, `0 아래로 내려간 인물 축 ${below.length}개`).toEqual([]);
  });

  test("인원 선택 단계에서는 언제나 나갈 수 있다 — 이미 고른 사람으로 가거나, 새로 고를 수 있다", () => {
    expect(partyStates.length).toBeGreaterThan(0);
    // 막다른 상태 = party_go도 안 되고(0명) 아무도 새로 고를 수 없는 상태.
    const stuck = partyStates.filter(
      (run) =>
        !applyAction(run, "party_go", CONTENT).ok &&
        !CHARACTER_IDS.some((id) => applyAction(run, pickOf(id), CONTENT).ok),
    );
    expect(stuck.length, `나갈 수 없는 인원 선택 상태 ${stuck.length}개`).toBe(0);
  });

  test("부상 경로가 실제로 도달하고, 부상자는 선택이 막힌다", () => {
    const injuredStates = partyStates.filter((run) =>
      CHARACTER_IDS.some((id) => run.characters[id].injured),
    );
    expect(injuredStates.length, "부상 상태가 하나도 도달하지 않았다").toBeGreaterThan(0);
    for (const run of injuredStates) {
      for (const id of CHARACTER_IDS) {
        if (!run.characters[id].injured) continue;
        expect(applyAction(run, pickOf(id), CONTENT).ok, `${id}는 부상인데 골라졌다`).toBe(false);
      }
    }
  });

  test("루 진엔딩은 단서와 물건을 모두 지난 뒤에만 성립한다", () => {
    for (const run of allStates) {
      if (run.terminal !== "true_ru") continue;
      expect(run.clue && run.relic, "true_ru인데 단서·물건이 없다").toBe(true);
    }
  });
});
