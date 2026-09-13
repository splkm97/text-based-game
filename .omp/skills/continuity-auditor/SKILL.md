---
name: continuity-auditor
description: "원고와 원장을 대조해 시간·장소·소지품·신체·관계·세계 규칙·시점·복선의 사실 모순을 검사할 때, 또는 인물이 알 수 없는 사실을 대사나 판단 근거로 쓰는지 확인할 때 사용한다. 인물의 동기와 행동 선택의 타당성 판단에는 `character-simulator`를, 재작성과 대체 문장에는 `narrative-rewriter`를 사용한다. 이 스킬은 진단만 한다."
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

원고와 원장을 대조해 연속성·설정 모순만 찾는다. `TIMELINE`, `LOCATION`, `KNOWLEDGE`, `INVENTORY`, `PHYSICAL_STATE`, `RELATIONSHIP`, `WORLD_RULE`, `IDENTITY`, `POV`, `FORESHADOWING`, `PROMISE_PAYOFF` 11개 영역을 모두 훑고, 후보마다 근거를 붙여 진단까지만 낸다.

## 사용 시점

- 새 장면이나 에피소드를 쓴 뒤 시간·장소·소지품·신체 상태·관계·세계 규칙·시점·복선·약속과 회수가 기존 설정과 맞는지 확인할 때.
- 인물이 알 수 없는 사실이 대사나 판단 근거로 쓰였는지, 비공개 정보가 이른 장면에 노출되지 않았는지 확인할 때.

## 사용하지 말아야 할 때

- 문체·페이싱·재미·주제를 평가할 때는 이 스킬을 쓰지 않는다. 이 스킬은 11개 영역의 모순만 판정한다.
- 수정문·대체 문장이 필요할 때는 `narrative-rewriter`를 쓴다. 이 스킬은 진단 결과만 낸 뒤 사람이 다음 작업을 정한다.
- 확정되지 않은 발산 후보를 캐논 위반으로 단정하거나 원장·원고를 실제로 고칠 때는 쓰지 않는다. 발산 후보는 `[HYPOTHESIS]`로만 기록하고, 승인된 정본 변경은 소유자가 수행한다 — 원장은 `remains-ledger-maintenance`, 원고는 `narrative-rewriter`(지정 범위)·사람.

## 입력

- 검사 범위: 장면 범위(예: `## 1. 첫 출동`부터 `## 2. 긴급 피해 조사 명령`까지)와 인물 범위.
- `RUN_ID`, `Reviewed commit`, 선택 시 이전 회차 findings 목록(해결 여부 확인용).
- `prototype/remains.json`, `prototype/stories/example.md` 구간 스냅샷. 참고 시 `docs/ideation/*.md` 스냅샷.

`RUN_ID`, `Reviewed commit`, 장면 범위 중 하나라도 없으면 `input-blocked`로 처리하고 파일을 쓰지 않는다.

## 절차

1. 범위를 확정하고 스냅샷한다. 장면 범위와 인물 범위를 정하고 `RUN_ID`를 확정한 뒤 `.outline/<RUN_ID>/`를 만들고 원장·원고 구간을 `RUN_DIR/inputs/`에 기록한다. 판단 근거로 쓴 파일만 스냅샷하고, 읽기만 하고 판단에 쓰지 않은 자료는 `Scope`에 경로만 적는다. 원장이 참조하는 프로토타입 자료(예: `officialDocumentStyleReference`)는 세계 규칙 확인에 필요할 때만 읽는다. **완료 조건:** manifest 항목 수와 스냅샷 파일 수가 같고, 모든 `relativePath`가 `RUN_DIR` 하위이며, 각 스냅샷 SHA-256이 manifest의 `sha256`과 일치한다.
2. 영역별 검사 질문을 적용한다. `references/continuity-domains.md`의 11개 영역을 순서대로 적용해 후보 문제를 수집한다. **완료 조건:** 11개 영역 각각에 후보 목록이 있고, 후보가 없는 영역은 `없음`으로 적혀 있다.
3. 근거 두 곳을 붙인다. 후보마다 원인 장면과 위반 장면을 `파일:줄`로 적는다. 원장과 원고가 충돌하면 원장 근거를 원인으로, 어긋난 원고 구간을 위반으로 적고, 원고 내부 두 장면이 충돌하면 확정 근거가 먼저 성립한 쪽을 원인으로 적는다. 두 근거가 모두 있고 확정 설정과 충돌할 때만 `Findings`로 올리고, 한쪽 근거가 없거나 위반 장면이 아직 작성되지 않았으면 `Held checks`로 옮겨 `UNVERIFIABLE`로 표시한다. `Findings`의 `status`는 `open|resolved`만 쓴다. **완료 조건:** 확정 후보는 `Findings`에, 보류 후보는 `Held checks`에 `suggested_check`와 함께 있고, 모순으로 단정한 항목에 근거 두 곳이 있다.
4. 지식 3층을 분리한다. `fact_id` 단위로 작가 지식·독자 지식·인물 지식을 나누고, 비공개 정보의 조기 노출을 `EARLY_DISCLOSURE` 유형으로 따로 표시한다. **완료 조건:** 각 지식 행에 `truth`, `author_knows`, `reader_knows_from_scene`, `characters.*.knows`가 채워지고, 검사 범위의 비공개 정보마다 노출 장면 유무가 기록된다.
5. 오탐을 걸러낸다. 의도된 서술자 제한, 미정 사실, 원장 미기재 값, 대표 원고 차이, 메타데이터 불일치를 구분해 제거한다. 원장 미기재 값을 근거로 위반을 단정한 후보는 `Rejected candidates`로, 지식 상태가 미기재라 판정할 수 없는 항목은 `Held checks`로 보낸다. **완료 조건:** 제거한 후보마다 `Rejected candidates`에 후보 요약과 제거 사유가 한 줄로 남고, 남긴 후보에 `[FACT]`/`[INFERENCE]`/`[CONFLICT]` 범주가 붙는다.
6. 심각도를 정한다. `Findings`의 각 항목에 `Critical|Major|Minor`를 부여하고, 심각도는 문서 `Status`에만 반영한다. 확정값 판정에는 원장이 참조를 지시한 자료(`officialDocumentStyleReference` 등)도 포함한다. 해결되지 않은 Critical 또는 Major가 있으면 `Status`를 `FAIL`로 한다. **완료 조건:** 모든 finding에 심각도가 있고, `FAIL`이면 그 근거 finding의 `id`가 열거된다.
7. 보고서를 쓴다. `RUN_DIR/outputs/continuity/<scope>.md`에 출력 계약대로 쓴다. 스냅샷은 대상 파일 전체를 복사하고 검사 구간은 `Scope`에 줄 범위로 적는다. `<scope>`는 검사 구간에서 파생한 `[A-Za-z0-9_-]+`(예: `scenes-1-2`)이고, `Reviewed artifact SHA-256`은 검사 대상 원고 파일 스냅샷의 해시이며 원장 스냅샷 해시는 `Evidence`에 병기한다. manifest의 `relativePath`는 `RUN_DIR` 상대 경로로, `sourceVersion`은 `Reviewed commit` 값으로 적는다. **완료 조건:** 경로가 `RUN_DIR` 하위이고 출력 계약의 모든 절이 채워졌다.

