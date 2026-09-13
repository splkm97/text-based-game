# Mission: 분기 서사 스킬 surface 운용과 확장

## Why

이 저장소의 프로토타입(괴수 도래 이후 도시재건 토목회사의 젊은 CEO 텍스트 분기 게임)은 2026-09-13 기준 18개 스킬과 2개 에이전트, 30개 검수 게이트로 구성된 서사 파이프라인을 갖고 있다(코스 시작 시점에는 16개였다). 문제는 이 파이프라인이 *아직 시나리오를 끝까지 만들지 못했다*는 것이다. 원고는 `prototype/stories/example.md`의 2장까지이고, 검수 스킬들이 요구하는 route manifest·anchor는 P0 착륙으로 생산자가 생겼고, runtime evidence는 그래프 실행 수준까지, ending set은 아직 없다.

이 코스의 목적은 스킬 목록을 외우는 것이 아니다. 요청 하나를 받아 **모드·담당 스킬·사람 게이트로 분해하고**, 각 스킬을 계약대로 실행해 산출물을 읽고, 파이프라인에서 **빠진 스킬을 스스로 설계해 추가할 수 있게** 되는 것이다. 그 결과로 이 프로토타입의 분기 시나리오를 캐논을 깨지 않고 끝까지 쓸 수 있게 된다.

## Success looks like

- 요청 하나를 `novel-workflow`의 다섯 모드 중 하나로 분류하고, 단계 표(담당·입력·산출·게이트)를 직접 쓴다.
- 계약 가족 11개 스킬 중 아무거나 하나를 호출해 `.outline/<RUN_ID>/inputs/manifest.json`과 `outputs/` 산출물을 읽고, `PASS|FAIL|UNVERIFIABLE` 판정과 심각도를 해석한다.
- 원고 구간에서 1인칭 정보 경계 위반을 원장 근거로 지목한다 — 후보 비공개 필드는 루의 `hiddenIdentity`, 최 반장의 `hiddenActivity`, 강두식-루시퍼 분리 인과다.
- G05·G14·G16·G17·G19가 각각 무엇을 요구하는지 말하고, G28→G29→G30 체인이 왜 그 순서인지, 어떤 입력이 없으면 막히는지 설명한다.
- 새 스킬 후보를 `_baseline/common-contract.md`의 공통 계약에 맞는 `SKILL.md` 뼈대로 쓴다 — RUN_DIR 격리, 사실 범주, 판정 어휘, 사람 게이트를 포함해.
- `pnpm verify && pnpm build`가 경고 없이 통과하는 상태를 깨지 않고 작업한다.

## Constraints

- 학습 산출물은 커밋 가능한 경로 `docs/learn/`에 둔다. 교수 계약이 롤백을 버전 관리에 의존하므로 무시된 경로(`.outline/`, `.gitignore:5`)에는 영속 자료를 두지 않는다. 스킬 실행 산출물(`RUN_DIR`)만 계약대로 `.outline/<RUN_ID>/`에 쓴다.
- 모든 연습은 **읽기 전용**이다. `prototype/remains.json`·`prototype/stories/example.md`·`docs/ideation/`을 고치지 않는다. 승인된 캐논 변경만 `remains-ledger-maintenance`가 수행한다.
- 명령은 Node 24에서 실행한다(`.nvmrc`). Vitest 5가 Node 25를 거부하고 `engine-strict`가 설치를 막는다.
- 스킬 실행 연습은 `.outline/<RUN_ID>/`에만 쓰고, 이미 존재하는 `RUN_ID`는 재사용하지 않는다.
- 세션은 짧게 끊어 진행한다. 각 레슨 뒤 인출 연습에 답한 뒤 다음 레슨으로 간다.

## Out of scope

- 엔진·컴파일러·리플레이 하네스의 실제 구현(`src/`, `tools/` 코드 수정).
- 게임 UI·에셋·사운드, 배포, 서비스 워커.
- 마케팅·스토어 문안, 번역.
- `모험가 이야기`·`정적의 항로` 세계의 콘텐츠 확장. 이 코스는 프로토타입 원장 하나만 다룬다.
- G01~G27 게이트 자체의 루브릭 개정. 이 코스는 게이트를 *읽고 해석*하는 법까지만 간다.
