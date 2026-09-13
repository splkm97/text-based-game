---
name: scene-architect
description: "장면 설계가 필요하거나 장면 목표 정하기를 요청받았을 때 사용한다. 산문 없이 진입·종료 상태, 인과 비트 6~10개, 턴, 정보 공개 범위, 선택지 4필드를 갖춘 scene card를 만든다. 이미 작성된 장면의 사후 검토에는 G01~G27 게이트와 `narrative-scene-after-generation`을, 이미 작성된 장면의 구조 문제 진단에는 `structural-critic`을, 여러 단계의 작업 순서 결정에는 `novel-workflow`를 사용한다."
---

## 공통 계약

- 프로젝트 정본(`prototype/remains.json`, `prototype/stories/example.md`)과 확정이 아닌 발산 제안(`docs/ideation/`)은 읽기 전용 입력이다. 원장·원고·발산 문서를 수정하지 않는다. 승인된 변경은 `remains-ledger-maintenance`가 수행한다.
- 산출물은 `.outline/<RUN_ID>/` 아래에만 쓰고 호출자에게 `RUN_DIR` 경로를 돌려준다. `RUN_ID`는 `[A-Za-z0-9_-]+`만 허용한다. 이미 존재하는 `RUN_ID`는 덮어쓰지 않고 `input-blocked`로 처리한다.
- 읽은 정본은 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest 항목은 `runId`, `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 가진다. `relativePath`는 정규화 후 `RUN_DIR` 하위여야 하며 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 스냅샷 해시는 manifest의 `sha256`과 일치해야 한다.
- 사실 범주를 구분한다: `[FACT]` 원장·원고에서 확인, `[INFERENCE]` 확인된 사실에서 추론, `[HYPOTHESIS]` 새로 제안, `[CONFLICT]` 기존 설정과 모순. `[HYPOTHESIS]`를 `[FACT]`로 자동 승격하지 않는다.
- 지식은 작가 지식·독자 지식·인물 지식으로 나눈다. 인물이 알 수 없는 사실을 그 인물의 판단 근거로 쓰지 않는다.
- 선택·승인·최종 결정은 사람이 한다. 이 스킬은 결정을 대신하지 않는다.
- 심각도는 `Critical|Major|Minor`, 판정은 `PASS|FAIL|UNVERIFIABLE`만 쓴다.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령을 실행하지 않는다.

## 목적

장면 하나를 산문이 아니라 사양서로 설계한다. `entry_state`에서 출발해 인과로 연결된 beats, 최소 하나의 turn, 의미 있는 상태 변화, 다음 장면을 여는 `next_question`을 갖춘 scene card를 확정한다. 원고·대사는 쓰지 않고 원장·원고를 수정하지 않는다.

## 사용 시점

- 새 장면의 목표·갈등·비트·턴을 설계하거나, 상태 변화가 부족한 기존 장면 사양을 재설계할 때.
- 장면 목표 정하기와 인물 목표·상대 목표의 분리가 필요할 때.
- 정보 공개·은폐 범위를 작가·독자·인물 지식 기준으로 정하거나 선택지 4필드를 붙일 때.

## 사용하지 말아야 할 때

- 이미 작성된 장면의 사후 검토에는 G01~G27 게이트와 `narrative-scene-after-generation`을 사용한다.
- 이미 작성된 원고의 인과·삭제 가능성·반복 같은 구조 문제를 진단할 때는 `structural-critic`을 사용한다. 이 스킬은 앞으로 쓸 장면의 사양을 만든다.
- 원장 항목의 추가·수정·삭제와 캐논 반영에는 `remains-ledger-maintenance`를 사용한다.
- 산문·대사 초안 작성에는 `narrative-rewriter`를, 여러 단계를 조합한 작업 순서 결정에는 `novel-workflow`를 사용한다.

## 입력

- 장면 대상(장면 번호·제목)과 장면 목표 초안, `RUN_ID`.
- `prototype/remains.json`, 관련 `prototype/stories/example.md` 구간, 발산 제안에 기반하면 `docs/ideation/` 항목. 직전 장면의 종료 상태와 확정·미확정 세계 규칙의 구분을 함께 확인한다.

장면 대상, `RUN_ID`, 진입 상태를 얻을 정본 근거 중 하나라도 없으면 `input-blocked`로 처리하고 파일을 작성하지 않는다.

## 절차

1. `RUN_DIR`을 만들고 읽은 정본을 manifest와 스냅샷으로 기록한다. 원장과 직전 장면 원고에서 진입 상태를 얻고, 직전 장면이 없으면 시작 상태를 명시한다. 완료 조건: 스냅샷 해시가 manifest의 `sha256`과 일치하고, `entry_state`가 근거 위치와 함께 한 문장으로 정해진다.
2. 장면 목표·인물 목표·상대 목표를 각각 한 문장으로 분리한다. 완료 조건: 세 문장의 주체가 서로 다르고, 각 문장이 그 장면에서 확인 가능한 행동으로 끝난다.
3. 정보 공개·은폐를 작가 지식·독자 지식·인물 지식 기준으로 나눈다. 비공개 필드(예: 루의 `hiddenIdentity`, 최 반장의 `hiddenActivity`, 강두식-루시퍼 분리 인과)는 공개 시점 전까지 `information.reveal`에 넣지 않는다. 완료 조건: 모든 공개·은폐 항목에 지식 주체가 붙는다.
4. beats 6~10개를 `원인 → 인물 행동 → 상대 반응 → 결과`로 쓴다. 각 beat의 결과는 다음 beat의 원인이 된다. 완료 조건: 모든 beat가 네 요소를 채우고, 순서를 바꾸면 인과가 깨진다.
5. turn을 하나 이상 둔다. 완료 조건: turn마다 위치와 뒤집히는 기대가 적히고, turn 뒤에 결과를 확인하는 beat가 남는다. turn이 없으면 앞 단계로 돌아가 장면을 재설계한다. 상투적 전환(갑작스러운 비밀 조직, 숨겨진 혈통, 구원할 운명, 알고 보니 가족, 기억상실, 주인공도 괴물, 마지막 순간의 희생, 단일 악역)에만 기대는 turn은 올바른 turn으로 인정하지 않고 경고와 대안 후보를 남긴다.
6. `entry_state`와 `exit_state`를 비교해 의미 있는 state change가 최소 하나 있는지 확인한다. 완료 조건: 변화가 있으면 `PASS`, 없으면 `FAIL`과 재설계 항목을 낸다.
7. 다음 장면을 여는 `next_question`을 한 문장으로 쓴다. 완료 조건: `exit_state`에서 파생된 한 문장이고, 이 장면 안에서 답이 나오지 않는다.
8. 선택지가 있는 장면이면 각 선택지에 `이유`, `보이는 위험`, `구별되는 즉시 결과`, `다음 상태`를 붙인다. 완료 조건: 모든 선택지가 네 필드를 채우고, 두 선택지의 즉시 결과나 다음 상태가 같으면 `가짜 선택`으로 표시해 재설계 항목에 넣는다.
9. `RUN_DIR/outputs/scenes/<SCENE_ID>-card.md`에 scene card를 쓴다. 완료 조건: 경로가 정규화 후 `RUN_DIR` 하위이고, 출력 계약 필드를 모두 포함하며, 호출자에게 `RUN_DIR`을 반환한다.

## 금지

- 산문·대사 초안 생성, 원장·원고 수정, `[HYPOTHESIS]`의 캐논 승격.
- 확정되지 않은 세계 규칙의 확정 사용, 비공개 정보의 조기 노출, 인물이 알 수 없는 사실을 그 인물의 근거로 쓰기.
- 선택지 결과를 동일하게 만들어 가짜 선택 만들기, 사람의 선택·승인 대신하기, 등급·점수 판정, 포맷터·린터·테스트·빌드·커밋·게시 명령 실행.

## 출력 계약

scene card는 다음 필드를 모두 포함한다: `scene_id`, `pov`, `location`, `time`, `entry_state`, `scene_goal`, `character_goal`, `opposition_goal`, `conflict`, `information.reveal`, `information.conceal`, `beats`(6~10개, 각 beat는 `원인 → 인물 행동 → 상대 반응 → 결과`), `turn`, `exit_state`, `next_question`, `constraints`, `continuity_risk`.

- `pov`는 원고의 1인칭 시점 규칙을 따르고, `location`·`time`은 원장과 직전 장면에서 확인되는 값만 쓴다. `information` 항목에는 `작가`/`독자`/`인물` 지식 주체를 표시하고, `constraints`는 확정된 세계 규칙과 인물 제약을 담는다.
- `continuity_risk`는 `표기: 위험 내용 — 근거 위치 — 심각도` 형식으로 적고, 근거를 찾지 못한 위험은 `확인 필요`로 적어 `UNVERIFIABLE`로 표시한다. 선택지가 있으면 각 선택지에 `이유`, `보이는 위험`, `구별되는 즉시 결과`, `다음 상태`를 붙이며, state change 판정과 사실 범주를 해당 필드에 표시한다.
- 호출자 반환: `RUN_DIR` 경로, state change 판정(`PASS|FAIL|UNVERIFIABLE`), `확인 필요`로 남긴 항목 목록. `input-blocked`면 파일 없이 부족한 입력을 돌려준다.

## 실패 처리

- **input-blocked:** 장면 대상, 정본, `RUN_ID` 중 하나라도 없으면 파일을 쓰지 않고 멈추며, 부족한 입력을 나열한다.
- **no-turn / no-state-change:** turn이 서지 않거나 `entry_state`와 `exit_state`가 같으면 `FAIL`과 재설계 항목을 내고 완성으로 표시하지 않는다.
- **fake-choice:** 두 선택지의 즉시 결과나 다음 상태가 같으면 `가짜 선택`으로 표시하고 재설계 항목에 넣는다.
- **knowledge-boundary / unconfirmed-rule:** 인물이 알 수 없는 사실이 목표나 beat에 섞이면 `[CONFLICT]`, 확정되지 않은 규칙이 필요하면 `[HYPOTHESIS]`로 표시하고 확정 없이 진행 가능한 범위까지만 쓴다.
- **insufficient-evidence:** `location`·`time`·`constraints`·`continuity_risk`의 근거를 찾지 못한 경우. 그 필드만 `확인 필요`와 `UNVERIFIABLE`로 표시하고 나머지 필드는 계속 채워 scene card를 작성한다.
- **unwritable-output:** 출력 파일을 쓰지 못한 경우. 의도한 경로와 오류를 보고하고 완료로 보고하지 않는다. 대체 경로를 고르지 않는다.
- **path-escape:** 정규화 후 출력 경로가 `RUN_DIR`을 벗어나면 파일을 쓰지 않고 거부한다.

## 참조

| 파일 | 로드 시점 |
|---|---|
| `references/beat-grammar.md` | beats 작성, turn 배치, 목표 충돌 처리, 선택지 4필드 판정, `continuity_risk` 표기 형식을 정할 때 |
