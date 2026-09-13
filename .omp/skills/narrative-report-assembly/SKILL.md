---
name: narrative-report-assembly
description: "전문 메모와 종합 메모에서 최종 30개 게이트 서사 보고서를 조립할 때 사용한다. G01~G27 전문 메모와 G28·G29 종합 메모의 지문을 검증하고, 같은 근본 원인의 finding을 병합하고, 정확한 13개 섹션 순서와 18개 공식 점수 키, G01~G30 게이트 커버리지, G30 게이트 레코드를 갖춘 `RUN_DIR/outputs/synthesis/G30.md`를 만든다. 점수 집합 생성은 `narrative-score-synthesis`가, 등급과 출시 준비도 판정은 `narrative-final-verdict`가 한다. 메모를 고치거나 없는 근거를 채우는 데는 사용하지 않는다."
---

## 목적

검증된 게이트 메모를 사람이 읽는 최종 서사 보고서 하나로 조립한다. 새 점수나 새 판정을 만들지 않고, 섹션 순서·키 개수·게이트 커버리지를 계약으로 고정해 `export-blocked`과 정상 산출을 명확히 가른다.

## 사용 시점

- G01~G27 전문 메모와 G28·G29 종합 메모가 모두 준비된 뒤 최종 보고서가 필요할 때.
- 게이트 커버리지와 공식 점수 키가 계약대로인지 마지막으로 확인할 때.
- finding을 근본 원인 단위로 중복 제거해 하나의 수정 목록으로 만들 때.

## 사용하지 말아야 할 때

- 점수 집합을 만들 때는 `narrative-score-synthesis`를 사용한다.
- 등급·출시 준비도를 판정할 때는 `narrative-final-verdict`를 사용한다.
- 게이트 하나를 전문 리뷰할 때는 `narrative-gate-specialist`를 사용한다.
- 전문·종합 메모 자체를 수정해야 할 때는 이 스킬을 쓰지 않는다. 이 스킬은 메모를 읽기만 한다.

## 공통 계약

`RUN_DIR`(=`.outline/<RUN_ID>/`) 안의 산출물만 읽고 쓴다. 외부 프로젝트 경로는 읽지 않는다. 제공된 전문·종합 근거를 보존한다. 죽음, 배신, 전투 결과, 시스템, 통화, 플레이 시간, 확률, 비밀 신원 또는 제공된 범위를 벗어난 사실을 만들지 않는다. 입력이 없거나 오래되었거나 형식이 잘못되었거나 충돌하면 `export-blocked`로 처리하고 기억으로 추론하지 않는다. 포맷터, 린터, 테스트, 빌드, 커밋 또는 게시 명령을 실행하지 않는다.

## 격리된 작업 디렉터리

- 호출자가 제공한 인라인 입력으로 고유한 `RUN_ID`를 정하고, 존재하지 않는 `.outline/<RUN_ID>/`를 먼저 만든다. 생성한 `.outline/<RUN_ID>/`를 `RUN_DIR`로 사용한다. 이미 존재하면 `export-blocked`로 처리한다.
- `RUN_ID`는 `[A-Za-z0-9_-]+` 형식만 허용한다.
- 인라인 입력을 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest에는 `runId`, 입력·중간 산출물·출력별 `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 기록한다.
- 모든 `relativePath`를 정규화하고 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 실제 스냅샷 해시가 manifest의 `sha256`과 일치해야 한다.

## 입력

- G01~G27 전문 메모, G28·G29 종합 메모, 최종 검토 스키마, 소스 지문의 인라인 내용.

G01~G27, G28, G29 메모 중 하나라도 없거나 최종 검토 스키마가 없으면 `export-blocked`로 처리하고 파일을 작성하지 않는다. 누락된 게이트를 추측으로 채우지 않는다.

## 필수 섹션 순서

1. `### Executive Verdict`
2. `### Scorecard`
3. `### Critical Problems`
4. `### World & Professional Fantasy Analysis`
5. `### Character & World Independence Analysis`
6. `### Replayability Analysis`
7. `### True Ending Analysis`
8. `### Choice Tree Analysis`
9. `### Player Experience Simulation`
10. `### Strongest Elements`
11. `### Required Revisions`
12. `### Gate Coverage`
13. `### FINAL VERDICT`

## 점수 및 G30 계약

- `Scorecard`는 최종 검토 스키마에 정의된 공식 점수 키를 정확히 18개 사용한다. supplemental scores는 별도 섹션으로 유지한다.
- G30 레코드는 `Gate`, `Status`, `Reason`, `Score`, `Reviewed commit`, `Reviewed artifact SHA-256`, `Scope`, `Evidence`, `Findings`, `Required revisions`, `Limitations`를 정확히 포함한다. `Status`는 `PASS|FAIL|UNVERIFIABLE`, `Score`는 정수 `0-100` 또는 `null`이다. 각 finding은 `id`, `severity`, `status`, `file`, `line`, `problem`, `why`, `playerImpact`, `fix`를 포함한다.

