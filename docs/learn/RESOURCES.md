# 분기 서사 스킬 surface Resources

이 코스의 설명은 두 종류의 출처에서만 끌어온다: **이 저장소의 정본**(스킬 계약·게이트 루브릭·원장·원고)과 **외부의 1차 자료**(분기 서사 구조 이론, 스크립팅 도구 문서). 파라메트릭 기억을 주 출처로 쓰지 않는다.

모든 항목은 2026-09-13에 링크를 직접 열어 확인했다.

## Knowledge

### 프로젝트 정본 (1차 출처)

- [`.omp/skills/_baseline/common-contract.md`](../../.omp/skills/_baseline/common-contract.md)
  계약 가족 11개 스킬이 복사해 쓰는 계약의 단일 소스. RUN_DIR 격리, manifest 스키마, 사실 범주, 지식 3층, 판정 어휘, 사람 게이트가 여기 있다. **Use for:** 스킬 산출물을 읽을 때, 새 스킬 뼈대를 쓸 때.
- [`tools/skills/contract-drift.test.ts`](../../tools/skills/contract-drift.test.ts)
  계약 복사본이 기준과 어긋나면 `pnpm test`를 실패시킨다. 자립 실행과 단일 소스의 긴장을 이 레포가 어떻게 처리했는지 보여주는 유일한 예시. **Use for:** 새 스킬을 계약 가족에 넣을 때, 드리프트를 어떻게 막는지 배울 때.
- [`.omp/NARRATIVE_REVIEW.md`](../../.omp/NARRATIVE_REVIEW.md)
  서사 surface 전체 지도. 라우팅 라벨(SCENE·ENDING_ROUTE·MULTI_ENDING·GATE_SPECIALIST·SYNTHESIS), 상류 vs 검수 권한 경계, 10개 사람 게이트, 은퇴 슬러그 이력. **Use for:** "이 작업을 어디에 위임하는가"를 정할 때.
- [`.omp/narrative-gate-rubrics.md`](../../.omp/narrative-gate-rubrics.md)
  G01~G27의 제목·호출 상황·핵심 질문·Required output. **Use for:** 게이트 리뷰를 읽거나 스폰할 때, 게이트가 실제로 무엇을 묻는지 확인할 때.
- [`.omp/skills/novel-workflow/SKILL.md`](../../.omp/skills/novel-workflow/SKILL.md) + [`references/workflow-modes.md`](../../.omp/skills/novel-workflow/references/workflow-modes.md)
  다섯 모드(ideation·character-test·scene-design·draft-review·revision)의 단계·담당·게이트 표. **Use for:** 요청 하나를 작업 계획으로 바꿀 때.
- [`.omp/skills/scene-architect/SKILL.md`](../../.omp/skills/scene-architect/SKILL.md) + [`references/beat-grammar.md`](../../.omp/skills/scene-architect/references/beat-grammar.md)
  scene card 17필드, beat 4요소, turn 규칙, 목표 3분리, 선택지 4필드, 가짜 선택 판정, `continuity_risk` 표기. **Use for:** 장면을 사양서로 설계할 때. 이 코스에서 가장 자주 다시 본다.
- [`.omp/agents/narrative-rewriter.md`](../../.omp/agents/narrative-rewriter.md)
  본문 재작성 전담 에이전트. 0계층(시점: `* * *` 블록 경계, 1인칭 지문 제약)과 1계층(무자각 원칙 5개, AI 문체 금지 7개)이 자기완결적으로 박혀 있다. **Use for:** 원고 문장을 고칠 때, 문체 규칙의 실제 목록이 필요할 때.
- [`.omp/agents/narrative-gate-specialist.md`](../../.omp/agents/narrative-gate-specialist.md)
  `GATE=<NN>` 단일 파라미터 에이전트. 메모 계약 11필드, 공통 상태 규칙, boundary. **Use for:** 게이트 하나를 독립 리뷰할 때.
- [`AGENTS.md`](../../AGENTS.md) — 「프로토타입 원장」 절, 「Content」 절
  원장 유지 규칙과 레포 전체 계층 규칙. **Use for:** 어떤 파일을 어떤 스킬만 쓸 수 있는지 판단할 때.
