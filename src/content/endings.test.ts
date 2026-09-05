import { describe, expect, test } from "vitest";
import type { Ending } from "../engine/types";
import { ENDINGS } from "./endings";
import { ENDING_IDS, type EndingId } from "./ids";

const EXPECTED: Readonly<Record<EndingId, Pick<Ending, "title" | "tone" | "scoreBonus">>> = {
  death: { title: "죽음", tone: "bad", scoreBonus: 0 },
  madness: { title: "광기", tone: "bad", scoreBonus: 0 },
  retire: { title: "은퇴", tone: "neutral", scoreBonus: 50 },
  mercenary_banner: { title: "용병의 깃발", tone: "good", scoreBonus: 200 },
  mercenary_betrayal: { title: "용병의 배신", tone: "bad", scoreBonus: 80 },
  monk_absolution: { title: "수도사의 사면", tone: "good", scoreBonus: 200 },
  monk_heresy: { title: "수도사의 이단", tone: "bad", scoreBonus: 80 },
  heir_restored: { title: "되찾은 가문", tone: "good", scoreBonus: 200 },
  heir_exile: { title: "추방된 후계자", tone: "bad", scoreBonus: 80 },
  circus_finale: { title: "서커스의 피날레", tone: "good", scoreBonus: 150 },
  lighthouse_keeper: { title: "등대지기", tone: "good", scoreBonus: 150 },
  debt_settled: { title: "청산된 빚", tone: "good", scoreBonus: 150 },
};

describe("ENDINGS", () => {
  test("defines every catalog id under its own key", () => {
    expect(Object.keys(ENDINGS).toSorted()).toEqual([...ENDING_IDS].toSorted());
    for (const id of ENDING_IDS) {
      expect(ENDINGS[id].id).toBe(id);
    }
  });

  test.each(ENDING_IDS)("%s has the fixed title, tone and bonus", (id) => {
    const { title, tone, scoreBonus } = ENDINGS[id];
    expect({ title, tone, scoreBonus }).toEqual(EXPECTED[id]);
  });

  test.each(ENDING_IDS)("%s has a multi-sentence Korean text", (id) => {
    const sentences = ENDINGS[id].text.split(/[.!?]\s*/).filter((s) => s.length > 0);
    expect(sentences.length).toBeGreaterThanOrEqual(3);
    expect(sentences.length).toBeLessThanOrEqual(5);
    expect(ENDINGS[id].text).toMatch(/[가-힣]/);
  });
});
