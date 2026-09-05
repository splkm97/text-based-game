// Common events: the open road, part 2. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const ROAD_MORE_EVENTS: readonly GameEvent[] = [
  {
    id: "common_road_tinker_cart",
    title: "땜장이의 수레",
    text: "냄비와 칼과 정체불명의 쇠붙이를 매단 수레가 길가에 멈춰 있다. 땜장이는 부러진 바퀴살을 들고 한숨만 쉬고 있다. 수레의 물건들이 바람에 부딪혀 종처럼 울린다.",
    pool: { kind: "common" },
    weight: 3,
    once: true,
    requires: [],
    choices: [
      {
        text: "바퀴살을 고쳐 준다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 12,
          success: {
            text: "쇠못과 가죽끈으로 바퀴가 다시 돈다. 땜장이는 당신 얼굴을 오래 들여다보며 기억해 두겠다고 한다.",
            effects: [
              { kind: "flag", flag: "common.road_tinker_debt" },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "바퀴는 더 망가졌고 손가락은 찢어졌다. 땜장이는 고맙다는 말 대신 침을 뱉는다.",
            effects: [
              { kind: "hp", delta: -1 },
              { kind: "sanity", delta: -1 },
            ],
          },
        },
      },
      {
        text: "매달린 물건을 구경한다",
        requires: [],
        outcome: {
          kind: "shop",
          stock: ["hunter_knife", "torch", "rope", "bread_loaf"],
          leave: {
            text: "땜장이가 수레 곁을 떠나는 당신에게 손을 흔든다. 물건들이 다시 바람에 울린다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
      {
        text: "갈 길을 간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "땜장이의 한숨이 등 뒤로 멀어진다. 당신 문제는 아니다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_road_tinker_return",
    title: "낯익은 수레",
    text: "쇠붙이 소리가 먼저 들리고, 그 다음에 수레가 보인다. 땜장이가 고개를 들어 당신을 살핀다. 이번에는 바퀴가 멀쩡하다.",
    pool: { kind: "common" },
    weight: 2,
    once: false,
    requires: [],
    choices: [
      {
        text: "땜장이가 빚을 갚는다",
        requires: [{ kind: "flag", flag: "common.road_tinker_debt" }],
        outcome: {
          kind: "direct",
          result: {
            text: "땜장이가 말없이 튼튼한 밧줄 한 다발을 건넨다. 은혜는 갚았으니 다음에는 값을 받겠다고 덧붙인다.",
            effects: [
              { kind: "item", item: "rope" },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "처음 보는 사이처럼 흥정한다",
        requires: [
          { kind: "notFlag", flag: "common.road_tinker_debt" },
          { kind: "gold", min: 3 },
        ],
        outcome: {
          kind: "direct",
          result: {
            text: "땜장이는 당신을 모른다. 빵 한 덩이 값을 정직하게, 그러니까 비싸게 부른다.",
            effects: [
              { kind: "gold", delta: -3 },
              { kind: "item", item: "bread_loaf" },
            ],
          },
        },
      },
      {
        text: "손을 흔들고 지나간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "땜장이도 손을 흔든다. 쇠붙이 소리가 점점 작아진다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_road_pilgrims",
    title: "순례자 행렬",
    text: "맨발의 순례자들이 느릿하게 길을 메우고 있다. 앞줄에서는 찬송이, 뒷줄에서는 발 아픈 신음이 들린다. 그들은 어디로 가는지 알고 있는 눈치다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "행렬에 섞여 함께 걷는다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "찬송은 서툴렀지만 걸음은 가벼워졌다. 누군가 물을 나눠 준다.",
            effects: [
              { kind: "sanity", delta: 3 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "설교자의 말을 곱씹는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "설교의 절반은 헛소리였지만 나머지 절반은 쓸 만했다. 헛소리를 가려내는 것도 배움이다.",
            effects: [
              { kind: "xp", delta: 4 },
              { kind: "sanity", delta: 1 },
            ],
          },
          failure: {
            text: "설교는 끝없이 이어졌고, 머릿속에서 종이 울리기 시작했다. 아직도 울린다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
      {
        text: "기도하는 틈에 헌금 주머니를 노린다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 15,
          success: {
            text: "신은 보고 있었을지 몰라도, 순례자들은 아니었다. 주머니가 묵직하다.",
            effects: [{ kind: "gold", delta: 12 }],
          },
          failure: {
            text: "순례자 하나가 당신 손목을 잡는다. 그들은 때리지 않았다. 대신 당신 지갑에서 헌금을 걷었다.",
            effects: [
              { kind: "gold", delta: -6 },
              { kind: "sanity", delta: -2 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_road_storm",
    title: "느닷없는 폭풍우",
    text: "하늘이 검게 물들더니 바늘 같은 비가 쏟아진다. 길은 곧 개울이 된다. 저 멀리 벼락이 언덕을 두 번 때린다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "버려진 오두막에 불을 피운다",
        requires: [{ kind: "item", item: "torch" }],
        outcome: {
          kind: "direct",
          result: {
            text: "횃불 하나가 젖은 장작을 살린다. 오두막은 새고 있었지만, 불 옆은 아니었다.",
            effects: [
              { kind: "removeItem", item: "torch" },
              { kind: "hp", delta: 2 },
              { kind: "sanity", delta: 2 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "큰 나무 아래로 피한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 12,
          success: {
            text: "당신은 벼락이 좋아하는 나무와 싫어하는 나무를 구분할 줄 알았다. 젖지 않은 채 폭풍이 지나간다.",
            effects: [{ kind: "xp", delta: 2 }],
          },
          failure: {
            text: "나무는 벼락이 좋아하는 종류였다. 귀가 멍하고 머리카락 끝이 탔다.",
            effects: [{ kind: "hp", delta: -3 }],
          },
        },
      },
      {
        text: "비를 뚫고 계속 걷는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "con",
          dc: 14,
          success: {
            text: "폭풍이 지칠 때까지 걸었다. 폭풍이 먼저 지쳤다.",
            effects: [{ kind: "xp", delta: 3 }],
          },
          failure: {
            text: "뼛속까지 젖은 채 밤을 보낸다. 기침이 며칠 갈 것이다.",
            effects: [
              { kind: "hp", delta: -2 },
              { kind: "sanity", delta: -1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_road_wandering_bard",
    title: "떠돌이 음유시인",
    text: "길가 바위에 앉은 사내가 줄이 세 개뿐인 류트를 튕기고 있다. 노래는 실연과 세금과 날씨에 관한 것이다. 사내는 당신을 보고 새 청중이 왔다며 반긴다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "노래 대결을 제안한다",
        requires: [{ kind: "trait", trait: "silver_tongue" }],
        outcome: {
          kind: "direct",
          result: {
            text: "당신의 노래에 사내가 류트를 내려놓는다. 판돈으로 걸었던 동전과 함께 패배를 인정한다.",
            effects: [
              { kind: "gold", delta: 8 },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "모험담을 들려주고 값을 요구한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 13,
          success: {
            text: "사내는 이야기를 사겠다며 동전을 센다. 다음 마을에서 당신 이야기가 노래로 불릴 것이다. 과장되어서.",
            effects: [
              { kind: "gold", delta: 5 },
              { kind: "xp", delta: 4 },
            ],
          },
          failure: {
            text: "사내는 하품을 하더니 당신을 놀리는 즉흥곡을 지어 부른다. 운율이 지나치게 좋았다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
      {
        text: "앉아서 노래를 듣는다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "노래는 형편없었지만 바위는 편했다. 오랜만에 아무것도 하지 않았다.",
            effects: [
              { kind: "sanity", delta: 3 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
];
