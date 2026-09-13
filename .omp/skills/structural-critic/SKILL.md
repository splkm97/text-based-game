---
name: structural-critic
description: "개요나 원고의 인과관계·장면 필요성·반복·갈등 강도·선택의 비용·우연 의존·클라이맥스 준비를 구조 진단할 때 사용한다. '이 장면 삭제하면 어떻게 돼'처럼 장면 하나의 필요성을 물을 때도 사용한다. 원고에서 실제 장면 골격을 표로 추출하는 작업에는 `reverse-outliner`를, 재작성에는 `narrative-rewriter`를, 전체 품질 등급과 게이트 판정에는 G01~G27 검수 surface를 사용한다."
---

## 공통 계약

- 프로젝트 정본(`prototype/remains.json`, `prototype/stories/example.md`)과 확정이 아닌 발산 제안(`docs/ideation/`)은 읽기 전용 입력이다. 원장·원고·발산 문서를 수정하지 않는다. 승인된 정본 변경은 소유자가 수행한다 — 원장은 `remains-ledger-maintenance`, 원고는 `narrative-rewriter`(지정 범위)·사람. 게임 메커니즘 파라미터(`prototype/game-mechanics.md`)도 읽기 전용 입력이며, 변경은 설계 문서 개정으로만 한다.
- 산출물은 `.outline/<RUN_ID>/` 아래에만 쓰고 호출자에게 `RUN_DIR` 경로를 돌려준다. `RUN_ID`는 `[A-Za-z0-9_-]+`만 허용한다. 실행 디렉터리 선점은 원자적으로 한다 — `.outline/<RUN_ID>/.claim`을 배타 생성(`mkdir` 또는 `O_EXCL`)으로 만들고, 실패하면 다른 실행이 이미 그 `RUN_ID`를 잡은 것이므로 `input-blocked`로 처리한다. 존재 확인과 생성 사이에 다른 실행이 끼어들 수 있으므로 `exists()` 검사만으로 시작하지 않는다. 관대한 생성(`exist_ok=True`, `mkdir -p`)은 선점이 아니다. `.claim`에는 `runId`·생성 시각·`sourceVersion`을 적는다. 남은 `.claim`은 실행 중단의 흔적이며, 사람이 그 RUN의 `manifest.json`과 `outputs/`를 확인해 완료된 실행인지 판정한 뒤에만 지운다 — 그것이 유일한 해제 수단이다.
- 읽은 정본은 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest 항목은 `runId`, `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 가진다. `relativePath`는 정규화 후 `RUN_DIR` 하위여야 하며 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 스냅샷 해시는 manifest의 `sha256`과 일치해야 한다.
- 사실 범주를 구분한다: `[FACT]` 원장·원고에서 확인, `[INFERENCE]` 확인된 사실에서 추론, `[HYPOTHESIS]` 새로 제안, `[CONFLICT]` 기존 설정과 모순. `[HYPOTHESIS]`를 `[FACT]`로 자동 승격하지 않는다.
- 지식은 작가 지식·독자 지식·인물 지식으로 나눈다. 인물이 알 수 없는 사실을 그 인물의 판단 근거로 쓰지 않는다.
- 선택·승인·최종 결정은 사람이 한다. 이 스킬은 결정을 대신하지 않는다.
- 심각도는 `Critical|Major|Minor`, 판정은 `PASS|FAIL|UNVERIFIABLE`만 쓴다.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령을 실행하지 않는다.

## 목적

개요나 원고의 구조적 문제를 진단하고 후보 문제와 수정 방향을 낸다. 문제를 재작성하지 않고, 사람의 결정을 돕는 진단서를 만든다.

## 사용 시점

- 개요·장면 목록·원고 전체 또는 구간의 구조 문제를 진단하거나, `이 장면 삭제하면 어떻게 돼`처럼 장면 하나의 필요성을 물을 때.
- 인과, 반복, 갈등 강도, 선택의 비용, 우연 의존, 중반부 정체, stakes 변화, 클라이맥스 준비, character agency, setup/payoff를 점검할 때.

## 사용하지 말아야 할 때

- 수정문 작성과 재작성에는 `narrative-rewriter`를 사용한다.
- 원고에서 실제 장면 골격을 15필드 표로 추출하는 작업에는 `reverse-outliner`를 사용한다. 이 스킬은 표 추출 없이 문제만 진단한다.
- 전체 품질 등급·점수 산정과 루브릭 게이트 판정에는 G01~G27 게이트와 `narrative-score-synthesis`를 사용한다.
- 승인된 변경의 정본 반영에는 `remains-ledger-maintenance`를 사용한다.

## 입력

- 진단 범위: scope 식별자(`[A-Za-z0-9_-]+`)와 대상 장면 목록(장면 번호 또는 `## N. 제목` 제목).
- 범위에 해당하는 입력: 정본 `prototype/remains.json`, `prototype/stories/example.md`; 확정이 아닌 발산 제안 `docs/ideation/*.md`.
- 호출자가 지정한 추가 검사 항목이나 제외 범위. 범위가 없으면 `prototype/stories/example.md`에 존재하는 장면 전체를 범위로 삼고 그 사실을 `Scope`에 기록한다. 없는 장면 ID는 `input-blocked`다.

## 절차

