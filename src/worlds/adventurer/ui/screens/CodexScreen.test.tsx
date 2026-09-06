// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { memoryStorage } from "../../../../shared/storage";
import { createMetaStore, type MetaStoreApi } from "../../store/metaStore";
import { createPersistence } from "../../store/persistence";
import { MetaStoreContext } from "../metaStoreContext";
import { CodexScreen } from "./CodexScreen";

const makeStore = () => createMetaStore(createPersistence(memoryStorage()));

const renderCodex = (store: MetaStoreApi) =>
  render(
    <MetaStoreContext value={store}>
      <CodexScreen />
    </MetaStoreContext>,
  );

afterEach(cleanup);

test("monsters tab names discovered monsters and hides the rest behind ???", async () => {
  const store = makeStore();
  store.getState().recordMonster("wild_boar");
  renderCodex(store);
  await userEvent.click(screen.getByRole("tab", { name: "몬스터" }));
  const panel = screen.getByRole("tabpanel");
  expect(within(panel).getByText("멧돼지")).toBeDefined();
  expect(within(panel).queryByText("노상강도")).toBeNull();
  expect(within(panel).getAllByText("???")).toHaveLength(19);
  expect(within(panel).getByText("1/20")).toBeDefined();
});

test("endings tab opens first, shows the tone of a discovered ending, and follows arrow keys", async () => {
  const store = makeStore();
  store.getState().recordEnding("retire");
  renderCodex(store);
  const endings = screen.getByRole("tab", { name: "에필로그" });
  expect(endings.getAttribute("aria-selected")).toBe("true");
  const panel = screen.getByRole("tabpanel");
  expect(within(panel).getByText("은퇴")).toBeDefined();
  expect(within(panel).getByText("중립")).toBeDefined();
  expect(within(panel).getByText("1/12")).toBeDefined();
  endings.focus();
  await userEvent.keyboard("{ArrowRight}");
  const monsters = screen.getByRole("tab", { name: "몬스터" });
  expect(monsters.getAttribute("aria-selected")).toBe("true");
  expect(document.activeElement).toBe(monsters);
});

test("items tab shows the name of a discovered item", async () => {
  const store = makeStore();
  store.getState().recordItem("rusty_sword");
  renderCodex(store);
  await userEvent.click(screen.getByRole("tab", { name: "아이템" }));
  const panel = screen.getByRole("tabpanel");
  expect(within(panel).getByText("녹슨 검")).toBeDefined();
  expect(within(panel).getByText("1/40")).toBeDefined();
});