## 절차

1. 실행 디렉터리를 만들고 인라인 입력을 manifest와 스냅샷으로 기록한다. 완료 조건: 모든 manifest 항목의 `relativePath`가 `RUN_DIR` 하위이고 스냅샷 해시가 `sha256`과 일치한다.
2. 모든 입력 지문이 현재 소스 지문과 일치하는지 검증한다. 완료 조건: 입력별 일치·불일치 판정이 있고, 불일치 입력이 `export-blocked` 목록에 들어간다.
3. `gate + normalized root cause + affected location`으로 finding을 중복 제거하고 독립 근거를 보존한다. 완료 조건: 병합된 finding마다 포함된 게이트 목록과 보존한 severity가 적힌다.
4. 점수·verdict·게이트 상태에 영향을 주는 충돌이 있으면 `export-blocked`로 중단한다. 완료 조건: 판정에 영향을 주는 충돌이 전부 열거되고, 영향이 없는 결함은 `Limitations`로 분류된다.
5. 정확히 30개 게이트 ID, 공식 점수 키, 채택 엔딩 종결, replay A-G, 한 회차 다중 엔딩 근거, 별도 supplemental scores를 확인한다. 완료 조건: 게이트 ID 30개와 공식 점수 키 18개가 각각 세어져 보고서에 적힌다.
6. 전문 메모나 종합 메모를 수정하지 않는다. 완료 조건: `RUN_DIR/inputs/`의 스냅샷 해시가 작성 전후로 동일하다.
7. G30 게이트 레코드와 최종 보고서를 `RUN_DIR/outputs/synthesis/G30.md`에 작성한다. 완료 조건: 출력 파일 하나에 13개 섹션이 순서대로, G30 게이트 레코드, 지문, 제한 사항이 들어 있다.

## 출력 계약

- 경로: `RUN_DIR/outputs/synthesis/G30.md` 한 파일. 정규화 후 `RUN_DIR` 하위여야 하고 심볼릭 링크를 거부한다.
- 필수 내용: 위 13개 섹션이 순서대로, `Scorecard` 공식 키 18개, supplemental scores 별도 섹션, G01~G30 게이트 커버리지, G30 게이트 레코드, 지문, `Limitations`.
- `Status`는 `PASS|FAIL|UNVERIFIABLE`, `Score`는 정수 `0-100` 또는 `null`만 쓴다. enum 밖 값을 쓰지 않는다.
- 호출자 반환: `RUN_DIR` 경로와 G30 `Status`. `export-blocked`면 파일 없이 부족하거나 충돌하는 입력을 나열한다.

## 실패 처리

- **export-blocked:** 메모나 스키마가 누락되었거나, 형식이 잘못되었거나, 지문이 현재 소스와 불일치하거나, `RUN_ID`가 이미 존재하거나, `relativePath`·스냅샷 해시 검증에 실패한 경우. 파일을 작성하지 않고 부족한 입력을 나열한다.
- **schema-mismatch:** 13개 섹션 순서, 30개 게이트 ID, 18개 공식 점수 키가 계약과 다른 경우. 키를 새로 만들지 않고 `export-blocked`로 중단하며 어긋난 항목을 나열한다.
- **unresolved-conflict:** 점수·verdict·게이트 상태에 영향을 주는 충돌이 남은 경우. 충돌을 평균내거나 임의로 고르지 않고 `export-blocked`로 중단한다.
- **non-blocking-defect:** finding 필드 일부가 비어 있거나 표현이 다른 경우처럼 조립 판정을 바꾸지 않는 결함. 없는 근거를 채우지 않고 `Limitations`에 남긴 뒤 조립을 계속한다.
- **memo-mutation:** 전문·종합 메모를 수정해야만 보고서를 만들 수 있는 경우. 수정하지 않고 `export-blocked`로 중단한다.
- **path-escape:** 정규화 후 출력 경로가 `RUN_DIR`을 벗어나는 경우. 파일을 작성하지 않고 거부한다.

## 금지

- G01~G29 메모, 원장, 기존 리뷰 파일 수정.
- 없는 근거나 새 점수 키를 만들어 빈칸을 채우는 것.
- 13개 섹션 순서를 바꾸거나 섹션을 합치는 것.
- 점수·verdict·게이트 상태에 영향을 주는 충돌을 평균이나 임의 선택으로 덮는 것.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령 실행.
