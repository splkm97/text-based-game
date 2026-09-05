// Trait catalog. Neutral values: statBonus {}, goldMultiplier 1, attackBonus 0,
// defenseBonus 0, sanityLossReduction 0, levelUpPoints () => 3.

import type { Trait } from "../engine/types";
import type { TraitId } from "./ids";

const NEUTRAL = {
  statBonus: {},
  goldMultiplier: 1,
  attackBonus: 0,
  defenseBonus: 0,
  sanityLossReduction: 0,
  levelUpPoints: () => 3,
} as const satisfies Omit<Trait, "id" | "name" | "description">;

export const TRAITS: Readonly<Record<TraitId, Trait>> = {
  strong_arms: {
    ...NEUTRAL,
    id: "strong_arms",
    name: "억센 팔",
    description: "평생 무거운 것을 들어 온 팔. 병을 따는 데도, 문을 부수는 데도 쓸모가 있다.",
    statBonus: { str: 2 },
  },
  quick_feet: {
    ...NEUTRAL,
    id: "quick_feet",
    name: "빠른 발",
    description: "도망치는 데 재능이 있다. 좋게 말하면 발이 빠르고, 나쁘게 말해도 발이 빠르다.",
    statBonus: { agi: 2 },
  },
  bookworm: {
    ...NEUTRAL,
    id: "bookworm",
    name: "책벌레",
    description: "책을 읽느라 세상을 놓쳤지만, 책 안에도 세상이 꽤 많이 들어 있었다.",
    statBonus: { int: 2 },
  },
  silver_tongue: {
    ...NEUTRAL,
    id: "silver_tongue",
    name: "달변가",
    description: "말로 안 되는 일은 없다고 믿는다. 가끔은 실제로 그렇다.",
    statBonus: { cha: 2 },
  },
  iron_body: {
    ...NEUTRAL,
    id: "iron_body",
    name: "강철 육체",
    description: "병치레 한 번 없이 자란 몸. 독약도 소화가 좀 안 되는 정도로 넘긴다.",
    statBonus: { con: 2 },
  },
  keen_eyes: {
    ...NEUTRAL,
    id: "keen_eyes",
    name: "예리한 눈",
    description: "남들이 놓치는 것을 본다. 대체로 보지 않는 편이 마음 편한 것들이다.",
    statBonus: { wis: 2 },
  },
  miser: {
    ...NEUTRAL,
    id: "miser",
    name: "구두쇠",
    description: "동전 한 닢도 그냥 보내지 않는다. 그래서 늘 조금 더 남는다.",
    goldMultiplier: 1.2,
  },
  late_bloomer: {
    ...NEUTRAL,
    id: "late_bloomer",
    name: "대기만성",
    description: "처음에는 느리다. 모두가 포기할 때쯤 갑자기 따라잡는다.",
    levelUpPoints: (levelIndex) => (levelIndex < 4 ? 2 : 5),
  },
  berserker: {
    ...NEUTRAL,
    id: "berserker",
    name: "광전사",
    description: "싸움이 시작되면 방어를 잊는다. 잊는다기보다, 애초에 관심이 없다.",
    attackBonus: 2,
    defenseBonus: -1,
  },
  steel_mind: {
    ...NEUTRAL,
    id: "steel_mind",
    name: "강철 정신",
    description: "끔찍한 것을 보고도 밤에 잠을 잔다. 조금 덜 잘 뿐이다.",
    sanityLossReduction: 1,
  },
};
