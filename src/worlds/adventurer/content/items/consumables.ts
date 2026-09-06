// Consumables: used from inventory, then removed. Price 5..120.

import type { Item } from "../../engine/types";
import type { ItemId } from "../ids";

export const CONSUMABLES = {
  bread_loaf: {
    id: "bread_loaf",
    kind: "consumable",
    effects: [{ kind: "hp", delta: 3 }],
    price: 5,
    name: "빵 한 덩이",
    description: "딱딱하지만 배는 채워 준다. 이틀만 지나면 무기로도 쓸 수 있다.",
  },
  healing_salve: {
    id: "healing_salve",
    kind: "consumable",
    effects: [{ kind: "hp", delta: 8 }],
    price: 25,
    name: "치유 연고",
    description: "약초 냄새가 지독한 연고. 상처에 바르면 따갑고, 따가운 만큼 낫는다.",
  },
  strong_wine: {
    id: "strong_wine",
    kind: "consumable",
    effects: [
      { kind: "sanity", delta: 4 },
      { kind: "hp", delta: -1 },
    ],
    price: 12,
    name: "독한 포도주",
    description: "한 잔이면 근심이 사라진다. 두 잔이면 기억도 사라진다.",
  },
  calming_tea: {
    id: "calming_tea",
    kind: "consumable",
    effects: [{ kind: "sanity", delta: 6 }],
    price: 20,
    name: "진정의 차",
    description: "쓴맛이 도는 약초차. 마시고 나면 세상이 조금 덜 끔찍해 보인다.",
  },
  antidote: {
    id: "antidote",
    kind: "consumable",
    effects: [{ kind: "hp", delta: 4 }],
    price: 18,
    name: "해독제",
    description: "약제사가 장담한 해독제. 독에 당한 게 아니어도 마시면 왠지 나아지는 기분이 든다.",
  },
  torch: {
    id: "torch",
    kind: "consumable",
    effects: [{ kind: "xp", delta: 2 }],
    price: 10,
    name: "횃불",
    description: "송진을 먹인 횃불. 어둠 속에서 길을 찾다 보면 배우는 것이 생긴다.",
  },
  rope: {
    id: "rope",
    kind: "consumable",
    effects: [{ kind: "xp", delta: 2 }],
    price: 10,
    name: "밧줄",
    description: "튼튼한 삼줄 열 발. 어디에 쓸지는 모르지만, 없어서 후회한 사람은 많다.",
  },
  holy_water: {
    id: "holy_water",
    kind: "consumable",
    effects: [{ kind: "sanity", delta: 8 }],
    price: 45,
    name: "성수",
    description: "사제가 축복한 물이며, 마시면 마음이 맑아진다. 축복이 진짜였는지는 별개의 문제다.",
  },
  dream_powder: {
    id: "dream_powder",
    kind: "consumable",
    effects: [
      { kind: "sanity", delta: 10 },
      { kind: "hp", delta: -3 },
    ],
    price: 60,
    name: "꿈의 가루",
    description: "들이마시면 아름다운 꿈을 꾼다. 깨어나면 몸이 그 값을 치른다.",
  },
  elixir_of_vigor: {
    id: "elixir_of_vigor",
    kind: "consumable",
    effects: [
      { kind: "hp", delta: 15 },
      { kind: "sanity", delta: 5 },
    ],
    price: 120,
    name: "활력의 영약",
    description:
      "황금빛으로 빛나는 영약으로, 한 모금에 온몸이 깨어난다. 값이 비싼 데는 이유가 있다.",
  },
} satisfies Partial<Readonly<Record<ItemId, Item>>>;
