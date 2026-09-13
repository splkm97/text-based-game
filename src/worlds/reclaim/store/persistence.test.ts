// 슬롯 계약: 없으면 null, 있으면 파싱해 돌려주고, clear는 키를 지운다. 스토리지가
// 없으면(null) 전부 no-op다. 검증은 schemas.ts가 이미 하므로 여기서는 키 이름과
// 왕복·강등 동작만 본다. run 키는 v3다 — 구 v1·v2 키는 다른 세이브 슬롯처럼 무시된다.

import { describe, expect, test } from "vitest";
import { memoryStorage } from "../../../shared/storage";
import { makeRun } from "../rules/testContent";
import { createMetaPersistence, createPersistence } from "./persistence";

const RUN_KEY = "lia.reclaim.run.v3";
const META_KEY = "lia.reclaim.meta.v1";

describe("run slot", () => {
  test("저장한 회차를 버전 키에 저장하고 그대로 돌려준다", () => {
    const storage = memoryStorage();
    const slot = createPersistence(storage);
    const run = makeRun({ jobIndex: 3, jobStep: "site", clue: true });

    slot.save(run);
    expect(storage.data.has(RUN_KEY)).toBe(true);
    expect(slot.load()).toEqual(run);
  });

  test("빈 슬롯은 null이고, clear는 키 자체를 비운다", () => {
    const storage = memoryStorage();
    const slot = createPersistence(storage);

    expect(slot.load()).toBeNull();
    slot.save(makeRun());
    slot.clear();
    expect(storage.data.has(RUN_KEY)).toBe(false);
    expect(slot.load()).toBeNull();
  });

  test("저장소에 직접 쓴 손상 페이로드는 null로 강등된다", () => {
    const storage = memoryStorage();
    const slot = createPersistence(storage);
    storage.setItem(RUN_KEY, "{oops");

    expect(slot.load()).toBeNull();
  });

  test("구 v1 키의 세이브는 읽지 않는다 — 마이그레이션 없이 버린다", () => {
    const storage = memoryStorage();
    storage.setItem("lia.reclaim.run.v1", "{}");

    expect(createPersistence(storage).load()).toBeNull();
  });

  test("구 v2 키의 세이브도 읽지 않는다 — 뒷정리 상태가 없는 페이로드는 반쯤 로드하지 않는다", () => {
    const storage = memoryStorage();
    storage.setItem("lia.reclaim.run.v2", "{}");

    expect(createPersistence(storage).load()).toBeNull();
  });

  test("스토리지가 없으면 저장도 읽기도 조용히 무시된다", () => {
    const slot = createPersistence(null);

    expect(slot.load()).toBeNull();
    slot.save(makeRun());
    slot.clear();
  });
});

describe("meta slot", () => {
  test("저장한 기록을 버전 키에 저장하고 그대로 돌려준다", () => {
    const storage = memoryStorage();
    const slot = createMetaPersistence(storage);
    const meta = {
      endingsSeen: {
        true_ru: 1,
        true_dusik: 0,
        death: 0,
        gov: 0,
        press: 0,
        general: 0,
        routine: 3,
      },
      runs: 5,
      updatedAt: "2026-09-14T09:00:00.000Z",
    };

    slot.save(meta);
    expect(storage.data.has(META_KEY)).toBe(true);
    expect(slot.load()).toEqual(meta);
  });

  test("빈 슬롯은 null이고 clear는 키를 비운다", () => {
    const storage = memoryStorage();
    const slot = createMetaPersistence(storage);

    expect(slot.load()).toBeNull();
    slot.save({
      endingsSeen: {
        true_ru: 0,
        true_dusik: 0,
        death: 0,
        gov: 0,
        press: 0,
        general: 0,
        routine: 0,
      },
      runs: 0,
      updatedAt: "",
    });
    slot.clear();
    expect(storage.data.has(META_KEY)).toBe(false);
  });
});
