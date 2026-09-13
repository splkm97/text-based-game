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
  expect(screen.getByRole("heading", { name: CONTENT.jobs.gwanak.title })).toBeDefined();
  expect(button(CONTENT.actions.office_printer.label)).toBeDefined();
});

test("종결 상태면 종결 화면이 카드를 보여준다", () => {
  const stores = makeStores();
  stores.run.setState({ run: makeRun({ jobStep: "site", terminal: "death" }) });
  renderApp(stores);
  expect(screen.getByRole("heading", { name: CONTENT.endings.death.title })).toBeDefined();
  expect(screen.getByText(CONTENT.endings.death.text)).toBeDefined();
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
