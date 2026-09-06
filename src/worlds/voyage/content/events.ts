// Observe-phase events: 3 day-ranged, 4 gated on a named crew member's state, 8 general,
// plus the weight-0 fallback. Every event keeps at least one ungated choice.

import type { ObserveEvent } from "../types";

const DAY_EVENTS: readonly ObserveEvent[] = [
  {
    id: "ev_day_first_silence",
    title: "첫 정적",
    text: "우리가 보낸 마지막 보고에 지구는 아직 답하지 않았다. 통신실 앞에 승무원이 둘 서 있다. 무슨 말이라도 듣고 싶은 얼굴이다.",
    weight: 8,
    once: true,
    requires: [{ kind: "day", from: 1, to: 3 }],
    choices: [
      {
        text: "지연은 정상이라고 사실대로 말한다.",
        requires: [],
        outcome: {
          text: "숫자를 적어 보여 준다. 둘은 고개를 끄덕이고 흩어진다. 안심한 얼굴은 아니다.",
          effects: [
            { kind: "trust", delta: 3 },
            { kind: "stress", target: "all", delta: 3 },
          ],
        },
      },
      {
        text: "통신사에게 재전송을 맡긴다.",
        requires: [],
        outcome: {
          text: "임세준이 안테나 각도를 다시 잡는다. 결과는 같지만 누군가 일하고 있다는 사실이 복도를 조용하게 만든다.",
          effects: [
            { kind: "stress", target: "comms", delta: 6 },
            { kind: "stress", target: "all", delta: -2 },
          ],
        },
      },
    ],
  },
  {
    id: "ev_day_midpoint",
    title: "중간점",
    text: "항로의 절반을 지난다. 항법사가 그 사실을 함내 방송으로 알리려 한다. 축하할 일인지 당신은 확신하지 못한다.",
    weight: 8,
    once: true,
    requires: [{ kind: "day", from: 14, to: 17 }],
    choices: [
      {
        text: "기념 식사를 허가한다.",
        requires: [],
        outcome: {
          text: "조리실이 저장 식량 하나를 푼다. 한 시간 동안 아무도 체온 얘기를 하지 않는다.",
          effects: [
            { kind: "stress", target: "all", delta: -8 },
            { kind: "trust", delta: 2 },
          ],
        },
      },
      {
        text: "방송을 막고 점검을 계속한다.",
        requires: [],
        outcome: {
          text: "강나래가 마이크를 내려놓는다. 점검 중에 기관장이 미개봉 검사 키트 한 상자를 찾아낸다.",
          effects: [
            { kind: "kits", delta: 1 },
            { kind: "stress", target: "all", delta: 4 },
          ],
        },
      },
    ],
  },
  {
    id: "ev_day_final_approach",
    title: "감속 개시",
    text: "주엔진이 역추진으로 돌아선다. 갑판이 며칠 만에 무게를 되찾는다. 격리 구획에서 벽을 두드리는 소리가 들린다.",
    weight: 8,
    once: true,
    requires: [{ kind: "day", from: 26, to: 30 }],
    choices: [
      {
        text: "전원 감속 자세를 지시한다.",
        requires: [],
        outcome: {
          text: "복도가 절차대로 움직인다. 끝이 보인다는 사실이 처음으로 명령보다 힘이 세다.",
          effects: [
            { kind: "trust", delta: 5 },
            { kind: "stress", target: "all", delta: -4 },
          ],
        },
      },
      {
        text: "남은 물자를 다시 센다.",
        requires: [],
        outcome: {
          text: "감속 하중에 눌려 있던 예비 상자가 열린다. 키트 하나, 약품 하나. 늦었지만 없는 것보다 낫다.",
          effects: [
            { kind: "kits", delta: 1 },
            { kind: "meds", delta: 1 },
          ],
        },
      },
    ],
  },
];

