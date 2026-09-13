// Fixed id catalog of 복구 기록. Rules never hard-code an id: flow and guards live in rules/.
// The trailing comment on each id is its Korean display name.

export const STAGE_IDS = [
  "field", // 첫 출동
  "office", // 지방 파견
  "obs", // 천체관측소
  "radio", // 아침 라디오
  "archive", // 협회 본부
  "xcheck", // 교차 대조
  "gate", // 루의 관문
  "site", // 최종 폐허
  "night", // 심야 재통합
  "venue", // 수신자 선택
  "gun", // 군 접점
  "submit", // 제출
] as const;
export type StageId = (typeof STAGE_IDS)[number];

export const ACTION_IDS = [
  "call_respond", // 호출에 응답

  "dispatch_send_taesan", // 태산 파견
  "dispatch_send_other", // 다른 인원 파견

  "obs_send_ru_alone", // 루를 혼자 보냄
  "obs_boss_joins", // 반장이 동행
  "obs_send_other", // 다른 인원을 보냄

  "radio_morning_on", // 아침 방송 켜기
  "radio_business_only", // 업무 방송만

  "archive_with_dusik", // 두식과 대조
  "archive_with_ru", // 루와 대조
  "archive_with_taesan", // 태산과 대조
  "archive_alone", // 혼자 대조
  "archive_leave", // 자리를 뜸

  "xcheck_compare", // 기록 대조
  "xcheck_skip", // 대조 생략

  "gate_dispatch", // 출동 허가
  "gate_hold", // 관문 저지
  "gate_reopen", // 관문 재개방
  "gate_to_venue", // 대회장으로

  "site_hold", // 정리 보류
  "site_process", // 정리 강행
  "site_with_taesan", // 태산과 정리

  "night_use", // 재통합 실행
  "night_not_use", // 재통합 보류
  "night_no_item", // 유물 없는 밤

  "venue_military", // 군에 넘김
  "venue_association", // 협회에 넘김
  "venue_government", // 관청에 넘김
  "venue_press", // 언론에 넘김
  "venue_silence", // 침묵
  "venue_no_stage", // 무대 없음

  "gun_with_taesan", // 태산과 접점
  "gun_with_banjang", // 반장과 접점

  "submit_original", // 원본 제출
  "submit_copy", // 사본 제출
] as const;
export type ActionId = (typeof ACTION_IDS)[number];

export const ENDING_IDS = [
  "true_ru", // 진실·루
  "true_dusik", // 진실·두식
  "death", // 죽음
  "gov", // 정부 인멸
  "press", // 언론
  "taesan", // 태산의 이탈
  "general", // 재통합 미성립
  "routine", // 일상 복귀
] as const;
export type EndingId = (typeof ENDING_IDS)[number];

export const CHARACTER_IDS = [
  "dusik", // 두식
  "ru", // 루
  "banjang", // 최 반장
  "taesan", // 배태산
] as const;
export type CharacterId = (typeof CHARACTER_IDS)[number];

export const EVIDENCE_IDS = [
  "broadcast", // 방송 녹음
  "documents", // 문서
  "coord", // 좌표
  "clue", // 단서
  "relic", // 유물
  "banjangSeed", // 반장의 씨앗
] as const;
export type EvidenceId = (typeof EVIDENCE_IDS)[number];
