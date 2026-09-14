// @vitest-environment jsdom

// 플레이 화면 계약(일감 구조 + 아침 조회): 아침은 산문 화면 → 사람들 화면의 두 화면이고,
// 사람들 화면은 네 사람을 田자(2×2) 창문 격자로 세운다 — 창문마다 초상·이름·잡담이 담기고
// 창문 안의 말 걸기 버튼 하나가 그 사람에게 말을 거는 동작이다(이미 나눈 사람은 거부 문면만
// 남는다). 그 자리에서 말을 건 사람 하나와 면담(응답 셋)이 하루 한 번 열린다 — 그 뒤에 프린터가
// 공문을 당기고, 공문 → 인원 선택 → 뒷정리 → 현장으로 이어진다. 이 전이를 **실제 스토어**로
// 돌리고, 면담이 사람 이름·먼저 하는 말·고른 응답의 답을 그 순서로 보여주는 것, 고른 응답이
// 화면에 남는 것, 한 번 이야기한 사람에게는 버튼 대신 그 행동의 거부 문면이 서는 것, 면담
// 화면이 대사로 시작하지 않는 것, 결장한 인원의 카드가 사유 문면과 함께 잠기는 것, 선택 없이
// 나서려는 `party_go`가 거부 문면으로 답하는 것, 뒷정리 작업을 다 고르기 전에는 마침이
// 거부 문면으로 막히는 것, 뒷정리 버튼의 표시 순서가 지침 순서를 새어 내지 않는 것, 상태
// 축(피로·부상·의심·신뢰)이 수치·미터로, 뒷정리 등급(perfect/partial/poor)이 이름으로도 화면에
// 오르지 않는 것, 회차가 도는 동안 종결 이름이 어디에도 없는 것을 단언한다.
//
// 스토어는 메모리 스토리지 위에서 만들고 컨텍스트로 주입한다 — 싱글턴 runStore는 쓰지 않는다.
// 문면 단언은 전부 주입한 CONTENT에서 읽는다(하드코딩 0).

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import type { StoreApi } from "zustand/vanilla";
import { memoryStorage } from "../../../../shared/storage";
import { CONTENT } from "../../content";
import {
  CHARACTER_IDS,
  type CharacterId,
  CLEANUP_TASK_IDS,
  type CleanupTaskId,
  ENDING_IDS,
  JOB_IDS,
} from "../../ids";
import { availableActions } from "../../rules/run";
import { makeRun, zeroCharacters } from "../../rules/testContent";
import { createPersistence } from "../../store/persistence";
import { createRunStore, type RunStore } from "../../store/runStore";
import type { Content, JobCard, RunState } from "../../types";
import { CLEANUP_DISPLAY_ORDER } from "../components/CleanupTaskPick";
import { ContentContext } from "../contentContext";
import { RunStoreContext } from "../runStoreContext";
import { PlayScreen } from "./PlayScreen";

const makeStore = (): StoreApi<RunStore> =>
  createRunStore({
    content: CONTENT,
    persistence: createPersistence(memoryStorage()),
    onStart: () => {},
    onEnding: () => {},
  });

const mount = (store: StoreApi<RunStore>): void => {
  render(
    <RunStoreContext value={store}>
      <PlayScreen />
    </RunStoreContext>,
  );
};

const button = (name: string) => screen.getByRole<HTMLButtonElement>("button", { name });

const click = async (name: string): Promise<void> => {
  await userEvent.click(button(name));
};

/**
 * 지문·안내 문단을 문면 그대로 찾는다 — 지문은 여러 문단(`\n\n`)이라 공백을 접는 getByText가
 * 아니라 원문 비교로 찾는다(한 문단이 한 요소에 담긴다는 것도 이 찾기가 함께 건다).
 */
const paragraph = (text: string): HTMLElement => {
  const found = [...document.querySelectorAll<HTMLElement>("p")].find(
    (element) => element.textContent === text,
  );
  if (found === undefined) throw new Error(`문단을 찾지 못했다: ${text}`);
  return found;
};

/** 문면 조작(등장 연출의 `말을 끊는다`) — 행동 목록의 일부가 아니므로 행동 단언에서 뺀다. */
const REVEAL_CONTROL_LABELS: readonly string[] = ["말을 끊는다", "바로 보기"];

/** 화면의 행동 버튼 문면 — 건너뛰기 버튼을 제외한다. */
const actionLabels = (scope: HTMLElement): readonly string[] =>
  [...scope.querySelectorAll("button")]
    .map((element) => (element.textContent ?? "").trim())
    .filter((label) => !REVEAL_CONTROL_LABELS.includes(label));

/** 그 문면이 화면에 있는가 — 단어 span으로 감싸인 줄(루의 목소리)도 원문으로 찾는다. */
const hasText = (text: string): boolean =>
  [...document.querySelectorAll("p")].some((element) => element.textContent === text);

/** 사람들 화면의 창문 넷 — 순서는 CHARACTER_IDS 곧 좌상·우상·좌하·우하(田자)다. */
const windows = (): readonly HTMLElement[] => [
  ...screen.getByRole("list", { name: "사람들" }).querySelectorAll<HTMLElement>("li"),
];

/** 그 사람의 창문 하나. */
const windowOf = (character: CharacterId): HTMLElement => {
  const found = windows()[CHARACTER_IDS.indexOf(character)];
  if (found === undefined) throw new Error(`창문을 찾지 못했다: ${character}`);
  return found;
};

/** 한 일감의 잡담 한 줄 — 없으면 픽스처가 바뀐 것이다. */
const chatterOf = (job: JobCard, character: CharacterId): string => {
  const line = job.office.chatter.find((entry) => entry.character === character);
  if (line === undefined) throw new Error(`${character}의 잡담이 없다`);
  return line.text;
};

/** 장면 지문은 빈 줄을 문단 나눔으로 살리는 렌더를 쓴다(`\n\n` → 빈 줄). */
const expectPreLine = (text: string, where: string): void => {
  expect(paragraph(text).className, `${where}의 지문이 문단 나눔을 살리지 않는다`).toContain(
    "whitespace-pre-line",
  );
};

/** 장면 화면을 넘긴다 — 지문이 두 장이면 `계속`이 선다(쪽 넘김은 화면 로컬 상태다). */
const advanceScene = async (): Promise<void> => {
  if (screen.queryByRole("button", { name: "계속" }) !== null) await click("계속");
};

