# 내러티브 게이트 루브릭 G01~G27

`narrative-gate-specialist` 에이전트가 `GATE=<NN>` 입력으로 담당 게이트의 판정 범위를 찾을 때 읽는다. 공통 상태 규칙·메모 계약·boundary는 에이전트 파일에 있고, 이 문서에는 게이트 고유 내용만 둔다.

이 문서는 `Fold narrative-g01..g27 into narrative-gate-specialist` 이전의 게이트 에이전트 파일 27개와 `NARRATIVE_REVIEW.md`의 게이트 표에서 옮긴 내용이다. 에이전트 파일에서 파라미터화된 두 줄(게이트 라벨, 산출 경로 문장)만 제목·표 열과 `<GATE>` 경로 규칙으로 흡수되었고, 그 밖에 버려진 항목은 없다.

## 게이트 색인

| Gate | 제목 | 호출 상황 | 핵심 질문 | 산출 파일 |
|---|---|---|---|---|
| `G01` | 첫 회차 경험 | 전체 첫 회차 구조가 안정된 후 | Hook·중반 긴장·절정 축적이 작동하는가? | `RUN_DIR/outputs/G01.md` |
| `G02` | 재플레이 가치 | 여러 route와 결과가 실행된 후 | 첫 엔딩 뒤 다시 할 실제 이유가 남는가? | `RUN_DIR/outputs/G02.md` |
| `G03` | 진엔딩 의미 | 진엔딩·일반 엔딩이 모두 작성된 후 | 진엔딩이 단순 행복 보상이 아닌가? | `RUN_DIR/outputs/G03.md` |
| `G04` | 선택의 실제 대가 | 주요 선택과 후속 state가 구현된 후 | 선택이 장기 결과와 대가를 만드는가? | `RUN_DIR/outputs/G04.md` |
| `G05` | 분기와 교차 인과 | 전체 선택 tree가 존재한 후 | 분기와 합류가 실제 사건 차이를 만드는가? | `RUN_DIR/outputs/G05.md` |
| `G06` | 인물 욕망과 변화 | 주요 인물 장면과 route가 작성된 후 | 인물이 욕망·약점·변화·독립 행동을 갖는가? | `RUN_DIR/outputs/G06.md` |
| `G07` | 행위 주도권과 대안 | 대안 해결·실패 route가 구현된 후 | 플레이어가 작가의 정답만 찾는가? | `RUN_DIR/outputs/G07.md` |
| `G08` | 사건 발생 원인 | 전체 사건 graph가 안정된 후 | 각 주요 사건에 실제 원인이 있는가? | `RUN_DIR/outputs/G08.md` |
| `G09` | 복선과 회수 | 본문·엔딩 회수 장면이 모두 준비된 후 | 복선이 자연스럽게 회수되는가? | `RUN_DIR/outputs/G09.md` |
| `G10` | 반전과 예상 가능성 | 공개 정보와 반전이 고정된 후 | 반전이 이전 장면을 재해석하는가? | `RUN_DIR/outputs/G10.md` |
| `G11` | 애착과 감정 보상 | 인물별 climax와 ending이 완성된 후 | 애착·충돌·손실·보상이 축적되는가? | `RUN_DIR/outputs/G11.md` |
| `G12` | 악역과 제도 압력 | 조직·제도 압력의 결과가 구현된 후 | 제도/악역이 실제로 선택을 압박하는가? | `RUN_DIR/outputs/G12.md` |
| `G13` | 세계 반응과 독립성 | 미개입·다른 route 결과가 준비된 후 | 세계와 NPC가 플레이어 없이도 움직이는가? | `RUN_DIR/outputs/G13.md` |
| `G14` | 모든 엔딩의 종결 | 모든 채택 엔딩이 완성된 후 | 모든 엔딩이 6축 종결을 갖는가? | `RUN_DIR/outputs/G14.md` |
| `G15` | 실패 이후의 이야기 | 실패 route와 후속 결과가 준비된 후 | 실패가 Game Over가 아니라 의미 있는 이야기를 만드는가? | `RUN_DIR/outputs/G15.md` |
| `G16` | 다중 엔딩 균형 | 다중 엔딩 result set이 실행된 후 | 진엔딩만 정답이거나 한 route가 모두 소비하지 않는가? | `RUN_DIR/outputs/G16.md` |
| `G17` | 재플레이 동기 채점 | G02·G16 근거와 실제 route set이 준비된 후 | A~G 재플레이 점수가 근거 있는가? | `RUN_DIR/outputs/G17.md` |
| `G18` | 후회와 책임 귀속 | 주요 선택의 전후 결과가 확인된 후 | 합리적인 후회와 공정한 정보가 있는가? | `RUN_DIR/outputs/G18.md` |
| `G19` | 정보 공정성과 다회차 지식 | route별 발견 정보와 진실이 고정된 후 | Layer 1/2/3가 공정하게 연결되는가? | `RUN_DIR/outputs/G19.md` |
| `G20` | 긴장과 장면 호흡 | 전체 장·노드 순서가 고정된 후 | 확인 반복과 절정 분산이 없는가? | `RUN_DIR/outputs/G20.md` |
| `G21` | 주제와 가치 충돌 | 선택·인물·엔딩이 모두 작성된 후 | 핵심 명제가 행동으로 시험되는가? | `RUN_DIR/outputs/G21.md` |
| `G22` | 세계관과 CEO 직업 | 세계관·CEO 직업 선택이 구현된 후 | 세계 조건과 직업 판타지가 실제 선택을 바꾸는가? | `RUN_DIR/outputs/G22.md` |
| `G23` | 경영과 현장 위기 | 경영 결정과 현장 위기가 연결된 후 | 관리 시스템과 드라마가 서로 원인이 되는가? | `RUN_DIR/outputs/G23.md` |
| `G24` | 분기와 지식 모순 | 전체 상태·본문·엔딩이 안정된 후 | 설정·지식·상태·시간축 모순이 없는가? | `RUN_DIR/outputs/G24.md` |
| `G25` | 몰입과 플레이 언어 | 실제 표시 문구와 선택지가 고정된 후 | 검증용 언어가 플레이 몰입을 깨지 않는가? | `RUN_DIR/outputs/G25.md` |
| `G26` | 작가 개입과 플롯 보호 | 위험·실패·생존 결과가 모두 정의된 후 | 특정 인물이 설명 없이 보호되는가? | `RUN_DIR/outputs/G26.md` |
| `G27` | 독자적 실행 | 전체 작품의 실행이 안정된 후 | 고유한 세계·직업·선택 결합이 남는가? | `RUN_DIR/outputs/G27.md` |

