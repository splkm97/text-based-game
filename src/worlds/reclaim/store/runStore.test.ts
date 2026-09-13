// 스토어 계약: 시작은 field에서 열리고 매 성공마다 저장되며, 거부는 lastReason만 남기고
// 상태를 건드리지 않고, 종결은 세이브를 비우며 metaStore 경로로 기록되고, reset은 키를
// 비운다. 전부 메모리 스토리지 위에서 돈다 — localStorage 의존 0.

import { describe, expect, test } from "vitest";
import type { StoreApi } from "zustand/vanilla";
import { memoryStorage } from "../../../shared/storage";
import type { ActionId, EndingId } from "../ids";
import { TEST_CONTENT } from "../rules/testContent";
import { createMetaStore } from "./metaStore";
import { createMetaPersistence, createPersistence } from "./persistence";
import { createRunStore, type RunStore } from "./runStore";

const NOW_ISO = "2026-09-14T12:00:00.000Z";

/** dusik_first에서 문서 없이 venue까지 가는 성공 액션열 — venue_no_stage로 routine 종결. */
const PATH_TO_VENUE: readonly ActionId[] = [
  "call_respond",
  "dispatch_send_other",
  "obs_boss_joins",
  "radio_business_only",
  "archive_with_taesan",
  "archive_leave",
  "xcheck_skip",
];

const drive = (store: StoreApi<RunStore>, ids: readonly ActionId[]): void => {
  for (const id of ids) {
    store.getState().act(id);
  }
};

/** 콜백 기록을 노출하는 기본 스토어. */
const setup = () => {
  const runStorage = memoryStorage();
  const started: number[] = [];
  const endings: EndingId[] = [];
  const store = createRunStore({
    content: TEST_CONTENT,
    persistence: createPersistence(runStorage),
    onStart: () => started.push(1),
    onEnding: (ending) => endings.push(ending),
  });
  return { store, runStorage, started, endings, state: () => store.getState() };
};

describe("start", () => {
  test("field에서 열리고 첫 액션 목록과 함께 저장된다", () => {
    const { runStorage, started, state } = setup();

    state().start();
    expect(state().run).toMatchObject({ placement: "ru_first", stage: "field", terminal: null });
    expect(state().availableActions).toEqual(["call_respond"]);
    expect(state().lastReason).toBeNull();
    expect(state().hasSave()).toBe(true);
    expect(started).toEqual([1]);
    expect(createPersistence(runStorage).load()).toEqual(state().run);
  });

  test("placement를 지정하면 세이브까지 그 배치로 저장된다", () => {
    const { runStorage, state } = setup();

    state().start("dusik_first");
    expect(state().run?.placement).toBe("dusik_first");
    expect(createPersistence(runStorage).load()?.placement).toBe("dusik_first");
  });
});

describe("act", () => {
  test("성공은 단계를 전진하고 사유를 지우며 저장을 갱신한다", () => {
    const { runStorage, state } = setup();

    state().start();
    state().act("call_respond");
    expect(state().run?.stage).toBe("office");
    expect(state().availableActions).toEqual(["dispatch_send_taesan", "dispatch_send_other"]);
    expect(state().lastReason).toBeNull();
    expect(createPersistence(runStorage).load()?.stage).toBe("office");
  });

  test("when 거부는 사유를 남기고 상태와 저장을 그대로 둔다", () => {
    const { runStorage, state } = setup();

    state().start();
    state().act("call_respond");
    const before = state().run;

    state().act("archive_with_dusik");
    expect(state().lastReason).toBe(TEST_CONTENT.actions.archive_with_dusik.deny);
    expect(state().run).toBe(before);
    expect(createPersistence(runStorage).load()).toEqual(before);
  });

  test("require 거부도 사유를 남기고 상태를 그대로 둔다", () => {
    const { store, state } = setup();

    state().start("dusik_first");
    drive(store, PATH_TO_VENUE);
    const before = state().run;

    state().act("venue_military"); // 문서가 없어 열리지 않는다
    expect(state().lastReason).toBe(TEST_CONTENT.actions.venue_military.deny);
    expect(state().run).toBe(before);
  });

  test("진행 중인 회차가 없으면 조용히 무시된다", () => {
    const { state } = setup();

    state().act("call_respond");
    expect(state().run).toBeNull();
    expect(state().lastReason).toBeNull();
  });
});

