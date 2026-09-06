import type { GameEvent } from "../../../engine/types";

const pool = { kind: "journey", journey: "journey_debt" } as const;

export const DEBT_EVENTS: readonly GameEvent[] = [
  {
    id: "journey_debt_1_ledger",
    title: "당신 이름의 빚",
    text: "지하 시장 입구에서 장부를 든 사내가 당신 이름을 부른다. 정확한 발음으로. 장부를 펼치니 당신 이름 옆에 금액이 적혀 있다. 당신은 진 적이 없다. 장부는 그런 사정에 관심이 없다.",
    pool,
    weight: 4,
    once: true,
    requires: [],
    choices: [
      {
        text: "일단 일부를 갚는다",
        requires: [{ kind: "gold", min: 10 }],
        outcome: {
          kind: "direct",
          result: {
            text: "사내는 동전을 세고 장부에 줄을 그었다. 금액은 줄었고, 당신 이름은 그대로였다. 그는 영수증 대신 고개를 끄덕였다.",
            effects: [
              { kind: "gold", delta: -10 },
              { kind: "sanity", delta: 1 },
              { kind: "flag", flag: "debt.step1" },
            ],
          },
        },
      },
      {
        text: "장부의 셈을 따져 묻는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 12,
          success: {
            text: "이자 계산이 두 군데 틀려 있었다. 사내는 잠시 당황했고, 그 틈에 당신은 채권자의 이름을 읽었다. 지하 시장 가장 안쪽의 이름이었다.",
            effects: [
              { kind: "xp", delta: 4 },
              { kind: "flag", flag: "debt.step1" },
            ],
          },
          failure: {
            text: "사내는 당신이 묻는 족족 장부의 다른 쪽을 펼쳐 보였다. 빚은 모두 여섯 장에 걸쳐 있었다. 당신은 첫 장도 못 넘었다.",
            effects: [
              { kind: "sanity", delta: -2 },
              { kind: "flag", flag: "debt.step1" },
            ],
          },
        },
      },
      {
        text: "그 자리에서 도망친다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 13,
          success: {
            text: "골목 세 개를 지나서야 뒤를 돌아봤다. 아무도 없었다. 사내는 뛰지 않는다. 뛸 필요가 없는 쪽이니까.",
            effects: [{ kind: "flag", flag: "debt.step1" }],
          },
          failure: {
            text: "골목 끝에 다른 사내 둘이 서 있었다. 장부를 든 쪽이 말했다. '뛰는 것도 이자에 들어가.'",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "flag", flag: "debt.step1" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_debt_2_collector",
    title: "수금원",
    text: "다음 날부터 수금원이 따라붙는다. 밥을 먹으면 옆자리에 앉고, 잠을 자면 문 앞에 서 있다. 정중하고, 말수가 적고, 한 번도 재촉하지 않는다. 그게 제일 견디기 어렵다.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "debt.step1" }],
    choices: [
      {
        text: "골목으로 끌어들여 싸운다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "road_bandit",
          win: {
            text: "수금원은 생각보다 약했고 지갑은 생각보다 두꺼웠다. 쓰러지면서 그가 말했다. '다음 사람은 내가 아냐.'",
            effects: [
              { kind: "xp", delta: 4 },
              { kind: "gold", delta: 6 },
              { kind: "flag", flag: "debt.step2" },
            ],
          },
          flee: {
            text: "싸움은 짧았고 결론은 없었다. 다음 날 아침 그는 다시 문 앞에 서 있었다. 얼굴에 멍이 든 채, 여전히 정중하게.",
            effects: [
              { kind: "hp", delta: -2 },
              { kind: "flag", flag: "debt.step2" },
            ],
          },
        },
      },
      {
        text: "차라리 말을 붙여 본다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 13,
          success: {
            text: "그도 빚을 갚는 중이었다. 장부의 같은 장에. 그날부터 그는 옆자리에 앉을 때 술을 한 잔 더 시켰다. 당신 몫으로.",
            effects: [
              { kind: "sanity", delta: 3 },
              { kind: "flag", flag: "debt.step2" },
            ],
          },
          failure: {
            text: "그는 예의 바르게 들었고, 예의 바르게 이자를 하루치 더 적었다. 대화도 시간이었다.",
            effects: [
              { kind: "gold", delta: -5 },
              { kind: "flag", flag: "debt.step2" },
            ],
          },
        },
      },
      {
        text: "하루 품을 팔아 갚는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 11,
          success: {
            text: "부두에서 종일 상자를 날랐다. 수금원은 그늘에서 지켜보다가 품삯의 절반만 가져갔다. 나머지는 당신 몫이었다. 오늘은.",
            effects: [
              { kind: "gold", delta: 4 },
              { kind: "flag", flag: "debt.step2" },
            ],
          },
          failure: {
            text: "상자 하나가 발등에 떨어졌다. 십장은 품삯에서 상자값을 뺐고, 수금원은 나머지를 가져갔다.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "flag", flag: "debt.step2" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_debt_3_undermarket",
    title: "지하 시장",
    text: "계단을 내려가면 시장이다. 물건은 싸고 눈은 많다. 좌판마다 장부가 한 권씩 놓여 있고, 상인들은 당신을 보자 그 장부를 펼친다. 당신 이름이 있는지 확인하는 것이다. 몇 명은 고개를 끄덕인다.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "debt.step2" }],
    choices: [
      {
        text: "좌판을 둘러본다",
        requires: [],
        outcome: {
          kind: "shop",
          stock: ["hunter_knife", "padded_jerkin", "antidote", "dream_powder"],
          leave: {
            text: "값은 쌌다. 어디서 온 물건인지 묻지 않는 값이었다. 계단을 오르는데 상인 하나가 장부에 무언가 적었다.",
            effects: [{ kind: "flag", flag: "debt.step3" }],
          },
        },
      },
      {
        text: "원래 채무자를 수소문한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 12,
          success: {
            text: "당신과 이름이 같은 사람이 있었다. 작년까지. 상인들은 그가 어디 묻혔는지는 알았지만 왜 죽었는지는 몰랐다. 아니, 말하지 않았다.",
            effects: [
              { kind: "xp", delta: 5 },
              { kind: "flag", flag: "debt.step3" },
            ],
          },
          failure: {
            text: "묻는 사람마다 다른 이름을 댔다. 나중에 보니 전부 당신 이름이었다. 발음만 조금씩 달랐다.",
            effects: [
              { kind: "sanity", delta: -3 },
              { kind: "flag", flag: "debt.step3" },
            ],
          },
        },
      },
      {
        text: "상인의 돈궤에 손을 댄다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 14,
          success: {
            text: "돈궤는 잠겨 있지 않았다. 지하 시장에서 훔치는 사람은 없으니까. 이제 한 명 있다.",
            effects: [
              { kind: "gold", delta: 12 },
              { kind: "flag", flag: "debt.step3" },
            ],
          },
          failure: {
            text: "손목을 잡혔다. 상인은 때리지 않았다. 장부를 펼쳐 당신 이름 옆에 한 줄을 더 적었을 뿐이다. 경비가 때렸다.",
            effects: [
              { kind: "hp", delta: -4 },
              { kind: "gold", delta: -3 },
              { kind: "flag", flag: "debt.step3" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_debt_4_namesake",
    title: "같은 이름",
    text: "장부의 주인이 당신을 안쪽 방으로 부른다. 빚을 진 사람은 당신과 이름이 같은 죽은 사내였다. 장부 주인은 개의치 않는다. '이름이 갚는 거지, 사람이 갚나. 그 사람이 되든가, 장부를 없애든가. 셋째 길은 없어.'",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "debt.step3" }],
    choices: [
      {
        text: "장부를 훔친다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 14,
          success: {
            text: "장부 주인이 등을 돌린 사이 장부를 품에 넣고 방을 나왔다. 그는 돌아서서 빈 책상을 보고 웃었다. 사본이 있다는 웃음이었다. 그래도 원본은 원본이다.",
            effects: [
              { kind: "xp", delta: 6 },
              { kind: "flag", flag: "debt.step4" },
            ],
          },
          failure: {
            text: "손이 장부에 닿기 전에 경비가 먼저 닿았다. 장부 주인은 한 줄을 더 적었다. '장부값.'",
            effects: [
              { kind: "hp", delta: -5 },
              { kind: "flag", flag: "debt.step4" },
            ],
          },
        },
      },
      {
        text: "죽은 사내의 유품을 찾는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "공동묘지 구석, 이름만 새긴 돌 아래. 사내는 반지 하나를 끼고 묻혔다. 반지 안쪽에 당신 이름이 있었다. 그의 이름이기도 했다.",
            effects: [
              { kind: "item", item: "iron_ring" },
              { kind: "flag", flag: "debt.step4" },
            ],
          },
          failure: {
            text: "돌은 찾았지만 무덤은 비어 있었다. 누군가 먼저 다녀갔다. 아니면 누군가 먼저 나갔다.",
            effects: [
              { kind: "sanity", delta: -4 },
              { kind: "flag", flag: "debt.step4" },
            ],
          },
        },
      },
      {
        text: "장부에 성수를 붓는다",
        requires: [{ kind: "item", item: "holy_water" }],
        outcome: {
          kind: "direct",
          result: {
            text: "잉크가 번졌다. 당신 이름만. 장부 주인은 젖은 장을 한참 보다가 새 장을 넘겼다. 새 장에는 아직 아무것도 없었다. 아직.",
            effects: [
              { kind: "removeItem", item: "holy_water" },
              { kind: "sanity", delta: 3 },
              { kind: "flag", flag: "debt.step4" },
            ],
          },
        },
      },
      {
        text: "그 사람이 되기로 한다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "고개를 끄덕였다. 장부 주인은 이름 옆의 물음표를 지웠다. 이제 빚은 정말로 당신 것이었다. 적어도 누구 것인지는 분명해졌다.",
            effects: [
              { kind: "sanity", delta: -3 },
              { kind: "flag", flag: "debt.step4" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_debt_5_closing",
    title: "계정 마감",
    text: "장부 주인이 마지막 장을 펼친다. 남은 금액, 이자, 그리고 당신이 아직 이름을 모르는 항목 몇 개. '오늘 닫지. 어떤 식으로든.' 방 안의 경비들이 문 쪽으로 자리를 옮긴다.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "debt.step4" }],
    choices: [
      {
        text: "남은 빚을 전부 갚는다",
        requires: [{ kind: "gold", min: 30 }],
        outcome: {
          kind: "direct",
          result: {
            text: "동전을 세는 데 오래 걸렸다. 장부 주인은 당신 이름에 두 줄을 그었다. 진 적 없는 빚을 갚는 기분은 이상했다. 갚지 않은 빚보다는 나았다.",
            effects: [
              { kind: "gold", delta: -30 },
              { kind: "end", ending: "debt_settled" },
            ],
          },
        },
      },
      {
        text: "장부의 허점을 짚어 계정을 무효로 만든다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 15,
          success: {
            text: "죽은 사람의 서명, 틀린 이자, 존재하지 않는 날짜. 셋 중 하나만 있어도 계정은 무효였다. 장부 주인은 한참 만에 장을 찢었다. 시장의 상인들이 일제히 자기 장부를 덮었다.",
            effects: [{ kind: "end", ending: "debt_settled" }],
          },
          failure: {
            text: "허점은 있었다. 당신이 짚기 전에 장부 주인이 먼저 고쳤을 뿐이다. 경비들이 당신을 계단까지 배웅했다. 배웅비도 적혔다.",
            effects: [
              { kind: "hp", delta: -5 },
              { kind: "sanity", delta: -5 },
              { kind: "gold", delta: -10 },
            ],
          },
        },
      },
      {
        text: "장부 주인을 쓰러뜨린다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "bandit_captain",
          win: {
            text: "장부 주인이 쓰러지자 경비들은 문을 열고 비켜섰다. 그들도 같은 장부에 있었다. 당신은 장부를 화로에 넣었다. 잘 탔다.",
            effects: [{ kind: "end", ending: "debt_settled" }],
          },
          flee: {
            text: "경비 둘을 지나 계단을 올랐다. 장부 주인은 쫓지 않았다. 다음 날 아침 문 앞에 새 수금원이 서 있었다. 정중하게.",
            effects: [
              { kind: "hp", delta: -6 },
              { kind: "sanity", delta: -3 },
            ],
          },
        },
      },
    ],
  },
];
