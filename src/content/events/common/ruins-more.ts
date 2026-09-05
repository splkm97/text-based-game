// Common events: ruins, part 2. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const RUINS_MORE_EVENTS: readonly GameEvent[] = [
  {
    id: "common_ruins_sealed_vault",
    title: "봉인된 금고",
    text: "지하 계단 끝에 철문이 서 있다. 자물쇠는 셋, 열쇠는 없다. 문 앞 바닥에 누군가 여러 해에 걸쳐 긁어 놓은 자국이 있다. 그 누군가는 결국 열지 못했다.",
    pool: { kind: "common" },
    weight: 2,
    once: true,
    requires: [],
    choices: [
      {
        text: "자물쇠를 딴다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 15,
          success: {
            text: "셋째 자물쇠가 풀리며 문이 열린다. 안에는 영주의 은과, 영주가 누구였는지 적힌 문서가 있었다. 은만 챙겼다.",
            effects: [
              { kind: "gold", delta: 25 },
              { kind: "flag", flag: "common.ruins_vault_opened" },
              { kind: "xp", delta: 4 },
            ],
          },
          failure: {
            text: "둘째 자물쇠에서 바늘이 튀어나왔다. 바늘에는 무언가 발려 있었다. 문은 닫힌 채였다.",
            effects: [{ kind: "hp", delta: -3 }],
          },
        },
      },
      {
        text: "경첩을 부순다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 15,
          success: {
            text: "경첩은 자물쇠보다 약했다. 문이 통째로 넘어가고, 그 뒤에 은이 있었다. 지하실 전체에 소리가 울렸다.",
            effects: [
              { kind: "gold", delta: 20 },
              { kind: "flag", flag: "common.ruins_vault_opened" },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "경첩은 튼튼했고 어깨는 그렇지 않았다. 바닥 자국에 하나를 더 보태고 돌아선다.",
            effects: [{ kind: "hp", delta: -4 }],
          },
        },
      },
      {
        text: "그냥 둔다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "열지 못한 문은 열지 않은 문과 다르다. 계단을 오르며 그렇게 되뇐다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_ruins_vault_watchers",
    title: "폐허의 감시자들",
    text: "폐허 입구 그늘에서 사내 넷이 일어선다. 우두머리는 이 폐허가 자기 구역이라고 한다. 안에서 무엇을 가지고 나왔는지 묻는 눈이다. 대답보다 먼저 손이 칼자루로 간다.",
    pool: { kind: "common" },
    weight: 2,
    once: false,
    requires: [],
    choices: [
      {
        text: "금고의 은을 지키며 두목과 싸운다",
        requires: [{ kind: "flag", flag: "common.ruins_vault_opened" }],
        outcome: {
          kind: "combat",
          monster: "bandit_captain",
          win: {
            text: "두목이 쓰러지자 나머지는 계산을 끝내고 흩어진다. 두목의 지갑에는 앞선 '통행세'가 들어 있었다.",
            effects: [{ kind: "gold", delta: 10 }],
          },
          flee: {
            text: "달아나는 동안 주머니가 가벼워졌다. 은은 폐허의 것이었고, 이제 산적의 것이다.",
            effects: [{ kind: "gold", delta: -10 }],
          },
        },
      },
      {
        text: "빈손을 보여 준다",
        requires: [{ kind: "notFlag", flag: "common.ruins_vault_opened" }],
        outcome: {
          kind: "direct",
          result: {
            text: "빈손은 정직했고, 산적들은 실망했다. 우두머리가 당신을 밀치며 시간 낭비했다고 투덜댄다.",
            effects: [
              { kind: "sanity", delta: -1 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "그늘 반대편으로 슬쩍 빠져나간다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "사내들이 폐허 안쪽을 살피는 동안 벽 틈으로 나왔다. 그들은 여전히 기다리고 있을 것이다.",
            effects: [{ kind: "xp", delta: 2 }],
          },
          failure: {
            text: "벽 틈은 좁았고 사내 하나가 발목을 잡았다. 빠져나오긴 했지만 장화 한 짝과 살갗 얼마를 두고 왔다.",
            effects: [{ kind: "hp", delta: -3 }],
          },
        },
      },
    ],
  },
  {
    id: "common_ruins_mine_shaft",
    title: "버려진 갱도",
    text: "산허리에 갱도 입구가 판자로 막혀 있다. 판자에는 여러 언어로 같은 말이 적혀 있다. 들어가지 말라는 뜻이다. 판자 틈으로 무언가 숨 쉬는 소리가 난다.",
    pool: { kind: "common" },
    weight: 1,
    once: true,
    requires: [],
    choices: [
      {
        text: "횃불을 들고 갱도 깊이 내려간다",
        requires: [{ kind: "item", item: "torch" }],
        outcome: {
          kind: "combat",
          monster: "mine_horror",
          win: {
            text: "그것이 쓰러지자 갱도 끝에서 푸르게 빛나는 광맥이 드러난다. 광부들이 남긴 검 한 자루가 그 빛으로 벼려져 있었다.",
            effects: [
              { kind: "removeItem", item: "torch" },
              { kind: "item", item: "silver_rapier" },
            ],
          },
          flee: {
            text: "횃불을 던지고 어둠 속을 거꾸로 기어 나왔다. 그것은 빛을 싫어했다. 당신을 더 싫어했다.",
            effects: [
              { kind: "removeItem", item: "torch" },
              { kind: "hp", delta: -4 },
            ],
          },
        },
      },
      {
        text: "입구 근처만 뒤진다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 12,
          success: {
            text: "광부들의 공구함에서 임금 자루를 찾아냈다. 그들은 임금을 받으러 돌아오지 않았다.",
            effects: [
              { kind: "gold", delta: 8 },
              { kind: "xp", delta: 2 },
            ],
          },
          failure: {
            text: "썩은 버팀목이 무너져 판자와 함께 당신을 덮쳤다. 숨소리가 가까워지기 전에 기어 나왔다.",
            effects: [{ kind: "hp", delta: -2 }],
          },
        },
      },
      {
        text: "판자의 충고를 따른다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "여러 언어로 적힌 충고는 대개 맞다. 산을 내려오는 동안 숨소리가 멎었다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_ruins_broken_sundial",
    title: "깨진 해시계",
    text: "무너진 정원 한가운데 해시계가 반으로 갈라져 있다. 남은 절반에는 시간 대신 문양이 새겨져 있다. 갈라진 틈 아래로 어둠이 이어진다. 바람이 그 틈에서 나온다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "밧줄을 내려 틈 아래로 내려간다",
        requires: [{ kind: "item", item: "rope" }],
        outcome: {
          kind: "direct",
          result: {
            text: "틈 아래는 정원사의 지하 창고였다. 정원사는 씨앗보다 동전을 더 열심히 모았다. 밧줄은 올라올 때 끊어졌다.",
            effects: [
              { kind: "removeItem", item: "rope" },
              { kind: "gold", delta: 12 },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "문양의 뜻을 푼다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 14,
          success: {
            text: "문양은 그림자가 가리키는 곳을 파라고 했다. 정오에 파 보니 작은 상자가 나왔다. 정원사의 유언은 짧았다. 가져가라고.",
            effects: [
              { kind: "xp", delta: 5 },
              { kind: "gold", delta: 6 },
            ],
          },
          failure: {
            text: "문양을 오래 들여다볼수록 문양이 당신을 들여다봤다. 해가 지고 나서야 눈을 뗄 수 있었다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
      {
        text: "해시계에 기대 쉰다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "시간을 잃은 해시계 옆에서 시간을 잊고 쉬었다. 정원에는 아직 꽃이 남아 있었다.",
            effects: [
              { kind: "hp", delta: 2 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_ruins_bone_ring",
    title: "유골의 반지",
    text: "무너진 탑 아래 유골이 벽에 기대앉아 있다. 손가락뼈에 쇠 반지가 아직 끼워져 있다. 반지 안쪽에 글자가 있는데, 유골이 손을 펴 주지 않으면 읽을 수 없다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "반지를 빼서 손가락에 끼운다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "반지는 차가웠다가 곧 따뜻해졌다. 유골이 당신을 붙잡지 않았다. 반지 안쪽 글자는 그저 누군가의 이름이었다.",
            effects: [
              { kind: "item", item: "iron_ring" },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "반지를 끼는 순간 유골의 마지막 기억이 흘러들었다. 좋은 기억이 아니었다. 반지는 다시 유골에게 돌려주었다.",
            effects: [
              { kind: "sanity", delta: -4 },
              { kind: "hp", delta: -1 },
            ],
          },
        },
      },
      {
        text: "유골에게 예를 갖추고 반지를 놓아둔다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "무언가 벽에서 떨어지는 소리가 났다. 유골이 가리키던 자리에 동전 몇 닢이 흙에 반쯤 묻혀 있었다. 사례일 것이다.",
            effects: [
              { kind: "sanity", delta: 2 },
              { kind: "gold", delta: 4 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "유골을 건드리지 않고 지나간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "탑을 나서며 한 번 돌아봤다. 유골은 여전히 벽에 기대 있었다. 손은 조금 더 펴진 것 같았다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
];
