// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { memoryStorage } from "../../../../shared/storage";
import { CONTENT } from "../../content";
import { startCombat } from "../../engine/combat";
import { fixedRolls, makeRun } from "../../engine/testContent";
import type { ContentRegistry, RunState } from "../../engine/types";
import { createMetaStore } from "../../store/metaStore";
import { createPersistence } from "../../store/persistence";
import { createRunStore } from "../../store/runStore";
import { ContentContext } from "../contentContext";
import { RunStoreContext } from "../runStoreContext";
import { useScreenStore } from "../screenStore";
import { AdventureScreen } from "./AdventureScreen";

const NOW = Date.parse("2026-09-06T12:00:00.000Z");
const NOTHING = { text: "", effects: [] } as const;

/** The run starts on the river crossing: its first choice needs a rope the hero lacks. */
const RIVER = "common_wilds_river_crossing";

/** Mounts the screen over `content`; the store keeps the real registry so the assertion is on the UI. */
const setupWith = (content: ContentRegistry, run: RunState, ...rolls: readonly number[]) => {
  const persistence = createPersistence(memoryStorage());
  const store = createRunStore({
    content: CONTENT,
    now: () => NOW,
    makeRng: () => fixedRolls(...rolls),
    persistence,
    meta: createMetaStore(persistence),
  });
  store.setState({ run });
  render(
    <ContentContext value={content}>
      <RunStoreContext value={store}>
        <AdventureScreen />
      </RunStoreContext>
    </ContentContext>,
  );
  const phase = () => {
    const current = store.getState().run;
    if (current === null) {
      throw new Error("run ended");
    }
    return current.phase;
  };
  return { store, user: userEvent.setup(), phase };
};

const setup = (run: RunState, ...rolls: readonly number[]) => setupWith(CONTENT, run, ...rolls);

const button = (name: string | RegExp) => screen.getByRole<HTMLButtonElement>("button", { name });

beforeAll(() => {
  // jsdom ships no <dialog> methods; the sheet only needs the `open` attribute and `close` event.
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

beforeEach(() => {
  useScreenStore.setState({ screen: "adventure" });
});

afterEach(cleanup);

describe("EventView", () => {
  test("an unavailable choice is disabled and names the missing requirement", () => {
    setup(makeRun({ phase: { kind: "event", event: RIVER } }));
    const rope = button("밧줄을 건너편 나무에 걸어 건넌다");
    expect(rope.disabled).toBe(true);
    expect(screen.getByText("아이템 필요: 밧줄")).toBeTruthy();
    expect(button("헤엄쳐 건넌다").disabled).toBe(false);
  });

  test("an available choice resolves through the store", async () => {
    const { user, phase } = setup(makeRun({ phase: { kind: "event", event: RIVER } }), 15);
    await user.click(button("하류로 멀리 돌아간다"));
    expect(phase().kind).toBe("resolution");
    expect(button("계속")).toBeTruthy();
  });
});

describe("CombatView", () => {
  test("공격 runs a round: the log grows and the round advances", async () => {
    const run = startCombat(makeRun(), "wild_boar", NOTHING, NOTHING, CONTENT);
    const { user, phase } = setup(run, 1);
    const log = () =>
      within(screen.getByRole("list", { name: "전투 기록" })).getAllByRole("listitem");
    expect(log()).toHaveLength(1);
    await user.click(button("공격"));
    const after = phase();
    expect(after.kind).toBe("combat");
    expect(after.kind === "combat" && after.combat.round).toBe(2);
    expect(log()).toHaveLength(2);
  });
});

describe("InventorySheet", () => {
  test("장착 equips the item through the store", async () => {
    const { user, store } = setup(makeRun({ phase: { kind: "event", event: RIVER } }));
    await user.click(button(/^가방/));
    await user.click(button("녹슨 검 장착"));
    expect(store.getState().run?.character.equipment.mainHand).toBe("rusty_sword");
    expect(button("녹슨 검 해제")).toBeTruthy();
  });
});

describe("EndingView", () => {
  const ended = (loadCount: number, ranked: boolean): RunState =>
    makeRun({ loadCount, phase: { kind: "ended", ending: "retire", score: 240, ranked } });

  test("shows the score and the unranked reason after three loads", () => {
    setup(ended(3, false));
    expect(screen.getByText("은퇴")).toBeTruthy();
    expect(screen.getByText("240")).toBeTruthy();
    expect(screen.getByText(/불러오기 3회 이상/)).toBeTruthy();
  });

  test("shows the ranked line otherwise and 타이틀로 leaves the run", async () => {
    const { user, store } = setup(ended(0, true));
    expect(screen.getByText("랭킹에 올랐어요.")).toBeTruthy();
    await user.click(button("타이틀로"));
    expect(store.getState().run).toBeNull();
    expect(useScreenStore.getState().screen).toBe("title");
  });
});

describe("ContentContext", () => {
  const SENTINEL = "덧씌운 강가의 사건";

  test("the event title comes from the provided registry, not the content singleton", () => {
    const source = CONTENT.events[RIVER];
    if (source === undefined) {
      throw new Error(`unknown event: ${RIVER}`);
    }
    const overlaid: ContentRegistry = {
      ...CONTENT,
      events: { ...CONTENT.events, [RIVER]: { ...source, title: SENTINEL } },
    };
    setupWith(overlaid, makeRun({ phase: { kind: "event", event: RIVER } }));
    expect(screen.getByRole("heading", { name: SENTINEL })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: source.title })).toBeNull();
  });
});
