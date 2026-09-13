// 리듀서 계약 테스트 — 시작 상태, 단계 전이, 거부 3종, 종결 단방향, 상한·하한 단조성, 배치 delta.

import { describe, expect, test } from "vitest";
import { CONTENT } from "../content";
import type { ActionId, EndingId, StageId } from "../ids";
import { ACTION_IDS } from "../ids";
import type { RunState } from "../types";
import { applyAction, availableActions, RECHANCE_LIMIT, REVIEW_LIMIT, startRun } from "./run";
import { makeRun, TEST_CONTENT } from "./testContent";

describe("startRun", () => {
  test("첫 출동 대기 상태 — 배치 ru_first 기본, 기회 2, 방문 0, 로그 비었음", () => {
    const run = startRun(TEST_CONTENT);
    expect(run).toEqual(makeRun());
    expect(run.placement).toBe("ru_first");
    expect(run.stage).toBe("field");
    expect(run.chances).toBe(RECHANCE_LIMIT);
    expect(run.reviews).toBe(0);
    expect(run.terminal).toBeNull();
    expect(run.log).toEqual([]);
    expect(startRun(TEST_CONTENT, "dusik_first").placement).toBe("dusik_first");
  });

  test("첫 단계에서 누를 수 있는 액션은 출동 하나뿐이다", () => {
    expect(availableActions(startRun(TEST_CONTENT))).toEqual(["call_respond"]);
  });
});

describe("happy path — 단계 전이는 각각 한 번씩", () => {
  test("field부터 night까지 루 진엔딩으로 닫힌다", () => {
    let run = startRun(TEST_CONTENT);
    const stages: StageId[] = [];
    const act = (id: ActionId) => {
      const outcome = applyAction(run, id, TEST_CONTENT);
      expect(outcome.ok).toBe(true);
      run = outcome.run;
      stages.push(run.stage);
    };

    act("call_respond"); // office
    act("dispatch_send_taesan"); // obs
    act("obs_send_ru_alone"); // radio — 단서
    act("radio_morning_on"); // archive — 방송 좌표
    act("archive_with_dusik"); // archive — 문서
    act("archive_with_ru"); // archive — 물건(night_use의 require)
    act("archive_leave"); // xcheck
    act("xcheck_compare"); // gate — 좌표 일치
    act("gate_dispatch"); // site
    act("site_hold"); // night — 접점
    act("night_use"); // 종결

    expect(stages).toEqual([
      "office",
      "obs",
      "radio",
      "archive",
      "archive",
      "archive",
      "xcheck",
      "gate",
      "site",
      "night",
      "night",
    ]);
    expect(run.terminal).toBe("true_ru");
    expect(run.clue).toBe(true);
    expect(run.broadcast).toBe(true);
    expect(run.documents).toBe(true);
    expect(run.coord).toBe(true);
    expect(run.relic).toBe(true);
    expect(run.contact).toBe(true);
    expect(run.log).toHaveLength(11);
    // 로그 위치는 결과 단계를 따른다: 대조 뒤 gate, 재통합 뒤에도 night.
    expect(run.log[7]).toEqual({ stage: "gate", text: TEST_CONTENT.actions.xcheck_compare.result });
    expect(run.log[10]).toEqual({ stage: "night", text: TEST_CONTENT.actions.night_use.result });
  });

  test("단계를 바꾸지 않은 본부 방문은 로그 위치를 archive로 남긴다", () => {
    const outcome = applyAction(makeRun({ stage: "archive" }), "archive_with_ru", TEST_CONTENT);
    expect(outcome.ok).toBe(true);
    expect(outcome.run.relic).toBe(true);
    expect(outcome.run.reviews).toBe(1);
    expect(outcome.run.log).toEqual([
      { stage: "archive", text: TEST_CONTENT.actions.archive_with_ru.result },
    ]);
  });
});

