// Relics: +1..+2 to one or two stats. Price 120..500.

import type { Item } from "../../engine/types";
import type { ItemId } from "../ids";

export const RELICS = {
  lucky_coin: {
    id: "lucky_coin",
    kind: "relic",
    statBonus: { cha: 1 },
    price: 120,
    name: "행운의 동전",
    description: "양면이 모두 앞면인 동전. 내기에는 좋고, 정직한 사람이 되기에는 나쁘다.",
  },
  owl_pendant: {
    id: "owl_pendant",
    kind: "relic",
    statBonus: { wis: 2 },
    price: 200,
    name: "올빼미 펜던트",
    description: "올빼미 모양의 청동 펜던트. 걸고 있으면 밤에 유난히 눈이 밝아지는 기분이 든다.",
  },
  iron_ring: {
    id: "iron_ring",
    kind: "relic",
    statBonus: { str: 1, con: 1 },
    price: 180,
    name: "철 반지",
    description:
      "장식 하나 없는 무거운 철 반지. 끼고 있으면 주먹이 단단해지고 마음도 조금 그렇게 된다.",
  },
  sage_spectacles: {
    id: "sage_spectacles",
    kind: "relic",
    statBonus: { int: 2 },
    price: 220,
    name: "현자의 안경",
    description:
      "어느 학자가 평생 쓰던 안경. 글씨가 또렷해지고, 세상의 어리석음도 함께 또렷해진다.",
  },
  hermit_beads: {
    id: "hermit_beads",
    kind: "relic",
    statBonus: { con: 1, wis: 1 },
    price: 260,
    name: "은둔자의 염주",
    description: "산속 은둔자가 오십 년 동안 굴렸다는 나무 염주. 손에 쥐면 서두를 이유가 사라진다.",
  },
  kings_signet: {
    id: "kings_signet",
    kind: "relic",
    statBonus: { cha: 2, wis: 1 },
    price: 500,
    name: "왕의 인장 반지",
    description:
      "왕가의 문장이 새겨진 금반지. 진짜인지는 아무도 확인하지 않지만, 보여 주면 모두 고개를 숙인다.",
  },
} satisfies Partial<Readonly<Record<ItemId, Item>>>;
