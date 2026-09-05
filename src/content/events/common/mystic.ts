// Common events: the uncanny, part 1. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const MYSTIC_EVENTS: readonly GameEvent[] = [
  {
    id: "common_mystic_moon_altar",
    title: "달빛 제단",
    text: "숲속 빈터에 하얀 돌 제단이 서 있다. 달빛이 제단 위에만 떨어지고 주변은 어둡다. 제단에 손을 대면 무언가 약속을 요구할 것 같은 느낌이 든다. 느낌은 대체로 맞는다.",
    pool: { kind: "common" },
    weight: 3,
    once: true,
    requires: [],
    choices: [
      {
        text: "달에게 서약을 바친다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "무엇을 약속했는지는 기억나지 않는다. 손바닥에 남은 은빛 자국만 기억한다. 달이 당신을 알게 되었다.",
            effects: [
              { kind: "flag", flag: "common.mystic_moon_oath" },
              { kind: "sanity", delta: -2 },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "동전을 제물로 올린다",
        requires: [{ kind: "gold", min: 10 }],
        outcome: {
          kind: "direct",
          result: {
            text: "동전이 달빛 속에서 사라진다. 대신 머릿속을 짓누르던 것이 함께 사라졌다. 나쁘지 않은 환율이다.",
            effects: [
              { kind: "gold", delta: -10 },
              { kind: "sanity", delta: 4 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "제단을 건드리지 않는다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "빈터를 벗어나자 달빛이 다시 고르게 떨어진다. 약속은 하지 않는 편이 낫다. 대체로.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_mystic_moon_priest",
    title: "달의 사제",
    text: "은빛 옷을 입은 사제가 길가에서 하늘을 보고 있다. 낮인데도 달을 찾는 눈치다. 사제가 고개를 돌려 당신의 손을 본다. 손을 아주 오래 본다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "손바닥의 은빛 자국을 보여 준다",
        requires: [{ kind: "flag", flag: "common.mystic_moon_oath" }],
        outcome: {
          kind: "direct",
          result: {
            text: "사제가 무릎을 꿇고 펜던트를 벗어 건넨다. 서약한 자에게 드리는 것이라며. 무엇을 서약했는지는 사제도 말해 주지 않는다.",
            effects: [
              { kind: "item", item: "owl_pendant" },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "사제의 의심을 말로 누그러뜨린다",
        requires: [{ kind: "notFlag", flag: "common.mystic_moon_oath" }],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 13,
          success: {
            text: "사제는 결국 당신이 그저 지나가는 사람임을 인정한다. 사과의 뜻으로 밤길에 대한 조언을 해 준다. 쓸 만한 조언이다.",
            effects: [{ kind: "xp", delta: 3 }],
          },
          failure: {
            text: "사제는 당신 손에서 무언가를 보았다고 한다. 당신은 보지 못했다. 그날 밤 달이 유난히 컸다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
      {
        text: "조용히 지나간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "사제는 다시 하늘을 본다. 낮의 달은 여전히 나타나지 않는다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_mystic_swamp_hag",
    title: "늪지 마녀의 오두막",
    text: "닭발 같은 말뚝 위에 선 오두막에서 노파가 손짓한다. 냄비가 끓고 있고, 냄비 속에서 무언가 노파를 부른다. 노파는 거래를 좋아한다고 한다. 손님이 손해 보는 거래를.",
    pool: { kind: "common" },
    weight: 2,
    once: true,
    requires: [],
    choices: [
      {
        text: "지혜를 사겠다고 한다",
        requires: [{ kind: "gold", min: 25 }],
        outcome: {
          kind: "direct",
          result: {
            text: "노파가 냄비 국물을 한 국자 떠 준다. 맛은 늪이었지만, 마신 뒤로 세상이 조금 더 선명해졌다. 값은 미리 받았다.",
            effects: [
              { kind: "gold", delta: -25 },
              { kind: "stat", stat: "wis", delta: 1 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "말재주로 공짜 선물을 얻어 낸다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 15,
          success: {
            text: "노파는 오랜만에 웃었다며 꿈의 가루 한 봉지를 건넨다. 웃음이 오래 남지는 않았다. 노파 쪽 말이다.",
            effects: [
              { kind: "item", item: "dream_powder" },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "노파는 당신 말을 듣고 냄비를 두드렸다. 냄비 속의 것이 당신 이름을 배웠다.",
            effects: [{ kind: "sanity", delta: -3 }],
          },
        },
      },
      {
        text: "노파를 처치한다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "swamp_hag",
          win: {
            text: "노파가 쓰러지자 냄비가 조용해진다. 벽에 걸린 물푸레나무 지팡이만 남았다. 지팡이는 아직 따뜻하다.",
            effects: [{ kind: "item", item: "ashwood_staff" }],
          },
          flee: {
            text: "늪을 건너 달아나는 동안 노파의 웃음소리가 물속에서 올라왔다. 며칠은 꿈에 나올 것이다.",
            effects: [{ kind: "sanity", delta: -3 }],
          },
        },
      },
    ],
  },
  {
    id: "common_mystic_whispering_well",
    title: "속삭이는 우물",
    text: "버려진 마을 한가운데 우물이 있다. 우물 안에서 목소리가 올라온다. 무슨 말인지는 알아들을 수 없지만, 당신에게 하는 말이라는 건 안다. 두레박은 없다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "행운의 동전을 던져 소원을 빈다",
        requires: [{ kind: "item", item: "lucky_coin" }],
        outcome: {
          kind: "direct",
          result: {
            text: "동전이 물에 닿기도 전에 목소리가 멎었다. 우물가에 은화가 쌓여 있었다. 행운은 이렇게 환전되는 모양이다.",
            effects: [
              { kind: "removeItem", item: "lucky_coin" },
              { kind: "gold", delta: 30 },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "우물에 귀를 기울인다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 14,
          success: {
            text: "목소리는 오래전 마을 사람들의 것이었다. 그들은 어디로 가면 안 되는지 알려 주었다. 당신은 그곳에 가지 않을 것이다.",
            effects: [{ kind: "xp", delta: 5 }],
          },
          failure: {
            text: "목소리를 알아듣는 순간 알아듣지 말았어야 했다는 것도 알았다. 우물에서 떨어질 때까지 귀를 뗄 수 없었다.",
            effects: [{ kind: "sanity", delta: -4 }],
          },
        },
      },
      {
        text: "손으로 물을 떠 마신다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "con",
          dc: 13,
          success: {
            text: "물은 차갑고 달았다. 목소리가 잠시 멈췄다가 다시 시작됐다. 이번에는 조금 친절하게.",
            effects: [
              { kind: "hp", delta: 4 },
              { kind: "xp", delta: 2 },
            ],
          },
          failure: {
            text: "물맛은 쇠와 흙과 다른 무엇이었다. 밤새 앓았고, 목소리는 밤새 함께 있었다.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "sanity", delta: -1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_mystic_fortune_teller",
    title: "천막 속의 점쟁이",
    text: "길가 천막에서 향 냄새가 흘러나온다. 안에는 수정 구슬과 카드와 새장 속 까마귀가 있고, 점쟁이는 당신이 올 줄 알았다고 한다. 누구에게나 그렇게 말할 것이다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "손놀림의 속임수를 짚어 낸다",
        requires: [{ kind: "trait", trait: "keen_eyes" }],
        outcome: {
          kind: "direct",
          result: {
            text: "카드는 소매에서, 목소리는 바닥 아래 조수에게서 나왔다. 점쟁이가 입막음 값을 낸다. 까마귀는 진짜였다.",
            effects: [
              { kind: "gold", delta: 5 },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "점괘의 허점을 파고든다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 13,
          success: {
            text: "점쟁이가 당신 과거를 맞힌다고 한 것은 모두 당신 옷차림에 쓰여 있었다. 점쟁이가 웃으며 복채를 돌려준다. 이자까지.",
            effects: [
              { kind: "gold", delta: 10 },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "점쟁이는 당신이 묻지 않은 것을 말했다. 맞았다. 복채를 두 배로 내고 나왔다.",
            effects: [
              { kind: "gold", delta: -5 },
              { kind: "sanity", delta: -2 },
            ],
          },
        },
      },
      {
        text: "복채를 내고 점을 본다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "먼 길과 낯선 사람과 뜻밖의 재물이 있을 거라고 한다. 모험가에게 그것은 점괘가 아니라 일정표다. 그래도 기분은 나아졌다.",
            effects: [
              { kind: "gold", delta: -5 },
              { kind: "sanity", delta: 3 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
];
