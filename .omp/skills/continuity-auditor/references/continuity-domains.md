# 연속성 검사 도메인

`continuity-auditor`의 절차 2단계에서 로드한다. 11개 영역의 검사 질문, 영역별 오탐 방지 기준, 지식 3층 스키마, 프로젝트 비밀 정보 적용 예, 심각도 사다리, `suggested_check` 작성 형식을 담는다. 근거는 원장 키 경로와 장면 제목으로 적고, 근거가 확인되지 않은 항목은 단정하지 않는다.

앵커 규칙: 판정의 앵커는 장면 제목(`## N. 제목`)과 `prototype/remains.json`의 키 경로다. 행 번호는 쓰지 않는다 — 원고는 개정될 수 있으므로 위치는 장면 제목으로 고정한다.

## 검사 영역 11개

### TIMELINE
- 원고의 시각·경과 시간·사건 순서가 원장 `chronology`와 같은가?
- `7년 전`, `도래 후 6년 6개월`, `6개월 전` 같은 상대 시점을 같은 기준점에서 계산했는가?
- 서술자가 장면에서 확인하지 않은 경과 시간을 이미 아는 사실처럼 말하지 않는가?
- **오탐 방지:** 원장의 `시점 미지정` 항목과 서술자의 불확실 표현(`아마`, `얼마 안 있어`)은 모순이 아니다.

### LOCATION
- 같은 시각에 한 인물이 두 장소에 있지 않은가?
- 장소의 구조·거리·출입 조건이 장면마다 같은가? (예: 회사 건물 삼 층 창가, 관악구 현장)
- 이동에 필요한 시간이 서술에서 생략된 것인지 불가능한 것인지 구분했는가?
- **오탐 방지:** 이동 장면 생략은 서술 생략이지 모순이 아니다. 원고가 밝히지 않은 지형·배치를 원장에 있다고 가정하지 않는다.

### KNOWLEDGE
- 인물이 알 수 없는 사실을 판단 근거나 대사로 쓰지 않았는가?
- 그 사실이 작가 지식·독자 지식·인물 지식 중 어느 층인지 표시했는가?
- 비공개 정보가 공개 예정 시점보다 이른 장면에서 노출되지 않았는가?
- **오탐 방지:** 1인칭 서술자가 모르는 사실을 추측한 것은 지식 위반이 아니라 추측 표시 대상이다. 인물의 오해는 모순이 아니라 상태다.

### INVENTORY
- 장비·소지품(헬멧, 무전기, 긴급구조 키트, 장비차, 드론)의 획득과 사용 순서가 장면과 맞는가?
- 선택지에서 챙기지 않은 물건이 이후 장면에서 사용되지 않는가?
- 사람 수·장비 수·소모량이 장면 사이에 근거 없이 변하지 않는가?
- **오탐 방지:** 원고가 수량을 밝히지 않은 물건을 임의의 확정 수량으로 계산해 위반을 만들지 않는다.

### PHYSICAL_STATE
- 부상·피로·복장 상태가 근거 없이 회복되거나 악화되지 않는가?
- 신체 능력의 한계가 장면마다 일정한가? (회사 인력과 히어로, 히어로와 괴수의 관계)
- 괴수·잔당의 신체 상태 변화에 서술된 원인이 있는가?
- **오탐 방지:** 서술되지 않은 치료와 생략된 회복 시간은 모순이 아니다.

### RELATIONSHIP
- 호칭(`사장님`, `반장`, 이름)과 관계 설정이 장면마다 같은가?
- 관계의 변화에 원인이 되는 장면이 있는가?
- 인물이 서로를 아는 범위가 원장의 공개 정보와 맞는가?
- **오탐 방지:** 장면 밖에서 일어난 관계 변화는 `UNVERIFIABLE`이며 모순이 아니다.

### WORLD_RULE
- 원장 `settings.association`의 등급·등록·청구·문서 규칙이 원고 서술과 맞는가?
- 원장 `settings.company`의 임무 범위(`coreMission`, `combatPosition`)를 벗어난 활동이 없는가?
- 괴수 잔당의 행동 원칙(`behavior`: 먼저 공격하지 않는다)이 지켜지는가?
- **오탐 방지:** 원장에 없는 규칙을 새로 가정해 위반을 만들지 않는다. 새 규칙은 `[HYPOTHESIS]`이며 위반 판정 근거가 아니다.

