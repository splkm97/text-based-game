// The three playable origins. Each one opens its own six-event story chain
// through the start flag its first story event requires.

import type { Origin } from "../engine/types";
import type { OriginId } from "./ids";

export const ORIGINS: Readonly<Record<OriginId, Origin>> = {
  origin_mercenary: {
    id: "origin_mercenary",
    name: "떠돌이 용병",
    description:
      "급료가 끊긴 날 부대는 흩어졌고, 깃발은 누군가의 짐수레에 실려 사라졌다. 당신에게 남은 것은 녹슨 검 한 자루와 빵 한 덩이, 그리고 아직 갚지 못한 술값뿐이다. 깃발을 되찾으면 부대도 돌아올 거라고, 적어도 당신은 그렇게 믿기로 했다.",
    startingItems: ["rusty_sword", "bread_loaf"],
    startingGold: 20,
    startingFlags: ["mercenary.start"],
  },
  origin_monk: {
    id: "origin_monk",
    name: "파문당한 수도사",
    description:
      "금서고에서 꺼내 온 책 한 권 때문에 수도원 문이 등 뒤에서 닫혔다. 책은 밤마다 스스로 페이지를 넘기는 듯하고, 당신은 그것을 돌려주고 싶은지 끝까지 읽고 싶은지 아직 정하지 못했다. 지팡이와 성수 한 병이 당신이 챙겨 나온 전부다.",
    startingItems: ["ashwood_staff", "holy_water"],
    startingGold: 10,
    startingFlags: ["monk.start"],
  },
  origin_heir: {
    id: "origin_heir",
    name: "몰락한 가문의 후계자",
    description:
      "저택은 저당 잡혔고, 초상화는 팔렸고, 가문의 인장은 어느 날 금고에서 사라졌다. 인장 없이는 이름을 증명할 수 없고, 이름 없이는 아무것도 되찾을 수 없다. 은빛 레이피어와 행운의 동전, 그리고 아직 남은 은화 몇 닢이 당신이 물려받은 유산의 전부다.",
    startingItems: ["silver_rapier", "lucky_coin"],
    startingGold: 60,
    startingFlags: ["heir.start"],
  },
};