## 게이트별 루브릭

### `G01` — 첫 회차 경험

Hook·주인공 행동 동기·다음 사건의 궁금증·중반 긴장·절정 축적·완주 동기를 평가한다. 생활 장면과 세계의 이상 징후가 연결되는지, 초반 설정만 매력적이고 실제 사건은 평범한지 확인한다.

- Required output: 도입→중반→절정→종결의 동기 변화 표. 가장 먼저 이탈할 위험이 있는 실제 장면과 이유.

- Output: `RUN_DIR/outputs/G01.md`

### `G02` — 재플레이 가치

다른 결과·인물 관계·해결·정보·실패를 경험할 이유와 반복하지 않을 이유를 분리한다. 엔딩 개수보다 한 회차의 동시 결과 집합과 남은 전용 콘텐츠를 검사한다. 한 회차에 네 진엔딩과 핵심 장면을 모두 보면 그 네 결말 자체를 추가 회차 동기로 세지 않는다. 남은 실패와 상반된 결과의 가치는 별도로 평가한다.

- Required output: 검증된 경로별 결과 집합, 동시 진엔딩, 이후 남는 경험 표. 재플레이 이유 한 문장. 표본 최대를 이론적 최대로 부르지 않는다.

- Output: `RUN_DIR/outputs/G02.md`

