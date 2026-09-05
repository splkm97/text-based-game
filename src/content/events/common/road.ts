// Common events: the open road, part 1. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const ROAD_EVENTS: readonly GameEvent[] = [
  {
    id: "common_road_broken_cart",
    title: "부서진 수레",
    text: "진창에 바퀴가 빠진 수레 옆에서 상인이 하늘에 대고 욕을 퍼붓고 있다. 노새는 이미 포기한 얼굴이다. 상인이 당신을 발견하고는 욕을 멈추고 웃는다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "수레를 밀어 올린다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 13,
          success: {
            text: "바퀴가 진창에서 빠져나온다. 상인은 약속보다 조금 적은 사례를 건네지만, 어쨌든 돈이다.",
            effects: [
              { kind: "gold", delta: 6 },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "수레는 꿈쩍도 않고, 허리에서 무언가 뚝 소리가 난다. 노새가 당신을 동정하는 눈으로 본다.",
            effects: [{ kind: "hp", delta: -2 }],
          },
        },
      },
      {
        text: "상인이 한눈파는 사이 짐을 뒤진다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 14,
          success: {
            text: "빵 한 덩이와 동전 몇 닢이 주머니로 들어온다. 상인은 여전히 하늘과 싸우는 중이다.",
            effects: [
              { kind: "item", item: "bread_loaf" },
              { kind: "gold", delta: 3 },
            ],
          },
          failure: {
            text: "노새가 크게 울고, 상인이 돌아본다. 도망치긴 했지만 그 눈빛이 며칠은 따라다닐 것 같다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
      {
        text: "못 본 척 지나간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "등 뒤에서 욕설이 다시 시작된다. 이번에는 당신 몫도 섞여 있다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_road_toll_bridge",
    title: "다리 통행세",
    text: "강 위의 낡은 다리를 창을 든 사내 둘이 막고 있다. 통행세를 걷는다는데, 어느 영주의 명인지는 서로 말이 다르다. 강물은 불어 있고 물살이 거칠다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "군말 없이 통행세를 낸다",
        requires: [{ kind: "gold", min: 10 }],
        outcome: {
          kind: "direct",
          result: {
            text: "동전이 사라지고 창이 비켜난다. 세상에서 가장 비싼 널빤지 위를 걷는다.",
            effects: [
              { kind: "gold", delta: -10 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "영주의 이름을 들먹이며 구슬린다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 14,
          success: {
            text: "두 사내가 서로를 쳐다보더니 창을 내린다. 어느 영주인지 당신도 모르지만, 그들도 모른다.",
            effects: [{ kind: "xp", delta: 4 }],
          },
          failure: {
            text: "사내들이 웃는다. 통행세에 웃음값이 더해진다.",
            effects: [{ kind: "gold", delta: -5 }],
          },
        },
      },
      {
        text: "다리를 피해 강을 건넌다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "con",
          dc: 13,
          success: {
            text: "물살은 거칠었지만 강은 통행세를 요구하지 않는다. 젖은 채로 반대편에 오른다.",
            effects: [{ kind: "xp", delta: 3 }],
          },
          failure: {
            text: "바위에 부딪히고 물을 잔뜩 마신 뒤에야 강가에 기어오른다. 사내들이 손을 흔든다.",
            effects: [{ kind: "hp", delta: -3 }],
          },
        },
      },
    ],
  },
  {
    id: "common_road_ambush",
    title: "덤불 속의 매복",
    text: "길이 좁아지는 곳에서 덤불이 부자연스럽게 흔들린다. 새 소리가 갑자기 멎는다. 누군가 당신을 기다리고 있었다는 뜻이다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "먼저 덤불로 뛰어든다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "road_bandit",
          win: {
            text: "강도는 매복의 기본조차 몰랐다. 당신이 가르쳐 주었다.",
            effects: [],
          },
          flee: {
            text: "덤불을 헤치고 달아난다. 등 뒤의 웃음소리가 오래 남는다.",
            effects: [{ kind: "sanity", delta: -1 }],
          },
        },
      },
      {
        text: "동전 주머니를 던지고 달린다",
        requires: [{ kind: "gold", min: 5 }],
        outcome: {
          kind: "direct",
          result: {
            text: "동전이 흩어지는 소리에 덤불이 조용해진다. 싸구려 평화다.",
            effects: [
              { kind: "gold", delta: -5 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
      {
        text: "길 옆 도랑에 몸을 숨긴다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 14,
          success: {
            text: "강도가 빈 길을 한참 노려보다 돌아간다. 도랑물은 차갑지만 공짜다.",
            effects: [{ kind: "xp", delta: 3 }],
          },
          failure: {
            text: "도랑은 생각보다 얕았다. 강도는 몽둥이를 휘두르고 주머니를 털어 간다.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "gold", delta: -4 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_road_dead_horse",
    title: "길가의 죽은 말",
    text: "안장을 얹은 채 죽은 말이 길가에 누워 있다. 까마귀들이 먼저 와 있었고, 기수는 어디에도 없다. 발자국이 덤불 쪽으로 이어진다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "안장 주머니를 뒤진다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 13,
          success: {
            text: "안장 안쪽에 꿰매 둔 동전 주머니를 찾아낸다. 기수는 영리했지만, 충분히 영리하진 않았다.",
            effects: [
              { kind: "gold", delta: 10 },
              { kind: "xp", delta: 2 },
            ],
          },
          failure: {
            text: "주머니에는 구더기뿐이었다. 까마귀 한 마리가 당신 어깨에 앉아 기다린다.",
            effects: [{ kind: "sanity", delta: -3 }],
          },
        },
      },
      {
        text: "발자국을 따라간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "발자국은 덤불 속으로 이어지고, 덤불은 부자연스럽게 흔들린다. 기수는 여기서 무언가를 만난 것이다.",
            effects: [
              { kind: "nextEvent", event: "common_road_ambush" },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
      {
        text: "눈을 돌리고 지나간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "까마귀 소리가 한동안 따라온다. 말의 눈이 자꾸 떠오른다.",
            effects: [
              { kind: "sanity", delta: -1 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_road_boar_field",
    title: "밭을 뒤엎는 멧돼지",
    text: "농부가 담장 위에 올라가 소리를 지르고 있다. 밭 한가운데서 멧돼지가 순무를 파먹는 중이다. 농부는 당신을 보자 소리를 지르는 방향만 바꾼다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "밭으로 뛰어들어 멧돼지와 맞선다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "wild_boar",
          win: {
            text: "농부가 담장에서 내려와 사례를 건넨다. 순무 값이라며 몇 닢 더 얹는다.",
            effects: [{ kind: "gold", delta: 4 }],
          },
          flee: {
            text: "멧돼지가 순무를 계속 먹는다. 농부는 담장 위에서 계속 소리를 지른다.",
            effects: [],
          },
        },
      },
      {
        text: "냄비를 두드려 쫓아낸다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 12,
          success: {
            text: "멧돼지가 순무 하나를 물고 숲으로 사라진다. 농부가 감사의 뜻으로 나머지 순무를 판다.",
            effects: [
              { kind: "gold", delta: 3 },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "멧돼지는 소리를 싫어했고, 당신을 더 싫어했다. 담장 너머로 던져지듯 도망친다.",
            effects: [{ kind: "hp", delta: -2 }],
          },
        },
      },
      {
        text: "담장에 기대 구경한다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "멧돼지가 이겼다. 농부는 당신을 저주하며 집으로 들어간다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
];
