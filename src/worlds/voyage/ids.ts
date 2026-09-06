// Fixed id catalog of 정적의 항로. Rules never hard-code a crew id: the medic is found by role.
// The trailing comment on each id is its Korean display name.

export const CREW_IDS = [
  "first_officer", // 부함장
  "medic", // 의무관
  "engineer", // 기관장
  "navigator", // 항법사
  "comms", // 통신사
  "biologist", // 생물학자
  "security", // 보안관
  "cook", // 조리사
] as const;
export type CrewId = (typeof CREW_IDS)[number];

export const CREW_ROLES = [
  "부함장",
  "의무관",
  "기관장",
  "항법사",
  "통신사",
  "생물학자",
  "보안관",
  "조리사",
] as const;
export type CrewRole = (typeof CREW_ROLES)[number];

/** The role whose absence (sick or dead) makes test results unreliable. */
export const MEDIC_ROLE: CrewRole = "의무관";

export const SYMPTOM_IDS = [
  "fever", // 발열
  "cough", // 기침
  "tremor", // 손떨림
  "insomnia", // 불면
  "rash", // 발진
  "nosebleed", // 코피
] as const;
export type SymptomId = (typeof SYMPTOM_IDS)[number];

export const ENDING_IDS = [
  "captain_dead", // 빈 함교
  "mutiny", // 반란
  "outbreak", // 정적
  "arrival", // 도착
] as const;
export type EndingId = (typeof ENDING_IDS)[number];

/** Content defines many events, messages, and confrontations, so their ids stay open. */
export type EventId = string;
export type MessageId = string;
export type ConfrontationId = string;

/** Drawn when no observe event qualifies. Content must define it with weight 0. */
export const FALLBACK_EVENT_ID = "fallback_quiet_watch"; // 조용한 당직