const ROLE_EVENTS: readonly ObserveEvent[] = [
  {
    id: "ev_role_medic_down",
    title: "의무실 무인",
    text: "의무관 문지호가 제 침상에 누워 있다. 의무실 문에는 손글씨로 '들어오지 말 것'이라고 붙어 있다. 검사 키트는 그 안에 있다.",
    weight: 10,
    once: true,
    requires: [{ kind: "crew", crew: "medic", status: "sick" }],
    choices: [
      {
        text: "생물학자에게 의무실을 맡긴다.",
        requires: [],
        outcome: {
          text: "오하린이 장갑을 끼며 매뉴얼을 넘긴다. 손이 빠르다. 얼굴은 그렇지 않다.",
          effects: [
            { kind: "stress", target: "biologist", delta: 12 },
            { kind: "meds", delta: 1 },
          ],
        },
      },
      {
        text: "당신이 직접 간호한다.",
        requires: [],
        outcome: {
          text: "밤새 물수건을 갈아 준다. 문지호가 눈을 뜨고 검사 절차를 한 줄씩 불러 준다. 당신은 잠을 잃는다.",
          effects: [
            { kind: "hp", delta: -1 },
            { kind: "stress", target: "medic", delta: -15 },
          ],
        },
      },
    ],
  },
  {
    id: "ev_role_engineer_quarantined",
    title: "기관실 경보",
    text: "냉각 순환기 경보가 울린다. 기관장 백도윤은 격리 구획에 있다. 인터컴 너머로 그가 무엇을 만지지 말라고 소리친다.",
    weight: 10,
    once: true,
    requires: [{ kind: "crew", crew: "engineer", status: "quarantined" }],
    choices: [
      {
        text: "인터컴으로 원격 지시를 받는다.",
        requires: [],
        outcome: {
          text: "밸브 번호를 하나씩 불러 준다. 경보가 꺼진다. 백도윤은 벽 너머에서 두 시간을 서서 보냈다.",
          effects: [
            { kind: "stress", target: "engineer", delta: 10 },
            { kind: "trust", delta: 3 },
          ],
        },
      },
      {
        text: "부함장에게 수동 정비를 맡긴다.",
        requires: [],
        outcome: {
          text: "한서율이 매뉴얼을 펼쳐 놓고 순환기를 뜯는다. 고쳐지긴 한다. 손에 화상이 하나 남는다.",
          effects: [{ kind: "stress", target: "first_officer", delta: 12 }],
        },
      },
    ],
  },
  {
    id: "ev_role_security_dead",
    title: "빈 무장고",
    text: "보안관 차민혁이 죽은 뒤 무장고 열쇠는 당신 주머니에 있다. 복도에서 누군가 그 사실을 소리 내어 말한다.",
    weight: 10,
    once: true,
    requires: [{ kind: "crew", crew: "security", status: "dead" }],
    choices: [
      {
        text: "무장고를 용접해 봉인한다.",
        requires: [],
        outcome: {
          text: "불꽃이 튀는 동안 아무도 말을 걸지 않는다. 이제 이 배에 무기는 없다. 당신 말고는.",
          effects: [
            { kind: "authority", delta: 1 },
            { kind: "trust", delta: -5 },
          ],
        },
      },
      {
        text: "열쇠를 부함장에게 넘긴다.",
        requires: [],
        outcome: {
          text: "한서율이 열쇠를 받아 목에 건다. 복도의 목소리가 조금 낮아진다. 당신의 것도 조금 작아진다.",
          effects: [
            { kind: "trust", delta: 4 },
            { kind: "stress", target: "first_officer", delta: 6 },
          ],
        },
      },
    ],
  },
  {
    id: "ev_role_cook_sick",
    title: "식당의 빈자리",
    text: "조리사 유보라가 발열로 쓰러진다. 식당 조리대는 그대로다. 저녁 배식 시간까지 세 시간이 남았다.",
    weight: 10,
    once: true,
    requires: [{ kind: "crew", crew: "cook", status: "sick" }],
    choices: [
      {
        text: "비상 배급식으로 전환한다.",
        requires: [],
        outcome: {
          text: "포장을 뜯는 소리만 난다. 아무도 불평하지 않는다. 불평하지 않는 것이 더 나쁘다.",
          effects: [{ kind: "stress", target: "all", delta: 5 }],
        },
      },
      {
        text: "당신이 조리대에 선다.",
        requires: [],
        outcome: {
          text: "국은 짜고 밥은 질다. 그래도 선장이 앞치마를 두른 광경이 하루치 이야깃거리가 된다.",
          effects: [
            { kind: "hp", delta: -1 },
            { kind: "stress", target: "all", delta: -3 },
            { kind: "trust", delta: 3 },
          ],
        },
      },
    ],
  },
];

