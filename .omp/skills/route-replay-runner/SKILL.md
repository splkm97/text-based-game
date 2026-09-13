---
name: route-replay-runner
description: "`story-graph.json`을 실행해 route별 runtime evidence(노드 방문 순서, 평가된 guard, 세워진 flag, 도달한 terminal)를 만들고 그래프 결함을 보고할 때 사용한다. 검수 surface의 `ENDING_ROUTE`·`MULTI_ENDING`은 이 evidence를 입력으로 요구하며 수동 guard 읽기를 증거로 인정하지 않는다. 그래프 생성은 `story-graph-compiler`, 품질 판정은 검수 스킬과 G01~G27을 사용한다. 이 스킬은 판정·점수·산문을 만들지 않는다."
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

그래프를 **실행**해서, 읽어서는 알 수 없는 것을 기록한다: 어떤 route가 terminal에 도달하는가, 어떤 guard가 참·거짓으로 평가되는가, 어떤 flag가 실제로 세워지는가. 그리고 그래프 자체의 결함(도달 불가 노드, 참이 될 수 없는 `requires`, 한 번도 세워지지 않는 flag, terminal 미도달)을 목록으로 낸다. 품질은 판정하지 않는다 — "도달했다/도달하지 않았다"만 말한다.

## 사용 시점

- `ENDING_ROUTE` 또는 `MULTI_ENDING` 검수 직전에 runtime evidence가 필요할 때.
- 그래프가 바뀐 뒤 이전 evidence가 무효가 되었을 때.
- 선택지 조합이 실제로 다른 상태를 만드는지 실행으로 확인할 때.

## 사용하지 말아야 할 때

- 그래프를 만들거나 갱신할 때는 `story-graph-compiler`를 사용한다.
- 구조·인과의 서사적 진단은 `structural-critic`, 선택의 대가는 G04, 분기 인과는 G05의 몫이다. 이 스킬은 그 판정을 대신하지 않는다.
- 게임 엔진이 아니다. 새 콘텐츠·문장·수치를 만들지 않는다.

## 입력

- `RUN_ID`, `story-graph.json`, `routes.json`, `Reviewed graph SHA-256`, 탐색 한도(최대 route 수와 최대 깊이).
- 그래프·route·해시 중 하나라도 없으면 `input-blocked`로 처리하고 파일을 작성하지 않는다.

## 절차

1. `RUN_DIR`을 만들고 그래프·route 스냅샷과 manifest를 기록한다. `Reviewed graph SHA-256`은 그래프 스냅샷의 해시와 일치해야 한다. **완료 조건:** 모든 `relativePath`가 `RUN_DIR` 하위이고 해시가 일치한다.
2. 스키마를 검증한다: 필수 키 존재, 노드 ID 유일, 모든 `next`가 실제 노드 ID 또는 `null`, `requires`·`effects`가 문자열 배열. **완료 조건:** 위반 목록이 있거나 `없음`으로 적혀 있다.
3. 도달 가능성을 계산한다. 진입 노드에서 `next`를 따라 forward로 훑어 도달 불가 노드를 찾는다. **완료 조건:** 모든 노드의 `reachable` 판정과 근거(도달 경로 또는 차단 간선)가 있다.
4. route를 순회한다. route에 명시된 선택을 그대로 따르고, 임의로 다른 선택을 고르지 않는다. 각 단계에서 `requires`를 평가해 참·거짓을 기록하고, `effects`를 적용해 flag 상태를 누적한다. **완료 조건:** 모든 route에 `steps[]`가 있고 각 step에 `node`·`choice`·`guards[]`·`flags[]`가 있다.
5. terminal 도달 여부를 기록한다. `open-edge`로 막힌 route는 `incomplete`이고, 그때 막은 간선을 명시한다. **완료 조건:** 모든 route의 `terminal`과 `status`가 정해진다.
6. 미탐색 분기를 한도 내에서 열거한다. 한도를 넘으면 `budget-exhausted`로 표시하고 미탐색 영역을 적는다 — 탐색하지 않은 것을 탐색한 것처럼 쓰지 않는다. **완료 조건:** `unexplored[]`에 남은 선택지 조합 또는 `한도 내 전부 탐색` 문장이 있다.
7. 결함을 판정한다: `unreachable-node`, `unreachable-terminal`(terminal이 정의되어 있는데 어떤 route도 그것에 도달하지 못함), `no-terminal-defined`(terminal이 하나도 정의되지 않음 — 원고 미완성 신호이고 `FAIL` 사유가 아니다), `unsatisfiable-guard`(모든 선행 경로에서 거짓), `unset-flag`(어떤 경로에서도 세워지지 않음), `open-edge`(컴파일러 산출물 인용). **완료 조건:** 여섯 유형 각각에 항목 목록 또는 `없음`이 있다.
8. `outputs/replay/<ROUTE_ID>.json`과 `outputs/replay/graph-evidence.md`를 쓰고 호출자에게 `RUN_DIR`과 `Status`를 돌려준다. **완료 조건:** 각 route 파일에 `graphSha256`이 있고, 보고서에 도달성 표·결함 목록·미탐색 영역·`Limitations`가 있다.

