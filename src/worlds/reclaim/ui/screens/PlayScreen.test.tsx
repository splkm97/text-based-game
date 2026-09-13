// @vitest-environment jsdom

// 플레이 화면 계약(일감 구조): 사무실 → 전체화면 공문 → 인원 선택 → 현장 전이를 **실제
// 스토어**로 돌리고, 결장한 인원의 카드가 사유 문면과 함께 잠기는 것, 선택 없이 나서려는
// `party_go`가 거부 문면으로 답하는 것, 상태 축(피로·부상·의심·신뢰)이 숫자·미터로 화면에
// 오르지 않는 것, 회차가 도는 동안 종결 이름이 어디에도 없는 것을 단언한다.
//
// 스토어는 메모리 스토리지 위에서 만들고 컨텍스트로 주입한다 — 싱글턴 runStore는 쓰지 않는다.
// 문면 단언은 전부 주입한 CONTENT에서 읽는다(하드코딩 0).

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import type { StoreApi } from "zustand/vanilla";
import { memoryStorage } from "../../../../shared/storage";
import { CONTENT } from "../../content";
import { ENDING_IDS, JOB_IDS } from "../../ids";
import { availableActions } from "../../rules/run";
import { makeRun, zeroCharacters } from "../../rules/testContent";
import { createPersistence } from "../../store/persistence";
import { createRunStore, type RunStore } from "../../store/runStore";
import type { Content, RunState } from "../../types";
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

