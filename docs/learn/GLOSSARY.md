# 분기 서사 스킬 surface Glossary

이 코스가 쓰는 표준 어휘. 설명·연습·학습 기록은 전부 이 용어를 쓴다.

**이 용어집의 규칙.** 새 용어는 학습자가 그 용어를 올바르게 쓸 수 있게 된 뒤에 추가한다. 아래 항목은 예외가 아니다 — 전부 이 저장소의 계약·원장·스킬 문서가 이미 정의한 어휘라서 첫 세션부터 쓸 수밖에 없다. 이해가 깊어지면 그 자리에서 정의를 고친다.

## 작업 공간

**정본(canon)**:
프로토타입의 사실을 확정하는 두 파일 — `prototype/remains.json`과 `prototype/stories/example.md`. 이 둘에 없는 것은 설정이 아니다.
_Avoid_: 캐논, 설정집, 세계관 문서

**원장(ledger)**:
`prototype/remains.json`. 테마·세계관·인물·사건·연표를 담는 JSON 파일 하나.
_Avoid_: 설정 파일, 데이터베이스, DB

**발산 제안**:
`docs/ideation/*.md`에 있는 확정 전 후보. 읽기 전용이고, 정본과 달리 근거로 쓸 때 `[HYPOTHESIS]`로 취급한다.
_Avoid_: 아이디어 문서, 초안, 기획안

**RUN_DIR**:
`.outline/<RUN_ID>/`. 스킬 하나의 실행 전체가 사는 디렉터리. 입력 스냅샷, manifest, 산출물이 여기 들어간다.
_Avoid_: 출력 폴더, 작업 폴더, tmp

**RUN_ID**:
`[A-Za-z0-9_-]+`만 허용되는 실행 식별자. 이미 존재하면 덮어쓰지 않고 `input-blocked`다.
_Avoid_: 실행 번호, 세션 ID

**manifest**:
`RUN_DIR/inputs/manifest.json`. 읽은 입력마다 `runId`·`role`·`relativePath`·`sha256`·선택적 `sourceVersion`을 기록한 목록.
_Avoid_: 인덱스, 로그

**지문(fingerprint)**:
산출물이나 정본의 SHA-256. `Reviewed commit`·`Reviewed artifact SHA-256`·`Reviewed compiled-content SHA-256` 꼴로 쓴다. 지문이 다르면 판정을 이어받지 않는다(`stale-fingerprint`).
_Avoid_: 해시값, 체크섬, 버전

## 사실과 지식

**사실 범주**:
`[FACT]`(정본에서 확인) · `[INFERENCE]`(확인된 사실에서 추론) · `[HYPOTHESIS]`(새 제안, 승격 금지) · `[CONFLICT]`(기존 설정과 모순) 네 가지. 모든 주장에 붙는다.
_Avoid_: 신뢰도, 확실성 등급

**지식 3층**:
작가 지식 · 독자 지식 · 인물 지식. 같은 사실이 세 주체에게 다르게 알려진다. 인물이 모르는 사실을 그 인물의 판단 근거로 쓰면 `knowledge-leak`이다.
_Avoid_: 정보 레벨, 시점 정보

**Layer 1 / 2 / 3**:
정보 공개 구조. Layer 1은 기본 정보, Layer 2는 조건부로 얻는 정보, Layer 3는 앞의 둘을 연결해 의미가 재해석되는 정보. G19가 검사한다.
_Avoid_: 1차/2차/3차 정보

**비공개 필드**:
원장에서 초반에 공개하지 않기로 한 항목. 현재 셋 — 루의 `hiddenIdentity`, 강두식의 `secretCausality`, 최 반장의 `hiddenActivity`.
_Avoid_: 비밀 설정, 스포일러

**조기 노출(EARLY_DISCLOSURE)**:
비공개 정보가 공개 시점 전에 원고에 나온 위반 유형. `continuity-auditor`가 따로 표시한다.
_Avoid_: 스포일러, 유출

## 판정과 게이트

**사람 게이트**:
사람의 명시적 승인 없이 다음 단계로 넘어갈 수 없는 10개 지점. 침묵·추정·산출물의 존재는 승인이 아니다.
_Avoid_: 결재, 승인 절차, 리뷰

