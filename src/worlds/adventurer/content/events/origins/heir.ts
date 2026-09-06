// 몰락한 가문의 후계자 story chain: six flag-gated events about hunting the
// family seal. Events 1-5 set their own step flag on every path.

import type { GameEvent } from "../../../engine/types";

const POOL = { kind: "origin", origin: "origin_heir" } as const;
const step = (k: number) => ({ kind: "flag", flag: `heir.step${k}` }) as const;

export const HEIR_EVENTS: readonly GameEvent[] = [
  {
    id: "origin_heir_1_creditors",
    title: "채권자들",
    text: "저택 경매 전날, 채권자 셋이 현관에 서 있다. 그들은 정중하고, 정중함에는 값이 붙어 있다. 인장이 사라진 것은 그들도 알고 있다. 그것이 없으면 당신은 이 집의 상속자가 아니라 그냥 세입자다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "heir.start" }],
    choices: [
      {
        text: "남은 은화로 한 달을 산다.",
        requires: [{ kind: "gold", min: 30 }],
        outcome: {
          kind: "direct",
          result: {
            text: "채권자들은 은화를 세고 모자를 벗었다. 한 달이었다. 그들은 날짜를 정확히 적어 갔다.",
            effects: [{ kind: "gold", delta: -30 }, { kind: "xp", delta: 2 }, step(1)],
          },
        },
      },
      {
        text: "가문의 이름을 걸고 위협한다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 13,
          success: {
            text: "이름은 아직 조금 남아 있었다. 채권자들은 물러섰고, 물러서면서 인장이 어느 전당포에 들어갔다는 말을 흘렸다.",
            effects: [{ kind: "xp", delta: 4 }, step(1)],
          },
          failure: {
            text: "이름은 이제 남아 있지 않았다. 그들은 은식기를 가져갔고, 가면서 인장이 전당포에 있다고 친절히 알려 주었다.",
            effects: [{ kind: "gold", delta: -10 }, step(1)],
          },
        },
      },
      {
        text: "뒷문으로 빠져나간다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 12,
          success: {
            text: "뒷문은 어린 시절 그대로였다. 담 너머에서 늙은 집사가 기다리고 있었다. 그는 놀라지 않았다.",
            effects: [{ kind: "xp", delta: 3 }, step(1)],
          },
          failure: {
            text: "담은 어린 시절보다 높았다. 무릎이 까진 채 내려오니 늙은 집사가 기다리고 있었다. 그는 한숨을 쉬었다.",
            effects: [{ kind: "hp", delta: -2 }, step(1)],
          },
        },
      },
    ],
  },
  {
    id: "origin_heir_2_old_steward",
    title: "늙은 집사",
    text: "집사는 마흔 해 동안 이 집의 열쇠를 쥐고 있었고, 지금은 자기 오두막의 열쇠만 쥐고 있다. 인장이 사라진 밤에 그는 집에 있었다. 그가 기억하는 것과 말하고 싶은 것은 다르다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "heir.step1" }],
    choices: [
      {
        text: "천천히 그날 밤을 되짚게 한다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 12,
          success: {
            text: "그날 밤 금고를 연 사람은 도둑이 아니었다. 사촌이었다. 사촌은 인장을 전당포에 맡기고 여비를 챙겼다.",
            effects: [{ kind: "xp", delta: 4 }, step(2)],
          },
          failure: {
            text: "집사의 기억은 우물처럼 깊고 우물처럼 어두웠다. 전당포 이름 하나를 건지는 데 이틀이 걸렸다.",
            effects: [{ kind: "sanity", delta: -2 }, step(2)],
          },
        },
      },
      {
        text: "밀린 봉급을 건넨다.",
        requires: [{ kind: "gold", min: 20 }],
        outcome: {
          kind: "direct",
          result: {
            text: "집사는 은화를 받지 않으려다 받았다. 그리고 사촌의 이름과 전당포의 위치를 봉급 영수증처럼 정확히 말해 주었다.",
            effects: [{ kind: "gold", delta: -20 }, step(2)],
          },
        },
      },
      {
        text: "다그친다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "집사는 전당포 이름을 말하고 문을 닫았다. 그 문은 다시 열리지 않았다. 당신은 그것이 무엇을 잃은 것인지 나중에야 알았다.",
            effects: [{ kind: "sanity", delta: -2 }, step(2)],
          },
        },
      },
    ],
  },
  {
    id: "origin_heir_3_pawnshop",
    title: "전당포",
    text: "전당포 주인은 인장을 기억한다. 물론이다. 그는 그것을 산 값의 세 배를 부르고, 장부는 계산대 밑에 두고, 문 옆에는 덩치 큰 사내를 세워 두고 있다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "heir.step2" }],
    choices: [
      {
        text: "부르는 값에 정보를 산다.",
        requires: [{ kind: "gold", min: 50 }],
        outcome: {
          kind: "direct",
          result: {
            text: "인장은 이미 팔렸다. 산 사람은 산 너머 요새의 새 영주였다. 주인은 그 이름을 은화 쉰 닢에 팔았고, 영수증은 주지 않았다.",
            effects: [{ kind: "gold", delta: -50 }, step(3)],
          },
        },
      },
      {
        text: "계산대 밑의 장부를 훔쳐본다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "장부는 정직했다. 인장은 산 너머 요새로 갔고, 산 사람의 이름은 사촌의 이름과 같았다.",
            effects: [{ kind: "xp", delta: 5 }, step(3)],
          },
          failure: {
            text: "덩치 큰 사내가 당신을 문밖으로 던졌다. 던지면서 그는 산 너머 요새 얘기를 했다. 친절한 사람이었다.",
            effects: [{ kind: "hp", delta: -3 }, step(3)],
          },
        },
      },
      {
        text: "문 옆의 사내를 제압한다.",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "road_bandit",
          win: {
            text: "사내가 쓰러지자 주인은 장부를 순순히 내밀었다. 인장은 산 너머 요새로 갔다. 주인은 보상금까지 얹어 주며 나가 달라고 했다.",
            effects: [{ kind: "gold", delta: 10 }, { kind: "xp", delta: 5 }, step(3)],
          },
          flee: {
            text: "당신은 달아났고, 사내는 문턱까지만 쫓아왔다. 그가 외쳤다. 산 너머 요새나 가 보라고. 조롱이었지만 정보였다.",
            effects: [{ kind: "hp", delta: -2 }, step(3)],
          },
        },
      },
    ],
  },
  {
    id: "origin_heir_4_mountain_pass",
    title: "산길",
    text: "요새로 가는 산길은 하나뿐이고, 그 위의 하늘에는 날개 달린 것이 돌고 있다. 절벽 아래로 동굴 입구가 보이고, 절벽 위로는 손으로 잡을 만한 바위가 보인다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "heir.step3" }],
    choices: [
      {
        text: "길을 따라 정면으로 오른다.",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "harpy",
          win: {
            text: "하피는 마지막까지 당신의 외투 문장을 노렸다. 요새 성문에서 그 문장을 본 문지기의 표정이 하피와 비슷했다.",
            effects: [{ kind: "xp", delta: 6 }, step(4)],
          },
          flee: {
            text: "당신은 바위 밑으로 기어들어 밤을 넘겼다. 하피는 지루해져 떠났고, 당신은 새벽에 요새에 닿았다.",
            effects: [{ kind: "hp", delta: -3 }, step(4)],
          },
        },
      },
      {
        text: "동굴로 우회한다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "con",
          dc: 13,
          success: {
            text: "동굴은 길었고 젖어 있었고 끝이 있었다. 당신은 요새 뒤편 우물로 나왔다. 문지기는 없었다.",
            effects: [{ kind: "xp", delta: 4 }, step(4)],
          },
          failure: {
            text: "동굴은 길었고 젖어 있었고 끝이 있었다. 그 끝에 닿았을 때 당신은 열이 있었고, 요새 우물물은 차가웠다.",
            effects: [{ kind: "hp", delta: -4 }, { kind: "sanity", delta: -1 }, step(4)],
          },
        },
      },
      {
        text: "밧줄로 절벽을 오른다.",
        requires: [{ kind: "item", item: "rope" }],
        outcome: {
          kind: "direct",
          result: {
            text: "밧줄은 절벽 위 바위에 남겨 두고 왔다. 다음에 오는 사람은 운이 좋을 것이다. 요새 성벽이 바로 앞이었다.",
            effects: [{ kind: "removeItem", item: "rope" }, { kind: "xp", delta: 4 }, step(4)],
          },
        },
      },
    ],
  },
  {
    id: "origin_heir_5_usurper_hall",
    title: "찬탈자의 연회",
    text: "요새의 새 영주는 당신의 사촌이다. 그는 당신 가문의 인장을 손가락에 끼고, 당신 가문의 이름으로 연회를 열고 있다. 지하 금고 앞에는 옛 갑주 하나가 세워져 있고, 연회장 구석의 도박판에서는 주사위가 구른다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "heir.step4" }],
    choices: [
      {
        text: "하객으로 섞여 들어가 인장을 빼낸다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 14,
          success: {
            text: "사촌은 술에 취해 반지를 뺐다 끼웠다 했다. 세 번째로 뺐을 때 반지는 당신 주머니에 있었다.",
            effects: [
              { kind: "item", item: "kings_signet" },
              { kind: "flag", flag: "heir.seal" },
              step(5),
            ],
          },
          failure: {
            text: "사촌은 취한 척만 했다. 당신은 하객들 앞에서 도둑으로 불리며 끌려 나갔다. 인장은 그의 손가락에 그대로였다.",
            effects: [{ kind: "hp", delta: -3 }, { kind: "sanity", delta: -2 }, step(5)],
          },
        },
      },
      {
        text: "금고를 지키는 갑주를 부순다.",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "cursed_knight",
          win: {
            text: "갑주 안은 비어 있었고 금고 안은 비어 있지 않았다. 사촌은 진짜 인장을 손가락이 아니라 금고에 두었다. 손가락의 것은 모조품이었다.",
            effects: [
              { kind: "item", item: "kings_signet" },
              { kind: "flag", flag: "heir.seal" },
              step(5),
            ],
          },
          flee: {
            text: "갑주는 계단 위까지만 따라왔다. 당신은 연회장 뒷문으로 빠져나왔다. 손은 비었고, 갈 곳은 법정뿐이었다.",
            effects: [{ kind: "sanity", delta: -3 }, step(5)],
          },
        },
      },
      {
        text: "행운의 동전을 걸고 사촌과 주사위 내기를 한다.",
        requires: [{ kind: "item", item: "lucky_coin" }],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 12,
          success: {
            text: "사촌은 동전이 탐났고, 당신은 인장이 탐났다. 주사위는 당신 편이었다. 사촌은 하객들 앞이라 반지를 빼야 했다.",
            effects: [
              { kind: "item", item: "kings_signet" },
              { kind: "flag", flag: "heir.seal" },
              step(5),
            ],
          },
          failure: {
            text: "주사위는 사촌 편이었다. 동전과 은화 몇 닢이 탁자 건너편으로 갔다. 사촌은 다음 판을 권했고 당신은 일어섰다.",
            effects: [
              { kind: "removeItem", item: "lucky_coin" },
              { kind: "gold", delta: -15 },
              step(5),
            ],
          },
        },
      },
    ],
  },
  {
    id: "origin_heir_6_royal_court",
    title: "왕의 법정",
    text: "상속 분쟁은 왕의 법정에서 끝난다. 사촌은 먼저 와서 앉아 있고, 서기는 잉크를 갈고 있다. 판관은 인장을 내놓으라고 말한다. 인장이 없다면 혈통을 증명하라고, 그것도 없다면 나가라고.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "heir.step5" }],
    choices: [
      {
        text: "인장을 되찾은 사실을 내세워 가문의 권리를 주장한다.",
        requires: [{ kind: "flag", flag: "heir.seal" }],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 13,
          success: {
            text: "판관은 인장을 되찾은 경위를 캐물었으나 흠을 잡지 못했다. 서기는 잉크를 찍었다. 사촌은 아무 말도 하지 않았다. 그날 밤 그는 도시를 떠났다.",
            effects: [{ kind: "end", ending: "heir_restored" }],
          },
          failure: {
            text: "사촌은 그 경위가 도둑질이었다고 되받아쳤고, 당신은 그것을 부인할 수 없었다. 판관은 당신의 주장을 기각하고 국경까지의 기한을 주었다.",
            effects: [{ kind: "end", ending: "heir_exile" }],
          },
        },
      },
      {
        text: "인장 없이 혈통과 증언만으로 호소한다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 17,
          success: {
            text: "늙은 집사가 증언대에 섰고, 채권자 셋이 뒤를 이었다. 판관은 인장 없는 상속을 처음으로 인정했다. 사촌은 그날 밤 도시를 떠났다.",
            effects: [{ kind: "end", ending: "heir_restored" }],
          },
          failure: {
            text: "혈통은 종이에 적히지 않았고, 증언은 잉크가 되지 못했다. 판관은 사촌의 손을 들었다. 사촌은 관대하게도 여비를 내주었다.",
            effects: [{ kind: "end", ending: "heir_exile" }],
          },
        },
      },
      {
        text: "사촌의 합의금을 받고 떠난다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "합의금은 넉넉했다. 사촌은 악수를 청했고 당신은 받았다. 가문의 이름은 그의 것이 되었고, 당신은 그 이름을 다시 쓰지 않았다.",
            effects: [{ kind: "end", ending: "heir_exile" }],
          },
        },
      },
    ],
  },
];
