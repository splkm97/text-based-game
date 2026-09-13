// 이 월드의 세이브 슬롯 두 개 — 회차(run)와 회차 간 기록(meta). 스토리지가 없거나 던지는
// 환경(사생활 보호 모드·quota·no DOM)에서는 `createSlot` 안에서 no-op로 강등되므로
// 게임은 영속성 없이도 돌아간다. run 키는 상태 모델이 갈릴 때마다 버전이 오른다(2026-09-14
// 일감 재편 → v2): 구 버전 키는 읽지도 않는다 — 마이그레이션 없이 버리는 게 정책이다.

import { browserStorage, createSlot, type Slot, type StorageLike } from "../../../shared/storage";
import type { RunState } from "../types";
import type { MetaState } from "./schemas";
import { parseMeta, parseRun } from "./schemas";

const RUN_KEY = "lia.reclaim.run.v3";
const META_KEY = "lia.reclaim.meta.v1";

export type RunPersistence = Slot<RunState>;
export type MetaPersistence = Slot<MetaState>;

export const createPersistence = (storage: StorageLike | null): RunPersistence =>
  createSlot(storage, RUN_KEY, parseRun);

export const createMetaPersistence = (storage: StorageLike | null): MetaPersistence =>
  createSlot(storage, META_KEY, parseMeta);

export const persistence: RunPersistence = createPersistence(browserStorage());
export const metaPersistence: MetaPersistence = createMetaPersistence(browserStorage());
