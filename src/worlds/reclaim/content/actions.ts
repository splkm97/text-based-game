// One card per ActionId: the button line, the refusal reason shown when a guard fails,
// and the one-line run record written on success. All strings are plain literals —
// the editor locates cards by the literal `id`. Deny/result never carry numbers;
// the UI renders quantities from state.

import type { ActionId } from "../ids";
import type { ActionText } from "../types";

export const ACTIONS_TEXT: Readonly<Record<ActionId, ActionText>> = {
  call_respond: {
    id: "call_respond",
    label: "두식과 함께 긴급 피해 조사에 나간다",
    deny: "출동이 끝난 뒤라 다시 응답할 호출이 없다",
    result: "두식이 자기 압류 통지서를 꺼냈다. 협회 공문은 여전히 매일 아침 온다.",
  },

  office_next: {
    id: "office_next",
    label: "사무실을 둘러본다",
    deny: "이미 자리를 살폈다 — 사람들이 각자 할 일을 하고 있다",
    result: "커피잔을 명단 위에서 치우고 자리에서 일어난다. 사무실이 한 걸음 멀어진다.",
  },
  talk_dusik: {
    id: "talk_dusik",
    label: "강두식에게 말을 건다",
    deny: "오늘은 이미 이야기를 나눴다 — 그는 다시 서류로 눈을 내린다",
    result: "강두식이 서류에서 눈을 떼고 이쪽을 본다.",
  },
  talk_ru: {
    id: "talk_ru",
    label: "루에게 말을 건다",
    deny: "오늘은 이미 이야기를 나눴다 — 그녀는 지도 모서리만 만지고 있다",
    result: "루가 반쯤 접힌 지도를 내려놓고 고개를 든다.",
  },
  talk_banjang: {
    id: "talk_banjang",
    label: "최 반장에게 말을 건다",
    deny: "오늘은 이미 이야기를 나눴다 — 그는 명부를 다시 펼친다",
    result: "최 반장이 명부를 덮고 자세를 고쳐 앉는다.",
  },
  talk_taesan: {
    id: "talk_taesan",
    label: "배태산에게 말을 건다",
    deny: "오늘은 이미 이야기를 나눴다 — 그는 커피만 젓고 있다",
    result: "배태산이 커피를 내려놓고 의자를 이쪽으로 돌린다.",
  },
  interview_reply_work: {
    id: "interview_reply_work",
    label: "일을 묻는다",
    deny: "대답은 이미 들었다 — 같은 질문을 두 번 하지는 않는다",
    result: "일 얘기로 물었더니, 돌아오는 말도 일 얘기다.",
  },
  interview_reply_comfort: {
    id: "interview_reply_comfort",
    label: "사정을 묻는다",
    deny: "대답은 이미 들었다 — 사정은 한 번만 묻는 것이 예의다",
    result: "사정을 묻자, 잠깐의 침묵 뒤에 대답이 온다.",
  },
  interview_reply_joke: {
    id: "interview_reply_joke",
    label: "농담으로 넘긴다",
    deny: "대답은 이미 들었다 — 농담은 한 번이어야 농담이다",
    result: "농담이 사무실 공기에 잠깐 얹혔다가, 원래 밀도로 돌아간다.",
  },
  interview_close: {
    id: "interview_close",
    label: "면담을 마친다",
    deny: "아직 대답을 듣지 않았다 — 이야기는 끝나지 않았다",
    result: "의자를 물리고 일어선다. 사무실 소리가 원래 크기로 돌아온다.",
  },

  office_printer: {
    id: "office_printer",
    label: "프린터에서 공문을 뽑는다",
    deny: "이미 당겨 낸 공문이 책상 위에 놓여 있다",
    result: "프린터가 남은 절반을 밀어 냈다. 오늘의 공문이 책상 위에서 한 장이 되었다.",
  },

  dispatch_send_taesan: {
    id: "dispatch_send_taesan",
    label: "지방 파견에 배태산을 보낸다",
    deny: "파견 명단이 확정된 뒤라 배태산을 다시 보낼 수 없다",
    result: "배태산이 지방으로 갔다. 다음 날 아침 사무실에 그가 없다.",
  },
  dispatch_send_other: {
    id: "dispatch_send_other",
    label: "지방 파견에 다른 사람을 보낸다",
    deny: "파견 인원이 이미 정해져 다른 사람을 넣을 수 없다",
    result: "다른 사람이 지방으로 갔다. 배태산은 사무실에 남는다.",
  },

  obs_send_ru_alone: {
    id: "obs_send_ru_alone",
    label: "루가 파편의 문양을 읽게 한다",
    deny: "루가 이번 현장의 동행이 아니다 — 문양을 읽을 눈이 잔해 밖에 서 있다",
    result: "루가 파편의 문양과 구조를 읽었다. 나는 특이사항 없음을 썼다.",
  },
  obs_boss_joins: {
    id: "obs_boss_joins",
    label: "파편을 내가 먼저 기록한다",
    deny: "루가 동행에 있다 — 파편의 첫 기록은 루의 몫이다",
    result: "내가 파편을 먼저 기록했다. 루는 아무것도 읽지 못했다.",
  },
  obs_send_other: {
    id: "obs_send_other",
    label: "루 없이 다른 사람에게 파편을 넘긴다",
    deny: "루가 함께 왔다 — 다른 사람에게 넘길 파편이 아니다",
    result: "돌아온 보고서에 특이사항이 없다.",
  },

  briefing_ack: {
    id: "briefing_ack",
    label: "공문을 접어 챙긴다",
    deny: "접을 공문이 아직 책상에 오르지 않았다",
    result: "공문을 세로로 접어 안주머니에 넣었다. 마감 줄은 접혀도 그대로였다.",
  },

  party_pick_dusik: {
    id: "party_pick_dusik",
    label: "강두식을 동행으로 세운다",
    deny: "두식이 이미 배차표에 있거나, 빈 칸이 없거나, 부상으로 이번 일감까지 결장이다",
    result: "두식이 배차표에 이름을 올렸다. 그는 헬멧을 먼저 들어 뒀다.",
  },
  party_pick_ru: {
    id: "party_pick_ru",
    label: "루를 동행으로 세운다",
    deny: "루가 이미 배차표에 있거나, 빈 칸이 없거나, 부상으로 이번 일감까지 결장이다",
    result: "루가 배차표에 이름을 올렸다. 도면을 접는 손이 먼저 움직였다.",
  },
  party_pick_banjang: {
    id: "party_pick_banjang",
    label: "최 반장을 동행으로 세운다",
    deny: "최 반장이 이미 배차표에 있거나, 빈 칸이 없거나, 부상으로 이번 일감까지 결장이다",
    result: "최 반장이 배차표에 이름을 올렸다. 명부 봉투는 이미 챙겨 둔 뒤였다.",
  },
  party_pick_taesan: {
    id: "party_pick_taesan",
    label: "배태산을 동행으로 세운다",
    deny: "배태산이 이미 배차표에 있거나, 빈 칸이 없거나, 부상으로 이번 일감까지 결장이다",
    result: "배태산이 배차표에 이름을 올렸다. 로비의 아는 얼굴부터 줄을 세워 뒀다.",
  },
  party_reset: {
    id: "party_reset",
    label: "동행을 모두 지운다",
    deny: "비울 이름이 배차표에 없다",
    result: "올려 둔 이름을 모두 지웠다. 배차표의 빈 칸이 다시 열렸다.",
  },
  party_go: {
    id: "party_go",
    label: "선택한 인원과 현장으로 나선다",
    deny: "배차표가 비어 있다 — 아무도 정하지 않은 채로는 현장에 나서지 않는다",
    result: "정해진 이름과 함께 출동 대장에 서명했다. 현장으로 나섰다.",
  },

  cleanup_pick_sign: {
    id: "cleanup_pick_sign",
    label: "통제선을 세우고 표지를 건다",
    deny: "이미 표지와 통제선이 서 있다 — 같은 줄을 두 번 세우지는 않는다",
    result: "통제선을 세우고 표지를 걸었다. 지나가던 사람들이 선 밖에서 멈춘다.",
  },
  cleanup_pick_power: {
    id: "cleanup_pick_power",
    label: "전원과 가스관을 끊는다",
    deny: "차단은 이미 끝났다 — 손댈 배선과 관이 남아 있지 않다",
    result: "전원과 가스관을 끊었다. 잔해 쪽에서 돌던 소리 하나가 멎었다.",
  },
  cleanup_pick_search: {
    id: "cleanup_pick_search",
    label: "잔해 안쪽을 확인한다",
    deny: "안쪽은 이미 확인했다 — 같은 자리를 두 번 뒤지지 않는다",
    result:
      "잔해 안쪽을 확인했다. 안쪽에서는 대답이 나오지 않았고, 나는 그 자리를 보고용지의 빈칸에 적었다.",
  },
  cleanup_pick_photo: {
    id: "cleanup_pick_photo",
    label: "위치와 수치를 적는다",
    deny: "기록은 이미 남겼다 — 같은 자리를 두 번 찍지 않는다",
    result: "위치를 적고 사진을 남겼다. 마감이 지나면 이 기록이 청구를 받친다.",
  },
  cleanup_finish: {
    id: "cleanup_finish",
    label: "뒷정리를 마치고 현장으로 들어선다",
    deny: "지침의 작업이 남아 있다 — 네 작업을 모두 마쳐야 현장에 선다",
    result:
      "뒷정리를 마치고 현장 안쪽으로 들어선다. 손에 남은 것은 지침서 사본과, 아직 아무것도 적히지 않은 보고용지다.",
  },

  radio_morning_on: {
    id: "radio_morning_on",
    label: "라디오를 켠 채 아침을 시작한다",
    deny: "아침이 지나면 라디오는 다시 켜지 않는다",
    result: "라디오에서 협회 발표가 흘러나왔다.",
  },
  radio_business_only: {
    id: "radio_business_only",
    label: "라디오를 업무 방송만 틀어 둔다",
    deny: "그 아침이 지나면 방송을 되돌릴 수 없다",
    result: "좌표 발표는 흘려보냈다. 루는 아무것도 적지 않았다.",
  },

  archive_with_dusik: {
    id: "archive_with_dusik",
    label: "두식이 문서 사본을 손에 넣는다",
    deny: "두식이 이번 방문의 동행이 아니다 — 서가에서 사본을 찾을 손이 없다",
    result: "두식이 문서 사본을 손에 넣었다. 방송이 말한 예측 시스템에 대한 대목은 없었다.",
  },
  archive_with_ru: {
    id: "archive_with_ru",
    label: "루가 목록 밖의 물건을 찾아낸다",
    deny: "루가 이번 방문의 동행이 아니다 — 목록 밖을 읽는 눈이 없다",
    result: "루가 목록 밖의 물건 앞에서 걸음을 멈췄다.",
  },
  archive_with_taesan: {
    id: "archive_with_taesan",
    label: "배태산이 핵심 문서를 빼돌린다",
    deny: "배태산이 이번 방문의 동행이 아니다 — 빼돌릴 손이 서가에 없다",
    result: "배태산이 핵심 문서를 빼돌렸다.",
  },
  archive_alone: {
    id: "archive_alone",
    label: "최 반장이 별도 보고를 남긴다",
    deny: "최 반장이 이번 방문의 동행이 아니다 — 별도 보고를 쓸 사람이 없다",
    result: "최 반장의 별도 보고가 회사 기록과 어긋났다.",
  },
  archive_leave: {
    id: "archive_leave",
    label: "본부를 나선다",
    deny: "한 번도 들어가지 않은 상태로 나갈 수는 없다",
    result: "남은 사본 더미를 두고 나왔다. 시간이 없었다.",
  },

  xcheck_compare: {
    id: "xcheck_compare",
    label: "좌표와 실험 기록을 대조한다",
    deny: "방송 좌표와 문서가 모두 있어야 대조가 선다",
    result: "두 좌표가 같은 지점이었다. 예측이 아니라 소환이었다.",
  },
  xcheck_skip: {
    id: "xcheck_skip",
    label: "대조 없이 넘어간다",
    deny: "이미 대조가 끝난 뒤라 다시 건너뛸 것이 없다",
    result: "대조를 건너뛰었다.",
  },

  gate_dispatch: {
    id: "gate_dispatch",
    label: "루를 최종 정리에 파견한다",
    deny: "루가 시퍼의 존재를 모른다 — 그는 손을 들지 않는다",
    result: "루가 먼저 손을 들었다. 나는 이유를 물었지만 답을 듣지 못했다.",
  },
  gate_hold: {
    id: "gate_hold",
    label: "루 대신 다른 인원을 배치한다",
    deny: "이 배치는 루가 단서를 쥔 회차에서만 가능하다",
    result: "평소처럼 다른 이름을 썼다. 등 뒤에서 인기척이 났다.",
  },
  gate_reopen: {
    id: "gate_reopen",
    label: "관측소 건을 다시 연다",
    deny: "다시 열 기회가 남아 있지 않다",
    result: "관측소 건을 다시 열었다.",
  },
  gate_to_venue: {
    id: "gate_to_venue",
    label: "루를 거치지 않고 다음 단계로 넘어간다",
    deny: "단서를 쥔 회차다 — 루 체인이 먼저 열린다",
    result: "루는 아무것도 알아채지 못했다. 다음 수신자를 정하러 갔다.",
  },

  site_hold: {
    id: "site_hold",
    label: "정리를 보류하고 최 반장과 들어간다",
    deny: "현장이 진행 중이 아니어서 함께 들어갈 수 없다",
    result: "루가 잔당에 손을 댔다. 나는 그 몸짓을 안전 위반으로 기록했다.",
  },
  site_process: {
    id: "site_process",
    label: "지침대로 처리 요청을 올린다",
    deny: "처리 요청을 받을 현장이 열려 있지 않다",
    result: "처리 요청이 올라갔다. 잔당 1건이 그날로 닫혔다.",
  },
  site_with_taesan: {
    id: "site_with_taesan",
    label: "배태산이 함께 들어간다",
    deny: "이 현장에 배태산이 들어갈 때가 아니다",
    result: "배태산이 판정을 넘겨받아 처리 요청을 올렸다. 잔당 1건이 그날로 닫혔다.",
  },

  night_use: {
    id: "night_use",
    label: "루가 물건을 삼킨다",
    deny: "쓸 물건이 없다 — 재통합은 열리지 않는다",
    result: "루가 물건을 삼켰다. 도시가 다시 전장으로 변해 갔다.",
  },
  night_not_use: {
    id: "night_not_use",
    label: "루가 물건을 쓰지 않는다",
    deny: "아직 그 밤이 아니어서 물건을 거두지 못한다",
    result: "재통합은 열리지 않았다. 잔당은 처리되고 도시는 남는다.",
  },
  night_no_item: {
    id: "night_no_item",
    label: "물건 없이 현장을 닫는다",
    deny: "물건이 회사 보관함에 있다",
    result: "접점만 남았다. 재통합은 열리지 않았다.",
  },

  venue_military: {
    id: "venue_military",
    label: "군부대에 알린다",
    deny: "군은 독립 검증을 요구한다 — 방송·문서·좌표가 모두 맞아야 하고 접점이 막히지 않아야 한다",
    result: "군의 협조 창구를 잡았다. 이제 누구와 현장에 갈지만 남았다.",
  },
  venue_association: {
    id: "venue_association",
    label: "협회에 먼저 알린다",
    deny: "문서 없이는 협회에 알릴 근거가 서지 않는다",
    result: "협회가 먼저 움직였다. 유예 뒤에 두식이 처리되었다.",
  },
  venue_government: {
    id: "venue_government",
    label: "관청에 알린다",
    deny: "넘길 서면이 없으면 관청은 접수하지 않는다",
    result: "관청이 서류를 회수해 갔다. 증거는 남지 않았다.",
  },
  venue_press: {
    id: "venue_press",
    label: "언론에 알린다",
    deny: "기사가 될 서면이 없어 언론은 움직이지 않는다",
    result: "청구는 취소되었다. 다만 재등록은 복원되지 않았다.",
  },
  venue_silence: {
    id: "venue_silence",
    label: "아무에게도 알리지 않는다",
    deny: "침묵은 결정이 끝난 뒤에는 고를 수 없다",
    result: "아무에게도 알리지 않았다. 유예 뒤에 두식이 처리되었다.",
  },
  venue_no_stage: {
    id: "venue_no_stage",
    label: "알릴 것이 없어 사건을 닫는다",
    deny: "손에 쥔 문서가 있다 — 아직 수신자를 고를 수 있다",
    result: "문서를 확보하지 못했다. 다음 날 아침 같은 공문이 다시 왔다.",
  },

  gun_with_taesan: {
    id: "gun_with_taesan",
    label: "배태산과 현장에 간다",
    deny: "군 접점이 열려 있지 않아 배태산과 갈 수 없다",
    result: "배태산의 인맥이 지휘관과의 접점을 열었다. 다만 그가 우리 경로를 알게 되었다.",
  },
  gun_with_banjang: {
    id: "gun_with_banjang",
    label: "최 반장과 현장에 간다",
    deny: "이 접점에 최 반장을 데려갈 자리가 없다",
    result: "인맥이 없어 접점이 열리지 않았다. 군 창구는 다시 열리지 않는다.",
  },

  submit_original: {
    id: "submit_original",
    label: "원본 대조를 요구한다",
    deny: "제출처가 닫혀 원본을 요구할 수 없다",
    result: "군 등록번호가 붙었다. 협회가 지울 수 없는 형태가 되었다.",
  },
  submit_copy: {
    id: "submit_copy",
    label: "사본 제출로 만족한다",
    deny: "사본을 받을 접수 창구가 열려 있지 않다",
    result: "사본으로 접수되었다.",
  },
};