### `G03` — 진엔딩 의미

모든 진엔딩의 핵심 질문·도달 조건·이전 사건 재해석·직업과 주제·감정 보상을 검토한다. 행복이나 수집 완료만으로 진엔딩이라 하지 않는다. 인물별 독립 사슬을 허용하며 상위 통합 진엔딩을 강제하지 않는다. 여러 회차 정보가 실제로 필요한지 구별한다.

- Required output: 진엔딩별 질문→사건 사슬→결론 표, 일반/좋은/비밀 결말과의 차이, 미회수 기대.

- Output: `RUN_DIR/outputs/G03.md`

### `G04` — 선택의 실제 대가

주요 선택의 양쪽 합리성·예측 가능한 대가·즉시 결과·상태 변화·후속 사건·인물과 세계·엔딩 영향을 추적한다. 설명뿐인 비용과 기회·관계·책임을 바꾸는 대가를 구별한다. 표현적 선택을 주요 분기로 과대평가하거나 장식이라는 이유만으로 결함 처리하지 않는다.

- Required output: 선택→즉시 결과→상태→중기→교차 사건→장기→엔딩 사슬. 단계별 근거와 단절 위치.

- Output: `RUN_DIR/outputs/G04.md`

### `G05` — 분기와 교차 인과

빠른 합류·콘텐츠 과도 제거·고정 정답·잠금의 인과를 검사한다. 여러 플래그의 AND와 실제 교차 사건을 구분한다. 합류 뒤 이전 선택이 인물·조건·해결을 바꾸는지 본다. Detroit식 대안 경로 비교를 하되 잠긴 루트 갤러리를 제품에 요구하지 않는다.

- Required output: 의미 있는 교차/체크리스트 잠금/차이 소멸 표와 주요 분기 지도.

- Output: `RUN_DIR/outputs/G05.md`

### `G06` — 인물 욕망과 변화

모든 주요 인물의 욕망·두려움·약점·가치·이해관계·개인 경계·주인공과 충돌·독립 행동·관계 변화를 본다. 대체 불가능한 행동을 찾는다. 비밀과 배신을 강제하지 않고 일관된 신념이 시험받는 인물도 인정한다. 원고의 애착을 플레이 본문의 성취로 대신 세지 않는다.

- Required output: 전 주요 인물 비교표와 각 인물의 결정적 행동·관계 변화 근거.

- Output: `RUN_DIR/outputs/G06.md`

### `G07` — 행위 주도권과 대안

작가의 정답 찾기와 플레이어가 만든 상황의 수용을 구별한다. 거절·보류·우회·부분 완수·실패 뒤 계속 진행을 본다. 제한은 권한·안전·세계·인물 의사로 설명돼야 한다. 없는 살인·배신·파산·전투를 창발성 요건으로 요구하지 않는다.

- Required output: 대안 행동 수용/차단과 후속 이야기 표. 플레이어가 친구에게 말할 인과적 경험을 사실과 예상으로 분리.

- Output: `RUN_DIR/outputs/G07.md`

### `G08` — 사건 발생 원인

중요 사건이 플레이어·인물·기업·사회·히어로·괴수·물리 조건에서 발생하는 이유를 검증한다. 우연한 필수 정보·기다리는 적·지능 하락·원인 없는 성공을 지적한다. 코드 guard 존재와 서사적 필요를 구별하되 확정 제약의 변경을 승인된 수정처럼 제안하지 않는다.

- Required output: 사건→원인→선행 증거→대안 설명 표. 인과 부족과 실제 모순을 분리.

- Output: `RUN_DIR/outputs/G08.md`

### `G09` — 복선과 회수

