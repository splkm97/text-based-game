// 원장 커버리지 — prototype/remains.json에서 큐레이션한 LEDGER_FACTS 각각이 실제 CONTENT
// 문면에 나타나는지 단언한다. 비밀 사실은 관악(gwanak) 범위 밖에서만 나타나야 하고, 반장·
// 배태산의 비공개 정체 문자열은 CONTENT 어디에도 없어야 한다(사용자 결정 2026-09-14).
// 뒷정리 미니게임 종류(CLEANUP_KINDS)가 네 일감에서 서로 다른지도 여기서 한 번 더 잠근다 —
// 원장 반영과 미니게임 다양성이 같은 완료 술어에 묶여 있기 때문이다.

import { describe, expect, test } from "vitest";
import type { JobId } from "../ids";
import { CHAIN_STEP_IDS, CHARACTER_IDS, JOB_IDS, TALK_CHOICE_IDS } from "../ids";
import { CLEANUP_KINDS } from "../rules/cleanupKinds";
import type { TalkLine } from "../types";
import { CONTENT } from "./index";
import { LEDGER_FACTS } from "./ledgerFacts";

const talkTexts = (lines: readonly TalkLine[]): readonly string[] => lines.map((l) => l.text);

/** 문면 한 줄과 그 소속 일감(일감에 매이지 않은 문면은 null). */
type Entry = { readonly job: JobId | null; readonly text: string };

const jobEntries = (job: JobId): readonly Entry[] => {
  const card = CONTENT.jobs[job];
  const lines: string[] = [
    card.title,
    card.office.prompt,
    card.office.news,
    card.office.printer,
    ...talkTexts(card.office.chatter),
    card.briefing.prompt,
    card.briefing.document.heading,
    ...card.briefing.document.meta,
    ...card.briefing.document.items,
    card.briefing.document.tail,
    ...talkTexts(card.briefing.talk),
    card.party.prompt,
    ...talkTexts(card.party.notes),
    card.cleanup.prompt,
    card.site.title,
    card.site.prompt,
    card.site.document.heading,
    ...card.site.document.meta,
    ...card.site.document.items,
    card.site.document.tail,
    ...talkTexts(card.site.partyLines),
  ];
  for (const id of CHARACTER_IDS) {
    const iv = CONTENT.interviews[job][id];
    lines.push(iv.opening, ...TALK_CHOICE_IDS.map((choice) => iv.replies[choice]));
  }
  return lines.map((text) => ({ job, text }));
};

const worldEntries = (): readonly Entry[] => {
  const lines: string[] = [];
  for (const id of CHAIN_STEP_IDS) {
    const chain = CONTENT.chains[id];
    lines.push(
      chain.title,
      chain.document.heading,
      ...chain.document.meta,
      ...chain.document.items,
      chain.document.tail,
      chain.prompt,
      ...talkTexts(chain.partyLines),
    );
  }
  for (const action of Object.values(CONTENT.actions)) {
    lines.push(action.label, action.deny, action.result);
  }
  for (const ending of Object.values(CONTENT.endings)) {
    lines.push(ending.title, ending.text, ...ending.epilogue);
  }
  for (const character of Object.values(CONTENT.characters)) {
    lines.push(character.name, character.role, character.voice, character.card);
  }
  for (const name of Object.values(CONTENT.cleanupTasks)) lines.push(name);
  return lines.map((text) => ({ job: null, text }));
};

const ALL_ENTRIES: readonly Entry[] = [...JOB_IDS.flatMap(jobEntries), ...worldEntries()];
const GWANAK_ENTRIES: readonly Entry[] = ALL_ENTRIES.filter((entry) => entry.job === "gwanak");

const hasKeyword = (entries: readonly Entry[], keywords: readonly string[]): boolean =>
  entries.some((entry) => keywords.some((keyword) => entry.text.includes(keyword)));

describe("원장 커버리지 — 큐레이션된 서사적 사실이 실제 문면에 나타난다", () => {
  test.each(LEDGER_FACTS)("$id — keywords 중 하나 이상이 문면에 있다", (fact) => {
    expect(
      hasKeyword(ALL_ENTRIES, fact.keywords),
      `${fact.id} 미발견(근거: ${fact.source}) — keywords: ${fact.keywords.join(", ")}`,
    ).toBe(true);
  });

  test.each(LEDGER_FACTS.filter((fact) => fact.secret === true))(
    "$id — 비밀 사실이 관악(첫 일감) 범위에 새지 않는다",
    (fact) => {
      expect(
        hasKeyword(GWANAK_ENTRIES, fact.keywords),
        `${fact.id}가 관악 범위에 새어 나왔다 — keywords: ${fact.keywords.join(", ")}`,
      ).toBe(false);
    },
  );

  test("최 반장·배태산의 비공개 정체 문자열이 CONTENT 어디에도 없다", () => {
    const forbidden = ["비밀요원", "협회의 실세", "생체실험"];
    const hits = forbidden.filter((phrase) => hasKeyword(ALL_ENTRIES, [phrase]));
    expect(hits, `금지 문자열 발견: ${hits.join(", ") || "없음"}`).toEqual([]);
  });

  test("일감 넷의 뒷정리 미니게임 종류가 서로 다르다", () => {
    const kinds = JOB_IDS.map((job) => CLEANUP_KINDS[job]);
    const table = JOB_IDS.map((job) => `${job}=${CLEANUP_KINDS[job]}`).join(", ");
    expect(new Set(kinds).size, `종류가 겹친다: ${table}`).toBe(JOB_IDS.length);
  });
});
