# 미션은 인터뷰가 아니라 레포 증거로 확립했고, ZPD 기준선은 "계약을 이미 만든 사람"이다

사용자는 요청에서 두 결과를 명시했다 — 현재 스킬들에 대한 학습자료, 그리고 분기 시나리오 작성에 필요한 신규 스킬의 고안·추천. 그 밖의 미션 서술은 인터뷰가 아니라 저장소 증거에서 파생했다: `.omp/skills/`의 스킬 계약(기록 시점 16개; 같은 날 P0 착륙 뒤 18개), `_baseline/common-contract.md`와 이를 강제하는 `tools/skills/contract-drift.test.ts`, 27개 게이트 루브릭, 2개 에이전트 정의가 모두 이 레포에 있고 서로 정합한다.

이것이 근접발달영역을 결정한다. 학습자는 스킬의 존재나 계약 어휘를 배울 필요가 없고, **파이프라인의 빈 자리를 발견하고 계약에 맞는 새 스킬을 설계하는 수준**에서 시작해야 한다. 그래서 레슨 0001~0003을 "계약 실행 → 라우팅 → 장면 사양"으로 잡고, 후보 스킬 제안서는 학습자의 기존 설계 관례(판정 어휘 닫기, 사람 게이트, 단일 캐논 쓰기 주체)를 기준으로 우선순위를 매겼다.

- Evidence: 사용자 요청문 2항목, `.omp/skills/*/SKILL.md` 16개, `.omp/skills/_baseline/common-contract.md`, `.omp/narrative-gate-rubrics.md`, `.omp/NARRATIVE_REVIEW.md`, `.omp/agents/{narrative-rewriter,narrative-gate-specialist}.md`, `tools/skills/contract-drift.test.ts`.
- Implications: 0004~0006(정보 경계·엔딩 세트·검수 체인)은 0001~0003의 인출 답변을 받은 뒤에 집필한다. 사전 지식 수준은 자기 보고가 아니라 산출물 증거로 추정한 것이므로, 대화에서 반증되면 이 기록을 `Status: superseded`로 표시하고 기준선을 다시 잡는다.