복선→기대→오도(있는 경우)→공개→회수를 추적한다. 뉴스·공문·기록·흔적·행동 단서의 자연스러움과 선택에 쓰이는지를 본다. 모든 복선에 반전을 강제하지 않는다. 미정 기원을 발명하지 않고 미회수 약속과 의도된 여백을 구별한다.

- Required output: 주요 복선 표와 처음/이후 의미, 실제 회수 장면.

- Output: `RUN_DIR/outputs/G09.md`

### `G10` — 반전과 예상 가능성

놀라움보다 기존 장면의 재해석과 공개 이후 갈등을 평가한다. 시점별 공개 정보로 예측하고 전체 내용을 이미 안 평가자의 사후 추론 한계를 적는다. 진행률·플레이 시간을 발명하지 않는다. 예상 가능해도 선택과 감정을 심화하는 반전은 인정한다.

- Required output: 사건 기준점별 예측과 공개 후 새 선택, 논리적 단서 표.

- Output: `RUN_DIR/outputs/G10.md`

### `G11` — 애착과 감정 보상

설정→애착→충돌→손실/희생/경계→보상을 검사한다. 인물의 결론이 절실해지는 과정을 본다. 죽음 외 신뢰·생활·자율성·직업·관계 손실과 회복을 평가한다. 감정·장기 기억 예상은 실측과 구별한다.

- Required output: 감정 장면별 축적·선택 연관성·후속 변화·예상 잔상 표.

- Output: `RUN_DIR/outputs/G11.md`

### `G12` — 악역과 제도 압력

개인 악역 또는 제도의 목표·논리·가치 충돌·실제 위협·능력과 행동의 일관성을 본다. 협회는 공문·방송·청구·통제·정산으로 평가하며 대면/통화 NPC를 요구하지 않는다. 선택 후 압력의 실제 차이를 본다.

- Required output: 압력의 원인→행동→회사/인물 영향, 선택별 압력 변화 표.

- Output: `RUN_DIR/outputs/G12.md`

### `G13` — 세계 반응과 독립성

플레이어 행동 기억과 플레이어 없이 진행되는 세계를 따로 평가한다. 미개입·거절·보류 뒤 NPC가 자기 목표로 적응하는지 본다. 지역 규모의 구체적 변화도 인정한다. 실시간 시뮬레이션이나 새로운 조직 도입을 강제하지 않는다.

- Required output: 행동 반응 표, 미개입 결과 표, NPC 간 독립 관계 변화와 범위 한계.

- Output: `RUN_DIR/outputs/G13.md`

### `G14` — 모든 엔딩의 종결

채택된 일반/진엔딩 전부를 제한 없이 각각 평가한다. 서사·인물·주제·감정·선택 결과·기억 이미지 여섯 축을 유지한다. 본편 완료 장면 반복과 이후 달라진 삶을 구별한다. 동시 달성 결과 보존·배타 세계 상태·후일담 충돌을 본다.

- Required output: 모든 엔딩의 narrativeClosure/characterClosure/thematicClosure/emotionalClosure/consequence/memorability/evidence 표. 누락 엔딩은 자료 부족으로 명시.

- Output: `RUN_DIR/outputs/G14.md`

### `G15` — 실패 이후의 이야기

실패→손실→적응/충돌→새 선택→후속 결과→의미를 추적한다. 짧아도 고유한 결과를 인정한다. 사망·게임오버·전용 장편 분기를 강제하지 않는다. 메뉴 축소·미이행·신뢰·부분 복구를 평가하며 사례 수를 채우지 않는다.

- Required output: 실제 실패별 이후 선택과 이야기가 계속되는지 표. 좋은 후회와 부당한 처벌을 분리.

- Output: `RUN_DIR/outputs/G15.md`

### `G16` — 다중 엔딩 균형

