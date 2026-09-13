// 스토어 계약: 시작은 규칙의 startRun 호출 한 번을 감싸고 매 성공마다 저장되며, 거부는
// lastReason만 남기고 상태(과 세이브)를 건드리지 않고, 종결은 세이브를 비우며 onEnding
// 콜백으로 기록을 남기고, reset은 키를 비운다. 규칙은 mock으로 갈아낀다 — 이 테스트의
// 대상은 저장·사유·콜백 경로지 규칙의 내부가 아니다(규칙 자체는 rules/ 테스트가 검증한다).

import { beforeEach, describe, expect, test, vi } from "vitest";
import { memoryStorage } from "../../../shared/storage";
import type { EndingId } from "../ids";
import type * as rulesRun from "../rules/run";
import { applyAction, availableActions, startRun } from "../rules/run";
import { makeRun, TEST_CONTENT } from "../rules/testContent";
import type { RunState } from "../types";
import { createMetaStore } from "./metaStore";
import { createMetaPersistence, createPersistence } from "./persistence";
import { createRunStore } from "./runStore";

// importOriginal로 상수(RECHANCE_LIMIT 등)는 살려 둔다 — testContent·schemas가 같은
// 모듈에서 상수를 가져다 쓰고, testContent는 이 파일의 그래프 안에서 로드된다.
vi.mock("../rules/run", async (importOriginal) => {
  const actual = await importOriginal<typeof rulesRun>();
  return {
    ...actual,
    startRun: vi.fn(),
    availableActions: vi.fn(),
    applyAction: vi.fn(),
  };
});

const mockedStart = vi.mocked(startRun);
const mockedAvailable = vi.mocked(availableActions);
const mockedApply = vi.mocked(applyAction);

const NOW_ISO = "2026-09-14T12:00:00.000Z";

/** 콜백 기록을 노출하는 기본 스토어. 스토리지를 공유해 resume을 두 스토어로 검증한다. */
const setup = (storage = memoryStorage()) => {
  const started: number[] = [];
  const endings: EndingId[] = [];
  const store = createRunStore({
    content: TEST_CONTENT,
    persistence: createPersistence(storage),
    onStart: () => {
      started.push(1);
    },
    onEnding: (ending) => {
      endings.push(ending);
    },
  });
  return { store, storage, started, endings };
};

beforeEach(() => {
  mockedStart.mockReset();
  mockedApply.mockReset();
  mockedAvailable.mockReset().mockImplementation(() => []);
});

describe("start", () => {
  test("규칙의 startRun 한 번을 감싸고 첫 상태를 저장한다", () => {
    const { store, storage, started } = setup();
    const initial = makeRun();
    mockedStart.mockReturnValue(initial);
    mockedAvailable.mockReturnValue(["call_respond"]);

    store.getState().start("ru_first");

    expect(mockedStart).toHaveBeenCalledWith(TEST_CONTENT, "ru_first");
    expect(store.getState().run).toBe(initial);
    expect(store.getState().availableActions).toEqual(["call_respond"]);
    expect(store.getState().lastReason).toBeNull();
    expect(store.getState().hasSave()).toBe(true);
    expect(createPersistence(storage).load()).toEqual(initial);
    expect(started).toEqual([1]);
  });

  test("배치를 생략하면 undefined를 넘겨 규칙의 기본 배치를 쓴다", () => {
    const { store } = setup();
    mockedStart.mockReturnValue(makeRun());

    store.getState().start();

    expect(mockedStart).toHaveBeenCalledWith(TEST_CONTENT, undefined);
    expect(store.getState().run).not.toBeNull();
  });
});

describe("act", () => {
  test("성공 액션은 새 상태를 저장하고 사유를 비운다", () => {
    const { store, storage } = setup();
    const initial = makeRun();
    const next: RunState = makeRun({
      jobStep: "briefing",
      log: [
        { place: { kind: "job", job: "gwanak" }, text: TEST_CONTENT.actions.call_respond.result },
      ],
    });
    mockedStart.mockReturnValue(initial);
    mockedApply.mockReturnValue({ run: next, ok: true, reason: null });
    mockedAvailable
      .mockReturnValueOnce(["call_respond"])
      .mockReturnValue(["radio_morning_on", "radio_business_only"]);
    store.getState().start();

    store.getState().act("call_respond");

    expect(mockedApply).toHaveBeenCalledWith(initial, "call_respond", TEST_CONTENT);
    expect(store.getState().run).toEqual(next);
    expect(store.getState().availableActions).toEqual(["radio_morning_on", "radio_business_only"]);
    expect(store.getState().lastReason).toBeNull();
    expect(createPersistence(storage).load()).toEqual(next);
  });

  test("거부는 lastReason만 남기고 상태와 세이브를 건드리지 않는다", () => {
    const { store, storage } = setup();
    const initial = makeRun();
    mockedStart.mockReturnValue(initial);
    mockedAvailable.mockReturnValueOnce(["call_respond"]);
    store.getState().start();
    const before = store.getState().run;
    mockedApply.mockReturnValue({
      run: initial,
      ok: false,
      reason: TEST_CONTENT.actions.radio_morning_on.deny,
    });

    store.getState().act("radio_morning_on");

    expect(store.getState().lastReason).toBe(TEST_CONTENT.actions.radio_morning_on.deny);
    expect(store.getState().run).toBe(before);
    expect(createPersistence(storage).load()).toEqual(before);
  });

  test("회차가 없으면 act는 규칙에 닿지 않는다", () => {
    const { store } = setup();

    store.getState().act("call_respond");

    expect(mockedApply).not.toHaveBeenCalled();
    expect(store.getState().run).toBeNull();
  });
});

