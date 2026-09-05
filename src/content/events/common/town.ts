// Common events: towns, part 1. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const TOWN_EVENTS: readonly GameEvent[] = [
  {
    id: "common_town_market_day",
    title: "장날",
    text: "광장이 천막과 고함과 닭 냄새로 가득하다. 상인들은 모든 것을 팔고, 소매치기들은 모든 것을 산다. 값을 부르는 소리가 종소리보다 크다.",
    pool: { kind: "common" },
    weight: 5,
    once: false,
    requires: [],
    choices: [
      {
        text: "천막 사이를 돌며 물건을 산다",
        requires: [],
        outcome: {
          kind: "shop",
          stock: ["bread_loaf", "healing_salve", "torch", "rope", "calming_tea"],
          leave: {
            text: "닭 냄새를 옷에 묻힌 채 광장을 빠져나온다. 지갑은 가벼워졌거나, 아니면 여전히 가볍다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
      {
        text: "붐비는 틈에 남의 지갑을 노린다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 15,
          success: {
            text: "뚱뚱한 상인의 허리춤에서 주머니가 조용히 사라진다. 상인은 닭 값을 흥정하느라 바쁘다.",
            effects: [{ kind: "gold", delta: 10 }],
          },
          failure: {
            text: "손목을 잡힌 채 광장 한가운데로 끌려 나간다. 벌금은 즉석에서, 그리고 넉넉하게 매겨진다.",
            effects: [{ kind: "gold", delta: -8 }],
          },
        },
      },
      {
        text: "곡예사의 재주를 구경한다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "곡예사가 칼 세 자루를 던지고 두 자루를 받는다. 그래도 관객은 박수를 친다. 당신도 친다.",
            effects: [
              { kind: "sanity", delta: 2 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_town_smithy",
    title: "대장간",
    text: "망치 소리가 골목 끝까지 울린다. 대장장이는 팔뚝이 당신 허벅지만 하고, 말수는 그보다 적다. 벽에는 팔 물건과 팔지 않을 물건이 섞여 걸려 있다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "벽에 걸린 무구를 살펴본다",
        requires: [],
        outcome: {
          kind: "shop",
          stock: [
            "rusty_sword",
            "iron_mace",
            "guard_saber",
            "plank_buckler",
            "padded_jerkin",
            "chain_shirt",
          ],
          leave: {
            text: "대장장이가 고개를 끄덕인다. 인사인지 배웅인지는 알 수 없다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
      {
        text: "하루 품삯을 받고 풀무를 밟는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 13,
          success: {
            text: "해 질 녘까지 풀무를 밟았다. 대장장이는 말없이 동전을 건네고, 처음으로 두 마디를 한다. 내일도 오라고.",
            effects: [
              { kind: "gold", delta: 6 },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "점심 무렵 다리가 풀렸다. 대장장이는 품삯 대신 화상 연고를 발라 준다. 연고 값은 뺀다.",
            effects: [{ kind: "hp", delta: -2 }],
          },
        },
      },
      {
        text: "망치 소리를 뒤로하고 나온다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "골목을 다 빠져나온 뒤에도 귀에서 망치 소리가 난다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_town_apothecary",
    title: "약방",
    text: "천장까지 쌓인 병과 말린 풀 사이에 노파가 앉아 있다. 냄새는 병을 고치는 냄새와 병을 만드는 냄새의 중간쯤이다. 노파가 안경 너머로 당신을 재어 본다.",
    pool: { kind: "common" },
    weight: 4,
    once: false,
    requires: [],
    choices: [
      {
        text: "선반의 약을 산다",
        requires: [],
        outcome: {
          kind: "shop",
          stock: ["healing_salve", "antidote", "calming_tea", "holy_water", "dream_powder"],
          leave: {
            text: "문을 나서자 냄새가 옷에서 따라 나온다. 며칠은 갈 것이다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
      {
        text: "약초 이름을 줄줄 외어 노파를 감탄시킨다",
        requires: [{ kind: "stat", stat: "int", min: 7 }],
        outcome: {
          kind: "direct",
          result: {
            text: "노파가 안경을 벗는다. 잘못 붙은 이름표 셋을 고쳐 준 값으로 동전을 받는다.",
            effects: [
              { kind: "gold", delta: 8 },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "정체 모를 병의 냄새를 맡아 본다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "con",
          dc: 12,
          success: {
            text: "코가 잠시 마비되었지만 그뿐이다. 노파가 그 병은 쥐약이라고 알려 준다.",
            effects: [{ kind: "xp", delta: 2 }],
          },
          failure: {
            text: "바닥이 천장이 되고, 노파가 둘로 보인다. 둘 다 웃고 있다.",
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
    id: "common_town_curio_shop",
    title: "골동품 가게",
    text: "먼지 앉은 진열장에 반지와 펜던트와 출처 불명의 지팡이가 놓여 있다. 주인은 물건마다 이야기가 있다고 하는데, 이야기마다 값이 다르다. 진품이 섞여 있을 수도 있다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "진열장을 훑는다",
        requires: [],
        outcome: {
          kind: "shop",
          stock: ["lucky_coin", "owl_pendant", "iron_ring", "sage_spectacles", "apprentice_wand"],
          leave: {
            text: "주인이 다음에 오면 더 좋은 이야기가 있을 거라고 한다. 값도 더 좋아질 것이다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
      {
        text: "구석의 잡동사니에서 진품을 골라낸다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 14,
          success: {
            text: "구리라고 적힌 상자 안에서 은 촛대를 찾아낸다. 주인은 상자 값만 받고, 당신은 촛대 값을 받는다. 다른 가게에서.",
            effects: [
              { kind: "gold", delta: 15 },
              { kind: "xp", delta: 4 },
            ],
          },
          failure: {
            text: "고대 왕의 인장이라던 반지는 손가락에 초록 자국을 남겼다. 주인은 이미 문을 잠갔다.",
            effects: [{ kind: "gold", delta: -5 }],
          },
        },
      },
      {
        text: "먼지를 털고 나온다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "진열장 유리에 비친 얼굴이 골동품처럼 보였다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_town_tavern_tab",
    title: "외상 장부",
    text: "선술집 주인이 장부를 두드리며 구석의 노인을 노려본다. 노인은 잔을 비운 뒤 주머니를 뒤집어 보인다. 안에서 나온 건 실밥뿐이다. 주변 손님들이 재미있어진 얼굴로 술을 마신다.",
    pool: { kind: "common" },
    weight: 3,
    once: true,
    requires: [],
    choices: [
      {
        text: "노인의 외상을 대신 갚는다",
        requires: [{ kind: "gold", min: 15 }],
        outcome: {
          kind: "direct",
          result: {
            text: "주인이 장부에 줄을 긋고 노인은 당신 이름을 묻는다. 술집 안이 잠시 조용해졌다가 다시 시끄러워진다.",
            effects: [
              { kind: "gold", delta: -15 },
              { kind: "flag", flag: "common.town_tab_paid" },
              { kind: "sanity", delta: 2 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "구경하며 한 잔 마신다",
        requires: [{ kind: "gold", min: 3 }],
        outcome: {
          kind: "direct",
          result: {
            text: "술은 독하고 싸다. 노인은 결국 부엌에서 설거지를 하게 된다. 그의 노래가 접시 소리에 섞인다.",
            effects: [
              { kind: "gold", delta: -3 },
              { kind: "sanity", delta: 3 },
              { kind: "hp", delta: -1 },
            ],
          },
        },
      },
      {
        text: "주인이 노인을 끌어내려 하자 끼어든다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 14,
          success: {
            text: "주인은 당신 팔뚝을 보더니 장부를 덮는다. 손님들이 내기 돈을 당신에게 몰아준다. 당신이 이길 줄 알았다고.",
            effects: [
              { kind: "gold", delta: 8 },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "주인의 주먹은 장부보다 두꺼웠다. 노인과 나란히 문밖에 던져진다.",
            effects: [{ kind: "hp", delta: -4 }],
          },
        },
      },
    ],
  },
];
