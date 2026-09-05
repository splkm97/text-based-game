import type { GameEvent } from "../../../engine/types";

const pool = { kind: "journey", journey: "journey_circus" } as const;

export const CIRCUS_EVENTS: readonly GameEvent[] = [
  {
    id: "journey_circus_1_poster",
    title: "보름달 밤, 단 하루",
    text: "마을 담벼락에 포스터가 붙어 있다. '달빛 서커스단. 보름달 밤, 단 하루.' 그림 속 곡예사는 웃고 있는데, 눈이 그려져 있지 않다. 언덕 너머에서 천막 올라가는 소리가 들린다.",
    pool,
    weight: 4,
    once: true,
    requires: [],
    choices: [
      {
        text: "입장료를 낸다",
        requires: [{ kind: "gold", min: 5 }],
        outcome: {
          kind: "direct",
          result: {
            text: "매표소의 소녀는 동전을 세지도 않고 받는다. 자리는 좋았고, 공연은 기묘하게 조용했다.",
            effects: [
              { kind: "gold", delta: -5 },
              { kind: "sanity", delta: 2 },
              { kind: "flag", flag: "circus.step1" },
            ],
          },
        },
      },
      {
        text: "천막 뒤로 몰래 들어간다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 12,
          success: {
            text: "천막 자락을 들추고 들어갔다. 무대 뒤에서 본 공연은 앞에서 본 것과 순서가 달랐다.",
            effects: [
              { kind: "xp", delta: 3 },
              { kind: "flag", flag: "circus.step1" },
            ],
          },
          failure: {
            text: "차력사에게 멱살을 잡혀 밖으로 던져졌다. 그는 미안하다는 듯 손을 흔들었다. 던지기 전에.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "flag", flag: "circus.step1" },
            ],
          },
        },
      },
      {
        text: "포스터를 뜯어 챙긴다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "포스터를 접어 품에 넣었다. 밤이 되자 종이가 미지근했다. 그래도 천막까지는 가 보기로 했다.",
            effects: [
              { kind: "xp", delta: 1 },
              { kind: "sanity", delta: -1 },
              { kind: "flag", flag: "circus.step1" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_circus_2_ringmaster",
    title: "단장의 제안",
    text: "공연이 끝나자 단장이 당신을 불러 세운다. 키가 크고, 모자가 더 크다. '얼굴이 낯익군. 일손이 모자라. 하룻밤이면 돼.' 그의 미소는 가면처럼 반듯하다.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "circus.step1" }],
    choices: [
      {
        text: "곡예사 오디션을 본다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "줄 위에서 세 걸음을 걸었다. 단원들이 박수를 쳤다. 박수 소리가 하나도 겹치지 않았다.",
            effects: [
              { kind: "xp", delta: 5 },
              { kind: "flag", flag: "circus.step2" },
            ],
          },
          failure: {
            text: "두 걸음째에 떨어졌다. 그물은 있었다. 그물 아래 바닥도 있었다.",
            effects: [
              { kind: "hp", delta: -4 },
              { kind: "flag", flag: "circus.step2" },
            ],
          },
        },
      },
      {
        text: "장부 정리를 돕는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 12,
          success: {
            text: "수입은 있는데 지출이 없었다. 밥값도, 숙박비도. 단장은 셈이 맞는다며 은화를 쥐여 주었다.",
            effects: [
              { kind: "gold", delta: 8 },
              { kind: "flag", flag: "circus.step2" },
            ],
          },
          failure: {
            text: "숫자가 자꾸 자리를 바꿨다. 셈이 틀린 만큼은 당신 몫에서 빠졌다.",
            effects: [
              { kind: "gold", delta: -3 },
              { kind: "flag", flag: "circus.step2" },
            ],
          },
        },
      },
      {
        text: "짐꾼으로 일한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 11,
          success: {
            text: "상자는 무거웠고 안에서 무언가 움직였다. 묻지 않았더니 품삯이 넉넉했다.",
            effects: [
              { kind: "gold", delta: 5 },
              { kind: "flag", flag: "circus.step2" },
            ],
          },
          failure: {
            text: "상자를 떨어뜨렸다. 상자는 멀쩡했고, 당신 발은 아니었다.",
            effects: [
              { kind: "hp", delta: -2 },
              { kind: "flag", flag: "circus.step2" },
            ],
          },
        },
      },
      {
        text: "거절하고 구경만 한다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "단장은 알겠다고 했다. 밤새 어디를 가든 그의 시선이 뒤통수에 붙어 있었다.",
            effects: [
              { kind: "sanity", delta: -2 },
              { kind: "flag", flag: "circus.step2" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_circus_3_cage",
    title: "천막 뒤의 우리",
    text: "밤이 깊자 천막 뒤에서 소리가 난다. 짐승 우리에 천이 덮여 있고, 그 아래에서 누군가 곡예사의 구령을 되풀이한다. 하나, 둘, 셋. 하나, 둘, 셋.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "circus.step2" }],
    choices: [
      {
        text: "우리를 연다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "restless_ghost",
          win: {
            text: "우리 안의 것은 옛 곡예사의 형상이었다. 흩어지기 전에 그것이 말했다. '피날레 전엔 아무도 못 떠나.'",
            effects: [
              { kind: "xp", delta: 4 },
              { kind: "flag", flag: "circus.step3" },
            ],
          },
          flee: {
            text: "우리 문을 도로 닫고 달렸다. 등 뒤에서 구령이 계속됐다. 넷, 다섯, 여섯.",
            effects: [
              { kind: "sanity", delta: -3 },
              { kind: "flag", flag: "circus.step3" },
            ],
          },
        },
      },
      {
        text: "횃불로 살펴본다",
        requires: [{ kind: "item", item: "torch" }],
        outcome: {
          kind: "direct",
          result: {
            text: "불빛 아래 우리는 비어 있었다. 바닥에 곡예복이 개켜져 있고, 그 위에 가면이 놓여 있었다. 셈이 맞았다. 단원 수보다 가면이 하나 많았다.",
            effects: [
              { kind: "xp", delta: 3 },
              { kind: "sanity", delta: 1 },
              { kind: "flag", flag: "circus.step3" },
            ],
          },
        },
      },
      {
        text: "조용히 물러난다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 12,
          success: {
            text: "듣지 않은 것으로 하기로 했다. 그러자 소리가 그쳤다. 그쪽도 같은 생각이었던 모양이다.",
            effects: [{ kind: "flag", flag: "circus.step3" }],
          },
          failure: {
            text: "물러나는 내내 구령이 따라왔다. 잠자리에 들어서도 셋까지 세면 눈이 떠졌다.",
            effects: [
              { kind: "sanity", delta: -4 },
              { kind: "flag", flag: "circus.step3" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_circus_4_masks",
    title: "가면 아래",
    text: "아침 식사 자리. 단원들은 모두 가면을 쓴 채 먹는다. 음식은 가면 뒤로 사라진다. 단장이 빈 접시를 밀어 주며 말한다. '함께 가지. 자리는 늘 하나 비어 있어.'",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "circus.step3" }],
    choices: [
      {
        text: "가면을 벗어 보라고 한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 14,
          success: {
            text: "가장 어린 단원이 가면을 내렸다. 그 아래에는 포스터의 얼굴이 있었다. 눈이 없는 채로. 단장이 처음으로 웃음을 멈췄다.",
            effects: [
              { kind: "xp", delta: 6 },
              { kind: "flag", flag: "circus.step4" },
            ],
          },
          failure: {
            text: "아무도 움직이지 않았다. 대신 모두가 당신 쪽으로 고개를 돌렸다. 정확히 같은 각도로.",
            effects: [
              { kind: "sanity", delta: -5 },
              { kind: "flag", flag: "circus.step4" },
            ],
          },
        },
      },
      {
        text: "단장의 마차를 뒤진다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 13,
          success: {
            text: "마차 바닥에 계약서 뭉치가 있었다. 서명은 모두 달랐고 필체는 하나였다. 그 사이에 낀 돈주머니는 당신이 챙겼다.",
            effects: [
              { kind: "gold", delta: 10 },
              { kind: "flag", flag: "circus.step4" },
            ],
          },
          failure: {
            text: "마차 계단이 무너졌다. 아니, 무너지도록 만들어져 있었다. 단장은 사고였다고 했다.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "flag", flag: "circus.step4" },
            ],
          },
        },
      },
      {
        text: "동전을 던져 정한다",
        requires: [{ kind: "item", item: "lucky_coin" }],
        outcome: {
          kind: "direct",
          result: {
            text: "동전은 모서리로 섰다. 단장이 그것을 한참 보다가 모자를 벗어 인사했다. 오늘은 더 묻지 않겠다는 뜻이었다.",
            effects: [
              { kind: "sanity", delta: 2 },
              { kind: "flag", flag: "circus.step4" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_circus_5_finale",
    title: "피날레",
    text: "보름달이 천막 꼭대기에 걸렸다. 마지막 공연. 단장이 링 한가운데를 비우고 당신을 본다. '이제 당신 차례.' 객석에는 마을 사람들이 앉아 있는데, 아무도 눈을 깜빡이지 않는다.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "circus.step4" }],
    choices: [
      {
        text: "링 위에 올라 공연을 끝낸다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 15,
          success: {
            text: "당신은 링 위에서 인사했다. 객석이 처음으로 눈을 깜빡였다. 단원들이 하나씩 가면을 벗었고, 그 아래에는 아무것도 없었다. 그것으로 충분했다.",
            effects: [{ kind: "end", ending: "circus_finale" }],
          },
          failure: {
            text: "인사를 마치기 전에 조명이 꺼졌다. 다시 켜졌을 때 천막은 없었고, 당신은 언덕 위에 혼자 서 있었다. 품속의 포스터가 뜨거웠다.",
            effects: [
              { kind: "hp", delta: -5 },
              { kind: "sanity", delta: -4 },
            ],
          },
        },
      },
      {
        text: "단장의 가면을 부순다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "swamp_hag",
          win: {
            text: "가면이 깨지자 모자가 먼저 떨어지고, 그다음에 나머지가 떨어졌다. 단원들이 박수를 쳤다. 이번에는 소리가 겹쳤다.",
            effects: [{ kind: "end", ending: "circus_finale" }],
          },
          flee: {
            text: "천막 밖으로 뛰쳐나왔다. 뒤에서 단장이 예의 바르게 외쳤다. '다음 보름에 봅시다.'",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "sanity", delta: -6 },
            ],
          },
        },
      },
      {
        text: "짐을 챙겨 조용히 떠난다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 12,
          success: {
            text: "공연이 시작되는 사이 마차 한 대의 돈궤를 비웠다. 언덕을 넘을 때까지 아무도 쫓아오지 않았다. 그게 더 불안했다.",
            effects: [
              { kind: "gold", delta: 10 },
              { kind: "sanity", delta: -3 },
            ],
          },
          failure: {
            text: "차력사가 출구에 서 있었다. 그는 여전히 미안한 얼굴이었다. 던지기 전에.",
            effects: [
              { kind: "hp", delta: -4 },
              { kind: "sanity", delta: -3 },
            ],
          },
        },
      },
    ],
  },
];
