---
name: narrative-score-synthesis
description: "G01~G27 서사 전문 검토 결과를 공식 점수와 supplemental score로 종합할 때 사용한다. 전문 메모의 게이트 레코드·지문·findings를 검증하고, 같은 근본 원인의 finding을 병합하고, 정확히 18개 공식 점수 키와 4개 supplemental 키를 만들고, `formalExportReady`와 G28 게이트 레코드를 남긴다. 게이트 전문 리뷰 자체는 `narrative-gate-specialist`가, G28 결과의 등급·출시 준비도 판정은 `narrative-final-verdict`가, 최종 보고서 조립은 `narrative-report-assembly`가 한다. 점수를 지어내거나 충돌 점수를 평균내는 데는 사용하지 않는다."
---

## 목적

G01~G27 전문 메모를 하나의 점수 집합으로 종합해, 어떤 게이트가 어떤 근거로 어떤 점수를 받았는지와 병합된 finding·충돌·미해결 항목을 `RUN_DIR` 안의 G28 산출물 하나로 고정한다. 등급을 매기지 않고, 유효한지 여부(`formalExportReady`)와 다음 단계가 쓸 점수만 남긴다.

## 사용 시점

- G01~G27 전문 메모가 모두 작성된 뒤 공식 점수 집합이 필요할 때.
- 같은 근본 원인의 finding을 게이트 간에 병합하고 severity를 확정할 때.
- 메모의 지문·스키마가 현재 소스와 일치하는지 검증할 때.

## 사용하지 말아야 할 때

- 게이트 하나를 전문 리뷰할 때는 `narrative-gate-specialist`를 사용한다.
- G28 결과에 등급과 출시 준비도를 매길 때는 `narrative-final-verdict`를 사용한다.
- 최종 30개 게이트 보고서를 조립할 때는 `narrative-report-assembly`를 사용한다.
- 채택 엔딩 세트 자체를 검토할 때는 `narrative-multi-ending-integration`을, 경로 하나를 검토할 때는 `narrative-ending-route-review`를 사용한다.

## 공통 계약

`RUN_DIR`(=`.outline/<RUN_ID>/`) 안의 산출물만 읽고 쓴다. 외부 프로젝트 경로는 읽지 않는다. 제공된 전문 근거를 보존한다. 죽음, 배신, 전투 결과, 시스템, 통화, 플레이 시간, 확률, 비밀 신원 또는 제공된 범위를 벗어난 사실을 만들지 않는다. 입력이 없거나 형식이 잘못되었거나 오래되었거나 충돌하면 `input-blocked`로 처리하고 기억으로 추론하지 않는다. 포맷터, 린터, 테스트, 빌드, 커밋 또는 게시 명령을 실행하지 않는다.

## 격리된 작업 디렉터리

