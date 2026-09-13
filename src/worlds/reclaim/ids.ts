// Fixed id catalog of 복구 기록. Rules never hard-code an id: flow and guards live in rules/.
// The trailing comment on each id is its Korean display name — the demo's own wording
// (prototype/route-combined-demo.html) is the anchor for each place's meaning, so keep
// them aligned. 화면 단계는 JobStepId | ChainStepId로 표현된다(2026-09-14 일감 재편).

export const ACTION_IDS = [
  "office_printer", // 프린터에서 공문을 뽑는다 (사무실 → 공문)
  "briefing_ack", // 공문을 접어 챙긴다 (공문 → 인원 선택)

  "party_pick_dusik", // 동행: 강두식
  "party_pick_ru", // 동행: 루
  "party_pick_banjang", // 동행: 최 반장
  "party_pick_taesan", // 동행: 배태산
  "party_reset", // 동행 선택을 비운다
  "party_go", // 선택한 인원과 현장으로 간다 (인원 선택 → 현장)

  "call_respond", // 긴급 피해 조사에 나간다 (강두식 동행)

  "dispatch_send_taesan", // 지방 파견에 배태산을 보낸다 (라디오 조건)
  "dispatch_send_other", // 지방 파견에 다른 사람을 보낸다

  "obs_send_ru_alone", // 관측소에 루를 단독으로 보낸다 (단서)
  "obs_boss_joins", // 사장이 관측소에 함께 간다 (상실 신호)
  "obs_send_other", // 관측소에 다른 직원을 보낸다 (상실 신호)

  "radio_morning_on", // 사무실 아침, 라디오를 켠 채 하루를 시작한다
  "radio_business_only", // 라디오를 업무로만 처리한다

  "archive_with_dusik", // 본부 1회차: 최 반장 + 강두식 → 문서 사본
  "archive_with_ru", // 본부 1회차: 최 반장 + 루 → 목록 밖의 물건
  "archive_with_taesan", // 본부 1회차: 최 반장 + 배태산 → 핵심 문서 유출 (상실 신호)
  "archive_alone", // 본부 1회차: 최 반장 혼자 → 최 반장 조사 재료
  "archive_leave", // 본부를 나선다

  "xcheck_compare", // 루의 좌표와 문서의 실험 기록을 대조한다
  "xcheck_skip", // 대조 없이 넘어간다

  "gate_dispatch", // 루를 최종 정리 사건에 파견한다
  "gate_hold", // 파견하지 않고 다른 인원을 배치한다 (사망)
  "gate_reopen", // 관측소 건을 다시 연다 (재등장)
  "gate_to_venue", // 단서 없이 다음 단계로 넘어간다

  "site_hold", // 관찰 유보 — 최 반장이 함께 들어간다
  "site_process", // 지침대로 처리 요청을 올린다 (시퍼 제거)
  "site_with_taesan", // 배태산이 함께 들어간다 (시퍼 제거)

  "night_use", // 루가 물건을 삼킨다 (재통합)
  "night_not_use", // 루가 물건을 쓰지 않는다 (일반)
  "night_no_item", // 물건 없이 현장을 닫는다 (일반)

  "venue_military", // 군부대에 알린다
  "venue_association", // 협회에 먼저 알린다 (사망)
  "venue_government", // 정부에 알린다 (증거 인멸)
  "venue_press", // 언론에 알린다 (청구 취소)
  "venue_silence", // 아무에게도 알리지 않는다 (사망)
  "venue_no_stage", // 알릴 것이 없다 — 회차를 닫는다 (일상)

  "gun_with_taesan", // 배태산과 현장에 간다 (접점 성립)
  "gun_with_banjang", // 최 반장과 현장에 간다 (군 경로 잠김)

  "submit_original", // 원본 대조를 요구한다
  "submit_copy", // 사본 제출로 만족한다
] as const;
export type ActionId = (typeof ACTION_IDS)[number];

export const ENDING_IDS = [
  "true_ru", // 진엔딩 · 루 — 루시퍼 복귀와 군단 소환
  "true_dusik", // 진엔딩 · 강두식 — 군 소속 히어로로 자격 회복
  "death", // 이탈 · 사망 엔딩 (미파견·협회 통보·침묵)
  "gov", // 이탈 · 일반 엔딩 (정부가 증거 인멸)
  "press", // 이탈 · 일반 엔딩 (언론, 청구 취소·재등록 불가)
  "general", // 이탈 · 일반 엔딩 (재통합 미성립)
  "routine", // 이탈 · 일상 엔딩 (무대 미개방, 회차 재시작)
] as const;
export type EndingId = (typeof ENDING_IDS)[number];

export const CHARACTER_IDS = [
  "dusik", // 강두식
  "ru", // 루
  "banjang", // 최 반장
  "taesan", // 배태산
] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

// ---------------------------------------------------------------------------
// 일감 구조 (2026-09-14 재편) — 장소는 선형 1회씩, 처리 순서는 모든 일감에 동일하다.
// ---------------------------------------------------------------------------

/** 일감 = 장소. 목록 순서가 곧 회차의 순서다(랜덤 인카운터가 아니다). */
export const JOB_IDS = [
  "gwanak", // 관악구 현장 — 첫 출동
  "observatory", // 천체관측소 잔해 — 회사 자체 업무
  "hq", // 협회 본부 문서고·보관고
  "ruins", // 최종 정리 폐허 — 잔당
] as const;
export type JobId = (typeof JOB_IDS)[number];

/** 일감 하나를 처리하는 순서. 모든 일감이 같은 순서를 탄다. */
export const JOB_STEP_IDS = [
  "office", // 사무실 — 뉴스·잡담·프린터 클릭
  "briefing", // 전체화면 공문
  "party", // 인원 선택 1~2명
  "site", // 현장 — 사건·이벤트
] as const;
export type JobStepId = (typeof JOB_STEP_IDS)[number];

/** 조건이 서면 일감 사이에 끼어드는 체인 절차(현 12단계의 나머지). */
export const CHAIN_STEP_IDS = [
  "xcheck", // 교차 대조 — 좌표와 실험 기록
  "gate", // 루 관문 — 파견/미파견/재등장
  "night", // 심야 재통합 (폐허 현장 뒤)
  "venue", // 수신자 선택
  "gun", // 군 접점
  "submit", // 제출
] as const;
export type ChainStepId = (typeof CHAIN_STEP_IDS)[number];
