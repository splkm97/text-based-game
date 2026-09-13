// @vitest-environment jsdom

// 플레이 화면 계약: 문면은 전부 주입한 CONTENT의 값 그대로 보이고, 열린 행동 클릭은 단계를
// 전진시키며 그 결과가 회차 기록에 남고, require 미충족 클릭은 단계를 그대로 둔 채 deny 문면을
// 내보인다. 진엔딩 플래그는 화면에 나타나지 않는다. 스토어는 메모리 스토리지로 만들어
// 컨텍스트로 주입한다 — 싱글턴 runStore는 쓰지 않는다(localStorage 의존 0).

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

const click = async (label: string): Promise<void> => {
  await userEvent.click(screen.getByRole("button", { name: label }));
};

afterEach(cleanup);

test("공문·서술·동행 대사·행동 버튼을 CONTENT 문면 그대로 보인다", () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  const field = CONTENT.stages.field;
  expect(screen.getByText(field.document.heading)).toBeDefined();
  for (const line of field.document.meta) {
    expect(screen.getByText(line)).toBeDefined();
  }
  for (const item of field.document.items) {
    expect(screen.getByText(item)).toBeDefined();
  }
  expect(screen.getByText(field.document.tail)).toBeDefined();
  expect(screen.getByText(field.prompt)).toBeDefined();
  expect(screen.getByRole("heading", { name: field.title })).toBeDefined();
  for (const line of field.partyLines) {
    expect(screen.getByText(line.text)).toBeDefined();
    expect(screen.getByText(CONTENT.characters[line.character].name)).toBeDefined();
  }
  expect(screen.getByRole("button", { name: CONTENT.actions.call_respond.label })).toBeDefined();
});

test("진엔딩 플래그를 화면에 노출하지 않고, 한 행동의 결과가 회차 기록에 남는다", async () => {
  const store = makeStore();
  store.getState().start();
  mount(store);
  expect(screen.queryByLabelText("증거")).toBeNull();
  await click(CONTENT.actions.call_respond.label);
  expect(screen.getByRole("heading", { name: CONTENT.stages.office.title })).toBeDefined();
  await click(CONTENT.actions.dispatch_send_taesan.label);
  await click(CONTENT.actions.obs_send_ru_alone.label);
  expect(store.getState().run?.stage).toBe("radio");
  expect(store.getState().run?.clue).toBe(true);
  // 확보한 플래그는 어디에도 문면으로 나타나지 않는다 — 기록은 행동의 결과 문장뿐이다.
  const record = screen.getByLabelText("회차 기록");
  expect(record.textContent).toContain(CONTENT.actions.obs_send_ru_alone.result);
  expect(record.textContent).not.toContain(CONTENT.actions.obs_send_ru_alone.deny);
  expect(document.body.textContent).not.toContain("좌표 수신");
  expect(document.body.textContent).not.toContain("문서 사본");
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