- 호출자가 제공한 인라인 입력으로 고유한 `RUN_ID`를 정하고 `.outline/<RUN_ID>/.claim`을 배타 생성으로 선점한다. 실패하면 다른 실행이 그 `RUN_ID`를 잡은 것이므로 `input-blocked`로 처리하고 파일을 만들지 않는다. 선점에 성공하면 그 디렉터리를 `RUN_DIR`로 사용한다. 관대한 생성(`exist_ok=True`, `mkdir -p`)은 선점이 아니다. `.claim`에는 `runId`·생성 시각·`sourceVersion`을 적는다. 남은 `.claim`은 실행 중단의 흔적이며, 사람이 그 RUN의 `manifest.json`과 `outputs/`를 확인해 완료된 실행인지 판정한 뒤에만 지운다 — 그것이 유일한 해제 수단이다.
- `RUN_ID`는 `[A-Za-z0-9_-]+` 형식만 허용한다.
- 인라인 입력을 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest에는 `runId`, 입력·중간 산출물·출력별 `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 기록한다.
- 모든 `relativePath`를 정규화하고 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 실제 스냅샷 해시가 manifest의 `sha256`과 일치해야 한다.

## 입력

- G01~G27 전문 메모의 인라인 내용.
- 현재 소스·아티팩트 지문과 최종 검토 스키마의 인라인 내용(스키마 정본: `.omp/skills/_baseline/review-score-schema.md`).

G01~G27 전문 메모 중 하나라도 없거나, 최종 검토 스키마 또는 현재 지문이 없으면 `input-blocked`로 처리하고 파일을 작성하지 않는다. 누락된 게이트를 추측으로 채우지 않는다.

## 점수 계약

- 공식 점수는 정확히 18개 키를 만든다. 키 이름·primary owner gate·표시 순서는 `.omp/skills/_baseline/review-score-schema.md`를 따른다.
- supplemental scores는 네 키를 별도로 만든다. 키 이름과 값 형식은 `.omp/skills/_baseline/review-score-schema.md`를 따른다.
- primary owner map의 정본도 같은 스키마 파일이다. 여기서 다시 열거하지 않는다.

## G28 게이트 레코드

G28 레코드는 `Gate`, `Status`, `Reason`, `Score`, `Reviewed commit`, `Reviewed artifact SHA-256`, `Scope`, `Evidence`, `Findings`, `Required revisions`, `Limitations`를 정확히 포함한다. `Status`는 `PASS|FAIL|UNVERIFIABLE`, `Score`는 정수 `0-100` 또는 `null`이다. 각 finding은 `id`, `severity`, `status`, `file`, `location`, `problem`, `why`, `playerImpact`, `fix`를 포함한다.

## 절차

1. 실행 디렉터리를 만들고 인라인 입력을 manifest와 스냅샷으로 기록한다. 완료 조건: 모든 manifest 항목의 `relativePath`가 `RUN_DIR` 하위이고 스냅샷 해시가 `sha256`과 일치한다.
2. 모든 메모가 `Gate`, `Status`, `Reason`, `Score`, 지문, `Scope`, `Evidence`, `Findings`, `Required revisions`, `Limitations`를 갖는지 검증한다. 각 finding은 `id`, `severity`, `status`, `file`, `location`, `problem`, `why`, `playerImpact`, `fix`를 갖는다. 완료 조건: 27개 게이트 각각에 대해 필수 필드 존재 여부가 판정되고, 누락이 있으면 그 게이트 이름이 보고서에 열거된다.
3. 현재 지문과 메모 지문이 일치하는지 확인한다. 완료 조건: 게이트별 지문 일치·불일치 판정이 있고, 불일치 게이트는 `input-blocked` 목록에 들어간다.
4. `gate + affected location + normalized causal defect`로 같은 근본 원인을 병합하고, 가장 높은 severity와 독립 근거를 보존한다. 완료 조건: 병합된 finding마다 병합에 포함된 게이트 목록과 보존한 severity가 적힌다.
5. 충돌하는 점수는 평균내지 않는다. 근거로 판정하거나 `input-blocked`로 표시한다. 완료 조건: 모든 충돌 쌍이 `판정` 또는 `input-blocked` 중 하나로 처리되고, 평균낸 값이 없다.
6. 정확히 18개의 공식 점수 키를 만들고 supplemental scores를 별도로 만든다. 완료 조건: 공식 키 18개와 supplemental 키 4개가 각각 세어져 보고서에 적히고, 근거가 없는 키는 `null`이다.
7. `RUN_DIR/outputs/synthesis/G28.md`에 결과를 작성한다. 완료 조건: 출력 파일 하나에 입력 지문, 공식 점수, supplemental scores, 병합 finding, 충돌, 제한 사항, `formalExportReady`, G28 게이트 레코드가 들어 있다.

## 출력 계약

- 경로: `RUN_DIR/outputs/synthesis/G28.md` 한 파일. 정규화 후 `RUN_DIR` 하위여야 하고 심볼릭 링크를 거부한다.
- 필수 내용: 입력 지문, 공식 점수 18개 키, supplemental scores 4개 키, 병합 finding, 충돌 처리, `formalExportReady`, `Limitations`, G28 게이트 레코드.
- `Status`는 `PASS|FAIL|UNVERIFIABLE`만, `Score`는 정수 `0-100` 또는 `null`만 쓴다. enum 밖 값을 쓰지 않는다.
- 호출자 반환: `RUN_DIR` 경로와 `formalExportReady`. `input-blocked`면 파일 없이 부족한 메모·필드를 나열한다.

## 실패 처리

- **input-blocked:** 전문 메모가 누락되었거나, 필수 필드가 없거나, 지문이 현재 소스와 불일치하거나, `RUN_ID`가 이미 존재하거나, `relativePath`·스냅샷 해시 검증에 실패한 경우. 파일을 작성하지 않고 부족한 입력을 나열한다.
- **score-conflict:** 두 메모가 같은 키에 다른 점수를 주는 경우. 평균을 쓰지 않는다. 근거로 판정하면 `Limitations`에 충돌과 판정 근거를 남기고, 판정할 근거가 없으면 `input-blocked`로 중단한다.
- **missing-official-key:** 18개 키 중 근거가 없는 키가 있는 경우. 그 키를 `null`로 두고 `Limitations`에 이유를 남긴다. 점수를 지어내지 않는다.
- **stale-artifact:** 메모 지문이 현재 컴파일 콘텐츠 지문과 다른 경우. `input-blocked`로 중단하고 불일치한 게이트를 나열한다.
- **path-escape:** 정규화 후 출력 경로가 `RUN_DIR`을 벗어나는 경우. 파일을 작성하지 않고 거부한다.
- **invented-score:** 근거 없는 점수·게이트 판정을 만든 경우. 해당 값을 `null`로 되돌리고 `Limitations`에 남긴다.

## 금지

- 전문·종합 메모, 원장, 기존 리뷰 파일 수정.
- 충돌 점수의 평균내기.
- 18개 공식 키·4개 supplemental 키 외의 점수 키 만들기.
- 게이트가 내리지 않은 등급·출시 준비도 판정을 대신 내리는 것.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령 실행.
