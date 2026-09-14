// 콘텐츠 무결성 테스트 — 일감 구조(2026-09-14 재편)의 콘텐츠 레이어 검사.
// 실제 CONTENT를 훑어 ① (일감 × 순서)·체인·액션·종결·인물·뒷정리 작업의 존재와 id 정합
// ② 빈 문면 0 ③ 목록 내·전역 중복 문면 0 ④ 액션 집합 일치(ids.ts ↔ content)를 단언한다.
// 여기에 둘을 더한다 — ⑤ 뒷정리: 지침서(site.document)가 작업 넷을 지침 순서대로 싣고
// 작업 이름은 차례를 흘리지 않는다(지침서가 유일한 단서다) ⑥ 장면 묘사의 문단 하한
// ⑦ 면담 16편(일감 × 인물)의 존재·문단·응답 셋 — 응답 셋은 서로 다른 결이어야 한다.
// 단언값은 콘텐츠에서 읽는다 — 수치 하드코딩 금지. 종결 도달·배치별 무대·막다른 상태 같은
// 열거 기반 검사는 별도 태스크(rules/enumerate 계열)가 담당한다 — 여기서 중복 구현하지 않는다.
import { describe, expect, test } from "vitest";
import {
  ACTION_IDS,
  type ActionId,
  CHAIN_STEP_IDS,
  CHARACTER_IDS,
  type ChainStepId,
  type CharacterId,
  CLEANUP_TASK_IDS,
  type CleanupTaskId,
  ENDING_IDS,
  type EndingId,
  JOB_IDS,
  JOB_STEP_IDS,
  type JobId,
  TALK_CHOICE_IDS,
} from "../ids";
import { CLEANUP_FORBIDDEN, CLEANUP_KINDS, CLEANUP_REQUIRED } from "../rules/cleanupKinds";
import type { StageDocument, TalkLine } from "../types";
import { CONTENT } from "./index";

/** 진엔딩 두 종 — 맞은편 체인의 잠금 서술을 끊는 종결(계획 §3.5). */
const TRUE_ENDINGS: readonly EndingId[] = ["true_ru", "true_dusik"];

const isBlank = (text: string): boolean => text.trim() === "";
const talkTexts = (lines: readonly TalkLine[]): readonly string[] => lines.map((l) => l.text);

// ---------------------------------------------------------------------------
// 문면 목록화 — 빈 문면·중복을 한 번에 훑기 위한 [위치, 문면들] 목록.
// ---------------------------------------------------------------------------

/** [위치, 문면 목록] 한 쌍. 목록 단위 검사(빈 문면·목록 내 중복)의 단위다. */
type Probe = readonly [where: string, lines: readonly string[]];

const documentProbes = (where: string, doc: StageDocument): Probe[] => [
  [`${where}.document.heading`, [doc.heading]],
  [`${where}.document.meta`, doc.meta],
  [`${where}.document.items`, doc.items],
  // document.tail은 서식상 생략된다(끝 줄 없는 자체 문서·지시서) — 검사에서 뺀다.
];

const jobProbes = (job: JobId): Probe[] => {
  const card = CONTENT.jobs[job];
  const w = `jobs.${job}`;
  return [
    [`${w}.title`, [card.title]],
    [`${w}.office.prompt`, [card.office.prompt]],
    [`${w}.office.news`, [card.office.news]],
    [`${w}.office.printer`, [card.office.printer]],
    [`${w}.office.chatter`, talkTexts(card.office.chatter)],
    ...documentProbes(`${w}.briefing`, card.briefing.document),
    [`${w}.briefing.prompt`, [card.briefing.prompt]],
    [`${w}.briefing.talk`, talkTexts(card.briefing.talk)],
    [`${w}.party.prompt`, [card.party.prompt]],
    [`${w}.party.notes`, talkTexts(card.party.notes)],
    [`${w}.cleanup.prompt`, [card.cleanup.prompt]],
    [`${w}.site.title`, [card.site.title]],
    [`${w}.site.prompt`, [card.site.prompt]],
    ...documentProbes(`${w}.site`, card.site.document),
    [`${w}.site.partyLines`, talkTexts(card.site.partyLines)],
  ];
};