/** 지문을 콘텐츠가 정한 자리에서 가른 두 장(화면과 같은 계산). */
const sceneTexts = (job: (typeof CONTENT.jobs)[keyof typeof CONTENT.jobs]): readonly string[] => {
  const paragraphs = job.office.prompt.split("\n\n");
  const at = job.office.pageBreak;
  if (at <= 0 || at >= paragraphs.length) return [job.office.prompt];
  return [paragraphs.slice(0, at).join("\n\n"), paragraphs.slice(at).join("\n\n")];
};

/** 뒷정리 작업을 차례대로 고른다 — 작업 버튼의 이름은 세계 공통의 작업 문면이다. */
const pickTasks = async (tasks: readonly CleanupTaskId[]): Promise<void> => {
  for (const task of tasks) await click(CONTENT.cleanupTasks[task]);
};

/**
 * 엔진이 만들 상태를 그대로 주입한다. 화면은 스토어만 읽으므로 열린 행동 목록도 규칙으로
 * 다시 계산해 함께 넣는다 — 목록이 상태와 어긋나면 그건 화면이 아니라 픽스처의 잘못이다.
 */
const inject = (store: StoreApi<RunStore>, run: RunState): void => {
  store.setState({ run, lastReason: null, availableActions: availableActions(run) });
};

/** 상태 축이 숫자·미터로 오르는 문면 — 화면에 있으면 안 된다(설계 §4.1). */
const METER_PATTERNS: readonly RegExp[] = [
  /게이지/,
  /미터\s*[:：]?\s*\d/,
  /피로\s*[:：]?\s*\d/,
  /부상\s*[:：]?\s*\d/,
  /의심\s*[:：]?\s*\d/,
  /신뢰\s*[:：]?\s*\d/,
  /신뢰\s*바/,
  /체력/,
  /잔여\s*\d/,
];

/** 지금 화면 전체의 문면에 상태 수치·미터가 없다. */
const expectNoMeters = (where: string): void => {
  const text = document.body.textContent ?? "";
  const hits = METER_PATTERNS.flatMap((pattern) => (pattern.test(text) ? [pattern.source] : []));
  expect(hits, `${where}에서 상태 수치·미터 문면: ${hits.join(", ")}`).toEqual([]);
  expect(
    document.querySelector("meter, progress, [role='progressbar']"),
    `${where}에 미터 위젯이 있다`,
  ).toBeNull();
};

afterEach(cleanup);

test("사무실 → 공문 → 인원 선택 → 뒷정리 → 현장 — 프린터가 공문을 당기고, 뒷정리를 마쳐야 현장에 선다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  const job = CONTENT.jobs[JOB_IDS[0] ?? "gwanak"];

  // 사무실(산문 화면): 아침 지문과 뉴스 한 줄, 그리고 사람들 쪽으로 건너가는 행동 하나.
  expect(store.getState().run?.jobStep).toBe("office");
  expect(store.getState().run?.officeStage).toBe("scene");
  expect(screen.getByRole("heading", { name: job.title })).toBeDefined();
  const pages = sceneTexts(job);
  expect(paragraph(pages[0] ?? "")).toBeDefined();
  // 첫 장에는 뉴스도 행동도 없다 — 일러스트·풍경, 그리고 `계속`뿐이다. 둘째 장에서야 나머지가 선다.
  expect(screen.queryByText(job.office.news)).toBeNull();
  await advanceScene();
  expect(paragraph(pages[1] ?? "")).toBeDefined();
  expect(screen.getByText(job.office.news)).toBeDefined();
  expect(button(CONTENT.actions.office_next.label)).toBeDefined();

  await click(CONTENT.actions.office_next.label);
  expect(store.getState().run?.officeStage).toBe("people");

  // 사무실(사람들 화면): 네 사람의 줄(이름·잡담·말 걸기), 그리고 책상 위 프린터 오브젝트.
  for (const line of job.office.chatter) {
    expect(hasText(line.text)).toBe(true);
    expect(screen.getByText(CONTENT.characters[line.character].name)).toBeDefined();
  }
  expect(screen.getByText(job.office.printer)).toBeDefined();

  await click(CONTENT.actions.office_printer.label);
  expect(store.getState().run?.jobStep).toBe("briefing");

  // 전체화면 공문: A안 서식 — 발신명의, 메타 줄, 번호 항목(ol), 꼬리 줄.
  const documentCard = job.briefing.document;
  expect(screen.getByText(documentCard.heading)).toBeDefined();
  const meta = screen.getByRole("list", { name: "문서 머리" });
  const items = screen.getByRole("list", { name: "문서 본문" });
  expect(items.tagName).toBe("OL");
  for (const line of documentCard.meta) expect(meta.textContent).toContain(line);
  for (const item of documentCard.items) expect(items.textContent).toContain(item);
  expect(screen.getByText(documentCard.tail)).toBeDefined();
  for (const line of job.briefing.talk) expect(hasText(line.text)).toBe(true);

  await click(CONTENT.actions.briefing_ack.label);
  expect(store.getState().run?.jobStep).toBe("party");

  // 인원 선택: 네 사람의 카드가 모두 서고, 고른 이름이 배차표에 오르고, 비우면 다시 빈다.
  expect(paragraph(job.party.prompt)).toBeDefined();
  for (const line of job.party.notes) expect(hasText(line.text)).toBe(true);
  await click(CONTENT.actions.party_pick_dusik.label);
  expect(store.getState().run?.party).toContain("dusik");
  expect(screen.getByLabelText("선택한 인원").textContent).toContain(CONTENT.characters.dusik.name);

  await click(CONTENT.actions.party_reset.label);
  expect(store.getState().run?.party).toEqual([]);
  expect(screen.queryByLabelText("선택한 인원")).toBeNull();

  await click(CONTENT.actions.party_pick_dusik.label);
  await click(CONTENT.actions.party_go.label);
  expect(store.getState().run?.jobStep).toBe("cleanup");

  // 뒷정리: 지침서(site.document)와 그 자리의 지문, 작업 넷. 아직 아무것도 고르지 않았다.
  expect(screen.getByRole("region", { name: "뒷정리" })).toBeDefined();
  expect(screen.getByText(job.site.document.heading)).toBeDefined();
  expect(paragraph(job.cleanup.prompt)).toBeDefined();
  expect(screen.queryByLabelText("고른 순서")).toBeNull();
  for (const task of CLEANUP_TASK_IDS)
    expect(button(CONTENT.cleanupTasks[task]).disabled).toBe(false);

  await click(CONTENT.cleanupTasks.sign);
  expect(store.getState().run?.cleanupPicks).toEqual(["sign"]);
  expect(screen.getByLabelText("고른 순서").textContent).toContain(CONTENT.cleanupTasks.sign);
  // 이미 고른 작업은 비활성으로 남는다 — 같은 작업을 두 번 하지 않는다.
  expect(button(CONTENT.cleanupTasks.sign).disabled).toBe(true);

  // 지침서가 정한 순서 그대로 마저 고르고 나서야 현장으로 간다.
  await pickTasks(CLEANUP_TASK_IDS.filter((task) => task !== "sign"));
  expect(store.getState().run?.cleanupPicks).toEqual([...CLEANUP_TASK_IDS]);
  await click(CONTENT.actions.cleanup_finish.label);
  expect(store.getState().run?.jobStep).toBe("site");

  // 현장: 사건 제목·문서·지시·동행 대사(데려간 사람만 말한다), 그리고 그 현장의 행동.
  expect(screen.getByRole("heading", { name: job.site.title })).toBeDefined();
  expect(screen.getByText(job.site.document.heading)).toBeDefined();
  expect(paragraph(job.site.prompt)).toBeDefined();
  const party = store.getState().run?.party ?? [];
  for (const line of job.site.partyLines) {
    const spoke = party.includes(line.character);
    expect(hasText(line.text), `${line.character}의 현장 대사`).toBe(spoke);
  }
  expect(screen.getByRole("button", { name: CONTENT.actions.call_respond.label })).toBeDefined();
});

