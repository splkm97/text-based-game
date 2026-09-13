// 이관 계약 — 현 12단계가 일감 구조의 어디로 가는가(설계 §7).
//
// 재편 후 회차는 일감 목록(JOB_IDS)을 선형으로 한 번씩 지나고, 일감마다
// office → briefing → party → site 순서를 탄다. 조건이 서면 체인 절차가
// 일감 사이에 끼어든다. 이 표는 그 대응의 단일 출처다: 규칙·콘텐츠·테스트가
// 모두 여기를 보고, 단계 하나가 빠지면 STAGE_IDS에 대한 total Record가 컴파일을 막는다.

import type { ChainStepId, JobId, JobStepId, StageId } from "../ids";

export type StagePlacement =
  | { readonly kind: "job"; readonly job: JobId; readonly step: JobStepId }
  | { readonly kind: "chain"; readonly chain: ChainStepId };

/** 마이그레이션 대응: field(관악구 첫 출동)는 첫 일감의 현장, office·radio는 다음 일감의 사무실이다. */
export const STAGE_PLACEMENT: Readonly<Record<StageId, StagePlacement>> = {
  field: { kind: "job", job: "gwanak", step: "site" },
  office: { kind: "job", job: "observatory", step: "office" },
  obs: { kind: "job", job: "observatory", step: "site" },
  radio: { kind: "job", job: "hq", step: "office" },
  archive: { kind: "job", job: "hq", step: "site" },
  xcheck: { kind: "chain", chain: "xcheck" },
  gate: { kind: "chain", chain: "gate" },
  site: { kind: "job", job: "ruins", step: "site" },
  night: { kind: "chain", chain: "night" },
  venue: { kind: "chain", chain: "venue" },
  gun: { kind: "chain", chain: "gun" },
  submit: { kind: "chain", chain: "submit" },
};
