---
title: "사용자 자유 서술의 원장 반영 규약 — 사실 분류 선행과 충돌의 세계 설정 흡수"
date: 2026-09-13
category: conventions
module: prototype
problem_type: convention
component: remains.json
severity: medium
applies_when:
  - "사용자의 자유 서술(엔딩 방향·설정 제안)을 prototype/remains.json에 반영할 때"
  - "사용자 표기와 원장·원고의 고유명사가 갈릴 때"
  - "반영할 문장이 사실·추론·가설·모순 중 어디로 분류할지 판단이 서지 않을 때"
  - "원장에 새 필드를 만들어 공개 정보와 비밀 정보를 나눌 때"
symptoms:
  - "사용자 발언을 근거 구분 없이 원장에 그대로 기록해 가설이 사실처럼 보임"
  - "이름 충돌을 오기/개명 이진으로만 판단해 세계 내 해법을 놓침"
  - "비밀 설정이 공개 필드에 섞여 정보 공개 범위가 무너짐"
  - "작성 순서 같은 공정 결정이 원장에 섞여 SSOT가 오염됨"
tags:
  - ssot
  - ledger
  - remains-json
  - fact-classification
  - conflict-resolution
  - narrative-convention
---

# 사용자 자유 서술의 원장 반영 규약 — 사실 분류 선행과 충돌의 세계 설정 흡수

## Context

이 프로젝트의 정본(SSOT)은 `prototype/remains.json`(테마·설정 원장)이고, 현재 원고는 `prototype/stories/example.md`다. 창작 변경은 `.omp/skills`의 라우터(novel-workflow)·발산(divergent-ideator)·원장(remains-ledger-maintenance) 스킬로 수행한다.

이번 세션에서 사용자가 두 인물(강두식, 루)의 진엔딩을 자유 서술로 제시했다. 이름 충돌도 하나 있었다. 사용자는 '배태식'이라고 썼지만 원장은 '배태산'이다.

에이전트는 사용자 발언을 원장에 곧바로 반영하지 않았다. 먼저 `[FACT]`·`[INFERENCE]`·`[HYPOTHESIS]`·`[CONFLICT]` 네 범주로 분류했다. 충돌은 세 번째 해법으로 흡수해 사용자 승인을 받았다. 분류와 승인이 끝난 뒤에만 원장 스킬로 반영했다.

## Guidance

- 사용자 발언을 원장에 반영하기 전에 반드시 네 범주로 분류한다. `[FACT]`=원장·원고 근거 있음, `[INFERENCE]`=기존 근거에서 추론, `[HYPOTHESIS]`=근거 없음, `[CONFLICT]`=기존 규칙과 충돌.
- `[FACT]`만 확정 사실로 취급한다. 분류마다 근거 경로(파일:줄 또는 JSON 키)를 함께 적는다. 기억으로 경로를 만들지 않는다(원장 스킬 절차 2).
- `[HYPOTHESIS]`는 사용자 승인을 받은 뒤 비밀 필드로만 기록한다. 근거 부재는 기각 사유가 아니라 "게임 시작 시점에 공개되지 않는 비밀"의 재료다.
- `[CONFLICT]`를 만나면 두 가지 이진 해법(오기 치우기, 개명 반영하기)에 머물지 말고 세 번째 해법, 즉 세계 내 규칙으로 흡수하는 방법을 먼저 검토한다. 그리고 사용자 승인을 받는다.
- 규칙을 깨는 제안은 규칙을 지우는 대신 기존 채널로 우회한다. 대화 등장 금지 규칙이면 공문 같은 문서 채널로 폭로한다.
- 공개 정보와 비밀 정보는 서로 다른 필드에 유지한다(원장 스킬 절차 3). 비밀 필드는 원장의 기존 명명(secret*, hidden*) 계열을 따른다.
- 공정 결정(작성 순서, 리뷰 순서, 분기 시점)은 원장에 쓰지 않는다. 런 계획 메모 `.outline/<RUN_ID>/outputs/workflow/`에만 기록한다. 원장은 세계·설정 사실만 담는다.
- 반영 후에는 실제 키 경로로 기록 위치를 확인한다. 근거 인용은 키 기준으로 하고 줄 번호는 보조로 쓴다. 줄 번호는 파일이 자라면 흘러간다.

## Why This Matters

원장이 SSOT이므로 분류 없이 반영하면 추론이 사실처럼 굳는다. 이후 continuity-auditor 같은 검수가 잘못된 정본을 근거로 판정한다.

공개와 비밀이 섞이면 정보층이 무너진다. secretSummoning·secretReunion·secretOriginWorld는 모두 "게임 시작 시점에 공개되지 않는" 비밀이다(remains.json:18, 75, 115).