const chainProbes = (id: ChainStepId): Probe[] => {
  const card = CONTENT.chains[id];
  const w = `chains.${id}`;
  return [
    [`${w}.title`, [card.title]],
    ...documentProbes(w, card.document),
    [`${w}.prompt`, [card.prompt]],
    [`${w}.partyLines`, talkTexts(card.partyLines)],
  ];
};

const actionProbes = (id: ActionId): Probe[] => {
  const card = CONTENT.actions[id];
  return [
    [`actions.${id}.label`, [card.label]],
    [`actions.${id}.deny`, [card.deny]],
    [`actions.${id}.result`, [card.result]],
  ];
};

const endingProbes = (id: EndingId): Probe[] => {
  const card = CONTENT.endings[id];
  return [
    [`endings.${id}.title`, [card.title]],
    [`endings.${id}.text`, [card.text]],
    [`endings.${id}.epilogue`, card.epilogue],
  ];
};

const characterProbes = (id: CharacterId): Probe[] => {
  const card = CONTENT.characters[id];
  return [
    [`characters.${id}.name`, [card.name]],
    [`characters.${id}.role`, [card.role]],
    [`characters.${id}.voice`, [card.voice]],
    [`characters.${id}.card`, [card.card]],
  ];
};

/**
 * 면담 한 편 — 그 사람이 먼저 하는 말(opening)과 응답 셋의 답(replies).
 * replies는 **한 목록**으로 묶는다: 응답 셋이 같은 문면이면 화면에서 무엇을 골라도 같은 말이
 * 나오므로, 목록 내 중복 검사가 그 결함을 잡는다.
 */
const interviewProbes = (job: JobId, id: CharacterId): Probe[] => {
  const card = CONTENT.interviews[job][id];
  const w = `interviews.${job}.${id}`;
  return [
    [`${w}.opening`, [card.opening]],
    [`${w}.replies`, TALK_CHOICE_IDS.map((choice) => card.replies[choice])],
  ];
};

/** 뒷정리 작업 이름 — 세계 공통 절차라 일감이 아니라 세계가 소유한다. */
const cleanupTaskProbes = (id: CleanupTaskId): Probe[] => [
  [`cleanupTasks.${id}`, [CONTENT.cleanupTasks[id]]],
];

/** 콘텐츠 전체의 문면 목록. */
const allProbes = (): Probe[] => [
  ...JOB_IDS.flatMap(jobProbes),
  ...CHAIN_STEP_IDS.flatMap(chainProbes),
  ...ACTION_IDS.flatMap(actionProbes),
  ...ENDING_IDS.flatMap(endingProbes),
  ...CHARACTER_IDS.flatMap(characterProbes),
  ...CLEANUP_TASK_IDS.flatMap(cleanupTaskProbes),
  ...JOB_IDS.flatMap((job) => CHARACTER_IDS.flatMap((id) => interviewProbes(job, id))),
];

/**
 * 산문 문면 목록 — 문서 얼굴(heading·meta·items)을 뺀다. 발신명의·인사말 같은
 * 공문 서식어는 문서마다 반복되는 것이 정답이고, 산문은 한 번밖에 쓰이지 않는다.
 */
const proseProbes = (): Probe[] => allProbes().filter(([where]) => !where.includes(".document."));

// ---------------------------------------------------------------------------
// 1. 카드 존재 — (일감 × 순서) 16장과 체인 6장, 집합 정합.
// ---------------------------------------------------------------------------

