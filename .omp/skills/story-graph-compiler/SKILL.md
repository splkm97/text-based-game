---
name: story-graph-compiler
description: "승인된 정본·scene card·원고에서 기계가 검증할 수 있는 이야기 그래프(`story-graph.json`)와 route 목록을 컴파일할 때 사용한다. 노드·선택지·guard·effect·flag·앵커를 추출하고, 근거 없는 값은 `[HYPOTHESIS]`, 다음 장면이 없는 간선은 `open-edge`로 남긴다. 그래프 형태를 설계할 때는 `story-graph-architect`, 그래프를 실행해 증거를 만들 때는 `route-replay-runner`, 구조 문제 진단은 `structural-critic`을 사용한다. 이 스킬은 판정·점수·산문을 만들지 않는다."
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

승인된 산출물(정본, scene card, 원고)을 **기계가 실행할 수 있는 형태**로 옮긴다. 검수 surface는 `route manifest`, `ending anchor`, `compiled-content SHA-256`, `runtime evidence`를 요구하지만 그것을 만드는 주체가 지금 없다. 이 스킬이 그 입력을 만든다. 그래프의 형태를 새로 디자인하지 않고, 원고·카드에 이미 있는 것만 옮기며, 없는 값은 지어내지 않고 `[HYPOTHESIS]` 또는 `open-edge`로 남긴다.

## 사용 시점

- 엔딩·경로 검수를 시작하려는데 `story-graph.json`이 없을 때.
- 새 장면이 승인되어 그래프를 갱신해야 할 때.
- 선택지의 `requires`·`effects`가 원장 근거를 갖는지 기계적으로 확인해야 할 때.

## 사용하지 말아야 할 때

- 그래프의 형태(수렴점·분기 축·예산)를 정할 때는 `story-graph-architect`를 사용한다. 이 스킬은 이미 정해진 구조를 옮기기만 한다.
- 그래프를 실행해 도달성·결함을 볼 때는 `route-replay-runner`를 사용한다.
- 장면 사양 자체를 만들 때는 `scene-architect`, 원고에서 15필드 표를 뽑을 때는 `reverse-outliner`를 사용한다.
- 품질 점수·등급·출시 판정은 G01~G27과 synthesis 스킬의 몫이다.

## 입력

- `RUN_ID`와 컴파일 범위(장면 범위 또는 전체).
- `prototype/remains.json`, `prototype/stories/example.md`.
- 게임 메커니즘 파라미터(있으면): `prototype/game-mechanics.md` — 분기점 조합 이벤트·플래그 판정 제약.
- 선택: 승인된 scene card(`RUN_DIR/outputs/scenes/<SCENE_ID>-card.md`), 확정 플래그 목록.
- `RUN_ID`나 컴파일 범위가 없으면 `input-blocked`로 처리하고 파일을 작성하지 않는다.

## 절차

1. `RUN_DIR`을 만들고 읽은 정본을 `RUN_DIR/inputs/`에 스냅샷으로 복사한 뒤 `manifest.json`을 기록한다. **완료 조건:** 모든 `relativePath`가 `RUN_DIR` 하위이고 스냅샷 SHA-256이 manifest의 `sha256`과 일치한다.
2. 노드 경계를 `## N. 제목` 단위로 확정하고 노드 ID를 `scene-NN`으로 부여한다. 경계를 잡을 수 없는 구간은 `boundary-ambiguous`로 표시하고 임의로 나누지 않는다. **완료 조건:** 노드 ID와 `## N. 제목`, `파일:줄` 대응표가 있다.
3. 선택지를 문서 순서대로 추출한다. 원고 관례는 `**문장 (S)**` 아래 `- 이름` 목록이고, 선택된 항목에 `— 선택`이 붙는다. 선택지 ID는 `<nodeId>.c<N>`이다. **완료 조건:** 모든 노드의 `choices`가 문서 순서를 보존하고 `selected` 표시가 원고와 일치한다.
4. 선택지마다 `requires`(진입 조건)와 `effects`(상태 변화)를 붙인다. 값마다 근거를 `prototype/stories/example.md:줄` 또는 `prototype/remains.json` JSON 경로로 적는다. 원장에 없는 플래그를 만들려 하면 그 항목을 `[HYPOTHESIS]`로 낮추고 `ungrounded-flag`로 보고한다. 근거가 없으면 `requiresBasis`에 `없음`을 쓴다. **완료 조건:** 모든 선택지에 `requires`·`effects`·근거가 있고, `[FACT]`로 표시한 항목에는 원장 근거가 있다.
5. scene card가 주어졌으면 `entry_state`·`exit_state`를 노드 상태로 옮기고 카드 ID를 근거로 적는다. 카드가 없으면 두 값을 `미기재`로 둔다. **완료 조건:** 모든 노드에 `entryState`·`exitState`와 근거가 있다.
6. 노드 사이 간선을 채운다. 다음 장면이 아직 없으면 `next`를 `null`로 두고 `openEdges`에 사유와 함께 넣는다. 존재하지 않는 노드 ID를 `next`에 쓰지 않는다. **완료 조건:** 모든 `next`가 실제 노드 ID이거나 `null`이고, `null`마다 `openEdges` 항목이 있다.
7. 앵커를 열거한다. 엔딩 또는 엔딩 후일담의 위치 후보를 `파일:줄` 근거와 함께 적고, 근거가 없으면 `[HYPOTHESIS]`로 둔다. 앵커를 발명하지 않는다. **완료 조건:** 앵커마다 근거 또는 `[HYPOTHESIS]` 표시가 있다.
8. route를 열거한다. 진입 노드에서 terminal까지 선택지 조합으로 경로를 만들고, `open-edge`에 막힌 경로는 `incomplete`로 표시한다. **완료 조건:** 모든 route가 `id`·`choices`·`terminal`·`status`를 갖고, `terminal`이 `null`인 route에는 막힌 간선이 적혀 있다.
9. `outputs/graph/story-graph.json`, `outputs/graph/routes.json`, `outputs/graph/compile-report.md`를 쓰고 호출자에게 `RUN_DIR`과 요약을 돌려준다. **완료 조건:** 세 파일이 존재하고, JSON 키 순서·배열 순서가 정규화되어 있으며(키는 사전순, 노드·선택지·route는 문서 순서), 보고서에 노드 수·선택지 수·`open-edge` 수·`ungrounded-flag` 수·사람 결정 필요 목록이 있다.

