// Common events: the wilds, part 2. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const WILDS_MORE_EVENTS: readonly GameEvent[] = [
  {
    id: "common_wilds_hunter_lodge",
    title: "사냥꾼의 오두막",
    text: "숲 깊은 곳 오두막의 처마에 가죽과 뿔이 줄줄이 걸려 있다. 사냥꾼은 당신을 위아래로 훑더니 사슴 고기를 한 점 자른다. 손님이 드문 모양이다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "단궁을 사겠다고 한다",
        requires: [{ kind: "gold", min: 30 }],
        outcome: {
          kind: "direct",
          result: {
            text: "사냥꾼은 처마 아래 걸린 단궁을 내려 시위를 당겨 보인 뒤 값을 부른다. 깎아 주지는 않는다.",
            effects: [
              { kind: "gold", delta: -30 },
              { kind: "item", item: "short_bow" },
            ],
          },
        },
      },
      {
        text: "새벽 사냥에 따라나선다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "사슴을 몰아 사냥꾼의 화살 앞에 세웠다. 고기는 사냥꾼이, 가죽 값은 당신이 가져간다.",
            effects: [
              { kind: "gold", delta: 5 },
              { kind: "xp", delta: 4 },
            ],
          },
          failure: {
            text: "나뭇가지를 밟았고, 사슴은 도망갔고, 사냥꾼은 당신을 두고 갔다. 돌아오는 길에 가시덤불이 있었다.",
            effects: [{ kind: "hp", delta: -2 }],
          },
        },
      },
      {
        text: "하룻밤 묵고 간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "모닥불 앞에서 사냥꾼의 이야기를 들었다. 곰 이야기가 셋, 사람 이야기가 하나였다. 사람 이야기가 더 무서웠다.",
            effects: [
              { kind: "hp", delta: 3 },
              { kind: "sanity", delta: 1 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_wilds_harpy_cliff",
    title: "절벽의 둥지",
    text: "절벽 중턱 바위 틈에 커다란 둥지가 걸려 있다. 반짝이는 것이 둥지 밖으로 삐져나와 있고, 그 위로 날개 달린 것이 원을 그린다. 울음소리가 사람 웃음과 비슷하다.",
    pool: { kind: "common" },
    weight: 2,
    once: false,
    requires: [],
    choices: [
      {
        text: "날개 달린 것을 끌어내려 싸운다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "harpy",
          win: {
            text: "하피가 떨어지자 둥지는 조용해진다. 반짝이던 것은 대부분 유리 조각이었다.",
            effects: [{ kind: "gold", delta: 4 }],
          },
          flee: {
            text: "하피는 당신을 절벽 아래까지 쫓아오며 웃었다. 발톱 자국이 남았다.",
            effects: [{ kind: "hp", delta: -2 }],
          },
        },
      },
      {
        text: "하피가 없는 틈에 둥지를 턴다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 16,
          success: {
            text: "둥지 바닥에 순례자의 반지와 상인의 동전이 있었다. 하피는 수집가였다. 이제 당신이 수집가다.",
            effects: [
              { kind: "gold", delta: 20 },
              { kind: "xp", delta: 5 },
            ],
          },
          failure: {
            text: "손을 뻗는 순간 그림자가 덮쳤다. 절벽을 굴러 내려온 것은 당신 쪽이었다.",
            effects: [{ kind: "hp", delta: -5 }],
          },
        },
      },
      {
        text: "바위 뒤에 숨어 지나가기를 기다린다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 12,
          success: {
            text: "해가 기울자 하피는 먹이를 찾아 멀리 날아갔다. 당신은 반대쪽으로 갔다.",
            effects: [{ kind: "xp", delta: 2 }],
          },
          failure: {
            text: "하피는 당신을 보지 못했지만, 밤새 바위 위에서 웃었다. 사람 웃음소리로.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
    ],
  },
  {
    id: "common_wilds_hill_troll",
    title: "언덕의 트롤",
    text: "언덕길 한가운데 바위인 줄 알았던 것이 일어선다. 트롤은 당신을 내려다보며 코를 긁는다. 지나가려면 뭔가를 내놓으라는데, 뭔지는 자기도 아직 정하지 않았다.",
    pool: { kind: "common" },
    weight: 2,
    once: false,
    requires: [],
    choices: [
      {
        text: "정면으로 맞선다",
        requires: [{ kind: "stat", stat: "str", min: 9 }],
        outcome: {
          kind: "combat",
          monster: "hill_troll",
          win: {
            text: "트롤이 쓰러진 자리에서 쇠 반지가 굴러 나온다. 트롤의 새끼손가락에도 맞지 않았을 크기다. 누군가의 것이었다.",
            effects: [{ kind: "item", item: "iron_ring" }],
          },
          flee: {
            text: "트롤은 느렸지만 팔이 길었다. 마지막 한 방이 등에 닿았다.",
            effects: [{ kind: "hp", delta: -3 }],
          },
        },
      },
      {
        text: "수수께끼 내기를 제안한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 15,
          success: {
            text: "트롤은 세 문제를 내고 세 번 졌다. 화를 내는 대신 한참 생각하더니 주머니의 동전을 준다. 규칙은 규칙이라고.",
            effects: [
              { kind: "xp", delta: 6 },
              { kind: "gold", delta: 10 },
            ],
          },
          failure: {
            text: "트롤의 수수께끼에는 답이 없었다. 틀렸다고 맞는 것이 규칙이었다.",
            effects: [{ kind: "hp", delta: -6 }],
          },
        },
      },
      {
        text: "트롤이 생각하는 동안 달아난다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "트롤이 요구 사항을 정했을 때 당신은 이미 언덕 너머였다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
          failure: {
            text: "트롤이 던진 바위는 당신보다 빨랐다. 요구 사항은 결국 당신의 짐 절반으로 정해졌다.",
            effects: [
              { kind: "hp", delta: -4 },
              { kind: "gold", delta: -4 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_wilds_strange_berries",
    title: "낯선 열매",
    text: "덤불에 보랏빛 열매가 탐스럽게 열려 있다. 새들은 먹지 않는다. 배는 고프고, 새들은 새일 뿐이다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "해독제를 곁들여 마음껏 먹는다",
        requires: [{ kind: "item", item: "antidote" }],
        outcome: {
          kind: "direct",
          result: {
            text: "열매는 달았고, 해독제는 썼고, 둘을 합치니 그럭저럭 저녁이 되었다.",
            effects: [
              { kind: "removeItem", item: "antidote" },
              { kind: "hp", delta: 4 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "한 알만 맛본다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 12,
          success: {
            text: "열매는 그냥 열매였다. 새들이 먹지 않은 이유는 새들만 안다. 배가 부르다.",
            effects: [
              { kind: "hp", delta: 3 },
              { kind: "xp", delta: 2 },
            ],
          },
          failure: {
            text: "나무들이 말을 걸기 시작했다. 나무들은 할 말이 많았다. 아침이 되자 조용해졌지만, 당신은 아니었다.",
            effects: [
              { kind: "hp", delta: -2 },
              { kind: "sanity", delta: -2 },
            ],
          },
        },
      },
      {
        text: "따서 다음 마을에 판다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "약방 노파가 열매를 보더니 값을 후하게 쳐 준다. 뭐에 쓰냐고 묻자 웃기만 했다.",
            effects: [
              { kind: "gold", delta: 4 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_wilds_cave_mouth",
    title: "동굴 입구",
    text: "산비탈에 입을 벌린 동굴에서 찬 바람이 나온다. 바람에는 박쥐 냄새와 오래된 쇠 냄새가 섞여 있다. 입구 옆 바위에 누군가 화살표를 긁어 놓았다. 안쪽을 가리킨다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "횃불을 켜고 화살표를 따라간다",
        requires: [{ kind: "item", item: "torch" }],
        outcome: {
          kind: "direct",
          result: {
            text: "화살표는 광부가 숨겨 둔 상자로 이어졌다. 광부는 돌아오지 않았고, 횃불은 상자 앞에서 꺼졌다.",
            effects: [
              { kind: "removeItem", item: "torch" },
              { kind: "gold", delta: 12 },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "어둠 속으로 그냥 들어간다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "cave_bat",
          win: {
            text: "박쥐가 떨어진 자리를 더듬다 동전 몇 닢을 줍는다. 화살표의 주인은 끝내 찾지 못했다.",
            effects: [{ kind: "gold", delta: 3 }],
          },
          flee: {
            text: "날갯소리에 둘러싸여 입구로 기어 나온다. 어둠 속 소리는 밖에서도 한동안 들렸다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
      {
        text: "입구에서 바람을 피해 잔다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "동굴은 비를 막아 주었다. 밤새 안쪽에서 들리는 소리는 막아 주지 않았다.",
            effects: [
              { kind: "hp", delta: 2 },
              { kind: "sanity", delta: -1 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
];
