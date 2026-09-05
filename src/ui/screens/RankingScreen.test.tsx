// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import type { RankingEntry } from "../../engine/types";
import { createMetaStore, EMPTY_META, type MetaStoreApi } from "../../store/metaStore";
import { createPersistence } from "../../store/persistence";
import { memoryStorage } from "../../store/testStorage";
import { MetaStoreContext } from "../metaStoreContext";
import { RankingScreen } from "./RankingScreen";

const entry = (overrides: Partial<RankingEntry>): RankingEntry => ({
  id: "id",
  name: "테스트",
  origin: "origin_mercenary",
  ending: "retire",
  score: 0,
  day: 1,
  hardMode: false,
  ranked: true,
  finishedAt: "2026-09-06T00:00:00.000Z",
  ...overrides,
});

const makeStore = () => createMetaStore(createPersistence(memoryStorage()));

const renderRanking = (store: MetaStoreApi) =>
  render(
    <MetaStoreContext value={store}>
      <RankingScreen />
    </MetaStoreContext>,
  );

// jsdom 29 ships <dialog> without showModal/close; the tests only need the open flag.
HTMLDialogElement.prototype.showModal ??= function showModal(this: HTMLDialogElement) {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close ??= function close(this: HTMLDialogElement) {
  this.removeAttribute("open");
};

afterEach(cleanup);

test("ranked entries are listed in stored order; unranked ones sit under the details", () => {
  const store = makeStore();
  store.getState().addRanking(entry({ id: "a", name: "가온", score: 300, day: 12 }));
  store
    .getState()
    .addRanking(
      entry({ id: "b", name: "나린", score: 120, hardMode: true, origin: "origin_monk" }),
    );
  store.getState().addRanking(entry({ id: "c", name: "다솔", score: 999, ranked: false }));
  renderRanking(store);
  const rows = within(screen.getByRole("list", { name: "랭킹" })).getAllByRole("listitem");
  expect(rows).toHaveLength(2);
  expect(within(rows[0] as HTMLElement).getByText("가온")).toBeDefined();
  expect(within(rows[0] as HTMLElement).getByText("떠돌이 용병")).toBeDefined();
  expect(within(rows[0] as HTMLElement).getByText("은퇴")).toBeDefined();
  expect(within(rows[0] as HTMLElement).getByText("300")).toBeDefined();
  expect(within(rows[0] as HTMLElement).queryByText("어려움")).toBeNull();
  expect(within(rows[1] as HTMLElement).getByText("나린")).toBeDefined();
  expect(within(rows[1] as HTMLElement).getByText("어려움")).toBeDefined();
  const details = screen.getByText("랭킹 제외 기록 (1)").closest("details");
  expect(details).not.toBeNull();
  expect(within(details as HTMLElement).getByText("다솔")).toBeDefined();
  expect(within(details as HTMLElement).getByText("불러오기 3회 이상")).toBeDefined();
});

test("an empty ranking says so and offers nothing to reset", () => {
  renderRanking(makeStore());
  expect(screen.getByText("아직 기록이 없어요.")).toBeDefined();
  expect(screen.queryByRole("list", { name: "랭킹" })).toBeNull();
  expect(screen.queryByText(/랭킹 제외 기록/)).toBeNull();
  expect((screen.getByRole("button", { name: "기록 초기화" }) as HTMLButtonElement).disabled).toBe(
    true,
  );
});

test("reset asks first, then clears every record", async () => {
  const store = makeStore();
  store.getState().addRanking(entry({ id: "a", name: "가온", score: 300 }));
  store.getState().recordMonster("wild_boar");
  renderRanking(store);
  await userEvent.click(screen.getByRole("button", { name: "기록 초기화" }));
  const dialog = screen.getByRole("dialog", { hidden: true });
  expect(dialog.hasAttribute("open")).toBe(true);
  expect(store.getState().meta.ranking).toHaveLength(1);
  await userEvent.click(screen.getByRole("button", { name: "취소", hidden: true }));
  expect(store.getState().meta.ranking).toHaveLength(1);
  await userEvent.click(screen.getByRole("button", { name: "기록 초기화" }));
  await userEvent.click(screen.getByRole("button", { name: "초기화", hidden: true }));
  expect(store.getState().meta).toEqual(EMPTY_META);
  expect(screen.getByText("아직 기록이 없어요.")).toBeDefined();
});
