// 콘텐츠 무결성 테스트 — prototype/game-mechanics.md 「콘텐츠 무결성 규칙 (테스트 대상)」의
// reclaim 대응(계획 §6). 실제 CONTENT를 두 배치로 열거해 콘텐츠 레코드와 가드 표(ACTION_SPECS)를
// 대조한다. 단언값은 열거 리포트와 콘텐츠에서 읽는다 — 수치 하드코딩 금지. 실패 시 문제 id를
// 메시지로 보인다.
import { describe, expect, test } from "vitest";
import type { ActionId, EndingId, StageId } from "../ids";
import { ACTION_IDS, ENDING_IDS, STAGE_IDS } from "../ids";
import { ACTION_SPECS } from "../rules/actions";
import type { EnumerationReport } from "../rules/enumerate";
import { enumerateRuns } from "../rules/enumerate";
import { applyAction, availableActions, REVIEW_LIMIT, startRun } from "../rules/run";
import type { Placement, RunState } from "../types";
import { CONTENT } from "./index";

const PLACEMENTS: readonly Placement[] = ["ru_first", "dusik_first"];
/** 진엔딩 두 종 — 맞은편 체인의 잠금 서술을 끊는 종결(계획 §3.5). */
const TRUE_ENDINGS: readonly EndingId[] = ["true_ru", "true_dusik"];
/** 고유 상태 상한 — 열거기(enumerate.ts)와 같은 폭발 가드. */
const STATE_LIMIT = 20_000;

const isBlank = (text: string): boolean => text.trim() === "";

// ---------------------------------------------------------------------------
// 열거 리포트 — 구조 무결성·종결 도달은 enumerateRuns의 리포트로 판정한다.
// ---------------------------------------------------------------------------

const reports: Readonly<Record<Placement, EnumerationReport>> = {
  ru_first: enumerateRuns(CONTENT, "ru_first"),
  dusik_first: enumerateRuns(CONTENT, "dusik_first"),
};

const aux = (placement: Placement): string => {
  const report = reports[placement];
  const counts = ENDING_IDS.map((id) => `${id}:${report.terminalCounts[id]}`).join(" ");
  return `부가 지표(단언 아님) ${placement} states=${report.states} bothChainsReady=${report.bothChainsReady} terminalCounts={${counts}}`;
};

// ---------------------------------------------------------------------------
// 도달 상태 순회 — 단계·선택지 무결성은 규칙의 공개 API(availableActions·applyAction)로
// 시작 상태부터 직접 돌려 수집한다. 서명(log 제외) 재방문은 건너뛴다.
// ---------------------------------------------------------------------------

type Reachability = {
  readonly stages: ReadonlySet<StageId>;
  readonly nonTerminal: readonly RunState[];
  readonly actionsOffered: ReadonlySet<ActionId>;
};

const signature = (run: RunState): string =>
  [
    run.placement,
    run.stage,
    run.terminal,
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
  ].join("|");

const reachable = (placement: Placement): Reachability => {
  const stages = new Set<StageId>();
  const nonTerminal: RunState[] = [];
  const actionsOffered = new Set<ActionId>();
  const seen = new Set<string>();
  const queue: RunState[] = [startRun(CONTENT, placement)];
  while (queue.length > 0) {
    const run = queue.shift();
    if (run === undefined) break;
    const sig = signature(run);
    if (seen.has(sig)) continue;
    seen.add(sig);
    if (seen.size > STATE_LIMIT) {
      throw new Error(`도달 순회가 고유 상태 상한 ${STATE_LIMIT}개를 넘었다 — 상태 공간 폭발`);
    }
    stages.add(run.stage);
    if (run.terminal !== null) continue;
    nonTerminal.push(run);
    for (const id of availableActions(run)) {
      actionsOffered.add(id);
      const outcome = applyAction(run, id, CONTENT);
      if (outcome.ok) queue.push(outcome.run);
    }
  }
  return { stages, nonTerminal, actionsOffered };
};

const reach: Readonly<Record<Placement, Reachability>> = {
  ru_first: reachable("ru_first"),
  dusik_first: reachable("dusik_first"),
};

/** 두 배치 도달 상태의 합집합으로 본 단계·액션 집합. */
const unionStages = (): ReadonlySet<StageId> =>
  new Set<StageId>([...reach.ru_first.stages, ...reach.dusik_first.stages]);

const unionActionsOffered = (): ReadonlySet<ActionId> =>
  new Set<ActionId>([...reach.ru_first.actionsOffered, ...reach.dusik_first.actionsOffered]);

// ---------------------------------------------------------------------------
// 1. 도달성 — 잠긴 상태를 요구하지 않고 시작 상태에서 만족 가능한 경로가 있다.
// ---------------------------------------------------------------------------

