// 파문당한 수도사 story chain: six flag-gated events about a forbidden book
// and the road back to the abbey. Events 1-5 set their own step flag on every path.

import type { GameEvent } from "../../../engine/types";

const POOL = { kind: "origin", origin: "origin_monk" } as const;
const step = (k: number) => ({ kind: "flag", flag: `monk.step${k}` }) as const;

export const MONK_EVENTS: readonly GameEvent[] = [
  {
    id: "origin_monk_1_abbey_messenger",
    title: "수도원의 전령",
    text: "수도원 문이 닫힌 지 하루 만에 전령이 당신을 따라잡는다. 그는 말에서 내리지도 않은 채 말한다. 책을 내놓으면 파문은 그대로지만 추적은 끝난다고. 품속의 책이 그 말을 듣기라도 한 듯 묵직해진다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "monk.start" }],
    choices: [
      {
        text: "책을 더 깊이 품고 묵묵히 걷는다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "전령은 한참 뒤따르다가 말머리를 돌렸다. 그날 밤 책은 평소보다 한 장 더 넘어가 있었다.",
            effects: [{ kind: "sanity", delta: -1 }, step(1)],
          },
        },
      },
      {
        text: "전령을 설득해 시간을 번다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 12,
          success: {
            text: "당신은 책을 태우려면 정해진 절차가 있다고 말했고, 전령은 그것이 사실인지 몰랐다. 그는 여비까지 조금 남기고 떠났다.",
            effects: [{ kind: "gold", delta: 5 }, { kind: "xp", delta: 4 }, step(1)],
          },
          failure: {
            text: "전령은 절차에는 관심이 없었다. 채찍 자국 하나를 남기고, 그는 다음에는 혼자 오지 않겠다고 했다.",
            effects: [{ kind: "hp", delta: -2 }, step(1)],
          },
        },
      },
      {
        text: "전령이 보는 앞에서 책을 펼친다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "첫 장은 별다를 것 없는 기도문이었다. 전령은 실망했고, 당신은 둘째 장이 첫 장과 다르다는 것을 말하지 않았다.",
            effects: [{ kind: "xp", delta: 4 }, { kind: "flag", flag: "monk.read" }, step(1)],
          },
          failure: {
            text: "첫 장을 읽자 글자가 흔들렸다. 전령이 떠난 것도, 해가 진 것도 나중에야 알았다.",
            effects: [{ kind: "sanity", delta: -3 }, { kind: "flag", flag: "monk.read" }, step(1)],
          },
        },
      },
    ],
  },
  {
    id: "origin_monk_2_wayside_shrine",
    title: "길가의 사당",
    text: "이끼 낀 사당 앞에서 책이 품속에서 떨린다. 사당 안의 촛불은 아무도 없는데 켜져 있고, 헌금함은 자물쇠도 없이 열려 있다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "monk.step1" }],
    choices: [
      {
        text: "무릎을 꿇고 옛 기도문을 왼다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 12,
          success: {
            text: "기도문이 끝나자 책은 조용해졌다. 촛불도 하나 꺼졌다. 당신은 그것을 좋은 징조로 치기로 했다.",
            effects: [{ kind: "sanity", delta: 2 }, { kind: "xp", delta: 3 }, step(2)],
          },
          failure: {
            text: "기도문 중간에 단어가 하나 바뀌어 나왔다. 당신이 바꾼 것이 아니었다.",
            effects: [{ kind: "sanity", delta: -1 }, step(2)],
          },
        },
      },
      {
        text: "성수를 책에 붓는다.",
        requires: [{ kind: "item", item: "holy_water" }],
        outcome: {
          kind: "direct",
          result: {
            text: "종이는 젖지 않았다. 대신 책은 사흘 동안 한 장도 넘어가지 않았다. 병은 비었다.",
            effects: [
              { kind: "removeItem", item: "holy_water" },
              { kind: "sanity", delta: 3 },
              step(2),
            ],
          },
        },
      },
      {
        text: "헌금함을 턴다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "동전은 많지 않았지만 무거웠다. 파문당한 몸에 죄 하나가 더 얹히는 정도야 무게로 치지도 않았다.",
            effects: [{ kind: "gold", delta: 15 }, { kind: "sanity", delta: -2 }, step(2)],
          },
          failure: {
            text: "촛불을 켜 둔 사람은 뒤뜰에 있었고, 빗자루를 들고 있었다. 당신은 헌금함 대신 멍을 얻었다.",
            effects: [{ kind: "hp", delta: -2 }, { kind: "sanity", delta: -3 }, step(2)],
          },
        },
      },
    ],
  },
  {
    id: "origin_monk_3_scholar_offer",
    title: "학자의 제안",
    text: "읍내 여관에서 한 학자가 당신 품속의 책 모양을 알아본다. 그는 책값으로 은화를, 필사본이라면 그 절반을 부른다. 그리고 원한다면 밤새 그 책에 관해 토론할 수도 있다고 덧붙인다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "monk.step2" }],
    choices: [
      {
        text: "필사본을 만들어 판다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 13,
          success: {
            text: "당신은 밤새 베꼈고, 학자는 아침에 값을 치렀다. 그가 산 것이 무엇인지는 그의 문제였다.",
            effects: [{ kind: "gold", delta: 25 }, { kind: "xp", delta: 3 }, step(3)],
          },
          failure: {
            text: "손이 떨려 글자가 뒤집혔다. 학자는 종이를 돌려주었고, 당신은 그날 밤 자기 글씨가 무서웠다.",
            effects: [{ kind: "sanity", delta: -2 }, step(3)],
          },
        },
      },
      {
        text: "거절하고 방으로 올라간다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "학자는 어깨를 으쓱했다. 어차피 그런 책은 파는 사람이 아니라 책이 주인을 고른다고, 그는 말했다.",
            effects: [{ kind: "xp", delta: 3 }, step(3)],
          },
        },
      },
      {
        text: "밤새 토론한다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 15,
          success: {
            text: "새벽에 학자는 졌음을 인정했다. 당신은 책의 셋째 장이 왜 비어 있는지 처음으로 이해했다.",
            effects: [{ kind: "xp", delta: 6 }, { kind: "stat", stat: "wis", delta: 1 }, step(3)],
          },
          failure: {
            text: "학자는 당신보다 책을 잘 알았다. 그것이 어떻게 가능한지가 아침까지 당신을 괴롭혔다.",
            effects: [{ kind: "sanity", delta: -2 }, step(3)],
          },
        },
      },
    ],
  },
  {
    id: "origin_monk_4_ghost_chapel",
    title: "유령의 예배당",
    text: "폭우를 피해 들어간 폐예배당에는 먼저 온 손님이 있다. 오래전에 죽은 수도사다. 그는 당신의 품을 가리키며 그 책을 자기가 썼다고 말한다. 그리고 돌려 달라고 한다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "monk.step3" }],
    choices: [
      {
        text: "지팡이를 들고 맞선다.",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "restless_ghost",
          win: {
            text: "유령은 흩어지며 마지막 장을 읽지 말라고 했다. 저자의 말이니 들을 가치는 있었다.",
            effects: [{ kind: "xp", delta: 6 }, step(4)],
          },
          flee: {
            text: "당신은 빗속으로 뛰쳐나왔다. 젖은 책은 무사했고, 젖은 정신은 그렇지 못했다.",
            effects: [{ kind: "sanity", delta: -3 }, step(4)],
          },
        },
      },
      {
        text: "책의 구절을 소리 내어 읽어 쫓는다.",
        requires: [{ kind: "flag", flag: "monk.read" }],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 12,
          success: {
            text: "둘째 장의 구절이 유령을 뒤로 밀어냈다. 책이 자기 저자를 내쫓는 것을 당신은 잠자코 지켜보았다.",
            effects: [{ kind: "sanity", delta: -1 }, step(4)],
          },
          failure: {
            text: "구절은 유령이 아니라 당신에게 작용했다. 정신을 차렸을 때 예배당은 비어 있었고, 비는 그쳐 있었다.",
            effects: [{ kind: "sanity", delta: -4 }, step(4)],
          },
        },
      },
      {
        text: "새벽까지 기도하며 버틴다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "con",
          dc: 13,
          success: {
            text: "유령은 첫닭과 함께 사라졌다. 당신은 무릎으로 밤을 샜고, 무릎은 이의를 제기했다.",
            effects: [{ kind: "xp", delta: 4 }, step(4)],
          },
          failure: {
            text: "밤은 길었고 유령의 손은 차가웠다. 새벽에 당신은 기침을 하며 예배당을 나섰다.",
            effects: [{ kind: "hp", delta: -4 }, step(4)],
          },
        },
      },
    ],
  },
  {
    id: "origin_monk_5_inquisitor",
    title: "심문관의 그림자",
    text: "수도원이 이번에는 전령 대신 심문관을 보냈다. 그는 갑옷 입은 종자를 데리고 여관 문을 막아선다. 이제 선택지는 셋뿐이라고 그는 말한다. 따라오든지, 달아나든지, 죽든지.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "monk.step4" }],
    choices: [
      {
        text: "순순히 따라간다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "심문관은 당신이 저항하지 않자 오히려 당황한 듯했다. 수도원까지 가는 길에 그는 밥값을 내 주었다.",
            effects: [{ kind: "sanity", delta: 1 }, step(5)],
          },
        },
      },
      {
        text: "창문으로 달아난다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "창문은 이층이었고 지붕은 가까웠다. 심문관의 욕설이 뒤따랐지만 심문관은 따라오지 못했다.",
            effects: [{ kind: "xp", delta: 5 }, step(5)],
          },
          failure: {
            text: "지붕은 생각보다 멀었다. 당신은 발목을 절며 수도원으로 향했다. 심문관은 굳이 뒤따르지도 않았다.",
            effects: [{ kind: "hp", delta: -5 }, step(5)],
          },
        },
      },
      {
        text: "갑옷 입은 종자와 싸운다.",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "cursed_knight",
          win: {
            text: "종자가 쓰러지자 심문관은 뒷걸음질쳤다. 당신은 그를 쫓지 않았다. 갈 곳은 어차피 같았다.",
            effects: [{ kind: "xp", delta: 7 }, step(5)],
          },
          flee: {
            text: "당신은 부엌 뒷문으로 달아났다. 등에 난 상처는 얕았고, 갈 길은 여전히 수도원이었다.",
            effects: [{ kind: "hp", delta: -3 }, step(5)],
          },
        },
      },
    ],
  },
  {
    id: "origin_monk_6_abbey_gate",
    title: "수도원의 문 앞",
    text: "돌아온 문 앞에는 대수도원장이 직접 서 있다. 그 옆에는 불이 지펴진 화로가 있고, 그 뒤에는 열린 문이 있다. 품속의 책은 마지막 장을 남겨 두고 있다. 당신은 그것을 알고 있다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "monk.step5" }],
    choices: [
      {
        text: "책을 화로에 넣고 무릎을 꿇는다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 14,
          success: {
            text: "불꽃이 무언가를 속삭였지만 당신은 듣지 않았다. 책은 재가 되었고, 대수도원장은 문에서 비켜섰다.",
            effects: [{ kind: "end", ending: "monk_absolution" }],
          },
          failure: {
            text: "불꽃이 마지막 장을 읽어 주었다. 당신은 손을 뻗어 책을 건졌다. 화상은 아프지 않았다. 문은 닫혔다.",
            effects: [{ kind: "end", ending: "monk_heresy" }],
          },
        },
      },
      {
        text: "대수도원장 앞에서 마지막 장을 읽는다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "마지막 장은 짧았다. 다 읽었을 때 대수도원장은 늙어 보였고, 당신은 그렇지 않았다. 당신은 돌아서서 걸었다.",
            effects: [{ kind: "end", ending: "monk_heresy" }],
          },
        },
      },
      {
        text: "책을 돌려주고 모든 것을 고백한다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 15,
          success: {
            text: "전령, 사당, 학자, 유령. 대수도원장은 끝까지 듣고 책을 받아 화로에 넣었다. 문은 열려 있었다.",
            effects: [{ kind: "end", ending: "monk_absolution" }],
          },
          failure: {
            text: "고백은 변명처럼 들렸다. 대수도원장은 책을 받지 않았고, 당신은 책과 함께 남았다. 책이 원하던 대로.",
            effects: [{ kind: "end", ending: "monk_heresy" }],
          },
        },
      },
      {
        text: "속죄 헌금을 바치고 책을 내려놓는다.",
        requires: [{ kind: "gold", min: 80 }],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 12,
          success: {
            text: "은화는 사면의 무게를 줄이지 못했지만, 문을 여는 데는 충분했다. 수도원 회계관은 영수증을 써 주었다.",
            effects: [
              { kind: "gold", delta: -80 },
              { kind: "end", ending: "monk_absolution" },
            ],
          },
          failure: {
            text: "회계관은 은화를 세더니 고개를 저었다. 헌금은 받았지만 문은 열리지 않았다.",
            effects: [
              { kind: "gold", delta: -80 },
              { kind: "end", ending: "monk_heresy" },
            ],
          },
        },
      },
    ],
  },
];