- [`prototype/remains.json`](../../prototype/remains.json)
  테마·세계관·인물·연표 원장. 비공개 필드(`ru.hiddenIdentity`, `banjang.hiddenActivity`, `dusik.secretCausality`)와 `narrativeRules.characterVoice.status: "별도 규칙 필요"`가 들어 있다. **Use for:** 모든 사실 판정의 기준.
- [`prototype/stories/example.md`](../../prototype/stories/example.md)
  현재 원고 2장. 1인칭, `**문장 (S)**` + `- **이름** — 선택` 선택지 관례. **Use for:** 장면·선택지 연습의 실제 재료.

### 외부 지식

- [Article: "Standard Patterns in Choice-Based Games" — Sam Kabo Ashwell](https://heterogenoustasks.wordpress.com/2015/01/26/standard-patterns-in-choice-based-games/)
  분기 구조의 사실상 표준 분류: Time Cave, Gauntlet, Branch and Bottleneck, Quest, Open Map, Sorting Hat, Floating Modules, Loop and Grow(+ spoke and hub). 각 패턴의 **작성 비용과 플레이 감각**을 함께 설명한다. **Use for:** 분기 형태를 고를 때, 왜 한 구조가 조합 폭발로 무너지는지 설명할 때.
- [Article: "Small-Scale Structures in CYOA" — Emily Short](https://emshort.blog/2016/11/05/small-scale-structures-in-cyoa/)
  큰 구조가 아니라 *한 선택지 묶음* 수준의 미시 구조를 다룬다. Ashwell의 상위 패턴과 짝을 이룬다. **Use for:** 선택지 개수·밀도·배치를 정할 때.
- [Article: "By the Numbers: How to Write a Long Interactive Novel That Doesn't Suck" — Dan Fabulich (Choice of Games)](https://www.choiceofgames.com/2011/07/by-the-numbers-how-to-write-a-long-interactive-novel-that-doesnt-suck/)
  조합 폭발을 숫자로 보여준다: 페이지마다 2지선다면 7페이지 분량에 128페이지, 8페이지면 256페이지, 20페이지면 100만 페이지. 해법으로 **지연 분기(delayed branching)** 와 수치 stat을 제시한다. **Use for:** 분기 예산을 말로 얼버무리지 않고 계산할 때.
- [Paper: "Towards a Theory of Choice Poetics" — Mawhorter, Mateas, Wardrip-Fruin, Jhala (FDG 2014)](http://www.fdg2014.org/papers/fdg2014_paper_19.pdf)
  선택을 goals/options/outcomes로 분해하고, 왜 거짓 선택이 평평하게 느껴지는지 formalism으로 설명한다. **Use for:** 선택지 설계를 취향이 아니라 분석으로 방어할 때.
- [Paper: "Choice Poetics by Example" — Mawhorter, Zegura, Gray et al. (Arts 7(3):47, 2018)](https://www.mdpi.com/2076-0752/7/3/47)
  앞 논문을 실제 게임 분석에 적용한 사례 연구. **Use for:** 선택이 플레이어 심리(공모·죄책감)를 만드는 방식을 예시로 볼 때. 논문이지 실증 연구는 아니므로 효과 크기 근거로 쓰지 않는다.
- [Documentation: "Writing with Ink" — inkle](https://github.com/inkle/ink/blob/master/Documentation/WritingWithInk.md)
  분기 서사를 텍스트로 쓰는 스크립트 언어의 실제 명세: knot/stitch, divert, sticky choice(`+`) vs 소비되는 choice(`*`), weave로 합류 지점을 코드로 표현하는 방법, 조건부 텍스트. **Use for:** "합류"와 "가드"를 산문이 아니라 기계가 읽는 형태로 어떻게 쓰는지 감을 잡을 때.
- [Documentation: Yarn Spinner](https://docs.yarnspinner.dev/)
  node / `<<set $flag>>` / `<<jump>>` / 조건문 / VS Code 확장의 노드 그래프 시각화. **Use for:** 가드·효과·노드 개념을 엔진 중립적으로 볼 때.
- [Presentation: "The Secrets of Baldur's Gate 3" — Swen Vincke (GDC)](https://gdcvault.com/play/1034610/The-Secrets-of-Baldur-s)
  대규모 분기에서 스프레드시트로 flag·prerequisite 상태를 추적하고, 플레이테스트로 논리 파손 지점을 찾는 실제 공정. **Use for:** 분기가 커졌을 때 무엇이 먼저 무너지는지(추적 문서) 볼 때.
- [Article: "Storylets: You Want Them" — Emily Short](https://emshort.blog/2019/11/29/storylets-you-want-them/)
  Floating Modules 계열을 실제로 굴리려면 필요한 상태·가용성 설계. **Use for:** 모듈형 사건을 검토할 때.

## Wisdom (Communities)

- [intfiction.org](https://intfiction.org/)
  인터랙티브 픽션 설계·구현 포럼. 분기 조언 스레드가 실제로 활동 중이다(예: "Advice for designing branching passages"). **Use for:** 구조 선택에 대한 반대 의견, 실제 작품 사례.
- [Choice of Games Forum](https://forum.choiceofgames.com/)
  지연 분기·stat 설계를 실무 규모로 다루는 작성자 커뮤니티. ChoiceScript 공식 문서가 함께 있다. **Use for:** 장편 분기 소설의 분량·분기 예산 감각.
- 이 코스의 리뷰어: **사람**. 이 레포는 선택·승인·판정을 사람이 한다고 계약에 못박았다(`common-contract.md`). 이 코스에서는 그 사람이 곧 학습자다.

## Gaps

- **런타임 리플레이 증거 — 부분 해소 (2026-09-13).** `route-replay-runner`가 그래프 실행 증거를 만든다. 다만 그것은 **그래프 실행**이지 게임 엔진 실행이 아니다(`.omp/skills/route-replay-runner/references/evidence-schema.md`의 `evidenceKind: graph-execution`). 엔진이 생기기 전까지 검수 계약이 요구하는 runtime evidence와 이 증거를 동일시하지 않는다.
- **route·anchor 스키마 — 해소 (2026-09-13).** `.omp/skills/story-graph-compiler/references/graph-schema.md`가 노드·선택지 ID, `requires`·`effects`, 앵커, route, 정규 순서를 정의한다. **남은 공백:** "compiled content"가 엔진이 굽는 산출물을 뜻한다면 그 형식은 아직 없다.
- **`최종 검토 스키마` 부재.** `narrative-score-synthesis`와 `narrative-report-assembly`가 "18개 공식 점수 키"를 요구하지만, 그 키의 정확한 표기가 있다는 "최종 검토 스키마" 파일이 저장소에 없다(`narrative-report-assembly/SKILL.md:58`). 현재 유일한 열거는 `narrative-score-synthesis/SKILL.md:45`의 primary owner map 18개다.
- **`.outline/sdd/plan.md` 부재 — 완화 (2026-09-13).** 파일은 여전히 없다. 대신 `narrative-gate-specialist`가 plan 부재 시 제약을 **추론하지 않고** `Limitations`에 `Global Constraints: 판단 자료 부족`을 적도록 바뀌었다. 남은 선택: 계획 파일을 정본 경로에 만들지, 매 호출 인라인으로 넘길지.
- **4인 voice 규칙 정본 없음.** 원장이 스스로 "별도 규칙 필요"로 비워 두었다(`prototype/remains.json` → `narrativeRules.characterVoice`). 그 결과 `dialogue-variator`는 voice를 `[HYPOTHESIS]`로만 다룬다.
- **한국어 분기 서사 설계 자료.** 위 외부 자료는 전부 영문이다. 국내 자료는 게임 기획 일반론이 대부분이라 이 코스의 Knowledge에 넣지 않았다. 필요하면 별도 조사가 필요하다.
- **구버전 산출물의 인용 드리프트.** `docs/ideation/world-situations-20.md`는 `prototype/storyline.md`와 `prototype/remains.md`를 근거로 인용하는데 두 파일은 현재 없다(각각 `stories/example.md`, `remains.json`으로 대체됨). 자료 자체는 발산 기록이므로 고치지 않지만, 인용을 근거로 쓰면 안 된다.