**게이트(G01~G30)**:
G01~G27은 전문 리뷰 하나씩(`narrative-gate-specialist`, `GATE=<NN>`), G28은 점수 종합, G29는 등급·출시 준비도, G30은 30개 게이트 보고서 조립.
_Avoid_: 체크리스트, 검사 항목, 루브릭

**판정(Status)**:
`PASS | FAIL | UNVERIFIABLE`뿐이다. 해결되지 않은 Critical/Major가 있으면 `FAIL`, 핵심 근거가 없으면 `UNVERIFIABLE`.
_Avoid_: 결과, 통과 여부, 판단

**심각도(severity)**:
`Critical | Major | Minor`. `Minor`는 `PASS`와 공존할 수 있고 `Required revisions`에 남는다.
_Avoid_: 중요도, 우선순위, 등급

**상류(authoring) surface / 검수(review) surface**:
상류는 후보·설계·진단까지만 내고, 검수는 점수·등급·출시 준비도를 낸다. 같은 대상에서 판정이 갈리면 검수를 신뢰한다.
_Avoid_: 작성팀/검수팀, 1차/2차

## 장면과 분기

**scene card**:
`scene-architect`가 만드는 장면 사양서. 진입·종료 상태, 목표 3개, 정보 공개, beats, turn, 선택지 4필드, `next_question`을 담는다. 산문이 아니다.
_Avoid_: 장면 기획서, 시놉시스, 개요

**beat**:
`원인 → 인물 행동 → 상대 반응 → 결과` 네 요소를 다 채운 한 단위. 결과가 다음 beat의 원인이 된다. 순서를 섞어도 성립하면 beat가 아니다.
_Avoid_: 비트, 사건, 단락

**turn**:
장면에서 기대가 뒤집히는 한 지점. beats 4~8번째에 두고, 뒤에 결과를 확인하는 beat를 남기며, `exit_state`를 바꿔야 한다.
_Avoid_: 반전, twist, 전환점

**가짜 선택(fake choice)**:
두 선택지의 구별되는 즉시 결과가 수렴하거나, 다음 상태가 같거나, 한쪽에 대가가 전혀 없는 상태. 선택이 장식이 된다.
_Avoid_: 의미 없는 선택, 장식적 선택

**선택지 4필드**:
`이유`(인물이 아는 사실만) · `보이는 위험`(선택 시점에 인식 가능) · `구별되는 즉시 결과`(시간·자원·관계·정보 중 최소 하나가 다름) · `다음 상태`(다음 장면의 `entry_state`).
_Avoid_: 선택지 스펙, 옵션 정보

**수렴점(bottleneck)**:
갈라진 분기가 다시 만나는 노드. 합류 뒤 이전 선택이 인물·조건·해결을 바꾸지 않으면 수렴점은 선택을 지운다(G05).
_Avoid_: 합류 지점, 병목, 머지

**앵커(anchor)**:
엔딩이나 경로를 실제로 식별하는 위치. replay 이유와 앵커가 짝을 이뤄야 G02·G17이 근거를 갖는다.
_Avoid_: 결말 표시, 태그

**runtime evidence**:
그래프를 실제로 실행해 얻은 기록 — 노드 방문 순서, 평가된 guard, 세워진 flag, 도달한 terminal. 수동으로 guard를 읽은 것은 evidence가 아니다.
_Avoid_: 실행 로그, 플레이 기록

**story-graph**:
정본·scene card·원고에서 컴파일한 기계 형식의 이야기 그래프. 노드·선택지·`requires`·`effects`·앵커·route를 담고, 같은 입력이면 같은 바이트가 나온다.
_Avoid_: 플로우차트, 분기도, 스토리맵

**open-edge**:
다음 장면이 아직 작성되지 않아 `next`가 비어 있는 간선. 결함이 아니라 미완성 표시이고, 그 route는 `incomplete`가 된다. 아직 쓰지 않은 것과 도달할 수 없는 것을 섞지 않는다.
_Avoid_: 끊긴 링크, 미구현 분기, 데드엔드

**재플레이 동기 A~G**:
G17이 0~5점으로 채점하는 일곱 축 — A 다른 엔딩 · B 선택 결과 · C 인물 관계·삶 · D 숨은 진실 · E 다른 루트 · F 놓친 콘텐츠 · G 의미 변화. 미평가가 있으면 합계를 보류한다.
_Avoid_: 재플레이 점수, 리플레이 지수