## 금지

- 없는 step·guard·flag를 만들어 evidence를 채우기. 실행하지 않은 경로를 실행한 것처럼 쓰기.
- 품질·재미·주제·등급·점수 판정. 결함이 있는 그래프를 "고쳐서" 실행하기(`effects`를 임의로 더하거나 `next`를 바꾸지 않는다).
- 그래프·route·원고·원장 수정, 포맷터·린터·테스트·빌드·커밋·게시 명령 실행.

## 출력 계약

- `outputs/replay/<ROUTE_ID>.json`: `schemaVersion`, `routeId`, `graphSha256`, `steps[]`(`node`, `choice`, `guards[]`{`expr`, `value`}, `flags[]`), `terminal`, `status`(`complete|incomplete`), `evidenceKind`(`graph-execution`).
- `outputs/replay/graph-evidence.md`: `Reviewed graph SHA-256`, `Reviewed commit`, `Entry node`, `Reachability`, `Defects`(`unreachable-node`·`unreachable-terminal`·`no-terminal-defined`·`unsatisfiable-guard`·`unset-flag`·`open-edge`), `Unexplored`, `Status`(`PASS|FAIL|UNVERIFIABLE`), `Limitations`. `Status`는 **정의된 terminal에 도달하지 못하는 route**가 있거나 충족 불가 guard가 있으면 `FAIL`이다. terminal이 아직 정의되지 않았거나(`no-terminal-defined`) 원고 미완성으로 `open-edge`만 있는 경우는 `FAIL` 사유가 아니다. 그래프·route 근거가 부족하면 `UNVERIFIABLE`, 그 외 `PASS`다.
- 호출자 반환: `RUN_DIR`, `Status`, route 수, 결함 수. `input-blocked`면 파일 없이 부족한 입력을 돌려준다.

## 실패 처리

- **input-blocked:** 그래프·route·해시 누락, `RUN_ID` 충돌, 스냅샷 검증 실패.
- **schema-invalid:** 필수 키 누락·id 중복·`next`가 없는 노드 참조. 실행하지 않고 위반 목록을 돌려준다(결함 그래프를 실행해 통과시키지 않는다).
- **unsatisfiable-guard:** 어떤 경로에서도 참이 되지 않는 `requires`. 실행은 계속하고 결함으로 보고한다.
- **no-terminal-defined:** 엔딩·앵커가 아직 작성되지 않아 terminal이 하나도 없다. `no-terminal-defined`로 표시하고 `FAIL`로 올리지 않는다 — 원고 미완성과 그래프 결함을 구분한다.
- **unset-flag:** 어떤 경로에서도 세워지지 않는 플래그. 컴파일러의 `[HYPOTHESIS]` 목록과 대조해 보고한다.
- **budget-exhausted:** 탐색 한도 초과. 부분 evidence를 내고 미탐색 영역을 명시하며, 완료로 보고하지 않는다.
- **path-escape / unwritable-output:** 출력 경로가 `RUN_DIR` 밖이거나 쓰지 못했다. 대체 경로를 고르지 않는다.

## 참조

| 파일 | 로드 시점 |
|---|---|
| `references/evidence-schema.md` | 4~8단계에서 guard 평가 기록 형식, flag 누적 규칙, 도달성 표기, 결함 판정 기준을 확인할 때 |
