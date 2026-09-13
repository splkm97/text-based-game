// @vitest-environment jsdom

// 플레이 화면 계약: 문면은 전부 주입한 CONTENT의 값 그대로 보이고, 열린 행동 클릭은
// 단계를 전진시키며 확보한 증거 chip을 켜고, require 미충족 클릭은 단계를 그대로 둔 채
// deny 문면을 내보인다. 스토어는 메모리 스토리지로 만들어 컨텍스트로 주입한다 — 싱글턴
// runStore는 쓰지 않는다(localStorage 의존 0).

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import type { StoreApi } from "zustand/vanilla";
import { PaletteContext } from "../../../../shared/art/paletteContext";
import { memoryStorage } from "../../../../shared/storage";
import { CONTENT } from "../../content";
import { createPersistence } from "../../store/persistence";
import { createRunStore, type RunStore } from "../../store/runStore";
import { THEME } from "../../theme";
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
      <ContentContext value={CONTENT}>
        <PaletteContext value={THEME.palette}>
          <PlayScreen />
        </PaletteContext>
      </ContentContext>
    </RunStoreContext>,
  );
};

const chipOf = (label: string): HTMLElement | null => screen.getByText(label).closest("li");

const click = async (label: string): Promise<void> => {
  await userEvent.click(screen.getByRole("button", { name: label }));
};

afterEach(cleanup);

test("공문·서술·동행 대사·행동 버튼을 CONTENT 문면 그대로 보인다", () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  const field = CONTENT.stages.field;
  expect(screen.getByText(field.screen)).toBeDefined();
  expect(screen.getByText(field.prompt)).toBeDefined();
  expect(screen.getByRole("heading", { name: field.title })).toBeDefined();
  for (const line of field.partyLines) {
    expect(screen.getByText(line.text)).toBeDefined();
    expect(screen.getByText(CONTENT.characters[line.character].name)).toBeDefined();
  }
  expect(screen.getByRole("button", { name: CONTENT.actions.call_respond.label })).toBeDefined();
});

test("열린 행동을 클릭하면 단계가 전진하고 확보한 증거 chip이 켜진다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  await click(CONTENT.actions.call_respond.label);
  expect(screen.getByRole("heading", { name: CONTENT.stages.office.title })).toBeDefined();
  await click(CONTENT.actions.dispatch_send_taesan.label);
  await click(CONTENT.actions.obs_send_ru_alone.label);
  expect(store.getState().run?.stage).toBe("radio");
  expect(store.getState().run?.clue).toBe(true);
  const clueChip = chipOf(CONTENT.evidence.clue);
  expect(clueChip).not.toBeNull();
  expect(clueChip?.className).not.toContain("text-dusk");
  expect(chipOf(CONTENT.evidence.broadcast)?.className).toContain("text-dusk");
});

test("require를 못 맞춘 행동은 deny 문면을 내보내고 단계를 그대로 둔다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  await click(CONTENT.actions.call_respond.label);
  await click(CONTENT.actions.dispatch_send_taesan.label);
  await click(CONTENT.actions.obs_send_ru_alone.label);
  await click(CONTENT.actions.radio_business_only.label);
  expect(store.getState().run?.stage).toBe("archive");
  await click(CONTENT.actions.archive_leave.label);
  expect(screen.getByRole("alert").textContent).toBe(CONTENT.actions.archive_leave.deny);
  expect(store.getState().run?.stage).toBe("archive");
  expect(store.getState().lastReason).toBe(CONTENT.actions.archive_leave.deny);
});
