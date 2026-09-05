// 떠돌이 용병 story chain: six flag-gated events about the lost banner of
// a disbanded company. Events 1-5 set their own step flag on every path.

import type { GameEvent } from "../../../engine/types";

const POOL = { kind: "origin", origin: "origin_mercenary" } as const;
const step = (k: number) => ({ kind: "flag", flag: `mercenary.step${k}` }) as const;

export const MERCENARY_EVENTS: readonly GameEvent[] = [
  {
    id: "origin_mercenary_1_tavern_rumor",
    title: "주막의 소문",
    text: "부대가 흩어진 뒤 처음 들른 주막에서, 낯익은 등이 보인다. 옛 취사병이다. 그는 당신을 보자마자 술잔을 비우고, 깃발이 어디로 갔는지 아는 사람은 자기뿐이라고 큰소리친다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "mercenary.start" }],
    choices: [
      {
        text: "술을 한 잔 사고 이야기를 듣는다.",
        requires: [{ kind: "gold", min: 5 }],
        outcome: {
          kind: "direct",
          result: {
            text: "석 잔째에 그는 회계관이 깃발을 팔았다고 털어놓는다. 넉 잔째는 당신 몫이 아니었다.",
            effects: [{ kind: "gold", delta: -5 }, { kind: "xp", delta: 3 }, step(1)],
          },
        },
      },
      {
        text: "멱살을 잡고 캐묻는다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 12,
          success: {
            text: "그는 발이 땅에서 떨어지기도 전에 회계관의 이름을 불었다. 주인이 눈치껏 잔을 치웠다.",
            effects: [{ kind: "xp", delta: 4 }, step(1)],
          },
          failure: {
            text: "취사병은 생각보다 무거웠고, 주인의 몽둥이는 생각보다 빨랐다. 길바닥에서 정신을 차렸을 때 누군가 회계관의 이름을 귓가에 속삭였다.",
            effects: [{ kind: "hp", delta: -3 }, { kind: "sanity", delta: -1 }, step(1)],
          },
        },
      },
      {
        text: "구석에 앉아 조용히 엿듣는다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "취사병은 공짜로 말할 때 가장 말이 많았다. 회계관, 장부, 짐수레. 당신은 잔을 비우지도 않고 일어섰다.",
            effects: [{ kind: "xp", delta: 4 }, step(1)],
          },
          failure: {
            text: "새벽까지 들은 것은 회계관 이름 하나와, 듣지 않았으면 좋았을 취사병의 연애담이었다.",
            effects: [{ kind: "sanity", delta: -2 }, step(1)],
          },
        },
      },
    ],
  },
  {
    id: "origin_mercenary_2_paymaster_ledger",
    title: "회계관의 장부",
    text: "회계관은 빚쟁이를 피해 야반도주했고, 그의 사무실은 문이 뜯긴 채 남아 있다. 서류는 바닥에 흩어졌고, 지하실로 내려가는 계단에서는 무언가 긁는 소리가 난다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [step(1)],
    choices: [
      {
        text: "흩어진 장부를 맞춰 읽는다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 12,
          success: {
            text: "숫자는 거짓말을 못 한다. 깃발은 '군수품 잡동사니'로 분류되어 병참장교에게 넘어갔다.",
            effects: [{ kind: "xp", delta: 4 }, step(2)],
          },
          failure: {
            text: "회계관의 글씨는 고의로 못 쓴 것이 분명했다. 사흘 뒤에야 병참장교의 이름 하나를 건졌다.",
            effects: [{ kind: "sanity", delta: -2 }, step(2)],
          },
        },
      },
      {
        text: "소리가 나는 지하실을 뒤진다.",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "giant_rat",
          win: {
            text: "쥐가 갉아 먹던 것은 병참장교 앞으로 쓴 인수증이었다. 절반은 쥐 뱃속에 있었지만 이름은 남았다.",
            effects: [{ kind: "xp", delta: 3 }, step(2)],
          },
          flee: {
            text: "당신은 계단을 거꾸로 올랐다. 물린 자리는 아팠지만, 나오는 길에 밟은 인수증에 병참장교의 이름이 있었다.",
            effects: [{ kind: "hp", delta: -2 }, step(2)],
          },
        },
      },
      {
        text: "횃불을 밝히고 금고를 찾는다.",
        requires: [{ kind: "item", item: "torch" }],
        outcome: {
          kind: "direct",
          result: {
            text: "빚쟁이들이 놓친 벽 뒤 금고에는 은화 몇 닢과 병참장교 앞으로 쓴 인수증이 있었다. 횃불은 다 타 버렸다.",
            effects: [
              { kind: "removeItem", item: "torch" },
              { kind: "gold", delta: 12 },
              { kind: "xp", delta: 4 },
              step(2),
            ],
          },
        },
      },
    ],
  },
  {
    id: "origin_mercenary_3_road_ambush",
    title: "옛 동료의 매복",
    text: "병참장교의 고향으로 가는 길목에서 화살 한 대가 발치에 꽂힌다. 덤불에서 나온 얼굴은 낯이 익다. 같은 솥의 밥을 먹던 자다. 그는 이제 다른 사람의 급료를 받는다고 말한다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [step(2)],
    choices: [
      {
        text: "검을 뽑는다.",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "road_bandit",
          win: {
            text: "그는 쓰러지며 누가 자기를 보냈는지 말했다. 옛 대장이었다. 당신은 그의 화살통을 챙기지 않았다.",
            effects: [{ kind: "xp", delta: 5 }, step(3)],
          },
          flee: {
            text: "당신은 덤불을 뚫고 달아났고, 지갑은 뚫리지 않은 대신 가벼워졌다. 등 뒤에서 그가 외쳤다. 대장이 기다린다고.",
            effects: [{ kind: "gold", delta: -10 }, step(3)],
          },
        },
      },
      {
        text: "옛정을 들먹인다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 14,
          success: {
            text: "당신은 그가 빚진 술값 얘기를 꺼냈다. 그는 활을 내리고 은화 몇 닢과 함께 대장의 이름을 내놓았다.",
            effects: [{ kind: "gold", delta: 5 }, { kind: "xp", delta: 4 }, step(3)],
          },
          failure: {
            text: "옛정은 두 번째 화살보다 느렸다. 그는 당신이 쓰러진 것을 보고서야 대장의 이름을 남기고 갔다.",
            effects: [{ kind: "hp", delta: -4 }, step(3)],
          },
        },
      },
      {
        text: "은화로 길을 산다.",
        requires: [{ kind: "gold", min: 15 }],
        outcome: {
          kind: "direct",
          result: {
            text: "그는 은화를 세고, 대장이 보냈다는 말을 덤으로 얹었다. 값이 싼 편이었다.",
            effects: [{ kind: "gold", delta: -15 }, step(3)],
          },
        },
      },
    ],
  },
  {
    id: "origin_mercenary_4_quartermaster_grave",
    title: "병참장교의 무덤",
    text: "병참장교는 지난겨울에 죽었고, 마을 사람들은 그가 '군기 한 장'을 관에 넣어 달라고 했다고 말한다. 묘지의 밤은 조용하지 않다. 무덤 사이로 갑옷 부딪히는 소리가 난다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [step(3)],
    choices: [
      {
        text: "묘지를 지키는 것과 싸운다.",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "skeleton_guard",
          win: {
            text: "뼈가 무너진 자리에서 관을 열었다. 안에는 깃대 하나와 깃발 없는 끈. 깃발은 누군가 먼저 가져갔다. 관 뚜껑에 산채의 표식이 새겨져 있었다.",
            effects: [{ kind: "xp", delta: 6 }, step(4)],
          },
          flee: {
            text: "당신은 담을 넘어 달아났다. 담 너머에서 본 것은 열린 관과, 관 뚜껑에 새겨진 산채의 표식이었다. 깃발은 이미 없었다.",
            effects: [{ kind: "sanity", delta: -3 }, step(4)],
          },
        },
      },
      {
        text: "새벽까지 기다렸다가 몰래 판다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "삽질 소리는 갑옷 소리에 묻혔다. 관은 비어 있었고, 뚜껑 안쪽에 산채의 표식이 새겨져 있었다.",
            effects: [{ kind: "xp", delta: 5 }, step(4)],
          },
          failure: {
            text: "삽이 돌에 부딪혔고, 갑옷이 돌아섰다. 당신은 관 뚜껑을 방패 삼아 도망쳤다. 뚜껑에는 산채의 표식이 새겨져 있었다.",
            effects: [{ kind: "hp", delta: -3 }, { kind: "sanity", delta: -2 }, step(4)],
          },
        },
      },
      {
        text: "성수를 뿌리고 정중하게 판다.",
        requires: [{ kind: "item", item: "holy_water" }],
        outcome: {
          kind: "direct",
          result: {
            text: "갑옷은 성수를 맞고 주저앉아 밤새 조용했다. 관은 비어 있었지만, 뚜껑의 산채 표식이 다음 행선지를 알려 주었다.",
            effects: [
              { kind: "removeItem", item: "holy_water" },
              { kind: "sanity", delta: 2 },
              { kind: "xp", delta: 4 },
              step(4),
            ],
          },
        },
      },
    ],
  },
  {
    id: "origin_mercenary_5_captain_letter",
    title: "대장의 편지",
    text: "주막 주인이 당신 앞으로 온 편지를 건넨다. 봉인은 옛 부대의 것이다. 대장은 산채에서 새 부대를 꾸렸고, 깃발도 자기가 갖고 있다고 쓰고 있다. 돌아오라고, 자리는 비워 두었다고.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [step(4)],
    choices: [
      {
        text: "초대를 받아들이는 답장을 보낸다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "답장은 짧았다. 가겠다고. 무엇을 할지는 쓰지 않았다. 대장도 묻지 않았다.",
            effects: [step(5)],
          },
        },
      },
      {
        text: "먼저 산채를 몰래 정찰한다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 14,
          success: {
            text: "보초는 셋, 뒷길은 하나, 깃발은 대장 막사 기둥에 걸려 있었다. 찢어졌지만 분명히 그것이었다.",
            effects: [
              { kind: "xp", delta: 6 },
              { kind: "flag", flag: "mercenary.scouted" },
              step(5),
            ],
          },
          failure: {
            text: "보초는 당신을 먼저 봤다. 당신은 굴러 내려온 비탈만큼 배웠다. 산채로 가는 길은 정면뿐이라는 것.",
            effects: [{ kind: "hp", delta: -4 }, step(5)],
          },
        },
      },
      {
        text: "편지를 태우고 하룻밤 푹 잔다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "편지는 잘 탔다. 봉인의 밀랍이 녹는 냄새가 옛 막사 냄새 같았다. 당신은 오랜만에 꿈 없이 잤다.",
            effects: [{ kind: "sanity", delta: 3 }, step(5)],
          },
        },
      },
    ],
  },
  {
    id: "origin_mercenary_6_captain_camp",
    title: "대장의 산채",
    text: "대장은 막사 앞에 앉아 있다. 뒤쪽 기둥에는 찢어진 깃발이 걸려 있다. 그는 자기 옆의 빈 의자를 가리킨다. 부하들은 반은 낯익고 반은 낯설다. 모두 당신의 손을 보고 있다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [step(5)],
    choices: [
      {
        text: "대장에게 결투를 청한다.",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "bandit_captain",
          win: {
            text: "대장이 쓰러지자 부하들은 무기를 내렸다. 당신은 기둥에서 깃발을 내려 어깨에 둘렀다.",
            effects: [{ kind: "end", ending: "mercenary_banner" }],
          },
          flee: {
            text: "당신은 등을 보였고, 부하들이 길을 막았다. 대장은 웃으며 은화 주머니를 던졌다. 당신은 그것을 주웠다.",
            effects: [{ kind: "end", ending: "mercenary_betrayal" }],
          },
        },
      },
      {
        text: "부하들에게 대장의 거래를 폭로한다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 15,
          success: {
            text: "회계관, 무덤, 팔린 깃발. 당신이 말을 마치기 전에 부하들은 대장을 둘러쌌다. 깃발은 당신 손에 쥐여졌다.",
            effects: [{ kind: "end", ending: "mercenary_banner" }],
          },
          failure: {
            text: "부하들은 대장의 급료를 받는 쪽을 택했다. 당신은 묶인 채 은화 한 주머니와 함께 산 아래로 내려보내졌다. 깃발은 그날 밤 불쏘시개가 되었다.",
            effects: [{ kind: "end", ending: "mercenary_betrayal" }],
          },
        },
      },
      {
        text: "뒷길로 들어가 깃발만 훔친다.",
        requires: [{ kind: "flag", flag: "mercenary.scouted" }],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 14,
          success: {
            text: "보초가 셋인 것은 여전했고, 뒷길이 하나인 것도 여전했다. 새벽에 당신은 깃발과 함께 산을 내려왔다.",
            effects: [{ kind: "end", ending: "mercenary_banner" }],
          },
          failure: {
            text: "기둥에서 깃발을 내리는 순간 등불이 켜졌다. 대장은 도둑을 죽이지 않았다. 대신 은화를 쥐여 주고 자기 이름으로 쫓아냈다.",
            effects: [{ kind: "end", ending: "mercenary_betrayal" }],
          },
        },
      },
      {
        text: "빈 의자에 앉는다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "의자는 편했다. 급료는 옛날의 두 배였다. 깃발은 그날 저녁 대장이 직접 불에 넣었다. 당신은 말리지 않았다.",
            effects: [{ kind: "end", ending: "mercenary_betrayal" }],
          },
        },
      },
    ],
  },
];