### IDENTITY
- 공개 신분과 비공개 신분의 취급이 장면마다 같은가? (루, 시퍼, 루시퍼)
- 같은 대상을 가리키는 이름 표기가 독자·인물의 지식 수준에 맞게 갈리는가?
- 신분 공개 시점이 원장 `originTimeline`, `separation`의 단계와 맞는가?
- **오탐 방지:** 인물이 모르는 신분 관계를 독자에게만 보여주는 연출은 모순이 아니다. 반대로 독자에게도 감춘 것을 인물이 아는 것처럼 쓰면 위반이다.

### POV
- 장면의 시점 인물이 도중에 바뀌지 않는가?
- 시점 인물이 관찰할 수 없는 정보를 서술하지 않는가?
- 인물의 내면 서술과 외부 관찰이 구분되는가?
- **오탐 방지:** 서술자가 의도적으로 `모른다`고 적는 제한은 결함이 아니다. 1인칭 서술에서 타인의 내면을 단정하는 경우만 후보로 삼는다.

### FORESHADOWING
- 심어진 복선이 회수 장면 없이 사라지지 않는가? (미회수)
- 회수 장면 뒤에 새로 심은 요소를 이미 회수된 복선처럼 다루지 않는가? (미복선)
- 복선의 강도와 회수의 규모가 맞는가?
- **오탐 방지:** `docs/ideation/`의 발산 후보는 복선이 아니다. 미회수 복선은 `open` 상태이며 그 자체로 `FAIL` 근거가 아니다.

### PROMISE_PAYOFF
- 선택지가 약속한 결과가 후속 장면에서 다뤄지는가? (예: 긴급구조 키트 미탑재 뒤의 구조 요청 절차)
- 장면이 세운 기대(마감, 청구, 책임)가 등장만 하고 해소되지 않는가?
- 약속과 회수의 짝이 같은 분기 경로 안에서 성립하는가?
- **오탐 방지:** 아직 작성되지 않은 후속 장면은 `UNVERIFIABLE`이며 이탈이 아니다. 다른 분기의 회수 장면을 이 분기의 근거로 쓰지 않는다.

## 지식 3층 모델 스키마

- `fact_id`: 검사 범위에서 고유한 식별자. 예: `ru.hiddenIdentity`.
- `truth`: 원장 기준 사실과 사실 범주(`[FACT]`/`[INFERENCE]`/`[CONFLICT]`).
- `author_knows`: 작가가 아는가(`true`/`false`). 원장에 기록된 사실은 `true`.
- `reader_knows_from_scene`: 독자가 그 사실을 알게 되는 장면 제목. 아직 모르면 `null`.
- `characters.<id>.knows`: 인물별 지식 상태(`true`/`false`/`partial`/`unknown-time`).
- `characters.<id>.learned_from`: 그 인물이 알게 되는 장면 제목. 모르면 `null`.
- `characters.<id>.evidence`: 그 인물이 실제로 접한 단서의 장면 제목 목록.
- 검증 규칙: `characters.*.knows`가 `true`면 `evidence`가 있어야 하고, `reader_knows_from_scene`은 실제로 그 사실을 드러내는 장면이어야 한다. `knows`가 `false`인 인물의 대사·판단에는 그 사실을 근거로 쓰지 않는다.
- 값 출처 규칙: `true`/`false`는 원장에 기록된 경우에만 쓴다. 원장에 기록이 없으면 `미기재`로 두고 그 사실을 `Held checks`에 올린다. 원장 미기재를 `false`로 단정해 지식 위반을 만들지 않는다.
- `EARLY_DISCLOSURE` 판정: `reader_knows_from_scene`이 공개 예정 장면보다 앞서면 조기 노출이다.

## 프로젝트 비밀 정보 적용 예

### 1. `ru.hiddenIdentity` — 루는 도래한 괴수의 일부다
- `truth`: `[FACT]` (`settings.characters.ru.hiddenIdentity`).
- `author_knows: true`, `reader_knows_from_scene: null`(초반 미공개), `characters.ru.knows: true`(`settings.characters.ru.knowledge.knowsOriginalIdentityFromStart`), 나머지 세 인물의 지식은 원장 미기재이므로 `미기재`로 두고 `Held checks` 대상으로 기록한다.
- 적용: `루시퍼`라는 이름 자체는 6개월간 뉴스에 노출된 공개 정보다(`settings.characters.ru.publicExposure`). 그러나 루가 그 일부라는 연결은 비공개다. 초반 장면의 서술자가 이 연결을 확정 서술하면 `EARLY_DISCLOSURE`다.
- 별도 기록: 루가 강두식의 히어로 이력을 아는 시점은 `knowsDusikWasTheHeroInitially: false`, `realizesDusikIdentity: 이야기 중에 알아차린다`(`settings.characters.ru.knowledge.knowsDusikWasTheHeroInitially`, `settings.characters.ru.knowledge.realizesDusikIdentity`)로 고정되어 있다.

