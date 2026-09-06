// Twelve transmissions from Earth. `earthDay` is when each one left; the lag rule decides arrival.
// Earth is wrong once (cough) and corrects itself later; it names the stress symptoms as harmless
// only after the crew has lived with them for weeks.

import type { Message } from "../types";

export const MESSAGES: readonly Message[] = [
  {
    id: "msg_01_first_case",
    earthDay: 1,
    title: "발열 확인",
    text: "관제에서 알린다. 출항 검역을 통과한 화물 구획에서 병원체가 검출됐다. 첫 증상은 발열이다. 승무원 체온을 매일 기록하라.",
    reveals: { confirms: ["fever"] },
  },
  {
    id: "msg_02_rash",
    earthDay: 2,
    title: "발진 보고",
    text: "발열 이틀 뒤 목과 팔에 발진이 돋는다. 두 증상이 겹치면 감염으로 본다. 검사 키트는 아끼지 말라. 재보급은 없다.",
    reveals: { confirms: ["rash"] },
  },
  {
    id: "msg_03_cough_alert",
    earthDay: 3,
    title: "기침 주의",
    text: "지상 격리 병동 보고를 전달한다. 환자 다수가 기침을 보인다. 기침도 감염 징후로 간주하라. 의심자는 즉시 분리한다.",
    reveals: { confirms: ["cough"] },
  },
  {
    id: "msg_04_protocol",
    earthDay: 4,
    title: "격리 절차",
    text: "격리 구획은 3번 화물칸을 쓴다. 격리자에게 하루 두 번 식사와 통신을 보장하라. 이 문장은 권고가 아니라 지시다.",
    reveals: {},
  },
  {
    id: "msg_05_nosebleed",
    earthDay: 6,
    title: "코피 확인",
    text: "발병 후기에 코피가 잦다. 이 단계의 환자는 나흘 안에 손을 써야 한다. 약품은 발병자에게만 쓰라. 예방 효과는 없다.",
    reveals: { confirms: ["nosebleed"] },
  },
  {
    id: "msg_06_cough_retracted",
    earthDay: 8,
    title: "기침 정정",
    text: "정정한다. 기침은 병동 공조 문제였다. 감염과 무관하다. 기침만으로 격리한 인원이 있다면 해제하라. 혼선에 사과한다.",
    reveals: { retracts: ["cough"] },
  },
  {
    id: "msg_07_delay_notice",
    earthDay: 10,
    title: "지연 안내",
    text: "이 통신은 사흘 늦게 닿는다. 다음 것은 더 늦을 것이다. 우리가 보내는 답은 늘 당신이 이미 내린 결정 뒤에 도착한다. 그것을 감안하라.",
    reveals: {},
  },
  {
    id: "msg_08_families",
    earthDay: 13,
    title: "가족 통신",
    text: "승무원 가족의 음성 파일을 첨부한다. 공개 여부는 선장 재량이다. 지상에서는 이미 열흘 전 소식이다. 배에서는 오늘이다.",
    reveals: {},
  },
  {
    id: "msg_09_stress_note",
    earthDay: 15,
    title: "손떨림과 불면",
    text: "밀폐 항해 스트레스 보고를 검토했다. 손떨림과 불면은 감염 증상이 아니다. 격리 근거로 삼지 말라. 그 둘은 당신의 문제이지 병원체의 문제가 아니다.",
    reveals: { retracts: ["tremor", "insomnia"] },
  },
  {
    id: "msg_10_treatment",
    earthDay: 18,
    title: "치료 지침",
    text: "확정 증상은 발열, 발진, 코피다. 다른 것은 없다. 남은 약품으로 발병자를 치료하라. 완치는 보장하지 않지만 시간을 벌어 준다.",
    reveals: { confirms: ["fever", "rash", "nosebleed"] },
  },
  {
    id: "msg_11_last_window",
    earthDay: 21,
    title: "마지막 교신 창",
    text: "감속 구간에 들어가면 지향 안테나가 지구를 놓친다. 이 뒤로 한 통쯤 더 닿을 것이다. 무엇을 하든 그것은 이미 당신의 몫이다.",
    reveals: {},
  },
  {
    id: "msg_12_farewell",
    earthDay: 24,
    title: "도착 전 통신",
    text: "이 문장이 닿을 때 배는 궤도 진입 중일 것이다. 살아남은 인원 수를 보고하라. 우리는 그 숫자를 엿새 뒤에 읽는다. 항해를 마치라.",
    reveals: {},
  },
];