1. 진단 범위를 확정한다. 대상 장면의 제목을 열거하고, 읽은 정본을 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. 완료 조건: 모든 대상 장면에 장면 제목이 붙고 스냅샷 해시가 manifest와 일치한다.
2. 장면마다 삭제 테스트와 변화 테스트를 적용한다. 두 결과로 필요성 등급(`Essential|Contributing|Optional|Redundant`)을 매긴다. 완료 조건: 모든 장면에 두 테스트 결과와 등급이 기록되고, 그 기록이 보고서의 장면별 절에 있다.
3. 검사 항목 12개를 다음 순서로 적용해 후보 문제를 수집한다: 인과관계, 장면 필요성, 반복, 갈등 강도, 선택의 비용, 우연 의존, deus ex machina, 중반부 정체, stakes 변화, climax 준비, character agency, setup/payoff.
   - 후보마다 핵심 질문 7개를 모두 적용한다: 이 장면을 삭제하면 이후 이야기가 달라지는가? 이 장면에서 무엇이 변하는가? 문제가 인물의 선택으로 악화되는가? 갈등이 외부 사건만으로 발생하는가? 해결책이 이전에 준비되었는가? 주인공이 아닌 존재가 문제를 해결하지 않는가? 같은 갈등이 형태만 바뀌어 반복되는가? 완료 조건: 항목별 후보 목록이 있고 각 후보에 `앵커`가 있다.
4. 우연 의존과 deus ex machina를 분리해 판정한다. 해결 장치마다 준비 위치를 확인해 준비된 장치와 준비되지 않은 장치를 가른다. 완료 조건: 해당 후보마다 준비 근거 위치 또는 `준비 없음`이 기록된다.
5. 문제마다 심각도와 가능한 수정 방향 A/B를 낸다. 완료 조건: 모든 `[ISSUE]`에 심각도와 A/B가 있고 수정문 자체가 없다.
6. `RUN_DIR/outputs/structure/<scope>.md`에 쓴다. 완료 조건: 출력 경로가 `RUN_DIR` 하위이고 상단 필드와 `[ISSUE]` 필드가 모두 있다.

## 금지

- 실제 수정문·대사·문장을 쓰지 않는다. 수정 방향은 방향 서술까지만 쓴다.
- 전체 품질 등급·점수를 매기거나 루브릭 게이트 판정을 대신하지 않는다.
- 취향 차이를 결함으로 단정하지 않는다.
- 정본에 없는 사실을 `[FACT]`로 쓰지 않는다. 원장과 원고를 수정하지 않는다.

## 출력 계약

- `RUN_DIR/outputs/structure/<scope>.md` 하나에 쓴다. `<scope>`는 `[A-Za-z0-9_-]+`만 쓴다.
- 문서 상단에 `Scope`, `Reviewed artifact SHA-256`, `Status`, `Limitations`를 둔다. `Reviewed artifact SHA-256`은 주 검토 대상 스냅샷의 해시다.
- `Limitations`는 읽지 못한 구간, `UNVERIFIABLE`로 남긴 후보, 진단에서 제외한 범위를 항목으로 나열한다. 비어 있으면 `없음`으로 쓴다.
- `Status`는 남은 `[ISSUE]`에 `Critical` 또는 `Major`가 있으면 `FAIL`, 범위 근거가 부족해 판단할 수 없으면 `UNVERIFIABLE`, 그 외에는 `PASS`다.
- `[ISSUE]`마다 `위치`, `유형`, `근거`, `왜 문제인가`, `심각도`, `가능한 수정 방향 A`, `가능한 수정 방향 B`, `비고`를 포함한다. `위치`는 장면 제목, `유형`은 검사 항목 이름이다. `비고`는 후보에서 제외한 이유나 추가 확인 필요 항목만 적고, 없으면 `없음`으로 쓴다.
- 장면별 절: 대상 장면마다 한 행에 `Scene ID`, 장면 제목, 삭제 테스트 결과, 변화 테스트 결과, 필요성 등급(`Essential|Contributing|Optional|Redundant`)을 적는다.
- 호출자 반환: `RUN_DIR` 경로와 `Status`. `input-blocked`면 파일 없이 사유와 부족한 입력을 돌려준다.

## 실패 처리

- **unknown-scene:** 없는 장면 ID·구간은 진단하지 않고 `input-blocked`로 보고한다.
- **existing-run-id:** 이미 있는 `RUN_ID`는 덮어쓰지 않고 `input-blocked`로 처리한다.
- **hash-mismatch:** 스냅샷 해시가 manifest와 다르면 진단을 중단하고 `input-blocked`로 처리한다.
- **path-escape:** 출력 경로가 `RUN_DIR` 밖이거나 심볼릭 링크면 쓰지 않고 `input-blocked`로 처리한다.
- **insufficient-evidence:** 근거가 부족하면 추측하지 않고 해당 후보를 `UNVERIFIABLE`로 표시하고 `Limitations`에 기록한다. 나머지 장면·항목 진단은 계속해 보고서를 작성한다.
- **unwritable-output:** 출력을 쓰지 못하면 의도한 경로와 오류를 보고하고 완료로 보고하지 않는다. 대체 경로를 고르지 않는다.

## 참조

| 파일 | 로드 시점 |
|---|---|
| `references/structural-tests.md` | 검사 항목 12개의 판정 기준·검출 신호, 삭제·변화 테스트 절차, 우연 의존과 준비된 복선 구분, 반복 갈등 판정, 수정 방향 A/B 제약, 심각도 판정표가 필요할 때 |