describe("거부 3종 — 상태를 그대로 돌려주고 사유를 붙인다", () => {
  test("단계 아닌 액션은 그 카드의 deny로 거부된다", () => {
    const run = makeRun({ stage: "field" });
    const outcome = applyAction(run, "dispatch_send_taesan", TEST_CONTENT);
    expect(outcome.ok).toBe(false);
    expect(outcome.reason).toBe(TEST_CONTENT.actions.dispatch_send_taesan.deny);
    expect(outcome.run).toBe(run);
  });

  test("require 불충족 — 대조는 방송·문서가, 관문 파견은 단서가 필요하다", () => {
    const bare = makeRun({ stage: "xcheck" });
    const compare = applyAction(bare, "xcheck_compare", TEST_CONTENT);
    expect(compare.ok).toBe(false);
    expect(compare.reason).toBe(TEST_CONTENT.actions.xcheck_compare.deny);
    expect(compare.run).toBe(bare);

    const gate = makeRun({ stage: "gate" });
    const dispatch = applyAction(gate, "gate_dispatch", TEST_CONTENT);
    expect(dispatch.ok).toBe(false);
    expect(dispatch.reason).toBe(TEST_CONTENT.actions.gate_dispatch.deny);
    expect(dispatch.run).toBe(gate);
  });

  test("종결 후에는 모든 액션이 종결 안내로 거부되고 목록도 비었다", () => {
    const ended = makeRun({ terminal: "death" });
    for (const id of ACTION_IDS) {
      const outcome = applyAction(ended, id, TEST_CONTENT);
      expect(outcome.ok).toBe(false);
      expect(outcome.run).toBe(ended);
      expect(outcome.run.terminal).toBe("death");
    }
    expect(availableActions(ended)).toEqual([]);
  });

  test("실제 종결 진입 뒤에도 terminal은 바뀌지 않는다", () => {
    let run = makeRun({ stage: "night", relic: true });
    run = applyAction(run, "night_use", TEST_CONTENT).run;
    expect(run.terminal).toBe("true_ru");
    const refused = applyAction(run, "submit_original", TEST_CONTENT);
    expect(refused.ok).toBe(false);
    expect(refused.reason).toBe("회차가 이미 종결되었다");
    expect(refused.run.terminal).toBe("true_ru");
  });
});

describe("상한·하한 단조성", () => {
  test("chances는 0 아래로 내려가지 않는다", () => {
    const outcome = applyAction(
      makeRun({ stage: "obs", chances: 0 }),
      "obs_boss_joins",
      TEST_CONTENT,
    );
    expect(outcome.ok).toBe(true);
    expect(outcome.run.chances).toBe(0);
  });

  test("reviews는 REVIEW_LIMIT를 넘지 않는다 — 마지막 방문 뒤 방문 액션이 닫힌다", () => {
    const last = applyAction(
      makeRun({ stage: "archive", reviews: REVIEW_LIMIT - 1 }),
      "archive_alone",
      TEST_CONTENT,
    );
    expect(last.ok).toBe(true);
    expect(last.run.reviews).toBe(REVIEW_LIMIT);

    const capped = makeRun({ stage: "archive", reviews: REVIEW_LIMIT });
    const refused = applyAction(capped, "archive_alone", TEST_CONTENT);
    expect(refused.ok).toBe(false);
    expect(refused.reason).toBe(TEST_CONTENT.actions.archive_alone.deny);
    expect(refused.run).toBe(capped);
    expect(availableActions(capped)).toEqual(["archive_leave"]);
  });
});

describe("배치 delta", () => {
  test("xcheck 이후 목적지: ru_first는 gate, dusik_first는 venue", () => {
    const ru = applyAction(
      makeRun({ stage: "xcheck", placement: "ru_first" }),
      "xcheck_skip",
      TEST_CONTENT,
    );
    expect(ru.run.stage).toBe("gate");
    const dusik = applyAction(
      makeRun({ stage: "xcheck", placement: "dusik_first" }),
      "xcheck_skip",
      TEST_CONTENT,
    );
    expect(dusik.run.stage).toBe("venue");
  });

  test("gate 단계 — ru_first에서는 gate_to_venue가 함께 열린다", () => {
    const ru = makeRun({ stage: "gate", placement: "ru_first" });
    expect(availableActions(ru)).toEqual(
      expect.arrayContaining(["gate_to_venue", "gate_dispatch", "gate_reopen"]),
    );
    const dusik = makeRun({ stage: "gate", placement: "dusik_first" });
    expect(availableActions(dusik)).not.toContain("gate_to_venue");
  });

  test("venue 단계 — dusik_first에서 gate_*와 venue_*가 함께, ru_first에서는 venue_*만", () => {
    const ru = makeRun({ stage: "venue", placement: "ru_first" });
    expect(availableActions(ru)).toEqual(
      expect.arrayContaining(["venue_military", "venue_no_stage"]),
    );
    expect(availableActions(ru)).not.toContain("gate_to_venue");
    expect(availableActions(ru)).not.toContain("gate_dispatch");

    const dusik = makeRun({ stage: "venue", placement: "dusik_first" });
    expect(availableActions(dusik)).toEqual(
      expect.arrayContaining(["gate_dispatch", "gate_reopen", "venue_military"]),
    );
    expect(availableActions(dusik)).not.toContain("gate_to_venue");
  });
});