### 2. `banjang.hiddenActivity` — 최 반장의 별도 감시 보고서
- `truth`: `[FACT]` (`settings.characters.banjang.hiddenActivity`). 초반에는 공개되지 않는다.
- `author_knows: true`, `reader_knows_from_scene: null`, `characters.banjang.knows: true`, 나머지 세 인물의 지식은 원장 미기재이므로 `미기재`로 두고 `Held checks` 대상으로 기록한다.
- 적용: 초반 장면에서 다른 인물이 이 보고서를 언급하거나 서술자가 단정하면 `KNOWLEDGE` 또는 `EARLY_DISCLOSURE` 후보다. 최 반장의 행동을 `협회 지시 이행`으로만 서술한 장면은 모순이 아니라 감춤이다.

### 3. `dusik.secretCausality` — 강두식과 루시퍼의 분리 인과
- `truth`: `[FACT]` (`settings.characters.dusik.secretCausality`, `chronology`). 6개월 전 진압 과정에서 강두식이 루시퍼와 싸운 결과 루와 시퍼로 분리되었다.
- `author_knows: true`, `reader_knows_from_scene: null`(초반 미공개), `characters.ru.knows: 미기재`, `characters.dusik.knows: unknown-time`, `characters.banjang.knows: unknown-time`, `characters.taesan.knows: unknown-time`.
- 별개 사실 주의: 루가 강두식의 히어로 이력을 모르는 것은 `ru.knowsDusikWasTheHeroInitially: false`(`settings.characters.ru.knowledge`)로 기록된 다른 사실이다. 이 인과에 대한 루의 지식과 섞지 않는다.
- 적용: 원장에 없는 지식 상태를 `false`로 단정하지 않는다. `unknown-time`은 위반 판정 근거가 아니라 `suggested_check` 대상이다. 강두식의 퇴역·부채 이력(`settings.characters.dusik.financialStatus`, `settings.characters.dusik.heroHistory`)과 이 인과를 같은 사건으로 묶는 서술은 `[INFERENCE]`로 표시한다.

## 심각도 사다리

- `Critical`: 확정된 시점·인과·신분을 뒤집어 이후 장면의 전제를 무효화한다. 예: 6개월 전 분리 사건을 다른 시점에 일어난 일로 서술, 공개되지 않은 신분을 처음부터 공개된 것으로 서술.
- `Major`: 두 장면이 같은 대상에 다른 값을 말하고, 원장으로 어느 쪽이 확정인지 판정할 수 있다. 예: 소지품, 등급, 호칭, 장소 구조.
- `Minor`: 표기·거리·표현 수준의 어긋남으로 한 장면 제목.
- 판정: `open`인 Critical 또는 Major가 하나라도 있으면 `FAIL`, `Minor`만 남거나 모두 `resolved`면 `PASS`, 입력 근거가 부족하면 `UNVERIFIABLE`.

## 반복 경고 대상 (연속성 판정 제외)

- 다음 패턴은 연속성·설정 모순이 아니므로 이 스킬의 finding으로 만들지 않는다. 발견하면 `참고`에 반복 경고로만 남긴다.
- 갑작스러운 비밀 조직, 숨겨진 혈통, 구원할 운명, 알고 보니 가족, 기억상실, 주인공도 괴물, 마지막 순간의 희생, 단일 악역.
- 이 패턴들을 금지 설정으로 기록하지 않는다. 원장 항목과 직접 충돌할 때만 11개 영역 중 해당 영역으로 판정한다.

## suggested_check 작성 형식

- 형식: 동사로 시작하는 한 문장 + 확인 대상 앵커(원고 장면 제목 또는 원장 JSON 키 경로) + 확인할 값 + 기대 판정.
- 예: `settings.company.playerAddress`와 원고 「2. 긴급 피해 조사 명령」의 `사장님` 호칭이 같은지 사람이 확인한다.
- 금지: 수정 지시(`고친다`, `바꾼다`), 대체 문장 제시, 한 줄에 둘 이상의 검사 묶기.
