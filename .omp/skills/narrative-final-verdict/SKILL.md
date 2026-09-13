---
name: narrative-final-verdict
description: "종합된 근거에 권위 있는 서사 등급과 출시 준비도 판정을 적용할 때 사용한다. G28 종합 메모를 검증한 뒤 `grade`, `releaseReadiness`, `replayValue`, `trueEnding`, `choiceQuality` 다섯 verdict 필드를 닫힌 enum으로 확정하고, 핵심 게이트 점수 상한과 미해결 Critical/Major 금지 규칙을 적용해 G29 게이트 레코드를 남긴다. G28 점수 집합을 만들 때는 `narrative-score-synthesis`를, 최종 30개 게이트 보고서 조립에는 `narrative-report-assembly`를 사용한다. 제품 전체 승인이나 투자 승인을 대신 결정하지 않는다."
---

## 목적

검증된 G28 근거 위에서만 등급과 출시 준비도를 확정한다. 새 점수를 만들지 않고, 핵심 게이트 점수 상한과 미해결 Critical/Major 금지 규칙을 그대로 적용해 서사 출시 준비도와 제품·투자 승인을 구분한 판정을 `RUN_DIR` 안의 G29 산출물로 돌려준다.

## 사용 시점

- G28 종합 메모가 검증되어 서사 등급과 출시 준비도 판정이 필요할 때.
- 미해결 Critical/Major 발견이 등급에 미치는 영향을 확정할 때.
- 재플레이 가치·진엔딩·선택 품질 verdict를 닫힌 enum으로 고정할 때.

## 사용하지 말아야 할 때

- G01~G27 메모에서 점수 집합을 만들 때는 `narrative-score-synthesis`를 사용한다.
- 최종 30개 게이트 보고서를 조립할 때는 `narrative-report-assembly`를 사용한다.
- 게이트 하나를 전문 리뷰할 때는 `narrative-gate-specialist`를 사용한다.
- 제품 전체 승인이나 투자 승인 자체를 결정할 때는 이 스킬을 쓰지 않는다. 이 스킬은 서사 준비도만 판정한다.

## 공통 계약

`RUN_DIR`(=`.outline/<RUN_ID>/`) 안의 산출물만 읽고 쓴다. 외부 프로젝트 경로는 읽지 않는다. 제공된 근거와 해결되지 않은 Critical/Major 발견을 보존한다. 죽음, 배신, 전투 결과, 시스템, 통화, 플레이 시간, 확률, 비밀 신원 또는 제공된 범위를 벗어난 사실을 만들지 않는다. 입력이 없거나 오래되었으면 `input-blocked`로 처리하고 기억으로 추론하지 않는다. 포맷터, 린터, 테스트, 빌드, 커밋 또는 게시 명령을 실행하지 않는다.

## 격리된 작업 디렉터리

