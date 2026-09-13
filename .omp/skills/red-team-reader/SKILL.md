---
name: red-team-reader
description: "완성된 장면 구간을 가혹한 독자 시뮬레이션으로 검증할 때, '뻔하다', '설명이 너무 많다', '이 장면은 없어도 되겠다' 같은 독자 반응 후보를 뽑을 때 사용한다. 재작성과 대체 문장에는 `narrative-rewriter`를, 장면 종합 검수에는 `narrative-scene-after-generation`을 사용한다."
---

## 공통 계약

- 프로젝트 정본(`prototype/remains.json`, `prototype/stories/example.md`)과 확정이 아닌 발산 제안(`docs/ideation/`)은 읽기 전용 입력이다. 원장·원고·발산 문서를 수정하지 않는다. 승인된 정본 변경은 소유자가 수행한다 — 원장은 `remains-ledger-maintenance`, 원고는 `narrative-rewriter`(지정 범위)·사람. 게임 메커니즘 파라미터(`prototype/game-mechanics.md`)도 읽기 전용 입력이며, 변경은 설계 문서 개정으로만 한다.
- 산출물은 `.outline/<RUN_ID>/` 아래에만 쓰고 호출자에게 `RUN_DIR` 경로를 돌려준다. `RUN_ID`는 `[A-Za-z0-9_-]+`만 허용한다. 이미 존재하는 `RUN_ID`는 덮어쓰지 않고 `input-blocked`로 처리한다.
- 읽은 정본은 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest 항목은 `runId`, `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 가진다. `relativePath`는 정규화 후 `RUN_DIR` 하위여야 하며 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 스냅샷 해시는 manifest의 `sha256`과 일치해야 한다.
- 사실 범주를 구분한다: `[FACT]` 원장·원고에서 확인, `[INFERENCE]` 확인된 사실에서 추론, `[HYPOTHESIS]` 새로 제안, `[CONFLICT]` 기존 설정과 모순. `[HYPOTHESIS]`를 `[FACT]`로 자동 승격하지 않는다.
- 지식은 작가 지식·독자 지식·인물 지식으로 나눈다. 인물이 알 수 없는 사실을 그 인물의 판단 근거로 쓰지 않는다.
- 선택·승인·최종 결정은 사람이 한다. 이 스킬은 결정을 대신하지 않는다.
- 심각도는 `Critical|Major|Minor`, 판정은 `PASS|FAIL|UNVERIFIABLE`만 쓴다.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령을 실행하지 않는다.

## 목적

원고를 읽는 독자의 불만 반응을 재현한다. 친절한 첨삭이 아니라 가혹한 독자 시뮬레이션이며, 칭찬과 총평을 기본적으로 하지 않는다. 결과는 반응 후보와 그 근거이며, 문장 수정은 하지 않는다.

## 사용 시점

- 장면 완성도와 무관하게, 독자가 어디서 실망하거나 이탈할지 먼저 알고 싶을 때.
- `뻔하다`, `설명이 너무 많다`, `캐릭터 말투가 다 똑같다` 같은 반응의 실제 위치를 확인할 때.

## 사용하지 말아야 할 때

- 문장을 고치거나 장면을 재작성할 때. 재작성 문안은 이 스킬의 출력이 아니며 `narrative-rewriter`가 다룬다.
- 정본 반영 여부를 승인·판정하거나 점수·등급을 산정할 때.

## 입력

- 검사 범위: 원고 파일과 장면 번호 또는 줄 범위.
- 읽기 전용 입력: 관련 `prototype/remains.json` 구간, `prototype/stories/example.md` 구간, 필요 시 확정이 아닌 발산 제안 `docs/ideation/*.md`.
- 호출자가 지정한 독자 가정(1회차 독자, 재플레이 독자 등)과 `RUN_ID`.

검사 범위나 원고 입력이 없으면 `input-blocked`로 처리하고 파일을 쓰지 않는다.

## 절차

1. 검사할 장면 범위를 확정하고 원고·원장 구간을 읽어 스냅샷한다. manifest와 SHA-256을 기록한다. 완료 조건: 범위의 시작·끝 위치와 스냅샷 해시가 기록되어 있다.
2. 9개 관점을 순서대로 적용해 반응 후보를 수집한다: `뻔하다`, `왜 저렇게 행동하지`, `작가가 억지로 움직였다`, `설명이 너무 많다`, `이 장면은 없어도 되겠다`, `반전이 너무 예상된다`, `갑자기 생긴 설정 같다`, `캐릭터 말투가 다 똑같다`, `작가가 정보를 숨겼다`. 완료 조건: 9개 관점 각각에 반응이 있거나 `해당 없음`이 적혀 있다.
3. 각 반응에 `Location`(파일:줄 또는 장면 id), `Evidence`(원문 인용 1~2문장), `Why Reader May React This Way`, `Confidence`(`High|Medium|Low`)를 붙인다. 완료 조건: 모든 반응에 다섯 필드가 채워져 있고 인용이 원문과 문자 단위로 일치한다.
4. 취향 차이와 실제 결함을 분리한다. 근거가 취향뿐이면 `Confidence: Low`로 내리고 결함으로 단정하지 않는다. 완료 조건: 각 반응에 취향 근거인지 결함 근거인지 표시되어 있고, 취향 반응에 결함 단정 표현이 없다.
5. 반응을 반복 빈도와 영향 범위로 정렬해 요약 표를 만든다. 완료 조건: 표의 모든 반응이 본문 항목과 1:1로 맞고 정렬 기준이 표시되어 있다.
6. `RUN_DIR/outputs/red-team/<scope>.md`에 결과를 쓴다. 완료 조건: 출력 경로가 정규화 후 `RUN_DIR` 하위이고, 상단 지문·다섯 필드·`Do NOT rewrite` 표시가 모두 있다.

## 금지

- 재작성, 대체 문장, 장면 삭제·이동 대안 제안.
- 칭찬, 총평, 격려, "좋은 점" 정리.
- 인용 근거 없는 반응, 원장에 없는 설정을 전제한 반응.
- 점수, 등급, 별점, 순위 산정.
- 원장·원고 수정과 정본 반영.

## 출력 계약

- 상단: `Scope`, `Reviewed artifact SHA-256`, `Status`(`PASS|FAIL|UNVERIFIABLE`), `Limitations`.
- 각 반응: `Reaction`, `Location`, `Evidence`, `Why Reader May React This Way`, `Confidence` 다섯 필드와 `Do NOT rewrite` 표시.
- `Why Reader May React This Way`는 취향 근거인지 결함 근거인지 밝히고 사실 범주(`[FACT]`/`[INFERENCE]`/`[CONFLICT]`)를 표기한다.
- 반응이 없는 관점은 `해당 없음`으로 적고 생략하지 않는다.
- 요약 표 열: `Reaction`, `Location`, `반복 빈도`, `영향 범위`, `Confidence`. 끝에 `RUN_DIR` 경로를 돌려준다.

## 실패 처리

- **input-blocked:** `RUN_ID` 충돌, 검사 범위·원고 입력 누락이면 파일을 쓰지 않고 중단하며, 호출자에게 부족한 입력을 나열해 돌려준다. `input-blocked`는 `Status` 어휘가 아니라 차단 결과 표기다.
- **evidence-mismatch:** 인용이 원문과 다르면 해당 반응을 `UNVERIFIABLE`로 내리고 인용을 다시 확인한다.
- **scope-creep:** 범위 밖 정본을 읽게 되면 읽기를 멈추고 범위를 다시 확인한다.

## 참조

| 파일 | 로드 시점 |
|---|---|
| `references/reader-reactions.md` | 2단계에서 반응별 판정 신호를 적용할 때와 3~5단계에서 `Confidence`·빈도·정렬을 정할 때 |