describe("terminal", () => {
  test("종결에 도달하면 세이브를 비우고 meta 경로로 엔딩을 넘긴다", () => {
    const { store, runStorage, endings, state } = setup();

    state().start("dusik_first");
    drive(store, PATH_TO_VENUE);
    state().act("venue_no_stage");

    expect(state().run?.terminal).toBe("routine");
    expect(state().availableActions).toEqual([]);
    expect(createPersistence(runStorage).load()).toBeNull();
    expect(runStorage.data.size).toBe(0);
    expect(endings).toEqual(["routine"]);
  });

  test("종결 뒤의 액션은 안내 문면으로 거부되고 상태를 건드리지 않는다", () => {
    const { store, state } = setup();

    state().start("dusik_first");
    drive(store, PATH_TO_VENUE);
    state().act("venue_no_stage");
    const ended = state().run;

    state().act("venue_silence");
    expect(state().lastReason).toBe("회차가 이미 종결되었다");
    expect(state().run).toBe(ended);
  });
});

describe("resume", () => {
  test("같은 저장소 위의 새 스토어는 세이브를 복원한다", () => {
    const runStorage = memoryStorage();
    const first = createRunStore({
      content: TEST_CONTENT,
      persistence: createPersistence(runStorage),
      onStart: () => {},
      onEnding: () => {},
    });
    first.getState().start("dusik_first");
    drive(first, PATH_TO_VENUE);

    const second = createRunStore({
      content: TEST_CONTENT,
      persistence: createPersistence(runStorage),
      onStart: () => {},
      onEnding: () => {},
    });
    expect(second.getState().hasSave()).toBe(true);
    expect(second.getState().resume()).toBe(true);
    expect(second.getState().run).toEqual(first.getState().run);
    expect(second.getState().availableActions).toEqual(first.getState().availableActions);
  });

  test("저장이 없으면 false이고 상태는 null로 남는다", () => {
    const { state } = setup();

    expect(state().hasSave()).toBe(false);
    expect(state().resume()).toBe(false);
    expect(state().run).toBeNull();
  });
});

describe("reset", () => {
  test("회차와 저장 키를 비우고 meta는 건드리지 않는다", () => {
    const { runStorage, state } = setup();

    state().start();
    expect(runStorage.data.size).toBe(1);

    state().reset();
    expect(state().run).toBeNull();
    expect(state().availableActions).toEqual([]);
    expect(state().lastReason).toBeNull();
    expect(state().hasSave()).toBe(false);
    expect(runStorage.data.size).toBe(0);
  });
});

describe("meta 기록 경로", () => {
  test("시작은 runs를, 종결은 endingsSeen을 세고 저장소에 남는다", () => {
    const runStorage = memoryStorage();
    const metaStorage = memoryStorage();
    const meta = createMetaStore({
      now: () => NOW_ISO,
      persistence: createMetaPersistence(metaStorage),
    });
    const store = createRunStore({
      content: TEST_CONTENT,
      persistence: createPersistence(runStorage),
      onStart: () => meta.getState().recordRun(),
      onEnding: (ending) => meta.getState().recordEnding(ending),
    });

    store.getState().start("dusik_first");
    drive(store, PATH_TO_VENUE);
    store.getState().act("venue_no_stage");

    expect(meta.getState().runs).toBe(1);
    expect(meta.getState().updatedAt).toBe(NOW_ISO);
    expect(meta.getState().endingsSeen.routine).toBe(1);
    expect(meta.getState().endingsSeen.true_ru).toBe(0);

    // 같은 저장소 위의 새 기록 스토어는 쌓인 기록을 내려받는다
    const reopened = createMetaStore({
      now: () => NOW_ISO,
      persistence: createMetaPersistence(metaStorage),
    });
    expect(reopened.getState().runs).toBe(1);
    expect(reopened.getState().endingsSeen.routine).toBe(1);
  });
});
