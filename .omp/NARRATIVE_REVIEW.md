# Narrative Review Agents and Skills

프로젝트의 내러티브 surface. 검수 surface와 상류(authoring) surface를 함께 기록한다. 모든 리뷰 스킬은 호출자에게서 입력을 인라인으로 받아 `.outline/<RUN_ID>/`를 직접 만들고, 그 디렉터리를 `RUN_DIR`로 사용한다. 인라인 입력은 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한 뒤 그 안의 파일만 읽고, 결과는 `RUN_DIR/outputs/`에만 쓴다. 외부 프로젝트 경로는 읽지 않는다. 자료 부족은 `UNVERIFIABLE` 또는 `input-blocked`(report-assembly는 `export-blocked`)로 기록한다. 스냅샷과 다른 리뷰 memo는 수정하지 않는다.

## Routing labels

| Label | 호출 시점 | 담당 surface | 출력 |
|---|---|---|---|
| `DRAFT` | 승인된 scene card(`state change: PASS`)를 1인칭 초고 블록으로 옮길 때 | `narrative-rewriter` (에이전트, 카드 없음·비PASS는 거부) | 호출자가 지정한 초고 파일 경로 |
| `SCENE` | 장면·노드 생성 또는 의미 있는 수정 직후 | 현재 장면, 직전/직후 노드, guard/effect, 정보 경계, 장면 인과 | `RUN_DIR/outputs/scenes/<SCENE_ID>.md` |
| `ENDING_ROUTE` | 하나의 엔딩과 하나의 시작→종결 route 완성 직후 | 실제 route replay evidence, 엔딩 6축, route anchor, 비용·실패·후속 책임 | `RUN_DIR/outputs/endings/<ENDING_ID>/<ROUTE_ID>.md` |
| `MULTI_ENDING` | 채택된 모든 엔딩·route·manifest·anchor 완성 후 | 엔딩 간 균형, 동시 달성, 재플레이, 정보 계층, 배타 상태, 전체 result set | `RUN_DIR/outputs/multi-ending-complete.md` |
| `GATE_SPECIALIST` | 전체 narrative gate에 대한 독립 단일 관점 리뷰 | `narrative-gate-specialist` (`GATE=<NN>`) | `.outline/sdd/reviews/specialists/<GATE>.md` |
| `SYNTHESIS` | G01~G27 specialist memo가 모두 준비된 후 | 점수 병합·최종 판정·보고서 조립 | project skills로 실행 |

### 공통 실행 계약