엔딩 ID·고유 사슬·배타 상태·동시 달성·회차 전용 경험을 분리한다. 진엔딩만 정답/일반 결말 벌칙/후반 단일 선택 덮어쓰기를 검사한다. 한 회차 네 진엔딩 가능성을 G02/G17에 명시적으로 전달한다. 준비의 보상 자체를 결함 취급하거나 배타화·최상위 결말을 자동 요구하지 않는다.

- Required output: 경로-결과 공존표, 가치관별 성취와 손실, 한 회차 소비 후 남는 경험.

- Output: `RUN_DIR/outputs/G16.md`

### `G17` — 재플레이 동기 채점

A 다른 엔딩 B 선택 결과 C 인물 관계·삶 D 숨은 진실 E 다른 루트 F 놓친 콘텐츠 G 의미 변화 각각 0~5와 근거. 합계 0~10 매우 낮음/11~20 낮음/21~27 보통/28~32 높음/33~35 매우 높음. 이미 본 인물 진엔딩을 놓친 콘텐츠로 세지 않는다. 미평가가 있으면 합계를 보류한다.

- Required output: A~G 점수·개별 근거·total·reason. 실측 아님과 동시 달성 반영을 명시.

- Output: `RUN_DIR/outputs/G17.md`

### `G18` — 후회와 책임 귀속

선택 전 양쪽 이유·위험 정보·선택 후 인과·대안의 대가를 검사한다. 알 수 없던 필수 정보·무작위 처벌·설명 없는 잠금·정답 미선택 벌칙을 좋은 후회로 세지 않는다. 감정은 예상으로 적는다.

- Required output: 선택 전 지식/후회 원인/대안/공정성 표.

- Output: `RUN_DIR/outputs/G18.md`

### `G19` — 정보 공정성과 다회차 지식

Layer1 기본 정보/Layer2 조건부 정보와 획득 조건/Layer3 연결·재해석을 나눈다. 플레이어·주인공·타인 지식, 한 회차 접근, 회차 간 저장, 회차 경험 필요를 구분한다. 루트가 다르다는 이유만으로 다회차 필수라고 하지 않는다.

- Required output: 정보별 계층·획득 조건·지식 주체·한 회차 접근·미래 선택 영향.

- Output: `RUN_DIR/outputs/G19.md`

### `G20` — 긴장과 장면 호흡

Intro→Act1→Act2→Midpoint→Act3→Climax→Ending의 정보·갈등·선택·보상을 본다. 절정 뒤 보조 사슬, 확인 반복, 단일 선택 클릭, 급격한 후반 설정을 평가한다. 일상·유머·휴식의 기능을 인정한다. 시간 대신 실제 장·노드 기준을 사용한다.

- Required output: 구간별 긴장·새 경험 표, 합칠/유지할 장면과 이유.

- Output: `RUN_DIR/outputs/G20.md`

### `G21` — 주제와 가치 충돌

영웅이 떠난 뒤 누구를 위해 무엇을 복구하고 책임을 어디까지 맡는가를 선택과 결말에서 평가한다. 오래 책임지는 명제는 인물이 동의할 정답이 아니라 시험할 질문이다. 윤리 원칙을 상대화하거나 잔혹함을 억지로 합리화하지 않는다.

- Required output: 주제 한 문장, 인물/선택/직업/결말이 제시하는 서로 다른 답.

- Output: `RUN_DIR/outputs/G21.md`

### `G22` — 세계관과 CEO 직업

괴수·히어로 때문에 복구 산업·노동·계약·통제·주거·비인간 권리가 달라지는지 본다. CEO가 배치·자원·계약·책임을 실제 결정하는지, 서명만 하는지 구별한다. 범위 밖 채용·전투·보험은 의무가 아니다. 기존 G22 Detroit 관점의 즉시/장기 변화·관계 기억·루트 비교·실제 콘텐츠 차이도 확장 분석에 포함한다.

