// 스키마는 저장 경계의 유일한 검증이다. 통과 케이스는 "완전한 RunState/MetaState가
// 그대로 돌아온다"를, 실패 케이스는 구(voyage형 구 페이로드)·손상(필드 누락·enum 이탈·
// 범위 이탈) 페이로드가 전부 null로 거부됨을 증명한다 — 마이그레이션 없이 반쯤 로드하지
// 않는 정책의 회귀 테스트.

import { describe, expect, test } from "vitest";
import { RECHANCE_LIMIT, REVIEW_LIMIT } from "../rules/run";
import { makeRun } from "../rules/testContent";
import type { MetaState } from "./schemas";
import { parseMeta, parseRun } from "./schemas";

const midRun = makeRun({
  placement: "dusik_first",
  stage: "venue",
  documents: true,
  broadcast: true,
  coord: true,
  reviews: 2,
  chances: 1,
  log: [
    { stage: "archive", text: "문서와 대조했다" },
    { stage: "venue", text: "대회장에 도착했다" },
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
  });

  test("필드가 하나만 어긋나도 null이다", () => {
    const broken: Record<string, unknown>[] = [
      { ...midRun, placement: undefined }, // 필드 누락
      { ...midRun, placement: "mars" }, // enum 이탈
      { ...midRun, stage: "church" },
      { ...midRun, terminal: "bankruptcy" }, // 미구현 종결
      { ...midRun, terminal: 0 },
      { ...midRun, documents: "yes" },
      { ...midRun, reviews: REVIEW_LIMIT + 1 }, // 범위 이탈
      { ...midRun, chances: -1 },
      { ...midRun, chances: RECHANCE_LIMIT + 1 },
      { ...midRun, log: [{ stage: "church", text: "오염" }] },
      { ...midRun, log: [{ stage: "venue" }] }, // text 누락
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
