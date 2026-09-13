---
name: divergent-ideator
description: "캠페인 규모 사건 후보 20개를 발산할 때(premise)와 특정 장면의 선택지 대안 10~20개를 늘릴 때(branch) 사용하고, 정본 근거 위에서 후보 생성·다양성 축 비교·중복 표시·요약 목록까지만 수행하며 최종 선택에는 사용하지 않는다. 후보 확정은 사람이 하고, 원장 반영은 `remains-ledger-maintenance`를 사용한다."
---

## 공통 계약

- 프로젝트 정본(`prototype/remains.json`, `prototype/stories/example.md`)과 확정이 아닌 발산 제안(`docs/ideation/`)은 읽기 전용 입력이다. 원장·원고·발산 문서를 수정하지 않는다. 승인된 정본 변경은 소유자가 수행한다 — 원장은 `remains-ledger-maintenance`, 원고는 `narrative-rewriter`(지정 범위)·사람. 게임 메커니즘 파라미터(`prototype/game-mechanics.md`)도 읽기 전용 입력이며, 변경은 설계 문서 개정으로만 한다.
- 산출물은 `.outline/<RUN_ID>/` 아래에만 쓰고 호출자에게 `RUN_DIR` 경로를 돌려준다. `RUN_ID`는 `[A-Za-z0-9_-]+`만 허용한다. 실행 디렉터리 선점은 원자적으로 한다 — `.outline/<RUN_ID>/.claim`을 배타 생성(`mkdir` 또는 `O_EXCL`)으로 만들고, 실패하면 다른 실행이 이미 그 `RUN_ID`를 잡은 것이므로 `input-blocked`로 처리한다. 존재 확인과 생성 사이에 다른 실행이 끼어들 수 있으므로 `exists()` 검사만으로 시작하지 않는다. 관대한 생성(`exist_ok=True`, `mkdir -p`)은 선점이 아니다. `.claim`에는 `runId`·생성 시각·`sourceVersion`을 적는다. 남은 `.claim`은 실행 중단의 흔적이며, 사람이 그 RUN의 `manifest.json`과 `outputs/`를 확인해 완료된 실행인지 판정한 뒤에만 지운다 — 그것이 유일한 해제 수단이다. 절차 7단계의 `docs/ideation/` 내보내기만 이 규칙의 예외다.
- 읽은 정본은 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest 항목은 `runId`, `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 가진다. `relativePath`는 정규화 후 `RUN_DIR` 하위여야 하며 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 스냅샷 해시는 manifest의 `sha256`과 일치해야 한다.
- 사실 범주를 구분한다: `[FACT]` 원장·원고에서 확인, `[INFERENCE]` 확인된 사실에서 추론, `[HYPOTHESIS]` 새로 제안, `[CONFLICT]` 기존 설정과 모순. `[HYPOTHESIS]`를 `[FACT]`로 자동 승격하지 않는다.
- 지식은 작가 지식·독자 지식·인물 지식으로 나눈다. 인물이 알 수 없는 사실을 그 인물의 판단 근거로 쓰지 않는다.
- 선택·승인·최종 결정은 사람이 한다. 이 스킬은 결정을 대신하지 않는다.
- 심각도는 `Critical|Major|Minor`, 판정은 `PASS|FAIL|UNVERIFIABLE`만 쓴다.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령을 실행하지 않는다.

## 목적

정본 근거 위에서 캠페인 사건 후보와 장면 선택지 대안을 발산해 탐색 공간을 넓힌다. 후보마다 결정 대상과 악화 방향, 정본 앵커 근거를 붙이고, 여섯 축으로 거리와 중복을 비교한다. 최종 선택은 사람이 한다.

## 사용 시점

- `premise`: 여러 장면과 인력 배치·후속 복구를 포함하는 굵직한 사건 후보 20개가 필요할 때.
- `branch`: 특정 장면의 `(S)` 선택지 대안 10~20개가 필요할 때.
- 기존 후보가 서로 비슷하거나 탐색 범위를 넓혀야 할 때.

## 사용하지 말아야 할 때

- 최종 후보 선택에는 사용하지 않는다. 선택은 사람이 하고, 캐논 반영은 `remains-ledger-maintenance`가 맡는다.
- 문장 교정과 본문 리라이팅에는 `narrative-rewriter`를 사용한다.
- 품질 점수·등급·출시 판정에는 G01~G27 게이트와 synthesis 스킬을 사용한다.

## 입력

- 모드(`premise` 또는 `branch`)와 대상 범위. 모드는 요청에서 하나로 확정한다.
- `premise`: 정본 전체 또는 호출자가 지정한 주제 범위.
- `branch`: 대상 장면 ID(`## N. 제목`)와 그 장면의 `(S)` 선택지.
- 입력: 정본 `prototype/remains.json`, `prototype/stories/example.md`; 확정이 아닌 발산 제안 `docs/ideation/*.md`(중복 회피용).

## 절차

