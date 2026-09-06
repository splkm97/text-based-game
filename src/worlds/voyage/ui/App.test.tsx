// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { createRng } from "../../../shared/rng";
import { memoryStorage } from "../../../shared/storage";
import { CONTENT } from "../content";
import { makeRun } from "../rules/testContent";
import { createPersistence } from "../store/persistence";
import { createRunStore } from "../store/runStore";
import { App } from "./App";
import { RunStoreContext } from "./runStoreContext";
import { useScreenStore } from "./screenStore";

const makeStore = () =>
  createRunStore({
    content: CONTENT,
    now: Date.now,
    makeRng: createRng,
    persistence: createPersistence(memoryStorage()),
  });

beforeEach(() => {
  useScreenStore.setState({ screen: "title" });
});

afterEach(cleanup);

test("새 항해 starts a run and lands on day 1 comms", async () => {
  const store = makeStore();
  render(
    <RunStoreContext value={store}>
      <App onExit={() => {}} />
    </RunStoreContext>,
  );
  expect(screen.queryByRole("button", { name: "이어하기" })).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "새 항해" }));
  expect(store.getState().run?.phase.kind).toBe("comms");
  expect(screen.getByRole("heading", { name: "항해일 1/30" })).toBeDefined();
  expect(screen.getByRole("heading", { name: "지구 통신" })).toBeDefined();
  expect(screen.getByRole("button", { name: "다음" })).toBeDefined();
});

test("이어하기 shows for a saved run and reopens it", async () => {
  const store = makeStore();
  store.getState().startRun();
  render(
    <RunStoreContext value={store}>
      <App onExit={() => {}} />
    </RunStoreContext>,
  );
  await userEvent.click(screen.getByRole("button", { name: "이어하기" }));
  expect(useScreenStore.getState().screen).toBe("voyage");
});

test("an ended run renders its ending, score, and the way out", async () => {
  const store = makeStore();
  store.setState({
    run: makeRun({ day: 31, phase: { kind: "ended", ending: "arrival", score: 142 } }),
  });
  useScreenStore.setState({ screen: "voyage" });
  const onExit = vi.fn();
  render(
    <RunStoreContext value={store}>
      <App onExit={onExit} />
    </RunStoreContext>,
  );
  expect(screen.getByRole("heading", { name: CONTENT.endings.arrival.title })).toBeDefined();
  expect(screen.getByText("142")).toBeDefined();
  await userEvent.click(screen.getByRole("button", { name: "허브로" }));
  expect(onExit).toHaveBeenCalledOnce();
  expect(store.getState().run).toBeNull();
  expect(useScreenStore.getState().screen).toBe("title");
});