test("뒷정리 작업을 다 고르기 전에는 마침이 거부 문면으로 막히고, 고른 작업은 차례와 함께 남는다", async () => {
  const store = makeStore();
  inject(store, makeRun({ jobStep: "cleanup", cleanupPicks: ["sign", "power"] }));
  mount(store);

  // 지침 순서대로 두 작업을 고른 상태 — 고른 차례가 화면에 남는다(1..4).
  const picked = screen.getByLabelText("고른 순서");
  expect(picked.querySelector("ol")?.tagName).toBe("OL");
  expect([...picked.querySelectorAll("li")].map((li) => li.textContent)).toEqual([
    CONTENT.cleanupTasks.sign,
    CONTENT.cleanupTasks.power,
  ]);
  expect(button(CONTENT.cleanupTasks.sign).disabled).toBe(true);
  expect(button(CONTENT.cleanupTasks.power).disabled).toBe(true);
  expect(screen.getByText("1번째로 골랐다")).toBeDefined();
  expect(screen.getByText("2번째로 골랐다")).toBeDefined();
  expect(button(CONTENT.cleanupTasks.search).disabled).toBe(false);

  // 남은 작업이 있는 동안 마침은 거부 문면으로 답한다(가드는 규칙의 것이고 문면은 콘텐츠의 것).
  await click(CONTENT.actions.cleanup_finish.label);
  expect(screen.getByRole("alert").textContent).toBe(CONTENT.actions.cleanup_finish.deny);
  expect(store.getState().lastReason).toBe(CONTENT.actions.cleanup_finish.deny);
  expect(store.getState().run?.jobStep).toBe("cleanup");
  expect(store.getState().run?.cleanupPicks).toEqual(["sign", "power"]);
});

test("지침 순서로 고르든 섞어 고르든 마침은 열린다 — 등급은 문면으로도 숫자로도 없다", async () => {
  // 지침서는 안전 → 차단 → 확인 → 기록이지만, 화면은 고른 차례를 비출 뿐 판정하지 않는다.
  const ordered = makeStore();
  inject(ordered, makeRun({ jobStep: "cleanup", party: ["dusik"] }));
  mount(ordered);
  await pickTasks(CLEANUP_TASK_IDS);
  expect(ordered.getState().run?.cleanupPicks).toEqual([...CLEANUP_TASK_IDS]);
  await click(CONTENT.actions.cleanup_finish.label);
  expect(ordered.getState().run?.jobStep).toBe("site");

  cleanup();

  // 섞어 고른 회차도 같은 자리로 간다 — 결과를 가르는 값은 화면 밖에 있다.
  const mixed = makeStore();
  const MIXED: readonly CleanupTaskId[] = ["photo", "sign", "search", "power"];
  inject(mixed, makeRun({ jobStep: "cleanup", party: ["dusik"] }));
  mount(mixed);
  await pickTasks(MIXED);
  expect(mixed.getState().run?.cleanupPicks).toEqual([...MIXED]);
  const shown = screen.getByLabelText("고른 순서");
  expect([...shown.querySelectorAll("li")].map((li) => li.textContent)).toEqual(
    MIXED.map((task) => CONTENT.cleanupTasks[task]),
  );
  // 등급은 규칙 내부의 enum 값이다 — 화면 어디에도 그 이름이 뜨지 않는다(문면·수치 둘 다).
  expect(document.body.textContent ?? "").not.toMatch(/perfect|partial|poor/);
  expectNoMeters("뒷정리(섞어 고른 뒤)");
  await click(CONTENT.actions.cleanup_finish.label);
  expect(mixed.getState().run?.jobStep).toBe("site");
});

test("장면 지문은 빈 줄을 문단 나눔으로 살려 렌더된다 — whitespace-pre-line", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  const job = CONTENT.jobs[JOB_IDS[0] ?? "gwanak"];

  expectPreLine(sceneTexts(job)[0] ?? "", "사무실(장면) 첫 장");
  await advanceScene();
  expectPreLine(sceneTexts(job)[1] ?? "", "사무실(장면) 둘째 장");
  await advanceScene();
  await click(CONTENT.actions.office_next.label);
  await click(CONTENT.actions.office_printer.label);
  expectPreLine(job.briefing.prompt, "공문");
  await click(CONTENT.actions.briefing_ack.label);
  expectPreLine(job.party.prompt, "인원 선택");
  await click(CONTENT.actions.party_pick_dusik.label);
  await click(CONTENT.actions.party_go.label);
  expectPreLine(job.cleanup.prompt, "뒷정리");
  await pickTasks(CLEANUP_TASK_IDS);
  await click(CONTENT.actions.cleanup_finish.label);
  expectPreLine(job.site.prompt, "현장");

  // 절차 화면도 같은 규칙을 쓴다.
  cleanup();
  const chainStore = makeStore();
  inject(
    chainStore,
    makeRun({ jobIndex: 3, jobStep: "site", chainStep: "venue", pendingChain: ["venue"] }),
  );
  mount(chainStore);
  expectPreLine(CONTENT.chains.venue.prompt, "절차");
});

