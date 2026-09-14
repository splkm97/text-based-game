// AI 문체 금지 — narrative-rewriter.md 1계층 규칙 중 정규식으로 기계 판정 가능한 항목만
// CONTENT 전 문면에서 검사한다(대조 구문, 상투적 신체 클리셰, 서술자의 평가성 요약, 물성화
// 과잉 묘사). 번역투·비유·추상적 문장·주인공 무자각 원칙은 사람 판단이 필요해 여기서 다루지
// 않는다 — narrative-scene-after-generation·red-team-reader 리뷰가 그 몫이다.

import { describe, expect, test } from "vitest";
import type { JobId } from "../ids";
import { CHAIN_STEP_IDS, CHARACTER_IDS, JOB_IDS, TALK_CHOICE_IDS } from "../ids";
import { CONTENT } from "./index";

type Entry = { readonly where: string; readonly text: string };

const jobEntries = (job: JobId): readonly Entry[] => {
  const card = CONTENT.jobs[job];
  const w = `jobs.${job}`;
  const entries: Entry[] = [
    { where: `${w}.title`, text: card.title },
    { where: `${w}.office.prompt`, text: card.office.prompt },
    { where: `${w}.office.news`, text: card.office.news },
    { where: `${w}.office.printer`, text: card.office.printer },
    { where: `${w}.briefing.prompt`, text: card.briefing.prompt },
    { where: `${w}.party.prompt`, text: card.party.prompt },
    { where: `${w}.cleanup.prompt`, text: card.cleanup.prompt },
    { where: `${w}.site.title`, text: card.site.title },
    { where: `${w}.site.prompt`, text: card.site.prompt },
  ];
  for (const line of card.office.chatter) {
    entries.push({ where: `${w}.office.chatter`, text: line.text });
  }
  for (const line of card.briefing.talk)
    entries.push({ where: `${w}.briefing.talk`, text: line.text });
  for (const line of card.party.notes) entries.push({ where: `${w}.party.notes`, text: line.text });
  for (const line of card.site.partyLines) {
    entries.push({ where: `${w}.site.partyLines`, text: line.text });
  }
  for (const id of CHARACTER_IDS) {
    const iv = CONTENT.interviews[job][id];
    entries.push({ where: `interviews.${job}.${id}.opening`, text: iv.opening });
    for (const choice of TALK_CHOICE_IDS) {
      entries.push({ where: `interviews.${job}.${id}.${choice}`, text: iv.replies[choice] });
    }
  }
  return entries;
};

const worldEntries = (): readonly Entry[] => {
  const entries: Entry[] = [];
  for (const id of CHAIN_STEP_IDS) {
    const chain = CONTENT.chains[id];
    entries.push({ where: `chains.${id}.prompt`, text: chain.prompt });
    for (const line of chain.partyLines) {
      entries.push({ where: `chains.${id}.partyLines`, text: line.text });
    }
  }
  for (const [id, action] of Object.entries(CONTENT.actions)) {
    entries.push({ where: `actions.${id}.label`, text: action.label });
    entries.push({ where: `actions.${id}.deny`, text: action.deny });
    entries.push({ where: `actions.${id}.result`, text: action.result });
  }
  for (const [id, ending] of Object.entries(CONTENT.endings)) {
    entries.push({ where: `endings.${id}.text`, text: ending.text });
    for (const line of ending.epilogue)
      entries.push({ where: `endings.${id}.epilogue`, text: line });
  }
  for (const [id, character] of Object.entries(CONTENT.characters)) {
    entries.push({ where: `characters.${id}.card`, text: character.card });
  }
  return entries;
};

const ALL_ENTRIES: readonly Entry[] = [...JOB_IDS.flatMap(jobEntries), ...worldEntries()];

/** narrative-rewriter.md 1계층 「AI 문체 금지」 항목 중 정규식으로 기계 판정 가능한 패턴. */
const FORBIDDEN_PATTERNS: readonly { readonly label: string; readonly pattern: RegExp }[] = [
  { label: "대조 구문(A가/이 아니라 B다)", pattern: /[가이] 아니라/ },
  { label: "군더더기 수식어(단순한/단순히)", pattern: /단순(한|히)/ },
  { label: "서술자의 평가성 요약(뻔했다/분명했다)", pattern: /것이 (뻔했|분명했)/ },
  { label: "물성화(시선이 오가다/머물다/얽히다)", pattern: /시선이 (오가|머물|얽히)/ },
  { label: "물성화(목소리가 낮게 가라앉다)", pattern: /목소리가 (낮게 )?가라앉/ },
  { label: "상투적 신체 클리셰(미간)", pattern: /미간을 (찌푸|파이)/ },
  { label: "상투적 신체 클리셰(입술)", pattern: /입술을 (짓씹|깨물)/ },
  { label: "상투적 신체 클리셰(턱짓)", pattern: /턱짓/ },
  { label: "상투적 신체 클리셰(동공)", pattern: /동공이 흔들/ },
  { label: "상투적 신체 클리셰(주먹)", pattern: /주먹을 꽉/ },
];

describe("AI 문체 금지 — narrative-rewriter.md 1계층 규칙", () => {
  test.each(FORBIDDEN_PATTERNS)("$label — CONTENT 전 문면에서 0건", ({ pattern }) => {
    const hits = ALL_ENTRIES.filter((entry) => pattern.test(entry.text)).map(
      (entry) => entry.where,
    );
    expect(hits, `발견 위치: ${hits.join(", ") || "없음"}`).toEqual([]);
  });
});
