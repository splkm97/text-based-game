// Common events: towns, part 2. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const TOWN_MORE_EVENTS: readonly GameEvent[] = [
  {
    id: "common_town_innkeeper_memory",
    title: "여관 주인의 기억",
    text: "낡은 여관의 주인이 당신을 오래 쳐다본다. 어디서 본 얼굴이라며 턱을 긁는다. 벽난로가 타고 있고, 위층에서 침대가 삐걱거린다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "외상을 갚아 준 사람이라는 걸 알아본다",
        requires: [{ kind: "flag", flag: "common.town_tab_paid" }],
        outcome: {
          kind: "direct",
          result: {
            text: "주인이 손뼉을 친다. 그 노인이 자기 아버지였다고 한다. 가장 좋은 방과 가장 뜨거운 국이 나온다. 값은 없다.",
            effects: [
              { kind: "hp", delta: 4 },
              { kind: "sanity", delta: 3 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "제값을 치르고 방을 잡는다",
        requires: [
          { kind: "notFlag", flag: "common.town_tab_paid" },
          { kind: "gold", min: 6 },
        ],
        outcome: {
          kind: "direct",
          result: {
            text: "주인은 결국 당신을 기억해 내지 못한다. 방은 좁지만 침대는 마른 침대다.",
            effects: [
              { kind: "gold", delta: -6 },
              { kind: "hp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "마구간에서 공짜로 잔다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "말들은 당신을 반기지 않았고, 짚은 축축했다. 그래도 지붕은 지붕이다.",
            effects: [
              { kind: "hp", delta: 1 },
              { kind: "sanity", delta: -1 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_town_gallows",
    title: "교수대 앞의 군중",
    text: "광장 한가운데 교수대가 서 있고, 군중은 좋은 자리를 놓고 다투는 중이다. 형리는 밧줄을 시험하고, 사형수는 하늘을 본다. 아이들이 과자를 판다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "형리에게 은밀히 돈을 쥐여 준다",
        requires: [{ kind: "gold", min: 20 }],
        outcome: {
          kind: "direct",
          result: {
            text: "밧줄이 우연히 끊어지고, 사형수는 우연히 군중 속으로 사라진다. 형리는 어깨를 으쓱한다. 낡은 밧줄이라고.",
            effects: [
              { kind: "gold", delta: -20 },
              { kind: "xp", delta: 5 },
              { kind: "sanity", delta: 2 },
            ],
          },
        },
      },
      {
        text: "사형수의 마지막 말에 귀 기울인다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "사형수는 자기가 묻은 돈의 위치를 수수께끼로 남긴다. 군중은 못 알아들었지만 당신은 알아들었다.",
            effects: [
              { kind: "xp", delta: 4 },
              { kind: "gold", delta: 6 },
              { kind: "sanity", delta: -1 },
            ],
          },
          failure: {
            text: "마지막 말은 당신을 똑바로 보며 한 저주였다. 우연이었겠지만, 밤에 그 눈이 다시 보인다.",
            effects: [{ kind: "sanity", delta: -3 }],
          },
        },
      },
      {
        text: "군중 뒤에서 구경한다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "일은 빨리 끝났다. 과자 파는 아이가 당신에게도 하나 팔았다. 맛은 기억나지 않는다.",
            effects: [
              { kind: "sanity", delta: -3 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
  {
    id: "common_town_watch_recruit",
    title: "경비대 모집",
    text: "성문 옆에 경비대장이 탁자를 놓고 앉아 있다. 사람이 모자란다며 지나가는 이들을 붙잡는다. 급료는 적고 위험은 많다고 솔직하게 말한다. 그 솔직함이 오히려 수상하다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "입대 시험을 치른다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "허수아비 세 개를 쓰러뜨리고 하루치 급료를 받는다. 대장은 내일부터 나오라고 했고, 당신은 내일 이 마을에 없을 것이다.",
            effects: [
              { kind: "gold", delta: 10 },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "허수아비가 이겼다. 대장은 아무 말 없이 다음 사람을 부른다.",
            effects: [{ kind: "hp", delta: -2 }],
          },
        },
      },
      {
        text: "말재주로 소개비를 뜯어낸다",
        requires: [{ kind: "trait", trait: "silver_tongue" }],
        outcome: {
          kind: "direct",
          result: {
            text: "지원자 다섯을 데려오겠다고 약속하고 선금을 받는다. 다섯 명은 존재하지 않는다.",
            effects: [
              { kind: "gold", delta: 6 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "야간 하수도 순찰 임무를 맡는다",
        requires: [{ kind: "hardMode" }],
        outcome: {
          kind: "combat",
          monster: "giant_rat",
          win: {
            text: "하수도에서 올라오자 대장이 코를 막으며 급료를 건넨다. 위험 수당이 붙어 있다.",
            effects: [{ kind: "gold", delta: 10 }],
          },
          flee: {
            text: "하수도에서 뛰쳐나온다. 대장은 급료 대신 눈빛만 준다.",
            effects: [{ kind: "sanity", delta: -1 }],
          },
        },
      },
      {
        text: "정중히 거절한다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "대장은 놀라지 않는다. 오늘 서른 번째 거절이라고 한다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_town_plague_bell",
    title: "역병의 종",
    text: "마을 어귀에서 종이 느리게 울린다. 문마다 흰 천이 걸려 있고, 거리에는 천으로 얼굴을 가린 사람만 다닌다. 누군가 문 안에서 물을 달라고 외친다.",
    pool: { kind: "common" },
    weight: 2,
    once: false,
    requires: [],
    choices: [
      {
        text: "해독제를 내놓는다",
        requires: [{ kind: "item", item: "antidote" }],
        outcome: {
          kind: "direct",
          result: {
            text: "해독제는 역병에 듣지 않았지만, 병자의 가족은 그 사실을 몰랐다. 사례는 후했다. 죄책감도 후했다.",
            effects: [
              { kind: "removeItem", item: "antidote" },
              { kind: "gold", delta: 12 },
              { kind: "xp", delta: 4 },
            ],
          },
        },
      },
      {
        text: "천을 두르고 병자에게 물을 나른다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "con",
          dc: 15,
          success: {
            text: "사흘 동안 물을 날랐고, 병은 당신을 건너뛰었다. 마을 사람들이 당신을 이름으로 부르기 시작한다.",
            effects: [
              { kind: "xp", delta: 6 },
              { kind: "sanity", delta: 2 },
            ],
          },
          failure: {
            text: "나흘째 아침, 열이 올랐다. 병은 가볍게 지나갔지만 그동안 당신은 가볍지 않았다.",
            effects: [{ kind: "hp", delta: -4 }],
          },
        },
      },
      {
        text: "숨을 참고 마을을 지나친다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "종소리가 등 뒤에서 오래 울린다. 물을 달라던 목소리도.",
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
    id: "common_town_street_preacher",
    title: "거리의 설교자",
    text: "우물가 돌 위에 올라선 사내가 세상의 종말을 외치고 있다. 날짜까지 정해 놓았는데, 지난주였다. 사내는 계산 착오였다며 새 날짜를 발표한다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "경전의 오류를 조목조목 짚는다",
        requires: [{ kind: "trait", trait: "bookworm" }],
        outcome: {
          kind: "direct",
          result: {
            text: "설교자는 세 번째 지적에서 말을 잃었다. 군중이 당신을 새 설교자로 오해하고 헌금을 던진다.",
            effects: [
              { kind: "xp", delta: 4 },
              { kind: "gold", delta: 3 },
            ],
          },
        },
      },
      {
        text: "말싸움을 건다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 13,
          success: {
            text: "종말이 지난주였다면 지금 우리는 어디 있느냐고 묻는다. 설교자는 돌에서 내려온다. 군중이 흩어진다.",
            effects: [{ kind: "xp", delta: 3 }],
          },
          failure: {
            text: "설교자는 당신보다 목소리가 컸고, 논리는 필요 없었다. 군중이 당신을 첫 번째 죄인으로 지목한다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
      {
        text: "헌금 그릇에 동전을 넣는다",
        requires: [{ kind: "gold", min: 4 }],
        outcome: {
          kind: "direct",
          result: {
            text: "설교자가 당신을 축복한다. 종말이 오면 당신만은 살려 두겠다고 한다. 값싼 보험이다.",
            effects: [
              { kind: "gold", delta: -4 },
              { kind: "sanity", delta: 2 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
];