- 각 리뷰 스킬은 호출마다 존재하지 않는 `.outline/<RUN_ID>/`를 직접 만들고 이를 `RUN_DIR`로 사용한다. `RUN_ID`는 `[A-Za-z0-9_-]+`만 허용한다. 이미 존재하는 `RUN_ID`는 덮어쓰지 않고 `input-blocked`(report-assembly는 `export-blocked`)로 처리한다.
- 호출자는 검수 대상 입력(장면·route·memo·runtime evidence·지문)을 인라인으로 제공한다. 스킬은 이를 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록하고, manifest에 기록된 스냅샷만 읽는다. 외부 프로젝트 경로는 읽지 않는다.
- manifest 항목은 `runId`, `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 가진다. `relativePath`는 정규화 후 `RUN_DIR` 하위여야 하며, 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈은 거부한다. 스냅샷 해시는 manifest의 `sha256`과 일치해야 한다.
- 결과는 `RUN_DIR/outputs/` 아래에만 쓰고, 호출자에게 그 `RUN_DIR` 경로를 돌려준다. orchestrator는 이 경로에서 결과를 찾는다.

## Authoring surface

상류(authoring) 스킬은 후보·설계·시뮬레이션·진단까지만 내고, 전체 품질 판정과 등급은 검수 surface가 담당한다. 이 11개 스킬은 `prototype/remains.json`, `prototype/stories/example.md`, `docs/ideation/`을 읽기 전용으로 직접 읽고 `RUN_DIR/inputs/`에 스냅샷을 남긴다. 위 「공통 실행 계약」의 "외부 프로젝트 경로는 읽지 않는다"는 검수 스킬에만 적용한다. 정본 쓰기의 소유자는 나뉜다 — 원장은 `remains-ledger-maintenance`, 원고는 `narrative-rewriter`(지정 범위)·사람이며, 산문 초고 작성은 위 `DRAFT` 라벨로 라우팅된다.

| Label | 호출 시점 | 담당 skill | 출력 |
|---|---|---|---|
| `AUTHOR_IDEATION` | 새 사건·에피소드·분기 후보가 필요할 때 | `divergent-ideator` | `RUN_DIR/outputs/ideation/<slug>.md` + `docs/ideation/<slug>.md` |
| `CHARACTER_TEST` | 인물 행동의 근거를 캐릭터 상태에서 검증할 때 | `character-simulator` | `RUN_DIR/outputs/characters/<id>-<situation>.md` |
| `SCENE_DESIGN` | 장면 사양(scene card)을 설계할 때 | `scene-architect` | `RUN_DIR/outputs/scenes/<SCENE_ID>-card.md` |
| `CONTINUITY` | 원고·원장을 대조해 연속성을 감사할 때 | `continuity-auditor` | `RUN_DIR/outputs/continuity/<scope>.md` |
| `STRUCTURE` | 개요·원고의 구조를 진단할 때 | `structural-critic` | `RUN_DIR/outputs/structure/<scope>.md` |
| `VOICE` | 같은 의도를 다른 subtext로 변주할 때 | `dialogue-variator` | `RUN_DIR/outputs/dialogue/<intent>.md` |
| `RED_TEAM` | 가혹한 독자 반응을 시뮬레이션할 때 | `red-team-reader` | `RUN_DIR/outputs/red-team/<scope>.md` |
| `REVERSE_OUTLINE` | 작성된 원고에서 실제 구조를 추출할 때 | `reverse-outliner` | `RUN_DIR/outputs/outline/<manuscript>.md` |
| `WORKFLOW` | 두 단계 이상을 조합하고 사람 게이트를 확정할 때 | `novel-workflow` | `RUN_DIR/outputs/workflow/<mode>.md` |
| `GRAPH_COMPILE` | 승인된 산출물에서 기계 검증 가능한 이야기 그래프가 필요할 때 | `story-graph-compiler` | `RUN_DIR/outputs/graph/story-graph.json` + `routes.json` + `compile-report.md` |
| `ROUTE_REPLAY` | `ENDING_ROUTE`·`MULTI_ENDING` 검수 직전에 runtime evidence가 필요할 때 | `route-replay-runner` | `RUN_DIR/outputs/replay/<ROUTE_ID>.json` + `graph-evidence.md` |

사람 게이트: Idea Selection, Story Premise Approval, Major Character Motivation, Major Plot Turn, Ending, Theme, Major Canon Change, Structural Rewrite, Final Voice, Final Manuscript. 게이트를 통과하지 않은 단계는 다음 단계로 넘기지 않는다.

위임: 상류 스킬은 G01~G27, `narrative-*`, synthesis 스킬의 판정을 대체하지 않는다. 같은 대상을 두고 판정이 갈리면 검수 판정을 신뢰한다. 위임 전제: `ENDING_ROUTE`·`MULTI_ENDING`을 위임하려면 `GRAPH_COMPILE` 산출물(그래프·route·앵커)과 `ROUTE_REPLAY` 산출물(runtime evidence)이 먼저 있어야 한다. 없으면 검수는 mechanics·도달성·배타성을 `UNVERIFIABLE`로 둔다.

## Lifecycle skills

### `SCENE` — `narrative-scene-after-generation`

호출:

```text
/skill:narrative-scene-after-generation SCENE_ID=<scene-id>
```

검사:

- 1인칭 정보 범위
- 장면 목적
- 선택지의 이유·위험·즉시 결과
- predecessor/successor 인과
- `requires`·`effects`·flag 무결성
- NPC 욕망·지식·경계
- 복선 소유권
- 연속성·몰입
- 너무 이른 클라이맥스 소비

필수 fingerprint:

- reviewed source commit
- reviewed artifact SHA-256

### `ENDING_ROUTE` — `narrative-ending-route-review`

호출:

```text
/skill:narrative-ending-route-review ENDING_ID=<ending-id> ROUTE_ID=<route-id>
```

검사:

- 시작부터 terminal state까지의 route 도달성
- 엔진이 생성한 runtime evidence(인라인으로 제공, `RUN_DIR/inputs/`에 스냅샷으로 기록)
- 즉시·지연·인물·세계·엔딩 consequence
- Narrative / Character / Thematic / Emotional / Consequence / Memorability closure
- 비용·실패·ongoing duty 보존
- 실제 ending anchor
- route 전용 replay reason

필수 조건:

- `<ENDING_ID>`와 `<ROUTE_ID>` 모두 제공
- current compiled-content fingerprint
- 관련 scene memo fingerprint
- runtime replay evidence

수동 guard 읽기는 replay proof가 아니다. evidence가 없거나 stale이면 mechanics를 `UNVERIFIABLE`로 둔다.

### `MULTI_ENDING` — `narrative-multi-ending-integration`

호출:

```text
/skill:narrative-multi-ending-integration
```

검사:

- 채택된 모든 엔딩과 route의 도달성
- ending manifest / outcome rules / anchors / bodies 일치
- 일반·진·실패·부분 엔딩의 독립 필요성
- 배타 상태와 독립적으로 달성된 결과
- 한 route에서 여러 진엔딩을 동시에 얻는지 여부
- 한 회차에서 본 결과를 replay motivation에서 중복 계산하지 않는지 여부
- Layer 1 / Layer 2 / Layer 3 정보 구조
- convergence·content loss·dominant best route·false choice
- epilogue 중복·모순·terminal overwrite
- 정확히 30개 gate와 기존 18개 formal score 유지

필수 조건:

- 모든 route 메모(인라인으로 제공, `RUN_DIR/inputs/`에 스냅샷으로 기록)
- current compiled-content fingerprint
- 모든 route memo fingerprint
- 엔진이 생성한 runtime evidence(인라인으로 제공, `RUN_DIR/inputs/`에 스냅샷으로 기록)

## GATE_SPECIALIST agent: G01~G27

게이트 전문 리뷰는 단일 파라미터 에이전트 `narrative-gate-specialist`가 담당한다. 호출 시 `GATE=<NN>`으로 담당 게이트를 지정한다. `GATE`가 없거나 G01~G27 밖이면 `input-blocked`로 처리하고 파일을 쓰지 않는다.

```text
GATE=<NN> narrative-gate-specialist
```

- 게이트별 제목·**호출 상황**·**핵심 질문**·판정 범위·`Required output`·추가 점수·산출 파일은 `.omp/narrative-gate-rubrics.md`에 있다(G01~G27). 이전 표의 네 열은 모두 그 색인 표로 옮겼다.
- 공통 상태 규칙, 메모 계약(`Gate`/`Status`/`Reason`/`Score`/`Reviewed commit`/`Reviewed artifact SHA-256`/`Scope`/`Evidence`/`Findings`/`Required revisions`/`Limitations`), boundary 규칙은 에이전트 파일에 있다.
- G01~G30 gate contract는 기존 final-review schema와 동일하게 유지한다.

## Synthesis skills

| Skill | Label | 입력 | 출력 |
|---|---|---|---|
| `narrative-score-synthesis` | `SYNTHESIS` | G01~G27 memo | `RUN_DIR/outputs/synthesis/G28.md` |
| `narrative-final-verdict` | `SYNTHESIS` | G28 + G01~G27 | `RUN_DIR/outputs/synthesis/G29.md` |
| `narrative-report-assembly` | `SYNTHESIS` | G28 + G29 + G01~G27 | `RUN_DIR/outputs/synthesis/G30.md` |

G28→G29→G30 순서를 지킨다. 입력 memo의 commit/SHA-256이 현재 소스와 일치하지 않으면 synthesis를 막는다.

## Discovery note

새 project skill은 새 OMP 세션에서 다시 discovery해야 한다. 현재 세션에서 `/skill:<name>`이 `Unknown skill`로 나오면 새 OMP 세션을 시작한 뒤 다시 확인한다.

같은 규칙이 project agent에도 적용된다. `dedup-skills` 폴드로 게이트별 에이전트 27개가 은퇴하고 `narrative-gate-specialist`가 추가되었으므로, 다음 gate 실행 전 새 세션에서 `narrative-gate-specialist`를 `GATE=<NN>`으로 스폰할 수 있는지, 은퇴한 27개 이름이 더 이상 노출되지 않는지 확인한다.

## 은퇴한 슬러그

`dedup-skills` 폴드로 은퇴한 슬러그와 생존자.

| 은퇴 | 생존자 | 방식 | 일자 |
|---|---|---|---|
| `narrative-g01-first-playthrough` … `narrative-g27-originality` (27개) | `narrative-gate-specialist` | `GATE=<NN>` 입력 + `.omp/narrative-gate-rubrics.md` 루브릭 표 | 2026-09-13 |

전체 은퇴 목록: `narrative-g01-first-playthrough`, `narrative-g02-replay-value`, `narrative-g03-true-ending`, `narrative-g04-choice-consequence`, `narrative-g05-branch-convergence`, `narrative-g06-character`, `narrative-g07-player-agency`, `narrative-g08-causality`, `narrative-g09-foreshadowing`, `narrative-g10-twist-predictability`, `narrative-g11-emotional-payoff`, `narrative-g12-institutional-antagonist`, `narrative-g13-world-independence`, `narrative-g14-ending-closure`, `narrative-g15-failure-content`, `narrative-g16-ending-balance`, `narrative-g17-replay-score`, `narrative-g18-player-regret`, `narrative-g19-information-layers`, `narrative-g20-pacing`, `narrative-g21-theme`, `narrative-g22-world-profession`, `narrative-g23-management-crisis`, `narrative-g24-contradictions`, `narrative-g25-immersion`, `narrative-g26-plot-armor`, `narrative-g27-originality`

게이트별 내용은 `.omp/narrative-gate-rubrics.md`로 이동했고 버려진 항목은 없다. 에이전트 파일에서 파라미터화된 두 줄(게이트 라벨, 산출 경로 문장)만 제목·`<GATE>` 경로 규칙으로 흡수되었다.