describe("terminal", () => {
  test("종결 도달은 세이브를 비우고 onEnding으로 기록을 남긴다", () => {
    const { store, storage, endings } = setup();
    const ended = makeRun({ jobStep: "site", terminal: "routine" });
    mockedStart.mockReturnValue(makeRun());
    mockedApply.mockReturnValue({ run: ended, ok: true, reason: null });
    mockedAvailable.mockReturnValueOnce(["submit_original"]).mockReturnValue([]);
    store.getState().start();

    store.getState().act("submit_original");

    expect(store.getState().run?.terminal).toBe("routine");
    expect(store.getState().availableActions).toEqual([]);
    expect(createPersistence(storage).load()).toBeNull();
    expect(storage.data.size).toBe(0);
    expect(endings).toEqual(["routine"]);
  });
});

describe("resume", () => {
  test("저장된 회차를 복원하고 파생 액션을 다시 계산한다", () => {
    const storage = memoryStorage();
    const saved = makeRun({ jobIndex: 1, jobStep: "office", party: ["taesan"] });
    createPersistence(storage).save(saved);
    const { store } = setup(storage);
    mockedAvailable.mockReturnValue(["call_respond"]);

    expect(store.getState().resume()).toBe(true);
    expect(store.getState().run).toEqual(saved);
    expect(store.getState().availableActions).toEqual(["call_respond"]);
    expect(store.getState().lastReason).toBeNull();
  });

  test("한 스토어가 저장한 회차를 다른 스토어가 그대로 복원한다", () => {
    const storage = memoryStorage();
    const initial = makeRun({ placement: "dusik_first" });
    mockedStart.mockReturnValue(initial);
    mockedAvailable.mockReturnValue(["call_respond"]);
    const first = setup(storage);
    first.store.getState().start("dusik_first");

    const second = setup(storage);
    expect(second.store.getState().resume()).toBe(true);
    expect(second.store.getState().run).toEqual(first.store.getState().run);
    expect(second.store.getState().availableActions).toEqual(
      first.store.getState().availableActions,
    );
  });

  test("저장이 없으면 false이고 상태는 null로 남는다", () => {
    const { store } = setup();

    expect(store.getState().resume()).toBe(false);
    expect(store.getState().run).toBeNull();
  });
});

describe("reset", () => {
  test("회차와 세이브를 버리고 파생 상태를 비운다", () => {
    const { store, storage } = setup();
    mockedStart.mockReturnValue(makeRun());
    mockedAvailable.mockReturnValue(["call_respond"]);
    store.getState().start();
    expect(store.getState().run).not.toBeNull();

    store.getState().reset();

    expect(store.getState().run).toBeNull();
    expect(store.getState().availableActions).toEqual([]);
    expect(store.getState().lastReason).toBeNull();
    expect(store.getState().hasSave()).toBe(false);
    expect(storage.data.size).toBe(0);
  });
});

describe("meta 기록 경로", () => {
  test("시작과 종결이 onStart·onEnding 콜백으로 metaStore에 기록된다", () => {
    const storage = memoryStorage();
    const meta = createMetaStore({
      now: () => NOW_ISO,
      persistence: createMetaPersistence(memoryStorage()),
    });
    const store = createRunStore({
      content: TEST_CONTENT,
      persistence: createPersistence(storage),
      onStart: () => meta.getState().recordRun(),
      onEnding: (ending) => meta.getState().recordEnding(ending),
    });
    const ended = makeRun({ jobStep: "site", terminal: "death" });
    mockedStart.mockReturnValue(makeRun());
    mockedApply.mockReturnValue({ run: ended, ok: true, reason: null });
    mockedAvailable.mockReturnValueOnce(["call_respond"]).mockReturnValue([]);
    store.getState().start();
    expect(meta.getState().runs).toBe(1);

    store.getState().act("call_respond");

    expect(meta.getState().runs).toBe(1);
    expect(meta.getState().endingsSeen.death).toBe(1);
    expect(meta.getState().updatedAt).toBe(NOW_ISO);
  });
});