test("사무실 → 공문 → 인원 선택 → 현장 — 프린터가 공문을 당기고, 이름을 세워야 현장에 선다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  const job = CONTENT.jobs[JOB_IDS[0] ?? "gwanak"];

  // 사무실: 아침 지문·뉴스·잡담, 그리고 책상 위 프린터 오브젝트.
  expect(store.getState().run?.jobStep).toBe("office");
  expect(screen.getByRole("heading", { name: job.title })).toBeDefined();
  expect(screen.getByText(job.office.prompt)).toBeDefined();
  expect(screen.getByText(job.office.news)).toBeDefined();
  for (const line of job.office.chatter) {
    expect(screen.getByText(line.text)).toBeDefined();
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
  for (const line of job.briefing.talk) expect(screen.getByText(line.text)).toBeDefined();

  await click(CONTENT.actions.briefing_ack.label);
  expect(store.getState().run?.jobStep).toBe("party");

  // 인원 선택: 네 사람의 카드가 모두 서고, 고른 이름이 배차표에 오르고, 비우면 다시 빈다.
  expect(screen.getByText(job.party.prompt)).toBeDefined();
  for (const line of job.party.notes) expect(screen.getByText(line.text)).toBeDefined();
  await click(CONTENT.actions.party_pick_dusik.label);
  expect(store.getState().run?.party).toContain("dusik");
  expect(screen.getByLabelText("선택한 인원").textContent).toContain(CONTENT.characters.dusik.name);

  await click(CONTENT.actions.party_reset.label);
  expect(store.getState().run?.party).toEqual([]);
  expect(screen.queryByLabelText("선택한 인원")).toBeNull();

  await click(CONTENT.actions.party_pick_dusik.label);
  await click(CONTENT.actions.party_go.label);
  expect(store.getState().run?.jobStep).toBe("site");

  // 현장: 사건 제목·문서·지시·동행 대사(데려간 사람만 말한다), 그리고 그 현장의 행동.
  expect(screen.getByRole("heading", { name: job.site.title })).toBeDefined();
  expect(screen.getByText(job.site.document.heading)).toBeDefined();
  expect(screen.getByText(job.site.prompt)).toBeDefined();
  const party = store.getState().run?.party ?? [];
  for (const line of job.site.partyLines) {
    const spoke = party.includes(line.character);
    expect(screen.queryByText(line.text) === null).toBe(!spoke);
  }
  expect(screen.getByRole("button", { name: CONTENT.actions.call_respond.label })).toBeDefined();
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
  expect(screen.getByText(dusik)).toBeDefined();
  expect(screen.queryByText(taesan)).toBeNull();

  cleanup();

  // 동행이 바뀌면 말하는 사람도 바뀐다 — 줄이 사라진 게 아니라 자격이 바뀐 것이다.
  const other = makeStore();
  inject(other, makeRun({ jobStep: "site", party: ["taesan"] }));
  mount(other);
  expect(screen.getByText(taesan)).toBeDefined();
  expect(screen.queryByText(dusik)).toBeNull();
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

test("네 화면 어디에도 상태 수치는 숫자·게이지·미터로 오르지 않는다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);

  expectNoMeters("사무실");
  await click(CONTENT.actions.office_printer.label);
  expectNoMeters("공문");
  await click(CONTENT.actions.briefing_ack.label);
  expectNoMeters("인원 선택");
  await click(CONTENT.actions.party_pick_dusik.label);
  expectNoMeters("인원 선택(선택 뒤)");
  await click(CONTENT.actions.party_go.label);
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
  expectNoMeters("인원 선택(결장)");
  expect(store.getState().run?.party).toEqual([]);
});

test("회차가 도는 동안 종결의 이름은 어디에도 없다 — 기록은 행동의 결과 문면뿐이다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  await click(CONTENT.actions.office_printer.label);

  // 공문 화면을 지나 인원 선택까지 간다 — 기록 패널이 있는 화면에서 기록을 읽는다.
  for (const id of ENDING_IDS) {
    expect(screen.queryByText(CONTENT.endings[id].title)).toBeNull();
  }
  await click(CONTENT.actions.briefing_ack.label);

  const record = screen.getByLabelText("회차 기록");
  expect(record.textContent).toContain(CONTENT.actions.office_printer.result);
  expect(record.textContent).not.toContain(CONTENT.actions.office_printer.deny);
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

  // 사무실: 첫 문단이 아침 지문이고, 뉴스·프린터가 그 뒤, 잡담이 맨 아래다.
  expect(screen.getByRole("region", { name: "사무실" }).querySelector("p")?.textContent).toBe(
    job.office.prompt,
  );
  const prompt = screen.getByText(job.office.prompt);
  const news = screen.getByText(job.office.news);
  const printer = screen.getByText(job.office.printer);
  expect(isBefore(prompt, news)).toBe(true);
  expect(isBefore(news, printer)).toBe(true);
  for (const line of job.office.chatter) {
    expect(isBefore(prompt, screen.getByText(line.text))).toBe(true);
    expect(isBefore(printer, screen.getByText(line.text))).toBe(true);
  }

  await click(CONTENT.actions.office_printer.label);

  // 공문: 어느 아침인지 알리는 장면 묘사가 문서 위에 서고, 문서 본문이 대사보다 앞선다.
  const docHeading = screen.getByText(job.briefing.document.heading);
  const briefing = screen.getByRole("region", { name: "공문" });
  const lead = job.briefing.prompt;
  if (lead) {
    expect(briefing.querySelector("p")?.textContent).toBe(lead);
    expect(isBefore(screen.getByText(lead), docHeading)).toBe(true);
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
  const partyPrompt = screen.getByText(job.party.prompt);
  for (const line of job.party.notes) {
    const name = screen.getByText(CONTENT.characters[line.character].name);
    const note = screen.getByText(line.text);
    expect(isBefore(partyPrompt, name)).toBe(true);
    expect(isBefore(name, note)).toBe(true);
  }

  await click(CONTENT.actions.party_pick_dusik.label);
  await click(CONTENT.actions.party_go.label);

  // 현장: 제목 → 현장 문서 → 지문 → 동행 대사(그 회차에 데려간 사람의 줄).
  const site = CONTENT.jobs.gwanak.site;
  const title = screen.getByRole("heading", { name: site.title });
  const siteDoc = screen.getByText(site.document.heading);
  const sitePrompt = screen.getByText(site.prompt);
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
  const lead = screen.getByText(LEAD);
  const docHeading = screen.getByText(job.briefing.document.heading);
  expect(briefing.querySelector("p")?.textContent).toBe(LEAD);
  expect(isBefore(lead, docHeading)).toBe(true);
  for (const line of job.briefing.talk) {
    expect(isBefore(docHeading, screen.getByText(line.text))).toBe(true);
  }
});

test("파견을 정하는 아침에는 프린터와 함께 파견 결정 액션이 선다", () => {
  const store = makeStore();
  inject(store, makeRun({ jobIndex: 1, jobStep: "office" }));
  mount(store);

  const job = CONTENT.jobs[JOB_IDS[1] ?? "observatory"];
  expect(screen.getByRole("heading", { name: job.title })).toBeDefined();
  expect(screen.getByText(job.office.printer)).toBeDefined();
  expect(button(CONTENT.actions.dispatch_send_taesan.label)).toBeDefined();
  expect(button(CONTENT.actions.dispatch_send_other.label)).toBeDefined();
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
  const prompt = screen.getByText(chain.prompt);
  for (const line of chain.partyLines) expect(screen.getByText(line.text)).toBeDefined();
  expect(screen.queryByRole("heading", { name: CONTENT.jobs.ruins.site.title })).toBeNull();
  // 절차 화면도 같은 순서다: 제목 → 문서 → 지문 → 대사.
  expect(isBefore(title, documentCard)).toBe(true);
  expect(isBefore(documentCard, prompt)).toBe(true);
  for (const line of chain.partyLines) {
    expect(isBefore(prompt, screen.getByText(line.text))).toBe(true);
  }
});