1. 근거 범위를 정본 앵커로 고정하고 `RUN_DIR/inputs/`에 스냅샷과 manifest를 기록한다. 존재하지 않는 경로나 앵커를 인용하면 `input-blocked`로 처리한다. 완료 조건: 인용할 모든 앵커가 실제 정본에 존재하고, 스냅샷 해시가 manifest의 `sha256`과 일치한다.
2. 모드와 대상을 확정하고 `RUN_DIR`을 만든다. `RUN_ID`는 `[A-Za-z0-9_-]+`만 쓰고 이미 존재하면 덮어쓰지 않고 `input-blocked`로 처리한다. 완료 조건: 모드와 `premise` 범위 또는 `branch` 장면 ID, 슬러그가 정해진다.
3. 후보를 생성한다. `premise`는 1~5 현실적, 6~10 관계 중심, 11~15 구조적으로 낯선 형태, 16~20 장르 관습 하나 파괴의 네 구간으로 20개를 만든다. `branch`는 현장 즉시 대응, 인력·자원 배분, 정보·협상·절차, 지연·보류·거부의 네 범주로 10~20개를 만든다. 각 후보에 `선택`(무엇을 결정하는가), `악화`(무엇이 나빠지는가), `근거`(앵커)를 붙인다. 근거가 없는 후보는 `근거`에 `없음`을 쓰고 `[HYPOTHESIS]`로 표시한다. 완료 조건: 후보 수와 구간·범주 배분이 맞고, 모든 후보에 `선택`·`악화`·`근거`·`범주`가 있다.
4. 여섯 축으로 후보를 비교한다: `protagonist_goal`, `conflict_source`, `relationship_axis`, `cost`, `ending_implication`, `story_scale`. 축 정의와 판정 기준은 `references/diversity-axes.md`를 따른다. 축 조합이 같은 후보는 대표를 정해 병합하거나 탈락으로 표시한다. 완료 조건: 모든 후보의 여섯 축 값과 병합·탈락 표시가 후보 번호로 기록된다.
5. 요약 목록을 만든다: `Most Conventional 5`, `Most Distant 3`, `Most Promising Contradictions 3`, `Human Decision Required`. 선정 기준은 `references/diversity-axes.md`를 따른다. 완료 조건: 네 목록의 개수가 정확하고, 지목한 후보 번호가 본문에 존재한다.
6. `RUN_DIR/outputs/ideation/<slug>.md`에 후보 전문과 요약을 쓴다. 도입부에 `근거 범위`와 `확정으로 승격하지 않는다`를 명시한다. 완료 조건: 모든 후보가 `### N. 제목`, `상황`, `선택`, `악화`, `근거`, `범주`를 갖추고, 도입부에 두 문구가 있다.
7. 같은 내용을 기존 관례 위치 `docs/ideation/<slug>.md`로 내보내고 호출자에게 보고한다. 이 내보내기가 공통 계약의 `.outline/<RUN_ID>/` 하위 쓰기 규칙에 대한 유일한 예외다. 대상 경로가 이미 있으면 덮어쓰지 않고 새 슬러그로 내보낸 뒤 충돌을 보고한다. 완료 조건: 두 파일 내용이 같고 `docs/ideation/`의 기존 문서가 수정되지 않았으며, 보고에 `RUN_DIR`·모드·후보 수·구간 분포·병합·탈락 수·사람 결정 필요 목록이 있다.

## 금지

- 최종 후보를 선택하거나 순위를 확정하지 않는다. 후보는 선택 가능성만 제시한다.
- 후보를 `[FACT]`로 표시하거나 확정 설정처럼 서술하지 않는다. 사건은 전부 제안이다.
- 근거 경로는 저장소에 실제로 존재해야 한다. 존재하지 않는 경로를 인용하거나 산출물에 남기지 않는다.
- 원장·원고·기존 `docs/ideation/` 문서를 수정하거나 덮어쓰지 않는다.
- 인물이 알 수 없는 사실을 후보의 인물 판단 근거로 쓰지 않는다.

## 출력 계약

- 문서 상단에 `Mode`, `Run ID`, `Slug`, `Candidate count`, `Grounding range`, `확정으로 승격하지 않는다`를 둔다.
- 각 후보는 `### N. 제목`, `상황`, `선택`, `악화`, `근거`, `범주`를 가진다. `범주`는 `[INFERENCE]`, `[HYPOTHESIS]`, `[CONFLICT]` 중 하나이고 `[FACT]`는 쓰지 않는다.
- 요약은 `Most Conventional 5`, `Most Distant 3`, `Most Promising Contradictions 3`, `Human Decision Required` 이름을 그대로 쓴다.

## 실패 처리

- **input-blocked:** `RUN_ID` 충돌, 존재하지 않는 근거 경로 인용, 모드 불명확. 파일을 쓰지 않고 사유를 보고한다.
- **thin-grounding:** 확인된 근거가 부족하면 후보를 `[HYPOTHESIS]`로 표시하고 `근거 범위`에 부족한 축을 적는다.
- **export-conflict:** `docs/ideation/<slug>.md`가 이미 존재하면 덮어쓰지 않고 새 슬러그로 내보낸 뒤 충돌을 보고한다.
- **secret-risk:** 초반 공개 금지 정보를 후보의 즉시 전제로 쓰면 그 근거를 붙여 경고하고 `Human Decision Required`에 올린다.

## 참조

| 파일 | 로드 시점 |
|---|---|
| `references/diversity-axes.md` | 3~5단계에서 축 정의, 구간 전략, 중복·탈락 판정, 상투성 경고, 요약 선정 기준을 확인할 때 |