describe("도달성 — 시작 상태에서 만족 가능한 경로", () => {
  test("도달 상태에 등장하는 단계는 12 전부다(두 배치 합집합)", () => {
    const seen = unionStages();
    const missing = STAGE_IDS.filter((id) => !seen.has(id));
    const perPlacement = PLACEMENTS.map(
      (placement) => `${placement}={${[...reach[placement].stages].sort().join(", ")}}`,
    ).join(" · ");
    expect(
      missing,
      `도달하지 못한 단계: ${missing.join(", ") || "없음"} — 배치별 도달 단계 ${perPlacement}`,
    ).toEqual([]);
  });

  test("모든 액션이 어느 도달 상태에선가 목록에 올라온다(두 배치 합집합)", () => {
    const offered = unionActionsOffered();
    const missing = ACTION_IDS.filter((id) => !offered.has(id));
    expect(missing, `한 번도 목록에 오르지 않은 액션: ${missing.join(", ") || "없음"}`).toEqual([]);
  });

  test("모든 종결에 도달 경로가 있다 — 두 배치 각각 terminalCounts 1 이상", () => {
    for (const placement of PLACEMENTS) {
      for (const id of ENDING_IDS) {
        expect(
          reports[placement].terminalCounts[id],
          `종결 ${id}의 도달 경로 수(${placement}). ${aux(placement)}`,
        ).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 2. 구조 무결성 — 실제 콘텐츠 기준 재확인(열거기의 TEST_CONTENT 검증과 별개).
// ---------------------------------------------------------------------------

describe("구조 무결성 — 실제 콘텐츠 기준 재확인", () => {
  test.each(PLACEMENTS)("%s — 막다른 비종결 상태 0, 순환 0", (placement) => {
    const report = reports[placement];
    expect(report.deadEnds, `비종결 상태에서 선택지가 막히지 않는다. ${aux(placement)}`).toEqual(
      [],
    );
    expect(report.cycles, `경로 내 상태 재방문이 없다. ${aux(placement)}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. 잠금 무결성 — 신호 없는 잠금 0: require가 있으면 거부 문면이 명시 신호다.
//    radio_morning_on의 상태 의존 전이(배태산 파견에만 broadcast)도 여기서 명시 판정한다.
// ---------------------------------------------------------------------------

describe("잠금 무결성 — 조용한 잠금 0", () => {
  test("require가 있는 액션은 모두 빈 문자열이 아닌 deny를 가진다", () => {
    const quiet = ACTION_IDS.filter(
      (id) => ACTION_SPECS[id].require !== undefined && isBlank(CONTENT.actions[id].deny),
    );
    expect(
      quiet,
      `require가 있는데 거부 문면(deny)이 빈 액션: ${quiet.join(", ") || "없음"}`,
    ).toEqual([]);
  });

  test("radio_morning_on은 배태산 파견 회차에서만 방송을 남긴다 — 다른 파견은 상실 신호로 false", () => {
    // office에서 라디오까지 실제 경로로 걸어 간다: 출동 → 파견 → 관측소 → 아침 라디오.
    const radio = (dispatch: ActionId): RunState => {
      let run = startRun(CONTENT);
      for (const id of [
        "call_respond",
        dispatch,
        "obs_send_other",
        "radio_morning_on",
      ] as ActionId[]) {
        const outcome = applyAction(run, id, CONTENT);
        expect(
          outcome.ok,
          `${id} 적용이 거부되었다(사유: ${outcome.reason}) — 라디오 도달 경로가 깨졌다`,
        ).toBe(true);
        run = outcome.run;
      }
      return run;
    };

    // 배태산이 파견된 회차: 발표를 받아 적는 손이 있다 — broadcast가 true가 된다.
    const withTaesan = radio("dispatch_send_taesan");
    expect(
      withTaesan.broadcast,
      "배태산 파견 회차에서 라디오가 방송을 남기지 못했다 — 군·진두식 경로의 전제가 깨진다",
    ).toBe(true);

    // 다른 사람이 파견된 회차: 발표는 흘렀지만 숫자를 받아 적을 사람이 없다 —
    // broadcast는 false로 남아 이번 회차의 군·진두식 경로가 닫힌다(상실 신호).
    const withOther = radio("dispatch_send_other");
    expect(
      withOther.dispatchTaesan,
      "준비 오류: dispatch_send_other 뒤에 배태산 부재 상태가 아니다",
    ).toBe(false);
    expect(
      withOther.broadcast,
      "배태산이 없는 회차에서 방송이 열리면 상실 신호가 사라지고 잠긴 경로가 무단으로 열린다",
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. 선택지 최소 수 — 비종결 상태는 목록이 2개 이상이다. 설계된 강제 이동은 예외 둘뿐이다
// (계획 §3.3, 데모 route-combined-demo.html:150-158과 같다): 도입 단계 field(출동 하나),
// 본부 방문 소진(reviews가 상한에 닿으면 with_*가 닫히고 남은 수는 퇴장뿐). 그 외 어떤
// 비종결 상태도 선택지를 1개로 좁히면 액션 id와 함께 실패한다.
// ---------------------------------------------------------------------------

describe("선택지 최소 수 — 비종결 상태의 선택지", () => {
  test.each(PLACEMENTS)("%s — 2개 미만 상태는 설계된 강제 이동뿐이다", (placement) => {
    const thin = reach[placement].nonTerminal
      .filter((run) => availableActions(run).length < 2)
      .map((run) => ({ run, offered: availableActions(run) }));
    const unexplained = thin
      .filter(
        ({ run }) =>
          run.stage !== "field" && !(run.stage === "archive" && run.reviews >= REVIEW_LIMIT),
      )
      .map(({ run, offered }) => `${run.stage}:${offered.length}개(${offered.join(", ")})`);
    expect(
      unexplained,
      `선택지가 2개 미만인 비종결 상태(field·본부 방문 소진 제외, 단계:목록 수(액션)). ${aux(placement)}`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 5. 문면 총체성 — 콘텐츠 리터럴은 전부 채워져 있다(빈 문면·공백만 있는 문면 0).
// ---------------------------------------------------------------------------

describe("문면 총체성 — 콘텐츠 리터럴", () => {
  test("모든 액션의 label·deny·result가 비어 있지 않다", () => {
    const blanks = ACTION_IDS.flatMap((id) => {
      const card = CONTENT.actions[id];
      const fields = (["label", "deny", "result"] as const).filter((field) => isBlank(card[field]));
      return fields.length === 0 ? [] : [`${id}(${fields.join(", ")})`];
    });
    expect(blanks, `빈 문면이 있는 액션: ${blanks.join(", ") || "없음"}`).toEqual([]);
  });

  test("모든 종결 카드의 title·text·epilogue 첫 문단이 비어 있지 않다", () => {
    const blanks = ENDING_IDS.flatMap((id) => {
      const card = CONTENT.endings[id];
      const firstEpilogue = card.epilogue[0];
      const fields: string[] = [];
      if (isBlank(card.title)) fields.push("title");
      if (isBlank(card.text)) fields.push("text");
      if (firstEpilogue === undefined || isBlank(firstEpilogue)) fields.push("epilogue[0]");
      return fields.length === 0 ? [] : [`${id}(${fields.join(", ")})`];
    });
    expect(blanks, `빈 문면이 있는 종결: ${blanks.join(", ") || "없음"}`).toEqual([]);
  });

  test("문서 줄·번호 항목·에필로그·동행 대사에 중복 문면이 없다 — 목록 키가 문면이다", () => {
    const dupes: string[] = [];
    for (const [id, card] of Object.entries(CONTENT.stages)) {
      for (const [field, lines] of [
        ["meta", card.document.meta],
        ["items", card.document.items],
      ] as const) {
        const seen = new Set<string>();
        for (const line of lines) {
          if (seen.has(line)) dupes.push(`${id}.${field}: ${line}`);
          seen.add(line);
        }
      }
      const characters = card.partyLines.map((line) => line.character);
      if (new Set(characters).size !== characters.length) {
        dupes.push(`${id}.partyLines: 인물이 중복된다`);
      }
    }
    for (const [id, card] of Object.entries(CONTENT.endings)) {
      if (new Set(card.epilogue).size !== card.epilogue.length) dupes.push(`${id}.epilogue`);
    }
    expect(dupes, `중복 문면: ${dupes.join(", ") || "없음"}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 6. 종결의 잠금 서술 — 형식 단언: 실패 시 실제 길이를 메시지로 보인다.
// ---------------------------------------------------------------------------

describe("종결의 잠금 서술 — 형식 단언(길이 진단)", () => {
  test("모든 종결 본문이 차 있고, 진엔딩 두 종은 나머지 가운데 가장 짧지 않다", () => {
    const lengths = ENDING_IDS.map((id) => ({ id, chars: CONTENT.endings[id].text.length }));
    const table = [...lengths].sort((a, b) => b.chars - a.chars).map((e) => `${e.id}=${e.chars}`);
    const floor = Math.min(
      ...lengths.filter((e) => !TRUE_ENDINGS.includes(e.id)).map((e) => e.chars),
    );
    const offenders = lengths
      .filter(
        (e) =>
          isBlank(CONTENT.endings[e.id].text) || (TRUE_ENDINGS.includes(e.id) && e.chars < floor),
      )
      .map((e) => `${e.id}=${e.chars}`);
    expect(
      offenders,
      `종결 본문 길이: ${table.join(", ")} — 빈 본문 또는 나머지 종결의 최소 길이(${floor})보다 짧은 진엔딩`,
    ).toEqual([]);
  });
});