- 호출자가 제공한 인라인 입력으로 고유한 `RUN_ID`를 정하고, 존재하지 않는 `.outline/<RUN_ID>/`를 먼저 만든다. 생성한 `.outline/<RUN_ID>/`를 `RUN_DIR`로 사용한다. 이미 존재하면 `input-blocked`로 처리한다.
- `RUN_ID`는 `[A-Za-z0-9_-]+` 형식만 허용한다.
- 인라인 입력을 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest에는 `runId`, 입력·중간 산출물·출력별 `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 기록한다.
- 모든 `relativePath`를 정규화하고 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 실제 스냅샷 해시가 manifest의 `sha256`과 일치해야 한다.

## 입력

- G28 종합 메모, G01~G27 전문 메모, 최종 검토 스키마, 소스 지문의 인라인 내용.

G28 종합 메모나 최종 검토 스키마가 없으면 `input-blocked`로 처리하고 파일을 작성하지 않는다.

## 판정 계약

- `grade`: `S|A|B|C|D|F`
- `releaseReadiness`: `Ready|Conditional|Not Ready`
- `replayValue`: `Low|Medium|High|Exceptional`
- `trueEnding`: `Weak|Adequate|Strong|Definitive`
- `choiceQuality`: `Weak|Adequate|Strong|Exceptional`

## 판정 규칙

| Grade | Meaning | Readiness |
|---|---|---|
| S | AAA narrative quality | Ready only when all critical gates and evidence pass |
| A | Release-ready with no major structural defect | Ready |
| B | Strong draft with bounded improvements remaining | Conditional |
| C | Structural revision required | Not Ready |
| D | Major rewrite required | Not Ready |
| F | Intended game experience cannot currently be supported | Not Ready |

- 점수 50 미만이면 grade가 C를 넘을 수 없는 핵심 게이트는 Choice Consequence, Player Agency, Replay Value, Ending Quality, Causality다.
- 다음 다섯 질문에 각각 명시적으로 답한다: 세계 상태가 핵심 선택과 인과관계를 바꾸는가? 플레이어가 관객이 아니라 선택으로 이야기를 만드는가? 첫 엔딩 뒤 다른 선택을 경험할 이유가 남는가? 진엔딩이 초기 사건과 중심 질문의 의미를 심화하는가? 누적 선택과 인물 행동으로 발생한 기억에 남는 장면이 하나 이상 있는가?

## G29 게이트 레코드

G29 레코드는 `Gate`, `Status`, `Reason`, `Score`, `Reviewed commit`, `Reviewed artifact SHA-256`, `Scope`, `Evidence`, `Findings`, `Required revisions`, `Limitations`를 정확히 포함한다. `Status`는 `PASS|FAIL|UNVERIFIABLE`, `Score`는 정수 `0-100` 또는 `null`이다. 각 finding은 `id`, `severity`, `status`, `file`, `line`, `problem`, `why`, `playerImpact`, `fix`를 포함한다.

## 절차

1. 실행 디렉터리를 만들고 인라인 입력을 manifest와 스냅샷으로 기록한다. 완료 조건: 모든 manifest 항목의 `relativePath`가 `RUN_DIR` 하위이고 스냅샷 해시가 `sha256`과 일치한다.
2. G28의 완전성, 지문, 공식 18개 키, supplemental keys, 충돌 기록을 검증한다. 18개 공식 점수 키와 4개 supplemental 키의 정의는 `narrative-score-synthesis`의 점수 계약을 따르며 여기서 다시 열거하지 않는다. 완료 조건: 18개 키와 4개 supplemental 키가 세어지고, 지문 일치 여부와 미해결 충돌 목록이 판정된다.
3. 검증된 근거에서 다섯 verdict 필드를 도출하고 enum을 확인한다. 완료 조건: 다섯 필드가 모두 채워지고 닫힌 enum 안의 값이며, 각 값에 근거 위치가 붙는다.
4. 해결되지 않은 Critical/Major finding을 보존한다. 핵심 게이트가 50 미만이면 grade는 C를 넘을 수 없고, Critical/Major가 남아 있으면 `Ready`로 판정하지 않는다. 완료 조건: 상한을 적용한 근거가 보고서에 적히고, 위반한 판정이 없다.
5. 세계 상태, 선택 주도권, 재플레이, 진엔딩, 누적 선택과 인물 행동에 관한 다섯 질문에 답한다. 완료 조건: 다섯 질문 각각에 답과 근거 위치가 있다.
6. 서사 출시 준비도와 제품 전체 승인 또는 투자 승인을 구분한다. 완료 조건: 보고서가 제품·투자 승인 판단을 내리지 않고 `Scope`에 그 구분이 적힌다.
7. G29 게이트 레코드와 결과를 `RUN_DIR/outputs/synthesis/G29.md`에 작성한다. 완료 조건: 출력 파일 하나에 verdict 5개, 다섯 질문 답변, 근거, 미해결 finding, 지문, 제한 사항, G29 게이트 레코드가 들어 있다.

## 출력 계약

- 경로: `RUN_DIR/outputs/synthesis/G29.md` 한 파일. 정규화 후 `RUN_DIR` 하위여야 하고 심볼릭 링크를 거부한다.
- 필수 내용: `grade`, `releaseReadiness`, `replayValue`, `trueEnding`, `choiceQuality`, 다섯 질문 답변, 근거, 미해결 finding, 지문, `Limitations`, G29 게이트 레코드.
- verdict 값은 위 판정 계약의 닫힌 enum만 쓴다. `Status`는 `PASS|FAIL|UNVERIFIABLE`, `Score`는 정수 `0-100` 또는 `null`만 쓴다.
- 호출자 반환: `RUN_DIR` 경로와 `grade`·`releaseReadiness`. `input-blocked`면 파일 없이 부족한 입력 목록을 돌려준다.

## 실패 처리

- **input-blocked:** G28 종합 메모·최종 검토 스키마가 없거나, 18개 공식 키가 완성되지 않았거나, 지문이 현재 소스와 불일치하거나, `RUN_ID`가 이미 존재하거나, `relativePath`·스냅샷 해시 검증에 실패한 경우. 파일을 작성하지 않고 부족한 입력을 나열한다.
- **grade-cap:** 핵심 게이트(Choice Consequence, Player Agency, Replay Value, Ending Quality, Causality) 점수가 50 미만인 경우. grade를 C 이하로 낮추고, 어떤 게이트가 상한을 걸었는지 `Limitations`에 적는다.
- **unresolved-critical:** 해결되지 않은 Critical/Major finding이 남은 경우. finding을 삭제하지 않고 `releaseReadiness`를 `Conditional` 또는 `Not Ready` 중 근거에 맞는 값으로 정하며 `Ready`를 쓰지 않는다.
- **unverifiable-core-gate:** 핵심 게이트의 점수가 `null`이거나 `UNVERIFIABLE`인 경우. 그 게이트를 `Limitations`에 나열하고 `releaseReadiness: Ready`를 쓰지 않는다.
- **verdict-invalid:** verdict 필드에 enum 밖 값을 쓴 경우. 값을 지어내지 않고 해당 필드를 판정 불가로 표시한 뒤 근거가 있으면 다시 도출한다.
- **path-escape:** 정규화 후 출력 경로가 `RUN_DIR`을 벗어나는 경우. 파일을 작성하지 않고 거부한다.

## 금지

- G28·전문 메모, 원장, 기존 리뷰 파일 수정.
- 등급을 맞추기 위해 게이트 점수를 올리거나 내리는 것.
- 핵심 게이트 50 미만, 미해결 Critical/Major, `UNVERIFIABLE` 핵심 게이트를 무시한 `Ready` 판정.
- 제품 전체 승인이나 투자 승인을 대신 결정하는 것.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령 실행.