### Supplemental Scores
In addition to the single formal gate `Score`, emit exactly these two supplemental score fields owned by this agent, each as an integer `0-100` or `null` when evidence is insufficient:
- `World Integration` and `Professional Fantasy`
Provide evidence about `Management–Story Integration` and `Field / Crisis Quality` only as narrative advisory notes; do not emit or score those keys. G28 combines the two G22 keys and two G23 keys into the four-key supplemental section.

- Required output: 세계 조건 제거 사고실험, 직업적 결정 표, 가장 자주 하는 흥미로운 결정, Detroit 관점 근거. 소유한 supplemental score 두 개를 출력하고, 다른 두 차원은 advisory evidence로만 제시한다.

- Output: `RUN_DIR/outputs/G22.md`

### `G23` — 경영과 현장 위기

실제 돈·직원·장비·안전·계약 결정을 후속 사건과 연결한다. 비용 언급과 가능성 변화, 경영→위기→경영의 왕복 인과를 구별한다. 사고를 막는 중단·우회·지원도 평가한다. 기존 G23 Baldur 관점인 대체 해결·실패 수용·상황 조합을 포함한다. 없는 경제·시간·전투를 발명하지 않는다.

### Supplemental Scores
In addition to the single formal gate `Score`, emit exactly these two supplemental score fields owned by this agent, each as an integer `0-100` or `null` when evidence is insufficient:
- `Management–Story Integration` and `Field / Crisis Quality`
Provide evidence about `World Integration` and `Professional Fantasy` only as narrative advisory notes; do not emit or score those keys. G28 combines the two G22 keys and two G23 keys into the four-key supplemental section.

- Required output: 시스템/결정→현장 사건→인물/조직→엔딩 표와 BG식 대안 수용. 소유한 supplemental score 두 개를 출력하고, 다른 두 차원은 advisory evidence로만 제시한다.

- Output: `RUN_DIR/outputs/G23.md`

### `G24` — 분기와 지식 모순

설정·행동·시간·물리·지식·상태·엔딩의 충돌을 검증한다. 다른 경로를 섞거나 부정문을 반대로 읽지 않는다. 실제 모순/설명 부족/미정 사실/대표 원고 차이/메타데이터 불일치를 구분한다.

- Required output: 문제·장면/경로·충돌 사실 양쪽·심각도·제약을 지키는 수정 방향 표.

- Output: `RUN_DIR/outputs/G24.md`

### `G25` — 몰입과 플레이 언어

설명용 행동·사건 뒤 무반응·선택 무시 컷신·세계 불가능·시스템 불일치·직업 관점 이탈을 검사한다. 제작자용 검증 문구와 필요한 위험 고지를 구별하고 확인/완료 반복의 몰입 손실을 본다.

- Required output: 문장/행동 증거와 플레이어 관점의 문제, 정보 보존 수정 방향.

- Output: `RUN_DIR/outputs/G25.md`

### `G26` — 작가 개입과 플롯 보호

오해·우연·배신·화해·기억상실·편의적 생존/죽음을 검사한다. 직원 영구 이탈과 죽음을 보상 필수 수단으로 만들지 않는다. 안전한 대응·사망 외 결과·조직의 편리한 승인과 설명 없는 예외를 본다.

- Required output: 사건의 위협→대응→결과, 세계 규칙 예외와 대체 설계. 사망 부재 자체는 감점하지 않는다.

- Output: `RUN_DIR/outputs/G26.md`

### `G27` — 독자적 실행

클리셰의 존재보다 직업·세계·인물·선택의 고유한 결합을 본다. 고유명사 치환과 실제 실행 차이를 구별한다. 핵심 요소 제거는 차별점 탐색이며 세계 필수성과 중복 감점하지 않는다. 기존 작품의 내용·규모를 복제하도록 요구하지 않는다.

- Required output: 고유한 실행과 근거, 익숙한 요소의 변형, 유지해야 할 차별점.

- Output: `RUN_DIR/outputs/G27.md`