test("데려가지 않은 사람은 현장에서 말하지 않는다 — 현장 대사는 동행 기준으로 거른다", () => {
  const job = CONTENT.jobs.gwanak;
  const taesan = job.site.partyLines.find((line) => line.character === "taesan")?.text ?? "";
  const dusik = job.site.partyLines.find((line) => line.character === "dusik")?.text ?? "";
  expect(taesan).not.toBe("");
  expect(dusik).not.toBe("");

  const store = makeStore();
  inject(store, makeRun({ jobStep: "site", party: ["dusik"] }));
  mount(store);
  expect(hasText(dusik)).toBe(true);
  expect(hasText(taesan)).toBe(false);

  cleanup();

  // 동행이 바뀌면 말하는 사람도 바뀐다 — 줄이 사라진 게 아니라 자격이 바뀐 것이다.
  const other = makeStore();
  inject(other, makeRun({ jobStep: "site", party: ["taesan"] }));
  mount(other);
  expect(hasText(taesan)).toBe(true);
  expect(hasText(dusik)).toBe(false);
});

test("결장한 인원의 카드는 잠기고, 왜 못 세우는지가 사유 문면으로 붙는다", () => {
  const store = makeStore();
  inject(
    store,
    makeRun({
      jobIndex: 1,
      jobStep: "party",
      characters: {
        ...zeroCharacters(),
        ru: { fatigue: 0, injured: true, suspicion: 0, trust: 0 },
      },
    }),
  );
  mount(store);

  const injured = button(CONTENT.actions.party_pick_ru.label);
  expect(injured.disabled).toBe(true);
  // 사유는 행동 정본의 거부 문면 그대로이고, 카드가 아니라 잠긴 버튼에 붙는다.
  const reason = CONTENT.actions.party_pick_ru.deny;
  const describedBy = injured.getAttribute("aria-describedby");
  expect(describedBy).not.toBeNull();
  expect(reason).toMatch(/부상/);
  expect(reason).not.toMatch(/\d/);
  expect(document.getElementById(describedBy ?? "")?.textContent).toBe(reason);

  // 부상하지 않은 사람은 같은 화면에서 그대로 세울 수 있다 — 잠금은 사람 하나에만 걸린다.
  expect(button(CONTENT.actions.party_pick_banjang.label).disabled).toBe(false);
  expect(store.getState().run?.party).toEqual([]);
});

test("선택 없이 나서려는 party_go는 거부 문면으로 답하고 배차표를 그대로 둔다", async () => {
  const store = makeStore();
  inject(store, makeRun({ jobStep: "party" }));
  mount(store);

  await click(CONTENT.actions.party_go.label);
  expect(screen.getByRole("alert").textContent).toBe(CONTENT.actions.party_go.deny);
  expect(store.getState().lastReason).toBe(CONTENT.actions.party_go.deny);
  expect(store.getState().run?.jobStep).toBe("party");
  expect(store.getState().run?.party).toEqual([]);
});

test("어느 화면에도 상태 수치는 숫자·게이지·미터로 오르지 않는다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);

  expectNoMeters("사무실(장면)");
  await advanceScene();
  await click(CONTENT.actions.office_next.label);
  expectNoMeters("사무실(사람들)");
  await click(CONTENT.actions.office_printer.label);
  expectNoMeters("공문");
  await click(CONTENT.actions.briefing_ack.label);
  expectNoMeters("인원 선택");
  await click(CONTENT.actions.party_pick_dusik.label);
  expectNoMeters("인원 선택(선택 뒤)");
  await click(CONTENT.actions.party_go.label);
  expectNoMeters("뒷정리");
  // 고른 차례(1..4)는 상태 수치가 아니다 — 미터 문면은 고른 뒤에도 서지 않는다.
  await pickTasks(CLEANUP_TASK_IDS);
  expectNoMeters("뒷정리(고른 뒤)");
  await click(CONTENT.actions.cleanup_finish.label);
  expectNoMeters("현장");

  // 결장 사유도 숫자가 아니라 문면이다 — 잠긴 카드가 붙는 순간에도 수치가 없다.
  inject(
    store,
    makeRun({
      jobIndex: 2,
      jobStep: "party",
      characters: {
        ...zeroCharacters(),
        dusik: { fatigue: 0, injured: true, suspicion: 0, trust: 0 },
      },
    }),
  );
  // 주입한 상태가 실제로 화면에 섰는지 먼저 확인한다 — 재렌더 전 화면을 검사하는 공허한 통과 방지.
  expect(await screen.findByText(CONTENT.actions.party_pick_dusik.deny)).toBeDefined();
  expect(button(CONTENT.actions.party_pick_dusik.label).disabled).toBe(true);
  expectNoMeters("인원 선택(결장)");
  expect(store.getState().run?.party).toEqual([]);
});

test("회차가 도는 동안 종결의 이름은 어디에도 없다 — 기록은 행동의 결과 문면뿐이다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  await advanceScene();
  await click(CONTENT.actions.office_next.label);
  await click(CONTENT.actions.office_printer.label);

  // 공문 화면을 지나 인원 선택까지 간다 — 기록 패널이 있는 화면에서 기록을 읽는다.
  for (const id of ENDING_IDS) {
    expect(screen.queryByText(CONTENT.endings[id].title)).toBeNull();
  }
  await click(CONTENT.actions.briefing_ack.label);

  const record = screen.getByLabelText("회차 기록");
  expect(record.textContent).toContain(CONTENT.actions.office_printer.result);
  expect(record.textContent).not.toContain(CONTENT.actions.office_printer.deny);

  // 뒷정리 화면에도 기록 패널이 서지만, 거기서도 종결의 이름은 읽히지 않는다.
  await click(CONTENT.actions.party_pick_dusik.label);
  await click(CONTENT.actions.party_go.label);
  expect(screen.getByLabelText("회차 기록").textContent).toContain(CONTENT.actions.party_go.result);
  expect(screen.getByLabelText("회차 기록").textContent).not.toContain(
    CONTENT.actions.cleanup_finish.result,
  );
  for (const id of ENDING_IDS) {
    expect(screen.queryByText(CONTENT.endings[id].title)).toBeNull();
  }
});

/** a가 b보다 문서 순서에서 앞선다. */
const isBefore = (a: Element, b: Element): boolean =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

