// Common events: ruins, part 1. Original prose; ids from ../../ids only.

import type { GameEvent } from "../../../engine/types";

export const RUINS_EVENTS: readonly GameEvent[] = [
  {
    id: "common_ruins_collapsed_chapel",
    title: "무너진 예배당",
    text: "지붕이 절반쯤 내려앉은 예배당 안에 제단만 멀쩡히 서 있다. 바닥의 뼈들은 기도하던 자세 그대로다. 그중 하나가 아직 창을 쥐고 있고, 창끝이 당신을 향해 천천히 돈다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "성수를 제단에 붓는다",
        requires: [{ kind: "item", item: "holy_water" }],
        outcome: {
          kind: "direct",
          result: {
            text: "뼈들이 소리 없이 무너져 내린다. 예배당 안이 처음으로 예배당다워졌다. 당신도 한동안 앉아 있었다.",
            effects: [
              { kind: "removeItem", item: "holy_water" },
              { kind: "sanity", delta: 5 },
              { kind: "xp", delta: 3 },
            ],
          },
        },
      },
      {
        text: "창을 쥔 해골과 싸운다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "skeleton_guard",
          win: {
            text: "해골이 흩어진 자리, 제단 아래 벽감에서 봉인된 성수병을 찾아낸다. 경비병은 마지막까지 그것을 지킨 것이다.",
            effects: [{ kind: "item", item: "holy_water" }],
          },
          flee: {
            text: "무너진 문틈으로 몸을 던진다. 뒤에서 뼈 부딪히는 소리가 박수처럼 들렸다.",
            effects: [{ kind: "sanity", delta: -2 }],
          },
        },
      },
      {
        text: "해골이 돌아서기 전에 제단을 뒤진다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 13,
          success: {
            text: "제단 뒤판의 문양을 읽고 감춰진 서랍을 연다. 헌금은 수백 년 동안 아무도 세지 않았다.",
            effects: [
              { kind: "gold", delta: 10 },
              { kind: "xp", delta: 3 },
            ],
          },
          failure: {
            text: "서랍은 없었고, 제단 위에 새겨진 글은 읽지 말았어야 했다. 뜻은 몰라도 몸이 먼저 알았다.",
            effects: [{ kind: "sanity", delta: -3 }],
          },
        },
      },
    ],
  },
  {
    id: "common_ruins_gargoyle_gate",
    title: "가고일의 문",
    text: "무너진 성벽에 문 하나가 남아 있고, 그 위에 석상이 웅크리고 있다. 석상은 이끼가 끼어 있지만 눈만은 깨끗하다. 문 너머로 보물 창고였을 법한 건물이 보인다.",
    pool: { kind: "common" },
    weight: 2,
    once: false,
    requires: [],
    choices: [
      {
        text: "석상을 문에서 끌어내린다",
        requires: [{ kind: "stat", stat: "str", min: 8 }],
        outcome: {
          kind: "combat",
          monster: "stone_gargoyle",
          win: {
            text: "석상이 부서진 자리에서 옛 성의 문장이 새겨진 방패가 나온다. 가고일이 지키던 것은 문이 아니라 이것이었다.",
            effects: [{ kind: "item", item: "kite_shield" }],
          },
          flee: {
            text: "돌 발톱이 등을 긁고 지나간다. 석상은 문 위로 돌아가 다시 웅크린다. 다음을 기약하듯이.",
            effects: [{ kind: "hp", delta: -3 }],
          },
        },
      },
      {
        text: "석상이 잠든 틈에 문 아래로 기어간다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 14,
          success: {
            text: "석상의 눈이 뜨이기 전에 문을 지났다. 창고는 비어 있었지만 바닥에 떨어진 것들은 있었다.",
            effects: [
              { kind: "gold", delta: 8 },
              { kind: "xp", delta: 4 },
            ],
          },
          failure: {
            text: "문 한가운데서 돌 날개가 펴지는 소리를 들었다. 성벽 밖으로 굴러 나온 건 운이 좋았기 때문이다.",
            effects: [{ kind: "hp", delta: -4 }],
          },
        },
      },
      {
        text: "돌아선다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "석상의 눈이 당신을 따라 움직인 것 같았다. 착각이었기를 바란다.",
            effects: [{ kind: "xp", delta: 1 }],
          },
        },
      },
    ],
  },
  {
    id: "common_ruins_ghost_hall",
    title: "유령의 회랑",
    text: "긴 회랑을 따라 촛불이 하나씩 켜진다. 초는 없고 불꽃만 있다. 회랑 끝에서 누군가 당신 이름을 부른다. 당신은 이름을 말한 적이 없다.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "귀를 막고 회랑을 걸어 지난다",
        requires: [{ kind: "trait", trait: "steel_mind" }],
        outcome: {
          kind: "direct",
          result: {
            text: "이름은 그저 소리일 뿐이다. 회랑 끝에 도착하자 촛불이 하나씩 꺼진다. 실망한 듯이.",
            effects: [{ kind: "xp", delta: 3 }],
          },
        },
      },
      {
        text: "목소리에 대답한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 14,
          success: {
            text: "유령은 오래 이야기했다. 배신과 독약과 숨겨 둔 지참금에 관해서. 지참금은 아직 벽 속에 있었다.",
            effects: [
              { kind: "xp", delta: 5 },
              { kind: "gold", delta: 8 },
            ],
          },
          failure: {
            text: "대답하는 순간 촛불이 모두 꺼졌고, 목소리는 당신 귓가에서 났다. 회랑을 어떻게 나왔는지 기억나지 않는다.",
            effects: [{ kind: "sanity", delta: -4 }],
          },
        },
      },
      {
        text: "목소리의 주인과 싸운다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "restless_ghost",
          win: {
            text: "유령이 흩어지며 마지막으로 고맙다고 말한다. 촛불이 조용히 꺼지고 회랑이 그저 복도가 된다.",
            effects: [{ kind: "sanity", delta: 2 }],
          },
          flee: {
            text: "회랑을 되돌아 뛰는 동안 촛불이 당신보다 빨리 꺼졌다. 이름은 계속 따라왔다.",
            effects: [{ kind: "sanity", delta: -3 }],
          },
        },
      },
    ],
  },
  {
    id: "common_ruins_cursed_knight",
    title: "무릎 꿇은 기사",
    text: "폐허의 마당에 갑옷을 입은 기사가 무릎을 꿇고 있다. 갑옷 틈으로 보이는 것은 살이 아니다. 기사가 고개를 들자 투구 속에서 두 개의 불빛이 켜진다. 결투를 청하는 것이다.",
    pool: { kind: "common" },
    weight: 2,
    once: false,
    requires: [],
    choices: [
      {
        text: "결투를 받아들인다",
        requires: [{ kind: "stat", stat: "con", min: 8 }],
        outcome: {
          kind: "combat",
          monster: "cursed_knight",
          win: {
            text: "기사가 쓰러지며 검을 당신 앞에 내려놓는다. 저주는 풀렸고, 검은 남았다.",
            effects: [{ kind: "item", item: "guard_saber" }],
          },
          flee: {
            text: "기사는 쫓아오지 않았다. 결투를 피한 자에게는 등을 베는 것으로 충분하다는 듯이.",
            effects: [{ kind: "hp", delta: -4 }],
          },
        },
      },
      {
        text: "검 대신 말로 기사의 사연을 묻는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 15,
          success: {
            text: "기사는 삼백 년 동안 아무도 묻지 않았다고 한다. 이야기가 끝나자 불빛이 꺼지고 갑옷만 남는다. 당신은 처음으로 무언가를 배웠다고 느낀다.",
            effects: [
              { kind: "xp", delta: 6 },
              { kind: "sanity", delta: 2 },
            ],
          },
          failure: {
            text: "기사는 말을 원하지 않았다. 검이 먼저 대답했고, 당신은 나중에야 이해했다.",
            effects: [
              { kind: "hp", delta: -2 },
              { kind: "sanity", delta: -3 },
            ],
          },
        },
      },
      {
        text: "고개를 숙이고 물러난다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "기사는 다시 무릎을 꿇는다. 마당을 나설 때까지 투구 속 불빛이 등을 따라왔다.",
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
    id: "common_ruins_old_library",
    title: "잊힌 서고",
    text: "무너진 탑 아래층에 서고가 남아 있다. 책들은 습기로 부풀었고, 몇 권은 아직도 읽히기를 기다린다는 듯 펼쳐져 있다. 먼지 위에 발자국은 없다. 당신 것만 빼고.",
    pool: { kind: "common" },
    weight: 3,
    once: false,
    requires: [],
    choices: [
      {
        text: "값나갈 고서를 골라 챙긴다",
        requires: [{ kind: "stat", stat: "int", min: 8 }],
        outcome: {
          kind: "direct",
          result: {
            text: "제본과 잉크만 보고 세 권을 골랐다. 다음 마을의 서기가 한 권당 값을 두 번이나 올려 불렀다.",
            effects: [
              { kind: "gold", delta: 15 },
              { kind: "xp", delta: 2 },
            ],
          },
        },
      },
      {
        text: "펼쳐진 책을 읽는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 14,
          success: {
            text: "책은 옛 언어로 쓰인 여행기였다. 밤새 읽었고, 아침에는 세상이 조금 넓어 보였다.",
            effects: [{ kind: "xp", delta: 6 }],
          },
          failure: {
            text: "글자가 페이지 위에서 움직였다. 읽기를 멈췄을 때는 이미 여러 장을 넘긴 뒤였다. 무엇을 읽었는지는 모른다.",
            effects: [{ kind: "sanity", delta: -3 }],
          },
        },
      },
      {
        text: "젖은 책으로 불을 피우고 쉰다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "책은 잘 타지 않았지만 결국 탔다. 불 앞에서 잠들었고, 아무도 꾸짖으러 오지 않았다.",
            effects: [
              { kind: "hp", delta: 2 },
              { kind: "sanity", delta: 1 },
              { kind: "xp", delta: 1 },
            ],
          },
        },
      },
    ],
  },
];
