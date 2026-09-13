# 모드별 단계와 게이트

이 문서는 `novel-workflow`가 모드 하나를 확정한 뒤 호출할 때만 읽는다. 담당 스킬의 절차를 다시 쓰지 않고, 순서·입력·산출·게이트만 고정한다.

## 상류와 검수의 경계

- 상류 담당: `divergent-ideator`, `character-simulator`, `scene-architect`, `reverse-outliner`, `structural-critic`, `continuity-auditor`, `dialogue-variator`, `red-team-reader`, `story-graph-compiler`, `route-replay-runner`. 뒤의 둘은 그래프와 실행 증거를 만들 뿐 판정하지 않는다.
- 검수 담당: G01~G27 specialist, `narrative-scene-after-generation`, `narrative-ending-route-review`, `narrative-multi-ending-integration`, `narrative-score-synthesis`, `narrative-final-verdict`, `narrative-report-assembly`.
- 상류 스킬은 후보·진단·제안까지만 낸다. 전체 품질 등급, 출시 준비도, 점수는 검수 surface만 낸다. 두 surface가 같은 대상을 두고 서로 다른 판정을 내면 검수 판정을 신뢰하고 상류 산출물은 참고 자료로 내린다.
- 원장 쓰기는 `remains-ledger-maintenance` 하나로 유지한다. 상류 스킬과 이 라우터는 원장을 쓰지 않는다.
- 검수 위임 전제: `draft-review`·`revision`에서 검수 surface에 위임할 때, 경로·엔딩 검사(`ENDING_ROUTE`·`MULTI_ENDING`)에는 `story-graph-compiler`의 그래프와 `route-replay-runner`의 runtime evidence가 먼저 필요하다. 없으면 검수는 mechanics를 `UNVERIFIABLE`로 둔다.
- G28→G29→G30 synthesis 체인은 이 라우터의 모드가 아니다. 그 순서는 synthesis 스킬이 직접 지키고, 이 라우터는 그 체인을 계획에 넣지 않는다.

## 모드 선택 판정표

| 요청 신호 | 모드 |
|---|---|
| 새 사건·에피소드·분기 후보가 필요하다 | `ideation` |
| 인물이 왜 그렇게 행동하는지 검증해야 한다 | `character-test` |
| 장면 하나의 목표·갈등·비트·선택지를 설계해야 한다 | `scene-design` |
| 승인된 장면 설계(scene card)를 1인칭 초고로 옮겨야 한다 | `scene-design` |
| 초고가 이미 있고 구조·연속성·독자 반응을 봐야 한다 | `draft-review` |
| 진단 결과가 있고 수정 순서를 정해야 한다 | `revision` |

두 신호가 동시에 성립하면 뒤 단계를 모드로 삼는다. 앞 단계는 이미 끝난 것으로 보고 게이트만 확인한다.

## `ideation`

| 순서 | 담당 | 입력 | 산출 | 게이트 |
|---|---|---|---|---|
| 1 | `divergent-ideator` (`premise` 또는 `branch`) | 원장, 원고, 기존 `docs/ideation/` | 후보 10~20개와 다양성 비교표 | **Idea Selection** |
| 2 | `remains-ledger-maintenance` | 선택된 후보와 원문 근거 | 원장 반영 | **Major Canon Change** |

1단계는 후보를 확정하지 않는다. 2단계는 사람이 후보를 고르거나 조합한 뒤에만 계획에 넣는다.

## `character-test`

| 순서 | 담당 | 입력 | 산출 | 게이트 |
|---|---|---|---|---|
| 1 | `character-simulator` | 원장 인물 항목, 현재 상태, 상황, 선택 가능 행동 | 행동 후보 3개와 `CHARACTER_PLOT_CONFLICT` | **Major Character Motivation** |
| 2 | `continuity-auditor` (`KNOWLEDGE`, `RELATIONSHIP`) | 1단계 산출물, 원장, 원고 | 지식 경계 위반 목록 | — |

2단계는 인물이 알 수 없는 사실을 근거로 쓰지 않았는지만 본다. 행동의 흥미로움은 판정하지 않는다.

## `scene-design`

| 순서 | 담당 | 입력 | 산출 | 게이트 |
|---|---|---|---|---|
| 1 | `scene-architect` | 원장, 직전 장면 원고, 장면 목표 | scene card | **Major Plot Turn** |
| 2 | `continuity-auditor` | scene card, 원장, 직전 장면 | 진입 상태·지식 경계·용어 모순 | — |
| 3 | `dialogue-variator` (대사가 있으면) | scene card, 인물 voice 규칙 | subtext 대안 목록 | **Final Voice** |
| 4 | `narrative-rewriter` (draft) | 승인된 scene card(`state change: PASS`), 사람이 고른 대사 변주(있으면) | 1인칭 초고 블록 | — |

3단계는 대사를 확정하지 않는다. 사람이 고른 뒤 원고에 반영한다. 반영은 이 라우터가 하지 않는다. 4단계 초고는 승인된 카드를 전제로 하며, 카드가 없거나 `state change`가 `PASS`가 아니면 `narrative-rewriter`가 거부한다.

## `draft-review`

| 순서 | 담당 | 입력 | 산출 | 게이트 |
|---|---|---|---|---|
| 1 | `reverse-outliner` | 작성된 원고 | 장면별 실제 구조 추출 | — |
| 2 | `continuity-auditor` | 원고, 원장, 1단계 추출 | 연속성·설정 모순 목록 | — |
| 3 | `structural-critic` | 원고, 1단계 추출 | `[ISSUE]` 목록 | — |
| 4 | `red-team-reader` | 원고 | 독자 반응 목록 | — |
| 5 | 검수 surface (G01~G27, `narrative-*`) | 원고, 정본 지문, 2~4단계 산출물 | 게이트 메모, 종합, 판정 | **Final Manuscript** |

1~4단계는 진단만 한다. 5단계 위임 여부와 범위는 호출자가 정한다. 이 라우터는 게이트 점수를 해석하거나 등급을 요약하지 않는다.

## `revision`

| 순서 | 담당 | 입력 | 산출 | 게이트 |
|---|---|---|---|---|
| 1 | `structural-critic` | 진단 결과, 원고 | 수정 방향 A/B | **Structural Rewrite** |
| 2 | `dialogue-variator` | 수정 대상 장면, voice 규칙 | subtext 대안 | **Final Voice** |
| 3 | `continuity-auditor` | 수정 반영 예정 원고, 원장 | 수정으로 생긴 모순 | — |
| 4 | 검수 surface | 수정된 원고 | 재검수 판정 | **Final Manuscript** |

수정 반영은 사람이 수행한다. 이 라우터와 상류 스킬은 원고를 쓰지 않는다.

## 사람 게이트

다음 지점에서는 사람 승인 없이 다음 단계로 넘어가지 않는다.

- Idea Selection, Story Premise Approval, Major Character Motivation
- Major Plot Turn, Ending, Theme
- Major Canon Change
- Structural Rewrite
- Final Voice, Final Manuscript

게이트 통과 판정 기준은 사람의 명시적 선택 문장이다. 침묵, 추정, 이전 산출물의 존재는 승인으로 보지 않는다.

## 위임 대상 지문

검수 surface에 위임할 때는 정본 지문(커밋, 산출물 SHA-256)과 상류 산출물의 지문을 함께 넘긴다. 지문이 현재 정본과 다르면 위임하지 않고 `stale-fingerprint`로 처리한다.