test("모든 단계 화면이 장면 묘사 → 문서/뉴스 → 인물 대사 순으로 읽힌다 — 대사로 시작하지 않는다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  const job = CONTENT.jobs[JOB_IDS[0] ?? "gwanak"];

  // 사무실(산문 화면): 첫 장은 일러스트와 풍경, 둘째 장에 남은 지문·뉴스·둘러보기가 온다.
  // 대사는 어느 장에도 없다.
  const scene = screen.getByRole("region", { name: "사무실" });
  expect(scene.firstElementChild?.tagName).toBe("H2");
  const prompt = paragraph(sceneTexts(job)[0] ?? "");
  // 첫 장: 제목 → (일러스트) → 지문 → 계속. 뉴스와 행동은 여기 없다.
  expect(scene.querySelector("svg[role='img']")).not.toBeNull();
  expect(isBefore(prompt, button("계속"))).toBe(true);
  expect(screen.queryByText(job.office.news)).toBeNull();
  await advanceScene();
  // 둘째 장: 지문 나머지 → 뉴스 → 둘러보기. 일러스트는 첫 장에만 걸린다.
  const rest = paragraph(sceneTexts(job)[1] ?? "");
  const news = screen.getByText(job.office.news);
  expect(scene.querySelector("svg[role='img']")).toBeNull();
  expect(isBefore(rest, news)).toBe(true);
  expect(isBefore(news, button(CONTENT.actions.office_next.label))).toBe(true);
  for (const line of job.office.chatter) {
    expect(document.body.textContent?.includes(line.text)).toBe(false);
  }

  await click(CONTENT.actions.office_next.label);

  // 사무실(사람들 화면): 첫 블록은 제목이고, 창문마다 초상 → 이름 → 잡담 → 말 걸기 순으로
  // 읽힌다(말 걸기 버튼이 창문 안의 마지막 줄로 선다). 창문 격자 아래에 프린터가 선다.
  const people = screen.getByRole("region", { name: "사무실 사람들" });
  expect(people.firstElementChild?.tagName).toBe("H2");
  expect(document.body.textContent?.includes(job.office.prompt)).toBe(false);
  const printer = screen.getByText(job.office.printer);
  for (const line of job.office.chatter) {
    const pane = windowOf(line.character);
    const name = screen.getByText(CONTENT.characters[line.character].name);
    const chatter = paragraph(line.text);
    const talk = within(pane).getByText(CONTENT.actions[`talk_${line.character}`].label);
    expect(pane.contains(name), `${line.character}의 이름이 창문 안에 있다`).toBe(true);
    expect(isBefore(name, chatter)).toBe(true);
    expect(isBefore(chatter, talk)).toBe(true);
    expect(isBefore(pane, printer)).toBe(true);
  }

  await click(CONTENT.actions.office_printer.label);

  // 공문: 어느 아침인지 알리는 장면 묘사가 문서 위에 서고, 문서 본문이 대사보다 앞선다.
  const docHeading = screen.getByText(job.briefing.document.heading);
  const briefing = screen.getByRole("region", { name: "공문" });
  const lead = job.briefing.prompt;
  if (lead) {
    expect(briefing.querySelector("p")?.textContent).toBe(lead);
    expect(isBefore(paragraph(lead), docHeading)).toBe(true);
  }
  expect(isBefore(screen.getByRole("heading", { name: job.title }), docHeading)).toBe(true);
  const items = screen.getByRole("list", { name: "문서 본문" });
  for (const line of job.briefing.talk) {
    expect(isBefore(items, screen.getByText(line.text))).toBe(true);
  }

  await click(CONTENT.actions.briefing_ack.label);

  // 인원 선택: 첫 문단이 선택 지시이고, 카드 안은 이름 → (사유) → 대사 순이다.
  expect(screen.getByRole("region", { name: "인원 선택" }).querySelector("p")?.textContent).toBe(
    job.party.prompt,
  );
  const partyPrompt = paragraph(job.party.prompt);
  for (const line of job.party.notes) {
    const name = screen.getByText(CONTENT.characters[line.character].name);
    const note = paragraph(line.text);
    expect(isBefore(partyPrompt, name)).toBe(true);
    expect(isBefore(name, note)).toBe(true);
  }

  await click(CONTENT.actions.party_pick_dusik.label);
  await click(CONTENT.actions.party_go.label);

  // 뒷정리: 제목 → 지침서(site.document) → 지문 → 고른 순서 → 작업 넷 → 마침. 이 화면에는
  // 대사가 없고, 첫 블록은 제목이다(대사로 시작하지 않는다).
  const cleanupScreen = screen.getByRole("region", { name: "뒷정리" });
  expect(cleanupScreen.firstElementChild?.tagName).toBe("H2");
  const cleanupTitle = screen.getByRole("heading", { name: job.title });
  const sheet = screen.getByText(job.site.document.heading);
  const cleanupPrompt = paragraph(job.cleanup.prompt);
  expect(isBefore(cleanupTitle, sheet)).toBe(true);
  expect(isBefore(sheet, cleanupPrompt)).toBe(true);

  await click(CONTENT.cleanupTasks.sign);
  const picked = screen.getByLabelText("고른 순서");
  expect(isBefore(cleanupPrompt, picked)).toBe(true);
  for (const task of CLEANUP_TASK_IDS) {
    expect(isBefore(picked, button(CONTENT.cleanupTasks[task]))).toBe(true);
  }

  // 표시 순서는 지침 순서와 **달라야 한다** — 배치가 정답을 알려주면 미니게임이 사라진다.
  // 순서를 아는 자리는 지침서 문서뿐이고, 버튼은 고정된 자기 자리에 선다.
  expect(CLEANUP_DISPLAY_ORDER.join()).not.toBe(CLEANUP_TASK_IDS.join());
  const taskNames = [...screen.getByLabelText("작업").querySelectorAll("button")].map(
    (element) => element.textContent,
  );
  expect(taskNames).toEqual(CLEANUP_DISPLAY_ORDER.map((task) => CONTENT.cleanupTasks[task]));
  const finish = button(CONTENT.actions.cleanup_finish.label);
  for (const task of CLEANUP_TASK_IDS) {
    expect(isBefore(button(CONTENT.cleanupTasks[task]), finish)).toBe(true);
  }

  await pickTasks(CLEANUP_TASK_IDS.filter((task) => task !== "sign"));
  await click(CONTENT.actions.cleanup_finish.label);

  // 현장: 제목 → 현장 문서 → 지문 → 동행 대사(그 회차에 데려간 사람의 줄).
  const site = CONTENT.jobs.gwanak.site;
  const title = screen.getByRole("heading", { name: site.title });
  const siteDoc = screen.getByText(site.document.heading);
  const sitePrompt = paragraph(site.prompt);
  expect(isBefore(title, siteDoc)).toBe(true);
  expect(isBefore(siteDoc, sitePrompt)).toBe(true);
  const party = store.getState().run?.party ?? [];
  for (const line of site.partyLines.filter((l) => party.includes(l.character))) {
    expect(isBefore(sitePrompt, screen.getByText(line.text))).toBe(true);
  }
});

