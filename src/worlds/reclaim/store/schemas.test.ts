// 스키마는 저장 경계의 유일한 검증이다. 통과 케이스는 "완전한 RunState/MetaState가
// 그대로 돌려준다"를, 실패 케이스는 구(voyage형 구 페이로드)·손상(필드 누락·enum 이탈·
// 범위 이탈·판별 유니온 이탈) 페이로드가 전부 null로 거부됨을 증명한다 — 마이그레이션
// 없이 반쯤 로드하지 않는 정책의 회귀 테스트.

import { describe, expect, test } from "vitest";
import { JOB_IDS } from "../ids";
import { RECHANCE_LIMIT, REVIEW_LIMIT } from "../rules/run";
import { makeRun } from "../rules/testContent";
import type { MetaState } from "./schemas";
import { parseMeta, parseRun } from "./schemas";

const midRun = makeRun({
  placement: "dusik_first",
  jobIndex: 2,
  jobStep: "site",
  party: ["dusik", "ru"],
  characters: {
    dusik: { fatigue: 1, injured: false, suspicion: 2, trust: 3 },
    ru: { fatigue: 2, injured: true, suspicion: 0, trust: 3 },
    banjang: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
    taesan: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
  },
  pendingChain: ["gun", "submit"],
  chainStep: "venue",
  documents: true,
  broadcast: true,
  coord: true,
  reviews: 2,
  chances: 1,
  log: [
    { place: { kind: "job", job: "hq" }, text: "문서와 대조했다" },
    { place: { kind: "chain", chain: "venue" }, text: "대회장에 도착했다" },
  ],
});

const meta: MetaState = {
  endingsSeen: {
    true_ru: 1,
    true_dusik: 0,
    death: 2,
    gov: 0,
    press: 0,
    general: 1,
    routine: 0,
  },
  runs: 4,
  updatedAt: "2026-09-14T09:00:00.000Z",
};

describe("parseRun", () => {
  test("완전한 회차를 그대로 돌려준다 — placement와 log 포함", () => {
    expect(parseRun(JSON.stringify(midRun))).toEqual(midRun);
    expect(parseRun(JSON.stringify(makeRun()))).toEqual(makeRun());
  });

  test("쓰레기 입력은 전부 null이다", () => {
    for (const json of ["", "not json", "null", "[]", "{}", "42"]) {
      expect(parseRun(json), json).toBeNull();
    }
  });

  test("구 페이로드(다른 버전의 모양)는 null이다", () => {
    expect(parseRun(JSON.stringify({ day: 1, phase: { kind: "comms" }, crew: [] }))).toBeNull();
    // 구 LogEntry 모양 — log의 place 판별 유니온이 생기기 전의 필드명이다.
    expect(
      parseRun(JSON.stringify({ ...midRun, log: [{ stage: "venue", text: "구 로그" }] })),
    ).toBeNull();
  });

  test("필드가 하나만 어긋나도 null이다", () => {
    const broken: Record<string, unknown>[] = [
      { ...midRun, placement: undefined }, // 필드 누락
      { ...midRun, placement: "mars" }, // enum 이탈
      { ...midRun, jobIndex: -1 }, // 위치 범위 밖
      { ...midRun, jobIndex: JOB_IDS.length }, // 목록 끝 다음
      { ...midRun, jobIndex: 1.5 }, // 정수 아님
      { ...midRun, jobStep: "lobby" }, // 순서 enum 이탈
      { ...midRun, party: ["dusik", "ru", "banjang"] }, // 동행 최대 2 초과
      { ...midRun, party: ["mars"] }, // 인물 enum 이탈
      {
        ...midRun,
        characters: { ...midRun.characters, ru: undefined }, // 인물 축 누락
      },
      {
        ...midRun,
        characters: { ...midRun.characters, dusik: { ...midRun.characters.dusik, injured: "no" } },
      },
      { ...midRun, pendingChain: ["church"] }, // 체인 enum 이탈
      { ...midRun, cleanupPicks: ["sign", "sign"] }, // 뒷정리 중복 선택
      { ...midRun, cleanupPicks: ["sign", "power", "search", "search"] }, // 길이는 4지만 중복 — 교착 회차
      { ...midRun, cleanupPicks: ["sign", "power", "search", "photo", "sign"] }, // 상한 초과
      { ...midRun, chainStep: "church" },
      { ...midRun, terminal: "bankruptcy" }, // 미구현 종결
      { ...midRun, terminal: 0 },
      { ...midRun, documents: "yes" },
      { ...midRun, reviews: REVIEW_LIMIT + 1 }, // 범위 이탈
      { ...midRun, chances: -1 },
      { ...midRun, chances: RECHANCE_LIMIT + 1 },
      { ...midRun, log: [{ place: { kind: "church" }, text: "오염" }] }, // 판별 kind 이탈
      { ...midRun, log: [{ place: { kind: "job", job: "church" }, text: "오염" }] }, // job enum 이탈
      { ...midRun, log: [{ place: { kind: "chain", chain: "venue" } }] }, // text 누락
    ];
    for (const [i, payload] of broken.entries()) {
      expect(parseRun(JSON.stringify(payload)), `case ${i}`).toBeNull();
    }
  });
});

describe("parseMeta", () => {
  test("완전한 기록을 그대로 돌려준다", () => {
    expect(parseMeta(JSON.stringify(meta))).toEqual(meta);
  });

  test("쓰레기와 부분 기록은 null이다", () => {
    expect(parseMeta("not json")).toBeNull();
    expect(parseMeta("{}")).toBeNull();
    // 종결 카운트 키가 하나 빠진 기록
    expect(
      parseMeta(JSON.stringify({ ...meta, endingsSeen: { true_ru: 1, death: 2 } })),
    ).toBeNull();
    expect(parseMeta(JSON.stringify({ ...meta, runs: "4" }))).toBeNull();
    expect(
      parseMeta(JSON.stringify({ ...meta, endingsSeen: { ...meta.endingsSeen, death: -1 } })),
    ).toBeNull();
  });
});