## 금지

- 원고에 없는 장면·선택지·앵커·플래그를 만들어 넣기. 없는 값은 `미기재`·`open-edge`·`[HYPOTHESIS]`로 남긴다.
- `[HYPOTHESIS]`를 `[FACT]`로 승격하거나, 원장에 없는 플래그를 확정 상태 변화로 쓰기.
- 그래프 형태를 재설계하거나 수렴점을 새로 만들기(`story-graph-architect`의 몫).
- 판정·점수·등급 산정, 원장·원고 수정, 포맷터·린터·테스트·빌드·커밋·게시 명령 실행.

## 출력 계약

- `outputs/graph/story-graph.json`: `schemaVersion`, `compiledFrom`(역할별 `relativePath`·`sha256`), `nodes[]`(`id`, `heading`, `file`, `line`, `entryState`, `exitState`, `entryStateBasis`, `exitStateBasis`, `choices[]`{`id`, `label`, `selected`, `requires[]`, `effects[]`, `requiresBasis`, `effectsBasis`, `next`}, `next`), `flags[]`(`name`, `category`, `basis`), `anchors[]`(`id`, `file`, `line`, `status`), `openEdges[]`(`from`, `choice`, `reason`). `runId`는 넣지 않는다 — 같은 입력이면 같은 바이트가 나와야 한다.
- `outputs/graph/routes.json`: `schemaVersion`, `entryNode`, `routes[]`(`id`, `choices[]`, `terminal`, `status`, `blockedBy[]`).
- `outputs/graph/compile-report.md`: `Run ID`, `Scope`, `Reviewed commit`, `Reviewed artifact SHA-256`(원고 스냅샷), `Nodes`, `Choices`, `Open edges`, `Ungrounded flags`, `Anchors`, `Boundary-ambiguous`, `Human decision required`, `Limitations`.
- 호출자 반환: `RUN_DIR`, 노드 수, `open-edge` 수, `ungrounded-flag` 수. `input-blocked`면 파일 없이 부족한 입력을 돌려준다.

## 실패 처리

- **input-blocked:** `RUN_ID` 누락·충돌, 정본을 읽을 수 없음, 범위 미확정, `relativePath`·스냅샷 해시 검증 실패. 파일을 작성하지 않는다.
- **open-edge:** 다음 장면이 아직 없다. 그래프는 내되 `openEdges`에 사유와 함께 남기고 route를 `incomplete`로 표시한다.
- **ungrounded-flag:** 원장에 없는 플래그를 상태 변화로 쓰려 했다. 그 항목을 `[HYPOTHESIS]`로 낮추고 `Human decision required`에 올린다. 조용히 확정하지 않는다.
- **boundary-ambiguous:** `## N. 제목` 단위로 경계를 잡을 수 없는 구간. `boundary-ambiguous`로 표시하고 임의 분할하지 않는다.
- **hash-mismatch:** 스냅샷 해시가 manifest와 다르다. 그래프를 쓰지 않고 불일치 스냅샷과 기대·실제 해시를 돌려준다.
- **path-escape / unwritable-output:** 정규화 후 `RUN_DIR` 밖이거나 파일을 쓰지 못했다. 대체 경로를 고르지 않고 거부하며 완료로 보고하지 않는다.

## 참조

| 파일 | 로드 시점 |
|---|---|
| `references/graph-schema.md` | 2~9단계에서 노드·선택지 ID 규칙, 정규 키 순서, `requires`·`effects` 표기, 결정성 요구를 확인할 때 |