test("공문 지문이 있으면 그 줄이 문서 위 첫 블록이 된다 — 공문을 대사로 시작하지 않는다", () => {
  const LEAD = "둘째 아침이다. 프린터가 뱉은 종이에는 오늘의 마감이 이미 적혀 있다.";
  const store = makeStore();
  inject(store, makeRun({ jobStep: "briefing" }));
  const content: Content = {
    ...CONTENT,
    jobs: {
      ...CONTENT.jobs,
      gwanak: {
        ...CONTENT.jobs.gwanak,
        briefing: { ...CONTENT.jobs.gwanak.briefing, prompt: LEAD },
      },
    },
  };
  render(
    <RunStoreContext value={store}>
      <ContentContext value={content}>
        <PlayScreen />
      </ContentContext>
    </RunStoreContext>,
  );

  const job = content.jobs.gwanak;
  const briefing = screen.getByRole("region", { name: "공문" });
  // 등장 애니메이션이 단어를 span으로 감싸므로(getByText는 직접 텍스트 노드만 본다) 원문 찾기를 쓴다.
  const lead = paragraph(LEAD);
  const docHeading = screen.getByText(job.briefing.document.heading);
  expect(briefing.querySelector("p")?.textContent).toBe(LEAD);
  expect(isBefore(lead, docHeading)).toBe(true);
  for (const line of job.briefing.talk) {
    expect(isBefore(docHeading, screen.getByText(line.text))).toBe(true);
  }
});

test("파견을 정하는 아침에는 사람들 화면에 프린터와 파견 결정 액션이 함께 선다", () => {
  const store = makeStore();
  inject(store, makeRun({ jobIndex: 1, jobStep: "office", officeStage: "people" }));
  mount(store);

  const job = CONTENT.jobs[JOB_IDS[1] ?? "observatory"];
  expect(screen.getByRole("heading", { name: job.title })).toBeDefined();
  expect(screen.getByText(job.office.printer)).toBeDefined();
  expect(button(CONTENT.actions.dispatch_send_taesan.label)).toBeDefined();
  expect(button(CONTENT.actions.dispatch_send_other.label)).toBeDefined();
  // 파견은 사무실 밖으로 나가는 문이라 면담과 마찬가지로 사람들 화면에서만 열린다.
  expect(screen.queryByText(CONTENT.actions.office_next.label)).toBeNull();
});

test("본부의 아침에는 프린터 대신 라디오 두 갈래가 사람들 화면에 선다", async () => {
  const store = makeStore();
  inject(store, makeRun({ jobIndex: 2, jobStep: "office", officeStage: "people" }));
  mount(store);

  const job = CONTENT.jobs[JOB_IDS[2] ?? "hq"];
  expect(screen.queryByText(job.office.printer)).toBeNull();
  expect(button(CONTENT.actions.radio_morning_on.label)).toBeDefined();
  expect(button(CONTENT.actions.radio_business_only.label)).toBeDefined();
  // 라디오를 업무로만 처리하면 사무실을 떠난다 — 그 뒤에는 아침 조회의 축이 초기값이다.
  await click(CONTENT.actions.radio_business_only.label);
  expect(store.getState().run?.jobStep).toBe("briefing");
  expect(store.getState().run?.officeStage).toBe("scene");
});

test("절차가 끼어들면 일감 화면 대신 절차 화면이 선다", () => {
  const store = makeStore();
  inject(
    store,
    makeRun({ jobIndex: 3, jobStep: "site", chainStep: "venue", pendingChain: ["venue"] }),
  );
  mount(store);

  const chain = CONTENT.chains.venue;
  const title = screen.getByRole("heading", { name: chain.title });
  const documentCard = screen.getByText(chain.document.heading);
  const prompt = paragraph(chain.prompt);
  for (const line of chain.partyLines) expect(hasText(line.text)).toBe(true);
  expect(screen.queryByRole("heading", { name: CONTENT.jobs.ruins.site.title })).toBeNull();
  // 절차 화면도 같은 순서다: 제목 → 문서 → 지문 → 대사.
  expect(isBefore(title, documentCard)).toBe(true);
  expect(isBefore(documentCard, prompt)).toBe(true);
  for (const line of chain.partyLines) {
    expect(isBefore(prompt, paragraph(line.text))).toBe(true);
  }
});

