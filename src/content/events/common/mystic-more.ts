// Common events: the uncanny, part 2. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const MYSTIC_MORE_EVENTS: readonly GameEvent[] = [
  {
    id: "common_mystic_standing_stones",
    title: "선돌의 원",
    text: "언덕 위에 선돌 열둘이 원을 그리고 있다. 돌마다 닳은 글자가 새겨져 있고, 원 안의 풀은 자라지 않는다. 해가 지자 돌들이 낮게 웅웅거린다.",
    pool: { kind: "common" },
    weight: 2,
    once: false,
    requires: [],
    choices: [
      {
        text: "원 안에서 밤을 새운다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "con",
          dc: 14,
          success: {
            text: "웅웅거림은 새벽까지 이어졌고, 당신은 버텼다. 해가 뜨자 돌들이 조용해지고, 몸 안에 무언가 단단해진 것이 남았다.",
            effects: [
              { kind: "xp", delta: 6 },
              { kind: "sanity", delta: 2 },
            ],
          },
          failure: {
            text: "자정 무렵 웅웅거림이 말이 되었다. 새벽에 원 밖에서 깨어났다. 어떻게 나왔는지는 모른다.",
            effects: [
              { kind: "sanity", delta: -3 },
              { kind: "hp", delta: -2 },
            ],
          },
        },
      },
      {
        text: "닳은 글자를 해독한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 15,
          success: {
            text: "글자는 달력이었다. 아주 오래된 사람들의, 아주 긴 달력. 마지막 날짜는 아직 오지 않았다.",
            effects: [{ kind: "xp", delta: 5 }],
          },
          failure: {
            text: "글자 하나를 소리 내어 읽었더니 돌들이 일제히 대답했다. 나머지는 읽지 않기로 했다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
      {
        text: "원을 돌아 지나간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "돌들의 웅웅거림이 언덕 아래까지 따라왔다. 언덕을 넘자 그쳤다. 뒤돌아보지 않았다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_mystic_wyvern_nest",
    title: "와이번의 둥지",
    text: "바위 절벽 위 둥지에 얼룩진 알 하나가 놓여 있다. 알 하나 값이면 마을 하나를 산다는 말이 있다. 어미는 보이지 않는다. 그림자는 보인다.",
    pool: { kind: "common" },
    weight: 2,
    once: false,
    requires: [],
    choices: [
      {
        text: "그림자가 멀어진 틈에 알을 훔친다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 16,
          success: {
            text: "알은 뜨거웠고 무거웠다. 절벽을 다 내려와서야 숨을 쉬었다. 마을 하나 값은 과장이었지만, 상인은 충분히 놀랐다.",
            effects: [
              { kind: "gold", delta: 35 },
              { kind: "xp", delta: 5 },
            ],
          },
          failure: {
            text: "알에 손이 닿는 순간 그림자가 돌아왔다. 절벽 아래 덤불이 당신을 받아 주었다. 덤불은 가시덤불이었다.",
            effects: [{ kind: "hp", delta: -6 }],
          },
        },
      },
      {
        text: "어미와 맞서 둥지를 차지한다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "young_wyvern",
          win: {
            text: "와이번이 추락하자 둥지가 당신 것이 된다. 알은 이미 깨져 있었지만, 둥지 바닥의 반짝이는 것들은 멀쩡했다.",
            effects: [{ kind: "gold", delta: 20 }],
          },
          flee: {
            text: "와이번은 절벽 아래까지 쫓아왔다. 발톱이 어깨를 스치고서야 흥미를 잃었다.",
            effects: [{ kind: "hp", delta: -3 }],
          },
        },
      },
      {
        text: "그림자를 보고 마음을 접는다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "마을 하나 값보다 목숨 하나 값이 더 나갔다. 적어도 오늘은.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_mystic_hermit",
    title: "산속의 은둔자",
    text: "바위 틈 오두막에 백발의 은둔자가 앉아 있다. 몇 년째 말을 안 했다는데, 당신을 보자 말을 시작한다. 할 말이 밀려 있었던 모양이다. 은둔자의 냄비에는 아무것도 없다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "빵을 나눈다",
        requires: [{ kind: "item", item: "bread_loaf" }],
        outcome: {
          kind: "direct",
          result: {
            text: "은둔자는 빵을 반으로 갈라 절반을 돌려준다. 그리고 남은 절반을 아주 오래 먹는다. 그동안 당신은 오랜만에 조용히 앉아 있었다.",
            effects: [
              { kind: "removeItem", item: "bread_loaf" },
              { kind: "sanity", delta: 4 },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "축복받은 물을 청한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "은둔자는 당신 눈을 보더니 샘물을 병에 담아 준다. 이미 아는 사람에게는 설명이 필요 없다고 했다.",
            effects: [
              { kind: "item", item: "holy_water" },
              { kind: "xp", delta: 2 },
            ],
          },
          failure: {
            text: "은둔자는 고개를 젓는다. 아직 준비되지 않았다고 한다. 병은 빈 채로 돌려받는다.",
            effects: [{ kind: "sanity", delta: -1 }],
          },
        },
      },
      {
        text: "은둔자의 가르침을 듣는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "가르침은 대부분 침묵이었다. 말이 끝나고 나서야 무엇을 배웠는지 알았다. 산을 내려오는 길이 가벼웠다.",
            effects: [
              { kind: "xp", delta: 5 },
              { kind: "sanity", delta: 3 },
            ],
          },
          failure: {
            text: "은둔자는 세 시간 동안 이야기했고, 당신은 세 시간 동안 이해하지 못했다. 은둔자는 실망한 얼굴로 다시 침묵에 들어갔다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
    ],
  },
  {
    id: "common_mystic_black_cat",
    title: "검은 고양이",
    text: "갈림길에 검은 고양이가 앉아 당신을 본다. 고양이는 오른쪽 길로 세 걸음 가더니 돌아본다. 따라오라는 뜻이다. 고양이의 뜻은 언제나 분명하다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "고양이를 따라간다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 12,
          success: {
            text: "고양이는 죽은 여행자의 배낭 앞에서 멈췄다. 여행자에게는 더 필요 없는 것들이었다. 고양이는 값을 요구하지 않았다.",
            effects: [
              { kind: "gold", delta: 8 },
              { kind: "xp", delta: 2 },
            ],
          },
          failure: {
            text: "고양이는 가시덤불 한가운데서 사라졌다. 당신은 사라지지 못했다. 고양이 웃음소리 같은 게 들렸다.",
            effects: [
              { kind: "hp", delta: -1 },
              { kind: "sanity", delta: -2 },
            ],
          },
        },
      },
      {
        text: "쓰다듬는다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "고양이는 쓰다듬는 것을 허락했다. 한동안. 그러고는 왼쪽 길로 사라졌다. 당신은 오른쪽으로 갔다.",
            effects: [
              { kind: "sanity", delta: 3 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
      {
        text: "돌을 던져 쫓는다",
        requires: [{ kind: "gold", min: 2 }],
        outcome: {
          kind: "direct",
          result: {
            text: "돌은 빗나갔고 고양이는 천천히 걸어갔다. 그날 밤 신발 한 짝이 없어졌다. 우연이겠지.",
            effects: [
              { kind: "sanity", delta: -1 },
              { kind: "gold", delta: -2 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_mystic_frost_shrine",
    title: "서리의 사당",
    text: "여름인데 골짜기 하나가 얼어 있다. 골짜기 끝 얼음 사당 앞에 거인이 앉아 있다. 거인은 숨을 쉴 때마다 눈을 내리게 한다. 사당 안에서 무언가 푸르게 빛난다.",
    pool: { kind: "common" },
    weight: 1,
    once: true,
    requires: [],
    choices: [
      {
        text: "거인에게 도전한다",
        requires: [{ kind: "stat", stat: "con", min: 10 }],
        outcome: {
          kind: "combat",
          monster: "frost_giant",
          win: {
            text: "거인이 무너지자 골짜기가 녹기 시작한다. 사당 안의 푸른 빛은 얼음으로 만든 탑 방패였다. 녹지 않는다.",
            effects: [{ kind: "item", item: "tower_shield" }],
          },
          flee: {
            text: "거인의 숨결이 등을 덮쳤다. 골짜기를 벗어났을 때 손가락 끝이 하얗게 얼어 있었다.",
            effects: [{ kind: "hp", delta: -5 }],
          },
        },
      },
      {
        text: "거인이 조는 틈에 얼음을 깨고 사당에 든다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 15,
          success: {
            text: "얼음이 갈라지고 사당 안에서 순례자들의 공물이 쏟아진다. 거인은 코를 한 번 골고 계속 잤다.",
            effects: [
              { kind: "gold", delta: 18 },
              { kind: "xp", delta: 4 },
            ],
          },
          failure: {
            text: "얼음은 깨지지 않았고 거인은 깼다. 거인의 손바닥은 얼음보다 단단했다.",
            effects: [{ kind: "hp", delta: -4 }],
          },
        },
      },
      {
        text: "사당을 향해 멀리서 절한다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "거인이 눈을 뜨고 당신을 보더니 다시 감았다. 그것으로 충분했다. 골짜기를 나올 때 눈이 그쳤다.",
            effects: [
              { kind: "sanity", delta: 2 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
];