근거 부재는 창작 공간이다. 연표에 도래 원인이 기록되지 않았기 때문에(remains.json:118-143) "협회가 소환 주체"를 `[HYPOTHESIS]`로 유지하며 흑막 설정을 살릴 수 있었다.

충돌을 흡수하면 사용자 의도와 정본이 동시에 살아남는다. 이진으로 강제로 끊으면 한쪽이 사라진다.

원장에 공정 결정이 섞이면 세계 사실과 진행 절차가 뒤섞인다. 다음에 원장을 읽는 에이전트가 작성 순서를 세계 규칙으로 오독한다.

## When to Apply

- 사용자가 진엔딩·설정·인물 관계를 자유 서술로 제시할 때.
- 사용자 표기와 원장·원고의 고유명사가 어긋날 때.
- remains-ledger-maintenance로 반영하기 직전, 모드와 대상·근거를 확정하는 단계.
- 여러 인물·장면의 작성 순서 같은 공정 결정을 내릴 때.

## Examples

### 1) 이름 충돌 흡수 — 배태식/배태산

- 충돌: 사용자 표기 '배태식' vs 원장 `characters.taesan.name` "배태산"(prototype/remains.json:104, 원고 prototype/stories/example.md:62).
- 이진 선택지: 오기로 치우기 / 개명으로 반영하기.
- 채택한 세 번째 해법: 세계 내 호칭 설정으로 흡수. `characters.taesan.misnaming` = "사장은 그의 이름을 자꾸 잊어 종종 '배태식'이라고 부른다"(prototype/remains.json:107).
- 사용자 승인을 받았다. 결과: 본명 원문이 보존되고, 사용자 표기도 세계 안에서 참이 된다.

### 2) 진엔딩 반영 — 강두식과 루

분류 단계:

- 부당 청구 = `[FACT]`: `characters.dusik.financialStatus`(prototype/remains.json:52), `characters.dusik.heroHistory.associationDebt`(prototype/remains.json:57).
- 히어로 재등록 가능 = `[INFERENCE]`: `association.heroRegistrationAuthority`(prototype/remains.json:22)와 `registrationRule`(prototype/remains.json:23)에서 추론.
- 협회=도래 소환 주체 = `[HYPOTHESIS]`: chronology(prototype/remains.json:118-143)에 도래 원인 미기록.
- 대면 폭로 = `[CONFLICT]`: `association.dialogueRule` "대화하는 인물로 등장하지 않는다"(prototype/remains.json:20) 위반.
- 재통합·본래의 힘 회복·군단 소환 = `[HYPOTHESIS]`: 반영 시점까지 근거 없음.
- 원래 세계 = `[INFERENCE]`: chronology 첫 항목 "첫 도래 때 루가 건너왔다"(prototype/remains.json:119-121).

충돌 해소:

- 사용자 결정으로 dialogueRule을 유지했다. 폭로 채널을 문서로 바꿨다. `association.appearanceChannels` ["공문", "청구서", "방송"](prototype/remains.json:19)이 기존 채널의 근거다.

반영 결과(모두 실제 키):

- `narrativeRules.trueEnding`(prototype/remains.json:150-155) — 진엔딩 토폴로지와 exclusivity(인물 진엔딩의 동시 성립 금지).
- `characters.dusik.trueEnding`(prototype/remains.json:60) — 협회 흑막 폭로 후 배상금 누명 해소와 히어로 복귀.
- `characters.ru.trueEnding`(prototype/remains.json:96) — 루·시퍼 재통합 후 원래 세계에서 군단 소환.
- `association.secretSummoning`(prototype/remains.json:18) — 비밀 필드.
- `characters.ru.separation.secretReunion`(prototype/remains.json:75) — 비밀 필드.
- `monsterRemnants.secretOriginWorld`(prototype/remains.json:115) — 비밀 필드.
- `characters.taesan.misnaming`(prototype/remains.json:107) — 공개 호칭 설정.

반영하지 않은 것:

- 두식·루 먼저 작성, 선형 작성 후 사람 리뷰, 리뷰 후 분기 확장 같은 공정 결정은 원장에 넣지 않고 `.outline/2026-09-13-narrative-structure/outputs/workflow/ideation.md`와 `selection-record.md`에만 기록했다.

## Related

- `AGENTS.md` — 프로토타입 원장 섹션(원장의 권위·공개/비밀 필드 규칙).
- `.omp/skills/remains-ledger-maintenance/SKILL.md` — 원장 반영 절차와 실패 처리.
- `.outline/2026-09-13-narrative-structure/outputs/workflow/selection-record.md` — 이 규약이 적용된 실제 반영 기록.
- `docs/ideation/character-true-endings-20.md` — 발산 후보(확정 아님; 존재하지 않는 구 경로 인용 주의).