describe("카드 존재 — (일감 × 순서)와 체인", () => {
  test.each(JOB_IDS.flatMap((job) => JOB_STEP_IDS.map((step) => ({ job, step }))))(
    "$job × $step — 카드가 있다",
    ({ job, step }) => {
      expect(CONTENT.jobs[job][step], `jobs.${job}.${step} 카드가 없다`).toBeTypeOf("object");
    },
  );

  test.each(CHAIN_STEP_IDS)("%s — 체인 카드가 있다", (id) => {
    expect(CONTENT.chains[id], `chains.${id} 카드가 없다`).toBeTypeOf("object");
  });

  test("일감·체인·종결·인물 집합이 ids.ts와 같다", () => {
    expect(Object.keys(CONTENT.jobs).sort()).toEqual([...JOB_IDS].sort());
    expect(Object.keys(CONTENT.chains).sort()).toEqual([...CHAIN_STEP_IDS].sort());
    expect(Object.keys(CONTENT.endings).sort()).toEqual([...ENDING_IDS].sort());
    expect(Object.keys(CONTENT.characters).sort()).toEqual([...CHARACTER_IDS].sort());
    expect(Object.keys(CONTENT.cleanupTasks).sort()).toEqual([...CLEANUP_TASK_IDS].sort());
    expect(Object.keys(CONTENT.interviews).sort()).toEqual([...JOB_IDS].sort());
    for (const job of JOB_IDS) {
      expect(Object.keys(CONTENT.interviews[job]).sort(), `interviews.${job}`).toEqual(
        [...CHARACTER_IDS].sort(),
      );
    }
  });

  test("모든 카드의 id 필드가 키와 같다", () => {
    const offenders: string[] = [];
    for (const job of JOB_IDS) if (CONTENT.jobs[job].id !== job) offenders.push(`jobs.${job}`);
    for (const id of CHAIN_STEP_IDS)
      if (CONTENT.chains[id].id !== id) offenders.push(`chains.${id}`);
    for (const id of ACTION_IDS) if (CONTENT.actions[id].id !== id) offenders.push(`actions.${id}`);
    for (const id of ENDING_IDS) if (CONTENT.endings[id].id !== id) offenders.push(`endings.${id}`);
    for (const id of CHARACTER_IDS)
      if (CONTENT.characters[id].id !== id) offenders.push(`characters.${id}`);
    expect(offenders, `id 불일치: ${offenders.join(", ") || "없음"}`).toEqual([]);
  });

  test("일감 site마다 인물 네 명의 줄이 모두 있다 — 현장은 동행만 말한다", () => {
    const missing = JOB_IDS.flatMap((job) => {
      const speakers = new Set(CONTENT.jobs[job].site.partyLines.map((line) => line.character));
      return CHARACTER_IDS.filter((id) => !speakers.has(id)).map((id) => `${job}: ${id}`);
    });
    expect(missing, `site.partyLines에 없는 인물: ${missing.join(", ") || "없음"}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. 액션 집합 일치 — ids.ts의 액션 집합과 콘텐츠 카드 집합이 양방향으로 같다.
// ---------------------------------------------------------------------------

describe("액션 집합 일치 — ids.ts와 콘텐츠", () => {
  test("선언된 액션마다 카드가 있고, 카드 밖의 액션은 없다", () => {
    const written = new Set<string>(Object.keys(CONTENT.actions));
    const missing = ACTION_IDS.filter((id) => !written.has(id));
    const declared = new Set<string>(ACTION_IDS);
    const extra = [...written].filter((id) => !declared.has(id));
    expect(
      { missing, extra },
      `빠진 액션: ${missing.join(", ") || "없음"} / 선언 밖 카드: ${extra.join(", ") || "없음"}`,
    ).toEqual({ missing: [], extra: [] });
  });
});

// ---------------------------------------------------------------------------
// 3. 문면 총체성 — 콘텐츠 리터럴은 전부 채워져 있다(빈 문면·공백만 있는 문면 0).
// ---------------------------------------------------------------------------

describe("문면 총체성 — 콘텐츠 리터럴", () => {
  test("모든 문면이 비어 있지 않다 — 문서 끝 줄(tail)만 서식상 생략을 허용한다", () => {
    const blanks = allProbes().flatMap(([where, lines]) =>
      lines.flatMap((line, i) => (isBlank(line) ? [`${where}[${i}]`] : [])),
    );
    expect(blanks, `빈 문면: ${blanks.join(", ") || "없음"}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 4. 중복 문면 — 목록 안에서 같은 문면이 반복되지 않고, 산문은 전체에서 하나뿐이다.
// ---------------------------------------------------------------------------

describe("중복 문면 — 목록 키가 문면이다", () => {
  test("한 목록 안에 같은 문면이 없다", () => {
    const dupes = allProbes().flatMap(([where, lines]) => {
      const seen = new Set<string>();
      const found: string[] = [];
      for (const line of lines) {
        if (seen.has(line)) found.push(`${where}: ${line}`);
        seen.add(line);
      }
      return found;
    });
    expect(dupes, `중복 문면: ${dupes.join(", ") || "없음"}`).toEqual([]);
  });

  test("대사 목록에 같은 인물이 두 번 나오지 않는다", () => {
    const dupes: string[] = [];
    const check = (where: string, lines: readonly TalkLine[]) => {
      const speakers = lines.map((line) => line.character);
      if (new Set(speakers).size !== speakers.length) dupes.push(where);
    };
    for (const job of JOB_IDS) {
      const card = CONTENT.jobs[job];
      check(`jobs.${job}.office.chatter`, card.office.chatter);
      check(`jobs.${job}.briefing.talk`, card.briefing.talk);
      check(`jobs.${job}.party.notes`, card.party.notes);
      check(`jobs.${job}.site.partyLines`, card.site.partyLines);
    }
    for (const id of CHAIN_STEP_IDS)
      check(`chains.${id}.partyLines`, CONTENT.chains[id].partyLines);
    expect(dupes, `인물 중복: ${dupes.join(", ") || "없음"}`).toEqual([]);
  });

  test("산문 문면이 콘텐츠 전체에서 겹치지 않는다", () => {
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    for (const [where, lines] of proseProbes()) {
      for (const line of lines) {
        const owner = seen.get(line);
        if (owner === undefined) seen.set(line, where);
        else dupes.push(`"${line}" — ${owner} · ${where}`);
      }
    }
    expect(dupes, `전역 중복 산문: ${dupes.join(" / ") || "없음"}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 5. 종결의 잠금 서술 — 형식 단언: 실패 시 실제 길이를 메시지로 보인다.
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

// ---------------------------------------------------------------------------
// 6. 뒷정리 — 지침서가 유일한 단서다.
// 작업 이름(버튼 문면)은 차례를 흘리지 않고, 규칙은 일감의 지침서(site.document)에만 산다.
// 종류는 일감마다 다르다(rules/cleanupKinds.ts): 관악은 네 작업을 지침 순서 그대로(order),
// 관측소·문서고·폐허는 필수 집합만 갖추면 되고(subset·exclude·count), 문서고는 금지 작업
// 하나를 더 진다(exclude). 지침서는 그 현장의 규칙을 문면으로 드러내야 하고, 화면이 버튼을
// 섞어 그려도 그 단서가 남는다.
// ---------------------------------------------------------------------------

describe("뒷정리 — 지침서가 유일한 단서다", () => {
  /** 지침서가 작업 이름을 실은 차례. 없는 작업은 빼고 센다(order 종류에서만 순서가 뜻을 갖는다). */
  const sheetOrder = (job: JobId): readonly CleanupTaskId[] =>
    CLEANUP_TASK_IDS.map((task) => ({
      task,
      at: CONTENT.jobs[job].site.document.items.findIndex((line) =>
        line.includes(CONTENT.cleanupTasks[task]),
      ),
    }))
      .filter((entry) => entry.at >= 0)
      .sort((a, b) => a.at - b.at)
      .map((entry) => entry.task);

  /** 지침서에 그 작업의 정확한 문면이 실려 있는가(순서 무관, 존재만 확인). */
  const sheetMentions = (job: JobId, task: CleanupTaskId): boolean =>
    CONTENT.jobs[job].site.document.items.some((line) => line.includes(CONTENT.cleanupTasks[task]));

  test("작업 이름이 넷이고 서로 다르며, 차례를 흘리는 낱말이 없다", () => {
    expect(Object.keys(CONTENT.cleanupTasks).sort()).toEqual([...CLEANUP_TASK_IDS].sort());
    const names = CLEANUP_TASK_IDS.map((id) => CONTENT.cleanupTasks[id]);
    expect(new Set(names).size, `작업 이름이 겹친다: ${names.join(" / ")}`).toBe(names.length);
    const leaking = CLEANUP_TASK_IDS.filter((id) =>
      /먼저|첫째|둘째|셋째|넷째|순서/.test(CONTENT.cleanupTasks[id]),
    );
    expect(leaking, `차례를 흘리는 작업 이름: ${leaking.join(", ") || "없음"}`).toEqual([]);
  });

  test("네 일감의 뒷정리 규칙 종류가 서로 다르다", () => {
    const kinds = JOB_IDS.map((job) => CLEANUP_KINDS[job]);
    expect(
      new Set(kinds).size,
      `종류가 겹친다: ${JOB_IDS.map((j) => `${j}=${CLEANUP_KINDS[j]}`).join(", ")}`,
    ).toBe(JOB_IDS.length);
  });

  test("order 종류(관악) — 지침서가 작업 넷을 지침 순서대로 싣는다", () => {
    const job = JOB_IDS.find((j) => CLEANUP_KINDS[j] === "order");
    expect(job, "order 종류인 일감이 없다").toBeDefined();
    if (job === undefined) return;
    expect(sheetOrder(job), `jobs.${job}.site.document가 지침 순서를 담지 않는다`).toEqual([
      ...CLEANUP_TASK_IDS,
    ]);
  });

  test.each(JOB_IDS.filter((job) => CLEANUP_KINDS[job] !== "order"))(
    "%s — 지침서가 필수 작업을 모두 문면으로 싣는다",
    (job) => {
      const required = CLEANUP_REQUIRED[job];
      expect(required, `${job}의 CLEANUP_REQUIRED가 없다`).toBeDefined();
      if (required === undefined) return;
      const missing = required.filter((task) => !sheetMentions(job, task));
      expect(
        missing,
        `jobs.${job}.site.document에 없는 필수 작업: ${missing.join(", ") || "없음"}`,
      ).toEqual([]);
    },
  );

  test("exclude 종류(문서고) — 지침서가 금지 작업의 정확한 문면을 싣지 않는다", () => {
    const job = JOB_IDS.find((j) => CLEANUP_KINDS[j] === "exclude");
    expect(job, "exclude 종류인 일감이 없다").toBeDefined();
    if (job === undefined) return;
    const forbidden = CLEANUP_FORBIDDEN[job];
    expect(forbidden, `${job}의 CLEANUP_FORBIDDEN이 없다`).toBeDefined();
    if (forbidden === undefined) return;
    expect(
      sheetMentions(job, forbidden),
      `jobs.${job}.site.document가 금지 작업(${forbidden})의 정확한 문면을 실어 지침을 흘린다`,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 7. 장면 묘사 — 문단 하한(사용자 지시: 사무실·공문·뒷정리·현장은 3문단 이상, 체인 절차는
// 2문단 이상). 한 필드가 하나의 플레인 리터럴이고, 문단은 빈 줄(`\n\n`)로만 가른다.
// ---------------------------------------------------------------------------

/** 장면 묘사를 가진 일감 단계 — 사무실·공문·뒷정리·현장. */
const JOB_PROSE_STEPS = ["office", "briefing", "cleanup", "site"] as const;
/** 일감 장면의 문단 하한 — 3~5문단 지시의 아래끝. */
const JOB_SCENE_FLOOR = 3;
/** 체인 절차 장면의 문단 하한 — 2~4문단 지시의 아래끝. */
const CHAIN_SCENE_FLOOR = 2;

/** 빈 줄로 가른 문단 수 — 빈 조각(연속 빈 줄)은 세지 않는다. */
const paragraphCount = (text: string): number =>
  text.split("\n\n").filter((part) => !isBlank(part)).length;

/** 문단 분할 자체의 결함 — 한 줄바꿈·빈 문단·문단 앞뒤 공백. */
const paragraphDefects = (where: string, text: string): readonly string[] => {
  const parts = text.split("\n\n");
  const defects: string[] = [];
  if (parts.some((part) => isBlank(part))) defects.push(`${where}: 빈 문단`);
  if (parts.some((part) => part.includes("\n"))) defects.push(`${where}: 한 줄바꿈`);
  if (parts.some((part) => part.trim() !== part)) defects.push(`${where}: 문단 앞뒤 공백`);
  return defects;
};

/** 면담 문면 전부 — opening과 응답 셋의 답. */
const interviewScenes = (): readonly { readonly where: string; readonly text: string }[] => [
  ...JOB_IDS.flatMap((job) =>
    CHARACTER_IDS.map((id) => ({
      where: `interviews.${job}.${id}.opening`,
      text: CONTENT.interviews[job][id].opening,
    })),
  ),
  ...JOB_IDS.flatMap((job) =>
    CHARACTER_IDS.flatMap((id) =>
      TALK_CHOICE_IDS.map((choice) => ({
        where: `interviews.${job}.${id}.replies.${choice}`,
        text: CONTENT.interviews[job][id].replies[choice],
      })),
    ),
  ),
];

/** 장면 묘사 전부 — 일감 네 단계와 체인 절차. */
const scenes = (): readonly { readonly where: string; readonly text: string }[] => [
  ...JOB_IDS.flatMap((job) =>
    JOB_PROSE_STEPS.map((step) => ({
      where: `jobs.${job}.${step}.prompt`,
      text: CONTENT.jobs[job][step].prompt,
    })),
  ),
  ...CHAIN_STEP_IDS.map((id) => ({
    where: `chains.${id}.prompt`,
    text: CONTENT.chains[id].prompt,
  })),
];

describe("장면 묘사 — 문단", () => {
  test.each(JOB_IDS.flatMap((job) => JOB_PROSE_STEPS.map((step) => ({ job, step }))))(
    "$job × $step — 장면 묘사가 문단으로 나뉘어 있다",
    ({ job, step }) => {
      const count = paragraphCount(CONTENT.jobs[job][step].prompt);
      expect(count, `jobs.${job}.${step}.prompt 문단 수: ${count}`).toBeGreaterThanOrEqual(
        JOB_SCENE_FLOOR,
      );
    },
  );

  test.each(CHAIN_STEP_IDS)("%s — 절차 묘사가 문단으로 나뉘어 있다", (id) => {
    const count = paragraphCount(CONTENT.chains[id].prompt);
    expect(count, `chains.${id}.prompt 문단 수: ${count}`).toBeGreaterThanOrEqual(
      CHAIN_SCENE_FLOOR,
    );
  });

  test("문단을 가르는 것은 빈 줄뿐이다 — 한 줄바꿈·빈 문단·앞뒤 공백 0", () => {
    const defects = [...scenes(), ...interviewScenes()].flatMap((scene) =>
      paragraphDefects(scene.where, scene.text),
    );
    expect(defects, `문단 분할 결함: ${defects.join(", ") || "없음"}`).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 8. 면담 — 그 사람이 먼저 말하고, 응답 셋은 서로 다른 결이다.
// 하루 한 번 열리는 문이므로 분량이 곧 보상이다: opening은 장면(3문단 이상), 응답의 답은
// 최소 한 문단이며, 셋이 같은 말이면 고를 이유가 사라진다.
// ---------------------------------------------------------------------------

/** 면담 opening의 문단 하한 — 장면 지시(3~4문단)의 아래끝. */
const INTERVIEW_FLOOR = 3;

describe("면담 — 사람이 먼저 말하고 응답 셋이 갈린다", () => {
  test.each(JOB_IDS.flatMap((job) => CHARACTER_IDS.map((id) => ({ job, id }))))(
    "$job × $id — 면담 opening이 문단으로 나뉘어 있다",
    ({ job, id }) => {
      const count = paragraphCount(CONTENT.interviews[job][id].opening);
      expect(count, `interviews.${job}.${id}.opening 문단 수: ${count}`).toBeGreaterThanOrEqual(
        INTERVIEW_FLOOR,
      );
    },
  );

  test.each(JOB_IDS.flatMap((job) => CHARACTER_IDS.map((id) => ({ job, id }))))(
    "$job × $id — 응답 셋의 답이 각각 한 문단 이상이고 서로 다르다",
    ({ job, id }) => {
      const card = CONTENT.interviews[job][id];
      const replies = TALK_CHOICE_IDS.map((choice) => card.replies[choice]);
      const thin = TALK_CHOICE_IDS.filter((choice) => paragraphCount(card.replies[choice]) < 1).map(
        (choice) => `${job}.${id}.${choice} 문단 없음`,
      );
      const dupes =
        new Set(replies).size === replies.length ? [] : [`${job}.${id} 응답 셋이 겹친다`];
      expect([...thin, ...dupes]).toEqual([]);
    },
  );
});

// ---------------------------------------------------------------------------
// 9. 쿠션 — 첫 일감(관악)만 읽어도 세계와 진행이 소개된다(사용자 지시, 2026-09-14).
// 튜토리얼 화면이 없는 대신 첫날의 본문이 그 일을 한다: 괴수·히어로·잔해 정리·협회가 나오고,
// 후반의 개념(잔당)이나 비밀 게이트 어휘는 아직 나오지 않는다. 테스트가 없으면 다음 산문
// 수정에서 조용히 빠진다 — 그래서 낱말 자체를 계약으로 못박는다.
// ---------------------------------------------------------------------------

/** 관악(첫 일감) 범위의 문면 전부 — 일감 카드와 그 일감의 면담 네 편. */
const firstJobTexts = (): readonly string[] => {
  const job = CONTENT.jobs.gwanak;
  return [
    job.title,
    job.office.prompt,
    job.office.news,
    job.office.printer,
    ...talkTexts(job.office.chatter),
    job.briefing.prompt,
    job.briefing.document.heading,
    ...job.briefing.document.meta,
    ...job.briefing.document.items,
    job.briefing.document.tail,
    ...talkTexts(job.briefing.talk),
    job.party.prompt,
    ...talkTexts(job.party.notes),
    job.cleanup.prompt,
    job.site.title,
    job.site.prompt,
    ...job.site.document.items,
    ...talkTexts(job.site.partyLines),
    ...CHARACTER_IDS.flatMap((id) => {
      const card = CONTENT.interviews.gwanak[id];
      return [card.opening, ...TALK_CHOICE_IDS.map((choice) => card.replies[choice])];
    }),
  ];
};

/** 첫날에 반드시 나와야 하는 세계의 기본 낱말. */
const CUSHION_WORDS = ["괴수", "히어로", "잔해", "협회"] as const;
/** 첫날에는 아직 나오면 안 되는 낱말 — 후반 개념과 비밀 게이트. */
const GATE_WORDS = ["잔당", "시퍼", "루시퍼", "소환", "유착", "실세"] as const;

describe("쿠션 — 첫 일감이 세계와 진행을 소개한다", () => {
  test("관악 범위에 세계의 기본 낱말이 모두 나온다", () => {
    const texts = firstJobTexts();
    const missing = CUSHION_WORDS.filter((word) => !texts.some((text) => text.includes(word)));
    expect(missing, `첫 일감에 없는 낱말: ${missing.join(", ") || "없음"}`).toEqual([]);
  });

  test("관악 범위에는 후반 개념·게이트 어휘가 없다", () => {
    const hits = firstJobTexts().flatMap((text) =>
      GATE_WORDS.filter((word) => text.includes(word)).map((word) => word),
    );
    expect(
      [...new Set(hits)],
      `첫 일감에 새어 나온 게이트 어휘: ${hits.join(", ") || "없음"}`,
    ).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 10. 장면 분할 — 쪽 나눔은 콘텐츠가 정하고, 그 값은 문단 안에 있다.
// `pageBreak`가 0이면 한 장, 문단 수 이상이면 두 장이 되지 않는다(화면이 그렇게 지킨다).
// 값이 문단 밖으로 나가면 화면이 조용히 한 장으로 접어 버리므로, 계약을 여기서 잡는다.
// ---------------------------------------------------------------------------

describe("장면 분할 — pageBreak는 문단 수 안에 있다", () => {
  test.each(JOB_IDS)("%s — 0 이상, 문단 수 미만", (job) => {
    const paragraphs = CONTENT.jobs[job].office.prompt
      .split("\n\n")
      .filter((p) => p.trim() !== "").length;
    const at = CONTENT.jobs[job].office.pageBreak;
    expect(Number.isInteger(at), `${job}.office.pageBreak가 정수가 아니다`).toBe(true);
    expect(at, `${job}.office.pageBreak=${at} (문단 ${paragraphs}개)`).toBeGreaterThanOrEqual(0);
    expect(at, `${job}.office.pageBreak=${at} (문단 ${paragraphs}개)`).toBeLessThan(paragraphs);
  });
});
