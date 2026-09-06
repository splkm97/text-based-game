// Common events: the wilds, part 1. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const WILDS_EVENTS: readonly GameEvent[] = [
  {
    id: "common_wilds_wounded_wolf",
    title: "덫에 걸린 늑대",
    text: "사냥꾼의 덫에 앞발이 물린 늑대가 숲 바닥에 엎드려 있다. 으르렁거리지만 일어서지는 못한다. 눈은 당신을, 이빨은 덫을 향한다.",
    pool: { kind: "common" },
    weight: 3,
    once: true,
    requires: [],
    choices: [
      {
        text: "천천히 다가가 덫을 푼다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "늑대는 물지 않았다. 절뚝이며 숲으로 사라지기 전에 한 번 돌아본다. 기억하는 얼굴이다.",
            effects: [
              { kind: "flag", flag: "common.wilds_wolf_freed" },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "덫은 풀렸고, 늑대는 감사 대신 이빨로 답했다. 절뚝이며 사라지는 건 이번엔 당신 쪽에 가깝다.",
            effects: [{ kind: "hp", delta: -3 }],
          },
        },
      },
      {
        text: "끝을 내고 가죽을 벗긴다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "가죽은 좋은 값에 팔릴 것이다. 늑대의 눈이 마지막까지 당신을 보고 있었다는 것만 빼면.",
            effects: [
              { kind: "gold", delta: 6 },
              { kind: "sanity", delta: -2 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
      {
        text: "돌아서 간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "으르렁 소리가 한참 따라오다 멎는다. 숲이 알아서 할 일이다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_wilds_wolf_pack",
    title: "늑대 무리",
    text: "달빛 아래 늑대 여섯이 길을 막고 있다. 맨 앞의 늑대는 앞발을 절고 있다. 무리는 아직 움직이지 않는다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "절름발이 늑대와 눈을 맞춘다",
        requires: [{ kind: "flag", flag: "common.wilds_wolf_freed" }],
        outcome: {
          kind: "direct",
          result: {
            text: "절름발이 늑대가 짧게 짖자 무리가 길을 연다. 지나가는 동안 여섯 쌍의 눈이 당신을 배웅한다. 빚은 청산되었다.",
            effects: [
              { kind: "xp", delta: 4 },
              { kind: "sanity", delta: 1 },
            ],
          },
        },
      },
      {
        text: "앞장선 늑대와 맞선다",
        requires: [{ kind: "notFlag", flag: "common.wilds_wolf_freed" }],
        outcome: {
          kind: "combat",
          monster: "gray_wolf",
          win: {
            text: "우두머리가 쓰러지자 무리가 흩어진다. 숲이 갑자기 조용해진다.",
            effects: [{ kind: "gold", delta: 8 }],
          },
          flee: {
            text: "무리가 잠시 뒤쫓다 멈춘다. 배가 고픈 정도는 아니었던 모양이다.",
            effects: [{ kind: "hp", delta: -2 }],
          },
        },
      },
      {
        text: "가까운 나무로 기어오른다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 14,
          success: {
            text: "늑대들은 나무 아래서 하품을 하다 새벽에 떠난다. 당신은 가지 위에서 하품을 참았다.",
            effects: [{ kind: "xp", delta: 2 }],
          },
          failure: {
            text: "첫 가지가 부러졌다. 늑대들은 당신이 다시 오르는 동안 충분히 즐거워했다.",
            effects: [{ kind: "hp", delta: -4 }],
          },
        },
      },
    ],
  },
  {
    id: "common_wilds_river_crossing",
    title: "불어난 급류",
    text: "봄비로 불어난 강이 길을 끊어 놓았다. 건너편에 길이 이어지는 게 보이지만, 그 사이에는 갈색 물살뿐이다. 떠내려가는 통나무가 바위에 부딪혀 두 동강 난다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "밧줄을 건너편 나무에 걸어 건넌다",
        requires: [{ kind: "item", item: "rope" }],
        outcome: {
          kind: "direct",
          result: {
            text: "밧줄은 강을 건너게 해 주었고, 강은 밧줄을 가져갔다. 공평한 거래였다.",
            effects: [
              { kind: "removeItem", item: "rope" },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "헤엄쳐 건넌다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "con",
          dc: 14,
          success: {
            text: "물살은 당신을 하류로 백 걸음쯤 데려갔지만 결국 건너편이었다. 짐은 젖었고 당신은 살아 있다.",
            effects: [{ kind: "xp", delta: 3 }],
          },
          failure: {
            text: "바위에 부딪히고, 물을 마시고, 동전 주머니가 풀렸다. 강은 통행세를 자기 방식으로 걷는다.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "gold", delta: -3 },
            ],
          },
        },
      },
      {
        text: "하류로 멀리 돌아간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "얕은 여울은 반나절 거리에 있었다. 돌아오는 길에는 발이 아팠고, 기분은 더 아팠다.",
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
    id: "common_wilds_bog",
    title: "안개 낀 늪",
    text: "길이 늪으로 잠긴다. 안개 속에서 무언가 젖은 소리를 내며 움직인다. 발밑의 땅은 절반쯤만 땅이다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "마른 땅을 골라 딛으며 가로지른다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "풀 무더기에서 풀 무더기로 뛰며 늪을 건넜다. 젖은 소리는 끝까지 따라오다 포기했다.",
            effects: [{ kind: "xp", delta: 3 }],
          },
          failure: {
            text: "허리까지 빠졌다. 기어 나오는 데 한 시간, 냄새를 잊는 데 하루가 걸렸다.",
            effects: [
              { kind: "hp", delta: -2 },
              { kind: "sanity", delta: -2 },
            ],
          },
        },
      },
      {
        text: "젖은 소리의 주인과 맞선다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "bog_slime",
          win: {
            text: "슬라임이 갈라지자 그 안에서 누군가의 동전 지갑이 나온다. 앞선 여행자의 것이다.",
            effects: [{ kind: "gold", delta: 5 }],
          },
          flee: {
            text: "슬라임은 느렸다. 당신은 느리지 않았다. 늪은 결국 못 건넜다.",
            effects: [{ kind: "sanity", delta: -1 }],
          },
        },
      },
      {
        text: "늪 가장자리를 따라 돌아간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "가장자리는 길었고, 모기는 많았다. 늪은 당신을 물지 않았지만 모기가 대신했다.",
            effects: [
              { kind: "hp", delta: -1 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_wilds_goblin_camp",
    title: "고블린 야영지",
    text: "골짜기 아래 모닥불 주위로 고블린들이 둘러앉아 무언가를 굽고 있다. 정찰병 하나가 졸고 있고, 족장은 남들보다 큰 뼈를 물고 있다. 약탈품 자루가 천막 옆에 쌓여 있다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "졸고 있는 정찰병을 덮친다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "goblin_scout",
          win: {
            text: "정찰병의 허리춤에서 자루 하나를 끊어 낸다. 나머지 고블린은 아직 굽는 데 열중해 있다.",
            effects: [{ kind: "gold", delta: 5 }],
          },
          flee: {
            text: "고함 소리를 뒤로하고 골짜기를 빠져나온다. 고블린들은 굽던 것을 두고 오지는 않았다.",
            effects: [{ kind: "sanity", delta: -1 }],
          },
        },
      },
      {
        text: "족장에게 정면으로 도전한다",
        requires: [{ kind: "stat", stat: "str", min: 8 }],
        outcome: {
          kind: "combat",
          monster: "goblin_chief",
          win: {
            text: "족장이 쓰러지자 나머지 고블린이 뼈를 떨어뜨리고 흩어진다. 족장의 단검은 사람 손에 맞게 만든 것이었다.",
            effects: [{ kind: "gold", delta: 10 }],
          },
          flee: {
            text: "족장은 뒤쫓지 않았다. 대신 무언가 무거운 것을 던졌다.",
            effects: [{ kind: "hp", delta: -3 }],
          },
        },
      },
      {
        text: "천막 뒤로 기어가 약탈품을 훔친다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 15,
          success: {
            text: "자루 하나를 통째로 끌고 나온다. 안에는 고블린이 훔친 동전과 고블린이 만든 냄새가 들어 있었다.",
            effects: [
              { kind: "gold", delta: 15 },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "자루 밑에 고블린 하나가 자고 있었다. 몽둥이와 고함과 도망이 순서대로 이어졌다.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "gold", delta: -2 },
            ],
          },
        },
      },
    ],
  },
];
