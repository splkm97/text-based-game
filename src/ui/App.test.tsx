// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test } from "vitest";
import { CONTENT } from "../content";
import { createRng } from "../engine/rng";
import { createMetaStore } from "../store/metaStore";
import { createPersistence } from "../store/persistence";
import { createRunStore } from "../store/runStore";
import { memoryStorage } from "../store/testStorage";
import { App } from "./App";
import { RunStoreContext } from "./runStoreContext";
import { useScreenStore } from "./screenStore";

const makeStore = (storage = memoryStorage()) => {
  const persistence = createPersistence(storage);
  return createRunStore({
    content: CONTENT,
    now: Date.now,
    makeRng: createRng,
    persistence,
    meta: createMetaStore(persistence),
  });
};

const START_INPUT = {
  name: "테스트",
  origin: "origin_mercenary",
  trait: "strong_arms",
  allocation: { str: 10, agi: 10, int: 10, cha: 4, con: 4, wis: 4 },
  hardMode: false,
  journeys: [],
} as const;

// jsdom 29 ships <dialog> without showModal/close; the tests only need the open flag.
HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
  this.removeAttribute("open");
};

beforeEach(() => {
  useScreenStore.setState({ screen: "title" });
});

afterEach(cleanup);

test("title offers a new adventure and leads to character creation", async () => {
  render(
    <RunStoreContext value={makeStore()}>
      <App />
    </RunStoreContext>,
  );
  expect(screen.queryByRole("button", { name: "이어하기" })).toBeNull();
  await userEvent.click(screen.getByRole("button", { name: "새 모험" }));
  expect(screen.getByRole("button", { name: "모험 시작" })).toBeDefined();
});

test("title offers to continue when a run is saved", () => {
  const store = makeStore();
  store.getState().startRun(START_INPUT);
  render(
    <RunStoreContext value={store}>
      <App />
    </RunStoreContext>,
  );
  expect(screen.getByRole("button", { name: "이어하기" })).toBeDefined();
});

test("continuing a run that is still in memory does not count as a load", async () => {
  const store = makeStore();
  store.getState().startRun(START_INPUT);
  render(
    <RunStoreContext value={store}>
      <App />
    </RunStoreContext>,
  );
  await userEvent.click(screen.getByRole("button", { name: "이어하기" }));
  expect(store.getState().run?.loadCount).toBe(0);
  expect(useScreenStore.getState().screen).toBe("adventure");
});

test("continuing a saved run after a reload does not count as a load", async () => {
  const storage = memoryStorage();
  makeStore(storage).getState().startRun(START_INPUT);
  const fresh = makeStore(storage);
  expect(fresh.getState().run).toBeNull();
  render(
    <RunStoreContext value={fresh}>
      <App />
    </RunStoreContext>,
  );
  await userEvent.click(screen.getByRole("button", { name: "이어하기" }));
  expect(fresh.getState().run?.loadCount).toBe(0);
  expect(useScreenStore.getState().screen).toBe("adventure");
});

test("a new adventure over a saved run asks first, then clears the save", async () => {
  const store = makeStore();
  store.getState().startRun(START_INPUT);
  render(
    <RunStoreContext value={store}>
      <App />
    </RunStoreContext>,
  );
  await userEvent.click(screen.getByRole("button", { name: "새 모험" }));
  const dialog = screen.getByRole("dialog", { hidden: true });
  expect(dialog.hasAttribute("open")).toBe(true);
  expect(useScreenStore.getState().screen).toBe("title");
  await userEvent.click(screen.getByRole("button", { name: "새로 시작", hidden: true }));
  expect(store.getState().run).toBeNull();
  expect(store.getState().hasSave()).toBe(false);
  expect(useScreenStore.getState().screen).toBe("create");
});
