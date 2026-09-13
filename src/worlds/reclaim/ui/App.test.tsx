// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { StoreApi } from "zustand/vanilla";
import { memoryStorage } from "../../../shared/storage";
import { CONTENT } from "../content";
import type { ActionId } from "../ids";
import { makeRun } from "../rules/testContent";
import type { MetaStore } from "../store/metaStore";
import { createMetaStore } from "../store/metaStore";
import { createMetaPersistence, createPersistence } from "../store/persistence";
import type { RunStore } from "../store/runStore";
import { createRunStore } from "../store/runStore";
import { App } from "./App";
import { MetaStoreContext } from "./metaStoreContext";
import { RunStoreContext } from "./runStoreContext";
import { useScreenStore } from "./screenStore";

type Stores = { readonly meta: StoreApi<MetaStore>; readonly run: StoreApi<RunStore> };

const NOW = "2026-09-14T09:00:00.000Z";

// 앱 싱글턴이 아니라 메모리 스토리지 위에서 만든 스토어를 컨텍스트로 주입한다.
// onStart·onEnding은 프로덕션 싱글턴과 같은 연결로 meta에 기록을 남긴다.
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

const choose = async (id: ActionId) => {
  await userEvent.click(screen.getByRole("button", { name: CONTENT.actions[id].label }));
};

beforeEach(() => {
  useScreenStore.setState({ screen: "title" });
});

afterEach(cleanup);

test("타이틀에서 새 회차를 시작하면 플레이 화면으로 들어간다", async () => {
  const { stores } = renderApp();
  expect(screen.queryByRole("button", { name: "이어하기" })).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "새 회차" }));
  expect(stores.run.getState().run?.placement).toBe("ru_first");
  expect(stores.run.getState().run?.stage).toBe("field");
  expect(screen.getByRole("heading", { name: CONTENT.stages.field.title })).toBeDefined();
  expect(screen.getByRole("button", { name: CONTENT.actions.call_respond.label })).toBeDefined();
});

test("종결 상태면 종결 화면이 카드를 보여준다", () => {
  const stores = makeStores();
  stores.run.setState({ run: makeRun({ stage: "gate", terminal: "death" }) });
  renderApp(stores);
  expect(screen.getByRole("heading", { name: CONTENT.endings.death.title })).toBeDefined();
  expect(screen.getByText(CONTENT.endings.death.text)).toBeDefined();
  expect(screen.getByRole("list", { name: "에필로그" })).toBeDefined();
  expect(screen.getByRole("button", { name: "새 회차" })).toBeDefined();
  expect(screen.getByRole("button", { name: "기록 보기" })).toBeDefined();
});

test("끝까지 진행하면 종결이 열리고 기록에 횟수가 남는다", async () => {
  renderApp();
  await userEvent.click(screen.getByRole("button", { name: "새 회차" }));
  await choose("call_respond");
  await choose("dispatch_send_other");
  await choose("obs_send_other");
  await choose("radio_business_only");
  await choose("archive_with_dusik");
  await choose("archive_leave");
  await choose("xcheck_skip");
  await choose("gate_to_venue");
  await choose("venue_silence");
  expect(screen.getByRole("heading", { name: CONTENT.endings.death.title })).toBeDefined();

  await userEvent.click(screen.getByRole("button", { name: "기록 보기" }));
  expect(screen.getByRole("heading", { name: "기록" })).toBeDefined();
  expect(screen.getByText("시작한 회차 1회")).toBeDefined();
  expect(screen.getByText(CONTENT.endings.death.title)).toBeDefined();
  expect(screen.getByText("1회")).toBeDefined();

  await userEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
  expect(screen.getByRole("heading", { name: CONTENT.endings.death.title })).toBeDefined();
});

test("나가기는 화면을 타이틀로 되돌려 놓고 허브로 나간다", async () => {
  const { onExit } = renderApp(makeStores(), vi.fn());
  await userEvent.click(screen.getByRole("button", { name: "나가기" }));
  expect(onExit).toHaveBeenCalledOnce();
  expect(useScreenStore.getState().screen).toBe("title");
});
