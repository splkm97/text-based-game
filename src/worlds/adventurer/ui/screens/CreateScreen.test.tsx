// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { createRng } from "../../../../shared/rng";
import { memoryStorage } from "../../../../shared/storage";
import { CONTENT } from "../../content";
import { createMetaStore } from "../../store/metaStore";
import { createPersistence } from "../../store/persistence";
import { createRunStore } from "../../store/runStore";
import { RunStoreContext } from "../runStoreContext";
import { useScreenStore } from "../screenStore";
import { CreateScreen } from "./CreateScreen";

const NOW = Date.parse("2026-09-06T12:00:00.000Z");

const setup = () => {
  const persistence = createPersistence(memoryStorage());
  const store = createRunStore({
    content: CONTENT,
    now: () => NOW,
    makeRng: createRng,
    persistence,
    meta: createMetaStore(persistence),
  });
  const user = userEvent.setup();
  render(
    <RunStoreContext value={store}>
      <CreateScreen />
    </RunStoreContext>,
  );
  const plus = (stat: string) =>
    screen.getByRole<HTMLButtonElement>("button", { name: `${stat} 늘리기` });
  const start = () => screen.getByRole<HTMLButtonElement>("button", { name: "모험 시작" });
  const raise = async (stat: string, times: number) => {
    for (let i = 0; i < times; i += 1) {
      await user.click(plus(stat));
    }
  };
  return { store, user, plus, start, raise };
};

beforeEach(() => {
  useScreenStore.setState({ screen: "create" });
});

afterEach(cleanup);

describe("CreateScreen", () => {
  test("start stays disabled until all 18 points are spent", async () => {
    const { start, raise } = setup();
    expect(start().disabled).toBe(true);
    await raise("힘", 6);
    await raise("민첩", 6);
    expect(start().disabled).toBe(true);
    await raise("지능", 6);
    expect(start().disabled).toBe(false);
  });

  test("+ is disabled at 10 for that stat and everywhere once no points remain", async () => {
    const { plus, raise } = setup();
    await raise("힘", 6);
    expect(plus("힘").disabled).toBe(true);
    expect(plus("민첩").disabled).toBe(false);
    await raise("민첩", 6);
    await raise("건강", 6);
    expect(plus("지능").disabled).toBe(true);
    expect(plus("지혜").disabled).toBe(true);
  });

  test("start creates the run from the chosen options and moves to the adventure screen", async () => {
    const { store, user, start, raise } = setup();
    const name = screen.getByLabelText("이름");
    await user.clear(name);
    await user.type(name, "수도사 밀");
    await user.click(screen.getByRole("radio", { name: /파문당한 수도사/ }));
    await user.click(screen.getByRole("radio", { name: /책벌레/ }));
    await user.click(screen.getByRole("switch", { name: /잊힌 등대/ }));
    await user.click(screen.getByRole("switch", { name: /어려움/ }));
    await raise("지능", 6);
    await raise("지혜", 6);
    await raise("카리스마", 6);
    await user.click(start());

    const run = store.getState().run;
    expect(run).toMatchObject({
      hardMode: true,
      journeys: ["journey_lighthouse"],
      character: {
        name: "수도사 밀",
        origin: "origin_monk",
        trait: "bookworm",
        stats: { str: 4, agi: 4, int: 12, cha: 10, con: 4, wis: 10 },
      },
    });
    expect(useScreenStore.getState().screen).toBe("adventure");
  });
});