## 금지

- 수정문·대체 문장·리라이트·대안 대사 작성.
- 점수·등급·순위 산정.
- 11개 영역 밖 문제(문체, 페이싱, 재미, 주제)의 자체 판정. 범위 밖 발견은 `참고`로만 남긴다.
- 근거 없는 모순 단정, `[HYPOTHESIS]`의 `[FACT]` 승격, 원장·원고 수정, 승인 없는 캐논 반영.
- 인물이 알 수 없는 사실을 그 인물의 판단 근거로 서술.

## 출력 계약

문서 상단에 `Scope`, `Reviewed commit`, `Reviewed artifact SHA-256`, `Status`, `Evidence`, `Findings`, `Held checks`, `Rejected candidates`, `Limitations`를 순서대로 둔다. `Status`는 `PASS|FAIL|UNVERIFIABLE` 중 하나다.

- 중간 산출물(영역별 후보 목록, 지식 3층 표, 오탐 제거 기록)은 각각 `Evidence`, `Evidence`, `Rejected candidates`에 둔다.
- `Held checks`는 위반 장면이 아직 없거나 근거가 한쪽뿐인 보류 항목 목록이다. 항목마다 `fact_id` 또는 주제, 확인에 쓴 `파일:줄`, 보류 이유, `suggested_check`를 가진다.
- `Rejected candidates`는 후보 요약과 제거 사유 한 줄을 가진 목록이다.

각 finding은 `id`(`F###`, 보고서 안에서 고유), `severity`, `type`(11개 영역 중 하나 또는 `EARLY_DISCLOSURE`), `status`(`open|resolved`), `file`(위반 장면의 저장소 상대 경로), `line`, `character`(없으면 `-`), `evidence`(원인 장면·위반 장면의 `파일:줄` 목록), `explanation`(사실 범주와 모순 내용, 수정 방향 제외), `suggested_check`(사람이 확인할 검사 하나)를 모두 가진다.

## 실패 처리

- **`input-blocked`/`path-escape`**: `RUN_ID`·`Reviewed commit`·장면 범위 중 하나가 없거나, `RUN_ID`가 이미 존재하거나, 필수 정본을 읽을 수 없거나, 정규화 후 `RUN_DIR` 밖이 되는 경로·절대경로·`..`·심볼릭 링크가 있으면 파일을 쓰지 않고 중단하며, 호출자에게 부족한 입력·거부한 경로와 사유를 돌려준다.
- **`hash-mismatch`**: 스냅샷 SHA-256이 manifest와 다르면 입력을 다시 기록하고, 불일치가 남으면 보고서를 쓰지 않는다.
- **`evidence-missing`**: 근거 한쪽이 없으면 그 finding을 `UNVERIFIABLE`로 두고 `Status`를 올리지 않는다.
- **`premature-verdict`**: 담당 영역 밖 문제는 판정하지 않고 `참고` 목록에만 남긴다.

## 참조

| 파일 | 로드 시점 |
| --- | --- |
| `references/continuity-domains.md` | 절차 2단계 진입 시. 11개 영역 검사 질문, 영역별 오탐 방지 기준, 지식 3층 스키마, 프로젝트 비밀 정보 적용 예, 심각도 사다리, `suggested_check` 작성 형식 |
