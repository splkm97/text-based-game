// Night confrontations: a crew member at stress 80+ blocks the captain. Authority check vs `dc`.
// Failure effects default to captain hp -3; only the last two override it.

import type { Confrontation } from "../types";

export const CONFRONTATIONS: readonly Confrontation[] = [
  {
    id: "cf_open_the_hatch",
    title: "해치를 열어라",
    text: "격리 구획 해치 앞을 막아선다. 안에 있는 사람은 아프지 않다고, 당신도 안다고 말한다. 손에는 절단기가 들려 있다.",
    dc: 11,
    success: {
      text: "절단기를 내려놓게 한다. 내일 아침 검사를 약속한다. 그 약속을 들은 사람이 복도에 셋 더 있다.",
      effects: [{ kind: "trust", delta: 3 }],
    },
    failure: {
      text: "절단기 손잡이가 당신 갈비뼈에 닿는다. 해치는 열리지 않았다. 당신은 바닥에 있다.",
    },
  },
  {
    id: "cf_radio_earth",
    title: "지구에 직접",
    text: "통신실 문을 등지고 선다. 지구에 직접 보고하겠다고 한다. 선장이 숨기는 것이 있다고 한다.",
    dc: 12,
    success: {
      text: "통신 로그를 통째로 열어 보인다. 숨긴 것은 없다. 늦은 것뿐이다. 문에서 물러난다.",
      effects: [{ kind: "stress", target: "all", delta: -3 }],
    },
    failure: {
      text: "콘솔로 밀쳐진다. 전송 버튼을 누르기 전에 부함장이 끌어낸다. 이마에서 피가 난다.",
    },
  },
  {
    id: "cf_take_the_keys",
    title: "열쇠를 내놔",
    text: "의무실 열쇠를 요구한다. 약을 나눠야 한다고, 당신은 누굴 살릴지 고를 자격이 없다고 한다.",
    dc: 13,
    success: {
      text: "재고 장부를 펼쳐 남은 수를 센다. 셋이 함께 센다. 열쇠는 당신 주머니에 남는다.",
      effects: [{ kind: "trust", delta: 2 }],
    },
    failure: {
      text: "몸싸움 끝에 열쇠는 지켰다. 검사 키트 상자 하나가 바닥에서 깨졌다.",
      effects: [
        { kind: "hp", delta: -2 },
        { kind: "kits", delta: -1 },
      ],
    },
  },
  {
    id: "cf_blade_in_the_galley",
    title: "식당의 칼",
    text: "조리용 칼을 들고 식탁 위에 서 있다. 누구도 접근하지 못한다. 당신 이름을 부른다.",
    dc: 14,
    success: {
      text: "천천히 다가가 손을 내민다. 칼이 식탁 위에 놓인다. 울음이 그 뒤를 따른다.",
      effects: [{ kind: "authority", delta: 1 }],
    },
    failure: {
      text: "칼날이 팔을 긋는다. 보안관이 뒤에서 제압한다. 식당 바닥에 당신 피가 길게 남는다.",
      effects: [{ kind: "hp", delta: -4 }],
    },
  },
];
