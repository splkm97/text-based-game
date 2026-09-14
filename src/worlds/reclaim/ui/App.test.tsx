// @vitest-environment jsdom

// 앱 셸 계약(일감 구조): 새 회차는 사무실 화면으로 들어가고, 종결이면 종결 화면이 카드를
// 보여주며, 기록 화면은 **달성한 종결만** 이름과 횟수를 내보낸다 — 미달성 종결의 이름은
// 어디에도 없다(설계 §4.2: 이름을 읽는 순간이 그 결말에 도달한 순간이다).
//
// 앱 싱글턴이 아니라 메모리 스토리지 위에서 만든 스토어를 컨텍스트로 주입한다.
// onStart·onEnding은 프로덕션 싱글턴과 같은 연결로 meta에 기록을 남긴다.

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { StoreApi } from "zustand/vanilla";
import { memoryStorage } from "../../../shared/storage";
import { CONTENT } from "../content";
import { ENDING_IDS } from "../ids";
import { makeRun } from "../rules/testContent";
import { createMetaStore, type MetaStore } from "../store/metaStore";
import { createMetaPersistence, createPersistence } from "../store/persistence";
import { createRunStore, type RunStore } from "../store/runStore";
import { App } from "./App";
import { MetaStoreContext } from "./metaStoreContext";
import { RunStoreContext } from "./runStoreContext";
import { useScreenStore } from "./screenStore";

type Stores = { readonly meta: StoreApi<MetaStore>; readonly run: StoreApi<RunStore> };

const NOW = "2026-09-14T09:00:00.000Z";

const makeStores = (): Stores => {
  const meta = createMetaStore({
    now: () => NOW,
    persistence: createMetaPersistence(memoryStorage()),
  });
  const run = createRunStore({
    content: CONTENT,
    persistence: createPersistence(memoryStorage()),
    onStart: () => meta.getState().recordRun(),
    onEnding: (ending) => meta.getState().recordEnding(ending),
  });
  return { meta, run };
};

const renderApp = (stores: Stores = makeStores(), onExit: () => void = () => {}) => {
  render(
    <RunStoreContext value={stores.run}>
      <MetaStoreContext value={stores.meta}>
        <App onExit={onExit} />
      </MetaStoreContext>
    </RunStoreContext>,
  );
  return { stores, onExit };
};

const button = (name: string) => screen.getByRole<HTMLButtonElement>("button", { name });

beforeEach(() => {
  useScreenStore.setState({ screen: "title" });
});

afterEach(cleanup);

test("타이틀에서 새 회차를 시작하면 첫 일감의 사무실 화면으로 들어간다", async () => {
  const { stores } = renderApp();
  expect(screen.queryByRole("button", { name: "이어하기" })).toBeNull();
  await userEvent.click(button("새 회차"));
  expect(stores.run.getState().run?.jobStep).toBe("office");
  expect(stores.run.getState().run?.jobIndex).toBe(0);
  // 아침은 사무실의 첫 하위 단계(산문 화면)에서 시작한다 — 사람들 화면과 그 책상 위 프린터는
  // 그다음 단계의 것이다(면회실 구조). 여기서 거는 것은 "어느 화면에 들어왔는가"다.
  expect(stores.run.getState().run?.officeStage).toBe("scene");
  expect(screen.getByRole("heading", { name: CONTENT.jobs.gwanak.title })).toBeDefined();
  // 산문 화면은 그 아침의 지문을 한 요소에 문단째로 내보낸다(문단 나눔은 pre-line이 살린다).
  const firstScene = CONTENT.jobs.gwanak.office.prompt
    .split("\n\n")
    .slice(0, CONTENT.jobs.gwanak.office.pageBreak)
    .join("\n\n");
  expect(screen.getByText((_text, element) => element?.textContent === firstScene)).toBeDefined();
  // 지문이 두 장이면 마지막 장에서야 행동이 선다 — 첫 장은 산문과 일러스트뿐이다.
  const 계속 = screen.queryByRole("button", { name: "계속" });
  if (계속 !== null) await userEvent.click(계속);
  expect(button(CONTENT.actions.office_next.label)).toBeDefined();
});

test("종결 상태면 종결 화면이 카드를 보여준다", () => {
  const stores = makeStores();
  stores.run.setState({ run: makeRun({ jobStep: "site", terminal: "death" }) });
  renderApp(stores);
  expect(screen.getByRole("heading", { name: CONTENT.endings.death.title })).toBeDefined();
  // 종결 본문은 단어 span으로 렌더된다 — 직접 텍스트 노드를 보는 getByText 대신 원문 비교로 찾는다.
  const endingText = [...document.querySelectorAll("p")].find(
    (element) => element.textContent === CONTENT.endings.death.text,
  );
  expect(endingText).toBeDefined();
  expect(screen.getByRole("list", { name: "에필로그" })).toBeDefined();
  expect(button("새 회차")).toBeDefined();
  expect(button("기록 보기")).toBeDefined();
});

test("기록 화면은 달성한 종결만 이름을 내보내고 미달성은 감춘다", async () => {
  const stores = makeStores();
  stores.meta.getState().recordRun();
  stores.meta.getState().recordEnding("death");
  stores.run.setState({ run: makeRun({ jobStep: "site", terminal: "death" }) });
  renderApp(stores);

  await userEvent.click(button("기록 보기"));
  expect(screen.getByRole("heading", { name: "기록" })).toBeDefined();
  expect(screen.getByText("시작한 회차 1회")).toBeDefined();
  expect(screen.getByText(CONTENT.endings.death.title)).toBeDefined();
  expect(screen.getByText("1회")).toBeDefined();

  // 미달성 종결의 이름은 어디에도 없다 — 자리(???)와 횟수 자리(—)만 남는다.
  const hidden = ENDING_IDS.filter((id) => id !== "death");
  for (const id of hidden) {
    expect(screen.queryByText(CONTENT.endings[id].title)).toBeNull();
  }
  expect(screen.getAllByText("???")).toHaveLength(hidden.length);

  await userEvent.click(button("뒤로 가기"));
  expect(screen.getByRole("heading", { name: CONTENT.endings.death.title })).toBeDefined();
});

test("나가기는 화면을 타이틀로 되돌려 놓고 허브로 나간다", async () => {
  const { onExit } = renderApp(makeStores(), vi.fn());
  await userEvent.click(button("나가기"));
  expect(onExit).toHaveBeenCalledOnce();
  expect(useScreenStore.getState().screen).toBe("title");
});
