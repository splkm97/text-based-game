# NOTES — 세션 조정, 사용자 선호, 다음 레슨 계획

레슨을 설계할 때 참고하는 메모. 작업 공간 루트에 산다.

## 작업 공간 위치 결정

`docs/learn/`에 있다. 처음엔 `.outline/teach/`에 만들었고, 그 뒤 옮겼다. 이유: 교수 계약이 "롤백은 버전 관리다"를 전제하는데 `.outline/`은 `.gitignore:5`로 무시되고 `AGENTS.md`가 커밋을 금지한다 — 버전 관리도 롤백도 불가능한 곳에 영속 산출물을 둘 수 없다. `docs/ideation/`이 사람이 읽는 에이전트 산출물을 커밋 대상 경로에 두는 선례다. 이동 비용은 낮았다(문서 전부 워크스페이스 내부 상대 경로, 깊이 동일: `.outline/teach/`와 `docs/learn/` 모두 루트에서 2단계).

스킬 실행 산출물(`RUN_DIR`)과 연습 메모만 `.outline/<RUN_ID>/`에 쓴다 — 그건 재현용 스냅샷이지 사람이 읽는 자료가 아니다.

아직 커밋하지 않았다. 커밋은 별도 concern이고, 레포 규칙대로 커밋 전에 `pnpm verify`를 돌린다.

**게이트 확인 결과 (2026-09-13):** 처음 예상("문서 전용이라 결과는 영향받지 않아야 한다")은 **틀렸다**. `.outline/`은 biome의 `vcs.useIgnoreFile`로 제외되지만 `docs/`는 아니다. 그래서 `docs/learn/assets/style.css`가 `biome check`에서 포맷 위반으로 걸렸다 — Node 24에서 `node_modules/.bin/biome check docs/learn` 결과 8파일 검사·1파일 수정 필요. `--write`로 정리했고 재검사는 통과한다(HTML 7개도 검사 대상이지만 위반은 없었다).

## 관찰한 사용자 선호

- 한국어로 쓴다. 문장은 짧고 결론이 먼저다.
- 근거를 `파일:줄`로 붙이는 문체가 레포 전체(스킬 계약·게이트 루브릭·원장)에 박혀 있다. 설명도 같은 문체를 쓴다.
- 확정과 가설을 구분해 표시하는 것을 선호한다. 코스 문서에서도 프로토타입 적용은 전부 `[HYPOTHESIS]`로 표시했다.
- 레포 게이트를 존중한다: Node 24, `pnpm verify && pnpm build` 경고 없이 통과, `.outline/` 커밋 금지.
- 판정·점수를 대신 내리지 않는 태도를 계약에 못박았다. 코스 문서도 같은 태도를 따른다(후보 우선순위는 제시하되 확정하지 않음).

## 미션 확립 방식 (정정 대상)

미션은 인터뷰가 아니라 레포 증거로 파생했다. 파생 문장은 `MISSION.md`에 있다. 근거와 가정은 `learning-records/0001-zpd-baseline-from-repo-artifacts.md`에 있다. **틀렸다면 그 기록을 대체하고 미션을 다시 쓴다.**

## 유지력 게이트 — 다음 레슨을 언제 쓰는가

이번 세션에서 쓴 것: 레슨 0001~0003 + 참조 문서 4개 + 용어집 + 학습 기록 1개.

미룬 것: 레슨 0004~0006. 이유는 게이트 규칙이다 — 새 레슨 전에 이전 레슨의 이해가 인출로 입증되어야 한다.

| 레슨 | 전제로 삼는 것 | 왜 미뤘는가 |
|---|---|---|
| 0004 정보 경계와 복선 회수 | 0001의 사실 범주·지식 3층, 0003의 목표 3분리와 `information` 필드 | 지식 주체 표기를 이미 쓸 수 있어야 `continuity-auditor`의 11개 영역을 읽는다 |
| 0005 엔딩 세트와 재플레이 | 0003의 수렴·선택 결과, 게이트 어휘(G14·G16·G17) | 수렴점 개념 없이 엔딩 배타성을 논하면 암기로 흐른다 |
| 0006 검수 체인 실행 | 0001의 RUN_DIR·지문·판정 어휘, 0002의 위임 조건 | 지문 조건을 모르면 `input-blocked`의 이유를 해석할 수 없다 |

게이트 판정: 0001의 인출 4문항과 0002의 라우팅 과제(계획 메모 1개), 0003의 과제 A·B 중 최소 둘에 답이 오면 진행한다. 답이 없으면 0001의 사실 범주·지식 3층을 다시 다루고 근접발달영역을 낮춘다. 같은 주제에서 두 번 입증에 실패하면 `learning-records/`를 전부 검토해 공백을 찾아 차단 사유를 보고한다.

## 다음 세션 후보 (순서대로)

1. 레슨 0004 — `continuity-auditor`를 실제 호출해 `example.md` 1~2장을 감사한다. 11개 영역을 직접 돌리고 `Findings`·`Held checks`·`Rejected candidates`를 분류한다.
2. 레슨 0005 — G05·G14·G16·G17을 읽고 `branch-patterns.html`의 가설 구조를 검증·반증한다.
3. 레슨 0006 — 장면 하나에 `SCENE` 검수를 붙이고, `narrative-gate-specialist`를 `GATE=<NN>`으로 스폰한 뒤 G28~G30 체인이 어디서 막히는지 직접 확인한다. 이 실습이 후보 스킬 P0의 필요를 몸으로 확인시키는 가장 좋은 경로다.

