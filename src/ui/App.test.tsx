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

const makeStore = () => {
  const persistence = createPersistence(memoryStorage());
  return createRunStore({
    content: CONTENT,
    now: Date.now,
    makeRng: createRng,
    persistence,
    meta: createMetaStore(persistence),
  });
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
  store.getState().startRun({
    name: "테스트",
    origin: "origin_mercenary",
    trait: "strong_arms",
    allocation: { str: 10, agi: 10, int: 10, cha: 4, con: 4, wis: 4 },
    hardMode: false,
    journeys: [],
  });
  render(
    <RunStoreContext value={store}>
      <App />
    </RunStoreContext>,
  );
  expect(screen.getByRole("button", { name: "이어하기" })).toBeDefined();
});