const GENERAL_EVENTS: readonly ObserveEvent[] = [
  {
    id: "ev_general_rumor",
    title: "소문",
    text: "누가 감염됐는지 승무원들끼리 명단을 돌린다. 명단에는 당신 이름도 있다.",
    weight: 10,
    once: false,
    requires: [],
    choices: [
      {
        text: "확인된 사실만 함내 방송으로 알린다.",
        requires: [],
        outcome: {
          text: "숫자는 소문보다 작다. 방송이 끝나자 명단은 쓰레기통에 있다.",
          effects: [{ kind: "trust", delta: 4 }],
        },
      },
      {
        text: "함구령을 내린다.",
        requires: [],
        outcome: {
          text: "말은 멈추지 않는다. 낮아질 뿐이다.",
          effects: [
            { kind: "trust", delta: -5 },
            { kind: "stress", target: "all", delta: -3 },
          ],
        },
      },
      {
        text: "내버려 둔다.",
        requires: [],
        outcome: {
          text: "명단은 하루 만에 두 장이 된다.",
          effects: [{ kind: "stress", target: "all", delta: 5 }],
        },
      },
    ],
  },
  {
    id: "ev_general_kit_cache",
    title: "예비 검사 키트",
    text: "기관장이 배관 뒤에서 봉인된 상자를 찾아낸다. 라벨은 없다. 검사 키트 모양이다.",
    weight: 6,
    once: true,
    requires: [],
    choices: [
      {
        text: "그대로 수령한다.",
        requires: [],
        outcome: {
          text: "봉인을 뜯는다. 키트 하나는 멀쩡하고 하나는 시약이 말라 있다.",
          effects: [{ kind: "kits", delta: 1 }],
        },
      },
      {
        text: "생물학자에게 검수를 맡긴다.",
        requires: [{ kind: "trust", min: 60 }],
        outcome: {
          text: "오하린이 시약을 다시 채운다. 둘 다 쓸 만하다. 당신이 물었을 때 그는 거절하지 않았다.",
          effects: [{ kind: "kits", delta: 2 }],
        },
      },
    ],
  },
  {
    id: "ev_general_sleepless_deck",
    title: "불면의 갑판",
    text: "새벽 세 시. 거주 갑판 조명이 절반 켜져 있고 침상 셋이 비어 있다. 아무도 잠들지 못한다.",
    weight: 8,
    once: false,
    requires: [],
    choices: [
      {
        text: "근무 교대를 재편한다.",
        requires: [],
        outcome: {
          text: "밤 근무를 둘씩 묶는다. 잠은 늘고 당신 말을 듣는 사람은 준다.",
          effects: [
            { kind: "stress", target: "all", delta: -6 },
            { kind: "trust", delta: -3 },
          ],
        },
      },
      {
        text: "그대로 둔다.",
        requires: [],
        outcome: {
          text: "조명은 아침까지 켜져 있다.",
          effects: [],
        },
      },
    ],
  },
  {
    id: "ev_general_med_locker",
    title: "약품 재고",
    text: "의무실 약품장 재고가 장부와 맞지 않는다. 남는 것이 있고 모자란 것이 있다.",
    weight: 6,
    once: true,
    requires: [],
    choices: [
      {
        text: "재분류해서 쓸 수 있는 것을 건진다.",
        requires: [],
        outcome: {
          text: "유효 기한이 지난 상자 뒤에서 한 통이 나온다.",
          effects: [{ kind: "meds", delta: 1 }],
        },
      },
      {
        text: "보안관에게 약품장을 잠그게 한다.",
        requires: [{ kind: "crew", crew: "security", status: "alive" }],
        outcome: {
          text: "차민혁이 자물쇠를 채운다. 사라지던 약이 멈춘다. 약을 가져가던 사람도 그것을 안다.",
          effects: [
            { kind: "meds", delta: 2 },
            { kind: "trust", delta: -3 },
          ],
        },
      },
    ],
  },
  {
    id: "ev_general_quarantine_petition",
    title: "격리 해제 청원",
    text: "격리 구획 문 아래로 종이가 밀려 나온다. 서명이 여럿이다. 밖에서도 몇 명이 그 종이를 보고 있다.",
    weight: 8,
    once: false,
    requires: [{ kind: "count", of: "quarantined", min: 1 }],
    choices: [
      {
        text: "거절한다.",
        requires: [],
        outcome: {
          text: "종이를 접어 주머니에 넣는다. 누구도 토를 달지 않는다. 오늘은.",
          effects: [
            { kind: "trust", delta: -6 },
            { kind: "authority", delta: 1 },
          ],
        },
      },
      {
        text: "내일 검사를 약속한다.",
        requires: [],
        outcome: {
          text: "문 너머에서 대답은 없다. 밖에 있던 사람들은 흩어진다.",
          effects: [
            { kind: "trust", delta: 3 },
            { kind: "stress", target: "all", delta: 2 },
          ],
        },
      },
    ],
  },
  {
    id: "ev_general_earth_broadcast",
    title: "지구 방송 잔향",
    text: "통신사가 민간 방송 잔향을 잡아낸다. 지상의 확진자 수가 흘러나온다. 한 자리가 아니다.",
    weight: 6,
    once: false,
    requires: [],
    choices: [
      {
        text: "전 승무원에게 공개한다.",
        requires: [],
        outcome: {
          text: "숫자를 들은 사람들은 고향 얘기를 멈춘다. 대신 당신을 본다.",
          effects: [
            { kind: "trust", delta: 5 },
            { kind: "stress", target: "all", delta: 4 },
          ],
        },
      },
      {
        text: "요약본만 게시한다.",
        requires: [],
        outcome: {
          text: "숫자는 뺀다. 임세준은 당신이 뺀 것을 안다.",
          effects: [
            { kind: "trust", delta: -2 },
            { kind: "stress", target: "comms", delta: 5 },
          ],
        },
      },
    ],
  },
  {
    id: "ev_general_captain_fatigue",
    title: "선장의 피로",
    text: "함교 의자에서 눈을 뜬다. 언제 감았는지 모른다. 손이 떨린다. 당신 것이다.",
    weight: 6,
    once: false,
    requires: [],
    choices: [
      {
        text: "두 시간 눕는다.",
        requires: [],
        outcome: {
          text: "깨어나니 함교에 부함장이 서 있다. 그동안 별일 없었다고 한다.",
          effects: [
            { kind: "hp", delta: 2 },
            { kind: "ap", delta: -1 },
          ],
        },
      },
      {
        text: "버틴다.",
        requires: [],
        outcome: {
          text: "커피는 진작 떨어졌다. 순찰을 돈다. 승무원들이 당신을 본다는 것이 도움이 된다. 당신에게는 아니다.",
          effects: [
            { kind: "hp", delta: -1 },
            { kind: "stress", target: "all", delta: -2 },
          ],
        },
      },
    ],
  },
  {
    id: "ev_general_memorial",
    title: "추모",
    text: "화물칸에 봉인된 관이 있다. 누군가 그 앞에 마른 꽃을 접어 두었다. 일정에는 추모 시간이 없다.",
    weight: 8,
    once: false,
    requires: [{ kind: "count", of: "dead", min: 1 }],
    choices: [
      {
        text: "십 분간 묵념을 지시한다.",
        requires: [],
        outcome: {
          text: "엔진 소리만 남는다. 끝나고 몇 명이 당신 어깨를 스치고 지나간다.",
          effects: [
            { kind: "stress", target: "all", delta: -6 },
            { kind: "trust", delta: 4 },
          ],
        },
      },
      {
        text: "일정대로 진행한다.",
        requires: [],
        outcome: {
          text: "꽃은 저녁까지 그 자리에 있다. 다음 날 아침에는 둘이 된다.",
          effects: [
            { kind: "stress", target: "all", delta: 5 },
            { kind: "authority", delta: 1 },
          ],
        },
      },
    ],
  },
];

const FALLBACK_EVENT: ObserveEvent = {
  id: "fallback_quiet_watch",
  title: "조용한 당직",
  text: "보고할 것이 없는 아침. 계기판은 초록이고 복도는 비어 있다. 이런 날이 가장 길다.",
  weight: 0,
  once: false,
  requires: [],
  choices: [
    {
      text: "항해 일지를 쓴다.",
      requires: [],
      outcome: { text: "날짜와 생존자 수를 적는다. 그 아래는 비워 둔다.", effects: [] },
    },
    {
      text: "갑판을 한 바퀴 돈다.",
      requires: [],
      outcome: {
        text: "마주치는 사람마다 짧게 인사한다. 그것으로 충분한 날도 있다.",
        effects: [{ kind: "stress", target: "all", delta: -2 }],
      },
    },
  ],
};

export const EVENTS: readonly ObserveEvent[] = [
  ...DAY_EVENTS,
  ...ROLE_EVENTS,
  ...GENERAL_EVENTS,
  FALLBACK_EVENT,
];
