import type { GameEvent } from "../../../engine/types";

const pool = { kind: "journey", journey: "journey_lighthouse" } as const;

export const LIGHTHOUSE_EVENTS: readonly GameEvent[] = [
  {
    id: "journey_lighthouse_1_dark_coast",
    title: "불 꺼진 해안",
    text: "해안 마을의 밤은 바다보다 어둡다. 곶 끝의 등대는 삼 년째 꺼져 있고, 그동안 배가 다섯 척 부서졌다. 촌장이 당신 앞에 잔을 놓으며 말한다. '올라가 볼 사람이 없어서 그렇지, 등대는 멀쩡해.'",
    pool,
    weight: 4,
    once: true,
    requires: [],
    choices: [
      {
        text: "보수를 요구한다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 12,
          success: {
            text: "촌장은 한숨과 함께 돈주머니를 내놓았다. 배 다섯 척보다는 싸다는 계산이었을 것이다.",
            effects: [
              { kind: "gold", delta: 10 },
              { kind: "flag", flag: "lighthouse.step1" },
            ],
          },
          failure: {
            text: "촌장은 웃었고, 주막 사람들도 따라 웃었다. 결국 공짜로 가게 되었다. 웃음값은 따로 없었다.",
            effects: [
              { kind: "sanity", delta: -1 },
              { kind: "flag", flag: "lighthouse.step1" },
            ],
          },
        },
      },
      {
        text: "그냥 맡는다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "잔을 비우고 일어섰다. 촌장은 고맙다는 말 대신 등대 열쇠가 없다는 말을 했다. 그 말이 먼저였어야 했다.",
            effects: [
              { kind: "xp", delta: 2 },
              { kind: "sanity", delta: 2 },
              { kind: "flag", flag: "lighthouse.step1" },
            ],
          },
        },
      },
      {
        text: "난파선을 먼저 뒤진다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "agi",
          dc: 11,
          success: {
            text: "갯바위에 걸린 선체에서 젖지 않은 밧줄 한 타래를 건졌다. 선원들의 흔적은 없었다. 신발 한 짝만 빼고.",
            effects: [
              { kind: "item", item: "rope" },
              { kind: "flag", flag: "lighthouse.step1" },
            ],
          },
          failure: {
            text: "파도가 갑판을 쓸었고 당신도 같이 쓸렸다. 얻은 것은 멍과 소금기뿐이었다.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "flag", flag: "lighthouse.step1" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_lighthouse_2_locked_door",
    title: "안에서 잠긴 문",
    text: "등대 문은 안에서 빗장이 걸려 있다. 삼 년 동안 아무도 나오지 않았다는 뜻이다. 문 위 창문은 열려 있는데, 사람 손이 닿기엔 높다.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "lighthouse.step1" }],
    choices: [
      {
        text: "문을 부순다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 13,
          success: {
            text: "세 번째 어깨에 빗장이 부러졌다. 안쪽에는 의자가 문에 기대어 있었다. 누군가 아주 오래 앉아 있던 자세로.",
            effects: [
              { kind: "xp", delta: 4 },
              { kind: "flag", flag: "lighthouse.step2" },
            ],
          },
          failure: {
            text: "문은 버텼고 어깨는 아니었다. 결국 벽을 타고 창문으로 들어갔다. 처음부터 그랬으면 될 일이었다.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "flag", flag: "lighthouse.step2" },
            ],
          },
        },
      },
      {
        text: "밧줄을 창문에 건다",
        requires: [{ kind: "item", item: "rope" }],
        outcome: {
          kind: "direct",
          result: {
            text: "밧줄이 창틀에 걸렸다. 올라가 보니 창틀 안쪽에 손톱 자국이 있었다. 나가려던 자국이 아니라 들어오려던 자국이었다. 밧줄은 그대로 두고 왔다.",
            effects: [
              { kind: "removeItem", item: "rope" },
              { kind: "xp", delta: 3 },
              { kind: "flag", flag: "lighthouse.step2" },
            ],
          },
        },
      },
      {
        text: "열쇠를 찾아본다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 12,
          success: {
            text: "문지방 돌 아래에 열쇠와 동전 몇 닢이 있었다. 열쇠는 문에 맞지 않았다. 동전은 어디에나 맞는다.",
            effects: [
              { kind: "gold", delta: 4 },
              { kind: "flag", flag: "lighthouse.step2" },
            ],
          },
          failure: {
            text: "한 시간 동안 돌을 뒤집었다. 열쇠는 없었고 바다는 계속 당신을 보고 있었다. 결국 창문으로 기어올랐다.",
            effects: [
              { kind: "sanity", delta: -2 },
              { kind: "flag", flag: "lighthouse.step2" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_lighthouse_3_spiral_stairs",
    title: "나선 계단",
    text: "계단 벽에 눈금이 새겨져 있다. 하루에 하나씩. 눈금은 계단을 따라 올라가다가 삼 년 전 날짜에서 끊긴다. 그 위쪽 어둠에서 날갯짓 소리가 내려온다.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "lighthouse.step2" }],
    choices: [
      {
        text: "소리를 향해 올라간다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "cave_bat",
          win: {
            text: "박쥐 떼는 등대지기의 침상을 둥지로 쓰고 있었다. 침상은 비어 있었다. 이불은 사람 모양으로 꺼져 있었다.",
            effects: [
              { kind: "xp", delta: 4 },
              { kind: "flag", flag: "lighthouse.step3" },
            ],
          },
          flee: {
            text: "계단을 반쯤 굴러 내려왔다. 박쥐들은 쫓아오지 않았다. 위쪽에 더 볼일이 있는 눈치였다.",
            effects: [
              { kind: "hp", delta: -2 },
              { kind: "flag", flag: "lighthouse.step3" },
            ],
          },
        },
      },
      {
        text: "횃불을 켠다",
        requires: [{ kind: "item", item: "torch" }],
        outcome: {
          kind: "direct",
          result: {
            text: "불빛이 닿자 날개들이 한꺼번에 창밖으로 빠져나갔다. 삼 년 만의 빛이었다. 벽의 눈금이 하나 늘어 있었다. 방금 새긴 것처럼.",
            effects: [
              { kind: "sanity", delta: 2 },
              { kind: "flag", flag: "lighthouse.step3" },
            ],
          },
        },
      },
      {
        text: "어둠 속을 더듬어 오른다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 13,
          success: {
            text: "눈금을 손끝으로 세며 올라갔다. 눈금이 끝나는 곳에서 계단도 끝났다. 셈이 맞는 것이 이렇게 불쾌할 수 있다는 걸 배웠다.",
            effects: [{ kind: "flag", flag: "lighthouse.step3" }],
          },
          failure: {
            text: "어둠 속에서 누군가 당신 손 위에 손을 얹었다. 눈금을 세는 걸 도와주려는 듯이. 그 손은 차가웠고 계단이 끝날 때까지 떨어지지 않았다.",
            effects: [
              { kind: "sanity", delta: -4 },
              { kind: "flag", flag: "lighthouse.step3" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_lighthouse_4_keepers_log",
    title: "등대지기의 일지",
    text: "등불실 아래 방. 책상 위에 일지가 펼쳐져 있다. 마지막 장은 삼 년 전 날짜다. '불을 끈 것은 나다. 빛을 보고 오는 것이 배만은 아니었다.' 그 아래는 글씨가 아니라 긁은 자국이다.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "lighthouse.step3" }],
    choices: [
      {
        text: "일지를 처음부터 읽는다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "int",
          dc: 13,
          success: {
            text: "등대지기는 꼼꼼했다. 무엇이 오는지, 며칠 간격인지, 불을 끄면 얼마나 늦어지는지. 늦어질 뿐 멈추지는 않는다는 것까지.",
            effects: [
              { kind: "xp", delta: 6 },
              { kind: "flag", flag: "lighthouse.step4" },
            ],
          },
          failure: {
            text: "중간부터 글씨가 일지의 것이 아니었다. 당신 필체였다. 아직 쓰지 않은 날짜로.",
            effects: [
              { kind: "sanity", delta: -5 },
              { kind: "flag", flag: "lighthouse.step4" },
            ],
          },
        },
      },
      {
        text: "일지를 태운다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "종이는 잘 탔다. 알고 싶지 않은 것을 태우는 것은 언제나 잘 탄다. 그날 밤은 잤다. 무엇이 오는지 모르는 채로.",
            effects: [
              { kind: "sanity", delta: -2 },
              { kind: "flag", flag: "lighthouse.step4" },
            ],
          },
        },
      },
      {
        text: "마을에서 등유를 사 온다",
        requires: [{ kind: "gold", min: 8 }],
        outcome: {
          kind: "direct",
          result: {
            text: "잡화점 주인은 등유를 팔면서 한 번도 등대 쪽을 보지 않았다. 통을 들고 올라오니 등불실의 심지가 이미 다듬어져 있었다.",
            effects: [
              { kind: "gold", delta: -8 },
              { kind: "xp", delta: 2 },
              { kind: "flag", flag: "lighthouse.step4" },
            ],
          },
        },
      },
    ],
  },
  {
    id: "journey_lighthouse_5_the_light",
    title: "꼭대기",
    text: "등불실. 렌즈는 먼지 아래서도 멀쩡하다. 바다 저편, 수평선 바로 아래에서 무언가가 기다린다. 빛을 켜면 배가 온다. 빛을 켜면 다른 것도 온다. 등대지기는 셋째 날에 결정했다고 일지에 적혀 있었다.",
    pool,
    weight: 4,
    once: true,
    requires: [{ kind: "flag", flag: "lighthouse.step4" }],
    choices: [
      {
        text: "불을 켜고 지킨다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "wis",
          dc: 15,
          success: {
            text: "불이 켜졌다. 수평선 아래의 것이 고개를 들었고, 당신은 렌즈를 돌려 그것의 눈을 정면으로 비췄다. 그것은 빛을 싫어했다. 배들은 그 밤 무사히 들어왔다. 당신은 벽에 눈금을 하나 새겼다.",
            effects: [{ kind: "end", ending: "lighthouse_keeper" }],
          },
          failure: {
            text: "불은 켜졌고 그것은 왔다. 당신은 계단을 굴러 내려가 문을 잠갔다. 안에서. 아침에 마을 사람들이 빗장을 부수고 당신을 끌어냈다. 등대는 다시 꺼져 있었다.",
            effects: [
              { kind: "hp", delta: -3 },
              { kind: "sanity", delta: -7 },
            ],
          },
        },
      },
      {
        text: "빛을 기다리던 것과 맞선다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "harpy",
          win: {
            text: "그것은 등불실 창을 부수고 들어왔다. 나갈 때는 부서진 채로 나갔다. 당신은 유리를 갈아 끼우고 심지에 불을 붙였다. 남는 사람이 등대지기다.",
            effects: [{ kind: "end", ending: "lighthouse_keeper" }],
          },
          flee: {
            text: "등불실을 버리고 내려왔다. 등 뒤에서 렌즈 깨지는 소리가 났다. 마을은 당신에게 아무것도 묻지 않았다. 그것이 답이었다.",
            effects: [
              { kind: "hp", delta: -5 },
              { kind: "sanity", delta: -5 },
            ],
          },
        },
      },
      {
        text: "불을 켜지 않고 내려간다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "등대지기의 결정을 존중하기로 했다. 문을 닫고 빗장을 안에서 걸었다. 창문으로 나왔다. 촌장에게는 등대가 멀쩡하다고 말했다. 거짓말은 아니었다.",
            effects: [{ kind: "sanity", delta: -3 }],
          },
        },
      },
    ],
  },
];