describe("종결 매핑 — 실제 CONTENT로 종결 액션을 돌린다", () => {
  // (준비 상태 → 액션 → 기대 terminal) 표. makeRun은 startRun과 같은 기본값이므로 오버라이드로
  // 목표 단계로 점프해도 시작 상태 모양은 그대로다. 적용은 전부 실제 CONTENT를 넣은
  // applyAction 하나 — 두 액션의 apply를 맞바꾸면 이 표가 어긋난다.
  type TerminalRow = { action: ActionId; terminal: EndingId; prep: RunState; why: string };
  const rows: readonly TerminalRow[] = [
    {
      action: "gate_hold",
      terminal: "death",
      prep: makeRun({ stage: "gate", clue: true }),
      why: "루 대신 다른 인원 배치는 단서를 쥔 회차에서만 고른다(require clue)",
    },
    {
      action: "venue_association",
      terminal: "death",
      prep: makeRun({ stage: "venue", documents: true }),
      why: "협회 통보는 서면 근거가 필요하다(require documents)",
    },
    {
      action: "venue_silence",
      terminal: "death",
      prep: makeRun({ stage: "venue" }),
      why: "침묵은 요건 없이 언제나 고를 수 있다(require 없음)",
    },
    {
      action: "venue_government",
      terminal: "gov",
      prep: makeRun({ stage: "venue", documents: true }),
      why: "관청 이관도 넘길 서면이 필요하다(require documents)",
    },
    {
      action: "venue_press",
      terminal: "press",
      prep: makeRun({ stage: "venue", documents: true }),
      why: "언론 통보도 기사가 될 서면이 필요하다(require documents)",
    },
    {
      action: "venue_no_stage",
      terminal: "routine",
      prep: makeRun({ stage: "venue" }),
      why: "알릴 것이 없는 닫기는 문서가 없을 때만 고른다(require !documents)",
    },
    {
      action: "site_process",
      terminal: "general",
      prep: makeRun({ stage: "site" }),
      why: "처리 요청은 site 단계에서만 고른다",
    },
    {
      action: "site_with_taesan",
      terminal: "general",
      prep: makeRun({ stage: "site" }),
      why: "배태산 동행도 site 단계에서만 고른다",
    },
    {
      action: "night_use",
      terminal: "true_ru",
      prep: makeRun({ stage: "night", relic: true }),
      why: "재통합은 삼킬 물건이 있어야 열린다(require relic)",
    },
    {
      action: "night_not_use",
      terminal: "general",
      prep: makeRun({ stage: "night" }),
      why: "물건을 쓰지 않는 선택에는 요건이 없다",
    },
    {
      action: "night_no_item",
      terminal: "general",
      prep: makeRun({ stage: "night" }),
      why: "물건 없는 마무리는 물건이 없을 때만 고른다(require !relic)",
    },
    {
      action: "submit_original",
      terminal: "true_dusik",
      prep: makeRun({ stage: "submit" }),
      why: "원본 대조 요구는 submit 단계에서만 고른다",
    },
    {
      action: "submit_copy",
      terminal: "true_dusik",
      prep: makeRun({ stage: "submit" }),
      why: "사본 제출도 submit 단계에서만 고른다",
    },
  ];

  test("종결 액션 전부는 각자 자기 종결로만 닫는다", () => {
    for (const { action, terminal, prep, why } of rows) {
      const outcome = applyAction(prep, action, CONTENT);
      expect(
        outcome.ok,
        `${action}이(가) 거부되었다(사유: ${outcome.reason}) — 준비 상태가 어긋났다: ${why}`,
      ).toBe(true);
      expect(
        outcome.run.terminal,
        `${action} → 기대 ${terminal}, 실제 ${String(outcome.run.terminal)} — ${why}`,
      ).toBe(terminal);
    }
  });

  test("gun_with_banjang 뒤 — venue로 되돌아가고 군 통보는 거부되며 잠금은 풀리지 않는다", () => {
    // 군 접점 요건(방송·문서·좌표)을 전부 채운 venue에서 접점에 진입한다.
    const venue = makeRun({ stage: "venue", broadcast: true, documents: true, coord: true });
    const enter = applyAction(venue, "venue_military", CONTENT);
    expect(enter.ok, `군 접점 진입이 막혔다(사유: ${enter.reason})`).toBe(true);
    expect(enter.run.stage).toBe("gun");

    const banjang = applyAction(enter.run, "gun_with_banjang", CONTENT);
    expect(banjang.ok, `최 반장 동행이 거부되었다(사유: ${banjang.reason})`).toBe(true);
    // 인맥 없는 동행: 접점은 다시 열리지 않고 수신자 선택으로 되돌아온다.
    expect(banjang.run.stage).toBe("venue");
    expect(banjang.run.gunLocked).toBe(true);

    const refused = applyAction(banjang.run, "venue_military", CONTENT);
    expect(refused.ok, "gunLocked인데 군 통보가 열리면 잠금 루프가 무너진 것이다").toBe(false);
    expect(refused.reason).toBe(CONTENT.actions.venue_military.deny);
    expect(refused.run.gunLocked, "거부만으로 잠금이 풀려서는 안 된다").toBe(true);
  });
});

describe("순수성", () => {
  test("같은 입력에 같은 출력, 입력을 훼손하지 않는다", () => {
    const run = makeRun({ stage: "xcheck", broadcast: true, documents: true });
    const snapshot = structuredClone(run);
    const first = applyAction(run, "xcheck_compare", TEST_CONTENT);
    expect(run).toEqual(snapshot);
    expect(applyAction(run, "xcheck_compare", TEST_CONTENT)).toEqual(first);
    expect(first.run).not.toBe(run);
  });
});
