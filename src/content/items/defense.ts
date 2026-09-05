// Shields (defense 1..4) and armor (defense 1..5; knight_plate is 5 at 350+).

import type { Item } from "../../engine/types";
import type { ItemId } from "../ids";

export const SHIELDS = {
  plank_buckler: {
    id: "plank_buckler",
    kind: "shield",
    defense: 1,
    price: 20,
    name: "널빤지 버클러",
    description:
      "나무통 뚜껑에 손잡이를 단 것 같은 작은 방패. 실제로 그렇게 만들었을 가능성이 높다.",
  },
  kite_shield: {
    id: "kite_shield",
    kind: "shield",
    defense: 2,
    price: 80,
    name: "연꼴 방패",
    description: "위는 둥글고 아래는 뾰족한 기병용 방패. 말은 없지만 방패는 그대로 잘 막는다.",
  },
  tower_shield: {
    id: "tower_shield",
    kind: "shield",
    defense: 4,
    price: 200,
    name: "탑 방패",
    description: "몸 전체를 가리는 커다란 방패. 뒤에 숨으면 세상이 잠시 조용해진다.",
  },
  mirror_shield: {
    id: "mirror_shield",
    kind: "shield",
    defense: 3,
    price: 160,
    name: "거울 방패",
    description:
      "표면을 거울처럼 닦아 놓은 방패. 적을 눈부시게 한다지만, 주로 비치는 것은 자기 얼굴이다.",
  },
} satisfies Partial<Readonly<Record<ItemId, Item>>>;

export const ARMOR = {
  travel_cloak: {
    id: "travel_cloak",
    kind: "armor",
    defense: 1,
    price: 25,
    name: "여행자의 망토",
    description: "두꺼운 모직 망토. 비와 바람과, 아주 무딘 칼날 정도를 막아 준다.",
  },
  padded_jerkin: {
    id: "padded_jerkin",
    kind: "armor",
    defense: 2,
    price: 60,
    name: "누비 조끼",
    description: "솜을 누벼 넣은 조끼. 맞으면 아프지만 죽지는 않는 정도로 맞게 해 준다.",
  },
  chain_shirt: {
    id: "chain_shirt",
    kind: "armor",
    defense: 3,
    price: 140,
    name: "사슬 셔츠",
    description: "쇠고리를 엮어 만든 셔츠. 무겁고 차갑고, 그만큼 든든하다.",
  },
  scale_mail: {
    id: "scale_mail",
    kind: "armor",
    defense: 4,
    price: 240,
    name: "비늘 갑옷",
    description: "쇠 비늘을 겹쳐 붙인 갑옷. 걸을 때마다 짤랑거려서 잠입에는 맞지 않는다.",
  },
  knight_plate: {
    id: "knight_plate",
    kind: "armor",
    defense: 5,
    price: 380,
    name: "기사의 판금 갑옷",
    description: "전신을 감싸는 판금 갑옷. 전 주인은 기사였고, 이제는 아니다.",
  },
  shadow_leathers: {
    id: "shadow_leathers",
    kind: "armor",
    defense: 3,
    price: 120,
    name: "그림자 가죽옷",
    description:
      "검게 물들인 부드러운 가죽옷. 소리도 안 나고 빛도 안 비치니, 어두운 골목에서 특히 사랑받는다.",
  },
} satisfies Partial<Readonly<Record<ItemId, Item>>>;