## 이번에 만들지 않은 것

- 연습용 샘플 scene card: 과제 A·B가 학습자가 직접 채우는 것이므로 정답을 미리 주지 않는다. 모범 답안은 0003의 `details` 안에만 있다.
- `reference/candidate-skills.html`의 `SKILL.md` 전문: 뼈대 하나와 후보별 필드 계약까지만 썼다. 착수할 때 그 후보만 전문을 쓰는 편이 낫다 — 쓰지 않을 스킬의 본문을 미리 쓰는 것은 낭비다.

## 세션 조정 메모

- 새 project skill은 **새 OMP 세션**에서 discovery해야 `/skill:<name>`으로 잡힌다(`.omp/NARRATIVE_REVIEW.md`의 Discovery note). 후보 스킬을 하나라도 만들면 세션을 다시 시작해 확인한다.
- 스킬 실행 연습은 `.outline/<RUN_ID>/`에 쓰고, 경로는 계약이 정한 산출 경로를 그대로 흉내 낸다(`outputs/workflow/<mode>.md` 등). 연습 산출물과 코스 산출물을 섞으면 `RUN_ID` 충돌과 인용 드리프트가 생긴다.
- `pnpm verify && pnpm build`는 스킬 실행이 아니라 캐논을 고칠 때만 의미가 있다. 학습 연습 중에는 돌리지 않는다 — 게이트가 경고를 내면 코스 때문인지 레포 때문인지 구분할 수 없다.
- **이 워크스페이스는 `biome check .` 범위 안에 있다.** `.outline/`은 `vcs.useIgnoreFile`로 빠지지만 `docs/`는 빠지지 않는다. CSS·JS·HTML을 추가하거나 고치면 `node_modules/.bin/biome check --write docs/learn`을 먼저 돌리고, `pnpm verify` 전에 `check`가 통과하는지 확인한다.

## 코스 개정 이력

- **v1 (세션 1)** — 레슨 0001~0003(실행 계약·라우팅·scene card), `skill-map.html`(입출력·권한 중심), `gate-index.html`, `branch-patterns.html`, `candidate-skills.html`, 용어집, 학습 기록 0001.
- **v2 (세션 1, 같은 날)** — 사용자 요청으로 강조점을 바꿨다. ① `skill-map.html`을 스킬별 **"왜 필요한가 / 가장 가까운 이웃과 무엇이 다른가"** 중심으로 재작성(맨 앞에 「3초 판정 — 증상에서 스킬로」 표 추가). ② `skill-pipeline.html` + `assets/skill-pipeline.svg` 신설 — 파이프라인 도식과 「제안 스킬이 앉는 자리」 표. ③ `candidate-skills.html`은 위치 표를 파이프라인 문서로 넘기고 근거·출력 계약·검증 방법에 집중(위치 정보를 두 곳에 두지 않는다).
- **v3 (세션 1, 같은 날)** — 사용자 요청("만들어줘")으로 **P0 넷을 실제로 착륙**시켰다. `.omp/skills/story-graph-compiler/`·`.omp/skills/route-replay-runner/`(+각 `references/`) 신설, `_baseline/common-contract.md` 가족 목록 등록, `remains-ledger-maintenance`에 `schema` 모드 추가, `narrative-gate-specialist`의 plan 전제 수정, `NARRATIVE_REVIEW.md`·`workflow-modes.md` 라우팅 갱신. 실행 검증: 원고 2장 → 그래프 컴파일 2회 바이트 동일, route 8개·step 24 실행 증거, 결함 주입 3종(schema-invalid·unsatisfiable-guard·unset-flag) 정상 검출. `pnpm verify`(248파일·501테스트)와 `pnpm build` 통과. 실행 중 발견한 계약 결함 하나(`no-terminal-defined` 분리)를 계약·참조·실행기 세 곳에 반영.
- 레슨 0001~0003은 v2에서 본문을 바꾸지 않았다. 그 셋은 "왜/차이"가 아니라 **운용**(계약 실행·라우팅·사양 작성)을 가르치고, 왜/차이는 참조 문서가 맡는 편이 낫다 — 레슨에 넣으면 운용 연습이 설명으로 밀린다.

## 열린 질문

1. 미션 파생이 맞는가? 특히 "스킬을 설계할 수 있게 되는 것"이 목표인지, "시나리오를 끝까지 쓰는 것"이 목표인지 — 후자를 앞세우면 레슨 순서를 0005·0006 먼저로 바꿔야 한다.
2. `docs/learn/`을 커밋할 것인가? 경로 자체는 정했다(「작업 공간 위치 결정」 참조). 남은 것은 커밋 시점과 단위다 — 코스 전체를 한 커밋으로 둘지, 레슨 단위로 나눌지.
3. ~~후보 스킬 P0를 지금 착수할 것인가~~ → **착륙했다(v3).** 다만 원고가 2장뿐이라 그래프가 작다. P1(`story-graph-architect`·`ending-set-architect`·`rewriter draft`)은 원고가 3~4장으로 늘어나야 검증 가치가 생긴다 — 지금 만들면 빈 그래프 위에서 도는 도구가 된다.
4. 착륙한 두 스킬을 다음 게이트 리뷰에 실제로 물릴 것인가? `narrative-ending-route-review`에 `replay-example-001`의 evidence를 인라인으로 넣어 mechanics가 `UNVERIFIABLE`에서 벗어나는지 확인하는 것이 다음 검증이다.