test("아침 조회: 장면 → 사람들 → 말 걸기 → 응답 → 닫기 → 프린터 — 면담의 답이 그 자리에 남는다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  const job = CONTENT.jobs[JOB_IDS[0] ?? "gwanak"];

  // 장면(산문) — 읽는 화면이고 행동은 둘러보기 하나뿐이다.
  await advanceScene();
  expect(button(CONTENT.actions.office_next.label)).toBeDefined();
  expect(screen.queryByText(job.office.printer)).toBeNull();

  await advanceScene();
  await click(CONTENT.actions.office_next.label);
  expect(store.getState().run?.officeStage).toBe("people");

  await click(CONTENT.actions.talk_dusik.label);
  expect(store.getState().run?.interview).toEqual({ character: "dusik", choice: null });

  // 면담: 첫 블록은 제목이지 대사가 아니다(이름 → 먼저 하는 말 → 응답 셋).
  const interview = screen.getByRole("region", { name: "면담" });
  expect(interview.firstElementChild?.tagName).toBe("H2");
  const card = CONTENT.interviews[job.id].dusik;
  const name = screen.getByText(CONTENT.characters.dusik.name);
  const opening = paragraph(card.opening);
  expect(opening.className).toContain("whitespace-pre-line");
  expect(isBefore(name, opening)).toBe(true);
  expect(isBefore(opening, button(CONTENT.actions.interview_reply_work.label))).toBe(true);
  expect(button(CONTENT.actions.interview_reply_comfort.label)).toBeDefined();
  expect(button(CONTENT.actions.interview_reply_joke.label)).toBeDefined();
  // 고르기 전에는 답도 마치는 버튼도 없고, 면담 중에는 사무실 밖으로 나가는 문도 닫힌다.
  expect(document.body.textContent?.includes(card.replies.work)).toBe(false);
  expect(screen.queryByRole("button", { name: CONTENT.actions.interview_close.label })).toBeNull();
  expect(screen.queryByRole("button", { name: CONTENT.actions.office_printer.label })).toBeNull();
  expectNoMeters("면담");

  await click(CONTENT.actions.interview_reply_work.label);
  expect(store.getState().run?.interview).toEqual({ character: "dusik", choice: "work" });
  // 고른 응답의 답이 그 자리에 남고, 응답 셋은 물러난다 — 남는 것은 그 사람의 말뿐이다.
  expect(paragraph(card.replies.work)).toBeDefined();
  expect(
    screen.queryByRole("button", { name: CONTENT.actions.interview_reply_work.label }),
  ).toBeNull();
  expect(button(CONTENT.actions.interview_close.label)).toBeDefined();
  expectNoMeters("면담(응답 뒤)");

  await click(CONTENT.actions.interview_close.label);
  expect(store.getState().run?.interview).toBeNull();
  expect(store.getState().run?.talks).toEqual(["dusik"]);

  // 사람들 화면으로 돌아온다: 오늘 이야기한 사람에게는 버튼 대신 거부 문면이 서고,
  // 아직 이야기하지 않은 사람의 버튼은 그대로 남는다.
  expect(screen.queryByRole("button", { name: CONTENT.actions.talk_dusik.label })).toBeNull();
  expect(screen.getByText(CONTENT.actions.talk_dusik.deny)).toBeDefined();
  expect(button(CONTENT.actions.talk_ru.label)).toBeDefined();

  await click(CONTENT.actions.office_printer.label);
  expect(store.getState().run?.jobStep).toBe("briefing");
  // 사무실을 떠나면 아침 조회의 세 축은 초기값이다 — 일감이 곧 하루다.
  expect(store.getState().run?.officeStage).toBe("scene");
  expect(store.getState().run?.talks).toEqual([]);
  expect(store.getState().run?.interview).toBeNull();
});

test("장면 화면에는 산문만 있다 — 사람들·프린터·현황은 사람들 화면에 선다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  const job = CONTENT.jobs[JOB_IDS[0] ?? "gwanak"];

  const scene = screen.getByRole("region", { name: "사무실" });
  expect(paragraph(sceneTexts(job)[0] ?? "")).toBeDefined();
  await advanceScene();
  expect(screen.getByText(job.office.news)).toBeDefined();
  expect(actionLabels(scene)).toEqual([CONTENT.actions.office_next.label]);
  for (const line of job.office.chatter) {
    expect(document.body.textContent?.includes(line.text)).toBe(false);
  }
  expect(screen.queryByText(job.office.printer)).toBeNull();
  expect(screen.queryByLabelText("현황")).toBeNull();

  await advanceScene();
  await click(CONTENT.actions.office_next.label);

  // 사람들 화면: 제목 아래에 네 사람의 창문이 격자로 서고, 지문과 뉴스는 여기 다시 오지
  // 않는다(같은 아침을 두 번 읽지 않는다). 프린터와 현황은 이 화면의 몫이다.
  const people = screen.getByRole("region", { name: "사무실 사람들" });
  expect(people.firstElementChild?.tagName).toBe("H2");
  expect(document.body.textContent?.includes(job.office.prompt)).toBe(false);
  expect(screen.queryByText(job.office.news)).toBeNull();
  for (const line of job.office.chatter) {
    const pane = windowOf(line.character);
    expect(pane.contains(screen.getByText(CONTENT.characters[line.character].name))).toBe(true);
    expect(pane.contains(paragraph(line.text))).toBe(true);
    expect(button(CONTENT.actions[`talk_${line.character}`].label)).toBeDefined();
  }
  expect(screen.getByText(job.office.printer)).toBeDefined();
  expect(screen.getByLabelText("현황")).toBeDefined();
});

test("사람들 화면은 네 사람을 田자 창문 격자로 세운다 — 창문마다 초상·이름·잡담·말 걸기가 담긴다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  const job = CONTENT.jobs[JOB_IDS[0] ?? "gwanak"];
  await advanceScene();
  await click(CONTENT.actions.office_next.label);

  // 田자 = 2열 격자. 창문 넷이 좌상·우상·좌하·우하(CHARACTER_IDS 순서)로 앉는다.
  const grid = screen.getByRole("list", { name: "사람들" });
  expect(grid.className).toContain("grid");
  expect(grid.className).toContain("grid-cols-2");
  expect(windows()).toHaveLength(CHARACTER_IDS.length);
  // 좌상·우상·좌하·우하 — 문서 순서가 곧 CHARACTER_IDS 순서다.
  for (const [index, character] of CHARACTER_IDS.entries()) {
    expect(windows()[index]?.textContent).toContain(CONTENT.characters[character].name);
  }

  for (const character of CHARACTER_IDS) {
    const pane = windowOf(character);
    const name = CONTENT.characters[character].name;
    const label = CONTENT.actions[`talk_${character}`].label;
    // 창문은 격자의 칸(li)이고 2px 프레임을 두른다 — 버튼이 아니라 프레임이다(안에 문단이 산다).
    expect(pane.tagName).toBe("LI");
    expect(pane.className).toContain("border-2");
    // 창문마다 초상 한 장 — 얼굴이 면담보다 먼저 걸린다(초상 → 이름 → 잡담 → 말 걸기).
    expect(
      [...pane.querySelectorAll("svg[role='img']")].map((svg) => svg.getAttribute("aria-label")),
      `${name}의 초상`,
    ).toEqual([name]);
    const portrait = pane.querySelector("svg[role='img']");
    if (portrait !== null) expect(isBefore(portrait, paragraph(name))).toBe(true);
    expect(pane.contains(paragraph(chatterOf(job, character)))).toBe(true);
    // 창문 안에서 만질 수 있는 것은 말 걸기 버튼 하나뿐이다 — 컨트롤 최소 높이(44px)를 지킨다.
    const talk = within(pane).getByRole("button", { name: label });
    expect(talk.className).toContain("min-h-11");
    // 루의 창문에는 문면 조작(`말을 끊는다`)이 함께 설 수 있다 — 세는 것은 말 걸기뿐이다.
    expect(actionLabels(pane)).toEqual([label]);
    expect(isBefore(paragraph(chatterOf(job, character)), talk)).toBe(true);
  }

  // 격자 안의 버튼은 넷뿐이다 — 창문(프레임)은 행동으로 세어지지 않고, 말 걸기만 선다.
  expect(actionLabels(grid)).toEqual(
    CHARACTER_IDS.map((character) => CONTENT.actions[`talk_${character}`].label),
  );

  // 읽는 순서: 제목 → 사람들 격자 → 프린터 → 현황 → 나머지 행동.
  const people = screen.getByRole("region", { name: "사무실 사람들" });
  expect(people.firstElementChild?.tagName).toBe("H2");
  expect(isBefore(grid, screen.getByText(job.office.printer))).toBe(true);
  expect(isBefore(screen.getByText(job.office.printer), screen.getByLabelText("현황"))).toBe(true);
  expect(
    isBefore(screen.getByLabelText("현황"), screen.getByRole("region", { name: "행동" })),
  ).toBe(true);

  // 루의 잡담만 단어 span으로 그려진다 — 느린 박자와 다른 서체가 이 화면에서도 보인다.
  const ru = paragraph(chatterOf(job, "ru"));
  expect(ru.className).toContain("reclaim-voice-ru");
  const words = [...ru.querySelectorAll("span.reclaim-reveal-word")];
  expect(words).toHaveLength(chatterOf(job, "ru").split(" ").length);
  expect(words.map((span) => span.textContent).join(" ")).toBe(chatterOf(job, "ru"));
  // 나머지 셋은 한 줄 문면 그대로다 — 목소리가 붙는 사람과 아닌 사람이 갈린다.
  for (const character of CHARACTER_IDS.filter((id) => id !== "ru")) {
    const plain = paragraph(chatterOf(job, character));
    expect(plain.className, `${character}의 잡담`).not.toContain("reclaim-voice-ru");
    expect(plain.querySelectorAll("span")).toHaveLength(0);
  }
});

test("오늘 이야기를 나눈 사람에게는 말 걸기 버튼이 서지 않고 거부 문면이 남는다", async () => {
  const store = makeStore();
  inject(store, makeRun({ jobStep: "office", officeStage: "people", talks: ["banjang"] }));
  mount(store);

  // 창문은 격자 그대로 넷 — 면담을 나눈 사람의 자리가 비지 않는다.
  expect(windows()).toHaveLength(CHARACTER_IDS.length);
  const talked = windowOf("banjang");
  expect(talked.tagName).toBe("LI");
  expect(talked.contains(screen.getByText(CONTENT.characters.banjang.name))).toBe(true);
  expect(screen.queryByRole("button", { name: CONTENT.actions.talk_banjang.label })).toBeNull();
  expect(within(talked).queryByRole("button")).toBeNull();
  // 그 창문에는 그 행동의 거부 문면이 META 줄로 남는다(하루 한 번은 숫자가 아니라 문면이다).
  const deny = within(talked).getByText(CONTENT.actions.talk_banjang.deny);
  expect(deny.className).toContain("text-xs");
  // 창문은 사라지지 않고 초상도 그대로 걸려 있다 — 잠긴 것은 동작뿐이다.
  expect(within(talked).getByRole("img", { name: CONTENT.characters.banjang.name })).toBeDefined();
  // 격자에 남은 말 걸기는 셋이다(문면 조작은 행동이 아니다).
  expect(actionLabels(screen.getByRole("list", { name: "사람들" }))).toHaveLength(
    CHARACTER_IDS.length - 1,
  );
  // 하루 한 번은 사람마다다 — 다른 사람의 창문은 그대로 열려 있다.
  expect(
    within(windowOf("taesan")).getByRole("button", { name: CONTENT.actions.talk_taesan.label }),
  ).toBeDefined();
  await click(CONTENT.actions.talk_taesan.label);
  expect(store.getState().run?.interview?.character).toBe("taesan");
  expect(store.getState().run?.talks).toEqual(["banjang"]);
  expect(screen.getByRole("region", { name: "면담" })).toBeDefined();
});

test("면담 화면은 대사로 시작하지 않는다 — 면담 중에는 사무실 밖으로도 나가지 못한다", () => {
  const store = makeStore();
  inject(
    store,
    makeRun({
      jobStep: "office",
      officeStage: "people",
      interview: { character: "ru", choice: null },
    }),
  );
  mount(store);

  const interview = screen.getByRole("region", { name: "면담" });
  expect(interview.firstElementChild?.tagName).toBe("H2");
  const card = CONTENT.interviews.gwanak.ru;
  expect(screen.getByText(CONTENT.characters.ru.name)).toBeDefined();
  expect(paragraph(card.opening)).toBeDefined();
  expect(button(CONTENT.actions.interview_reply_joke.label)).toBeDefined();
  expect(screen.queryByRole("button", { name: CONTENT.actions.interview_close.label })).toBeNull();
  expect(screen.queryByRole("button", { name: CONTENT.actions.office_printer.label })).toBeNull();
});

test("pageBreak가 0이면 장면은 한 장이다 — 계속 없이 곧바로 행동이 선다", () => {
  const store = makeStore();
  const job = CONTENT.jobs.gwanak;
  const content: Content = {
    ...CONTENT,
    jobs: { ...CONTENT.jobs, gwanak: { ...job, office: { ...job.office, pageBreak: 0 } } },
  };
  store.getState().start();
  render(
    <RunStoreContext value={store}>
      <ContentContext value={content}>
        <PlayScreen />
      </ContentContext>
    </RunStoreContext>,
  );

  expect(paragraph(CONTENT.jobs.gwanak.office.prompt)).toBeDefined();
  expect(screen.queryByRole("button", { name: "계속" })).toBeNull();
  expect(button(CONTENT.actions.office_next.label)).toBeDefined();
});

test("면담은 루가 아니어도 지문처럼 뜬다 — 연출(느린 박자·끊기)만 루의 것이다", async () => {
  const store = makeStore();
  inject(store, makeRun({ jobStep: "office", officeStage: "people" }));
  mount(store);

  await click(CONTENT.actions.talk_taesan.label);
  const opening = paragraph(CONTENT.interviews.gwanak.taesan.opening);
  // 지문 자리이므로 단어 span으로 뜨고, 문단 나눔을 살린다.
  expect(opening.querySelectorAll(".reclaim-reveal-word").length).toBeGreaterThan(0);
  expect(opening.className).toContain("whitespace-pre-line");
  expect(opening.className).not.toContain("reclaim-voice-ru");
  // 끊기는 루에게만 있다 — 배태산의 면담에는 그 버튼이 서지 않는다.
  expect(screen.queryByRole("button", { name: "말을 끊는다" })).toBeNull();
});
