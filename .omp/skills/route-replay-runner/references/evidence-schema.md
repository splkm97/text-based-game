# 실행 증거 형식과 결함 판정

`route-replay-runner`가 4~8단계에서 읽는다. 실행이란 그래프를 순서대로 따라가며 **무엇이 실제로 일어나는지** 기록하는 일이다. 읽어서 추정하는 것과 다르다.

## 왜 실행이어야 하는가

검수 계약은 "수동 guard 읽기는 replay 증거가 아니다"라고 못박는다(`narrative-ending-route-review/SKILL.md`, `.omp/NARRATIVE_REVIEW.md`). 이유는 단순하다 — 사람이 `requires` 목록을 눈으로 훑으면 "이 조건은 만족될 것"이라고 추정하게 되고, 그 추정은 flag 누적을 계산하지 않는다. 실행은 추정을 없앤다.

## step 기록

한 step은 노드 하나를 지나는 일이다.

```json
{
  "node": "scene-02",
  "choice": "scene-02.c2",
  "guards": [ { "expr": "kit_loaded", "value": false }, { "expr": "!rescue_requested", "value": true } ],
  "flags": []
}
```

- `guards[]`는 그 선택지의 `requires`를 **평가한 결과**다. 평가하지 않은 조건을 적지 않는다.
- `flags[]`는 그 step을 지난 **뒤의 누적 상태**다(사전순 정렬).
- 평가 시점의 상태는 직전 step의 `flags`다. 첫 step의 초기 상태는 빈 집합이다.

## flag 누적 규칙

1. route 시작: 상태 = 빈 집합.
2. step마다 그 선택지의 `effects`를 적용한다.
3. `flag`는 집합에 넣고, `!flag`는 집합에서 뺀다.
4. 세워지지 않은 flag를 참으로 가정하지 않는다. `requires`가 거짓이면 그 선택지는 **선택 불가**이고, route가 그 선택지를 명시하고 있으면 `unsatisfiable-guard` 결함이다.

## 도달성 표

| node | reachable | 근거 |
|---|---|---|
| `scene-01` | 예 | 진입 노드 |
| `scene-03` | 아니오 | `scene-02.c1`의 `next`가 `null`(open-edge) |

도달 경로나 차단 간선 중 하나를 반드시 적는다. 근거 없는 판정은 쓰지 않는다.

## 결함 다섯 유형

| 유형 | 정의 | 판정 근거 |
|---|---|---|
| `unreachable-node` | 진입 노드에서 `next`를 따라가도 닿지 않는 노드 | forward 탐색 결과 |
| `unreachable-terminal` | terminal이 **정의되어 있는데** 어떤 route도 그것에 도달하지 못함 | route 순회 결과 |
| `no-terminal-defined` | terminal이 하나도 정의되지 않음 — 원고 미완성 신호이며 결함이 아니다 | `anchors`·terminal 목록 |
| `unsatisfiable-guard` | 어떤 경로에서도 참이 되지 않는 `requires` | flag 누적 계산 |
| `unset-flag` | 어떤 경로에서도 세워지지 않는 플래그 | `effects` 전체 스캔 |
| `open-edge` | 다음 장면 미작성으로 막힌 간선 | 컴파일러 `openEdges` 인용 |

`open-edge`는 컴파일러가 이미 아는 결함이다. 실행기는 그것을 **다시 판정하지 않고 인용**한다 — 두 곳에서 다른 판정이 나오면 어느 쪽이 정본인지 알 수 없다.

## Status 규칙

- `FAIL`: 정의된 terminal에 도달하지 못하는 route가 있거나, 충족 불가 guard가 있다. 그래프가 실행 가능하지 않다.
- `no-terminal-defined`는 `FAIL`이 아니다. 아직 엔딩을 쓰지 않은 것과 도달할 수 없는 것은 다르다 — 이 구분을 흐리면 미완성 원고가 결함으로 보고된다.
- `UNVERIFIABLE`: 그래프·route 근거가 부족하다(예: `Reviewed graph SHA-256` 불일치, 스키마 위반으로 순회 중단).
- `PASS`: 위 둘이 아니고 도달성·guard·flag가 전부 계산되었다.

`open-edge`만 있는 것은 `FAIL`이 아니다 — 원고가 아직 안 쓰였을 뿐이다. 그 사실은 `Unexplored`와 route의 `incomplete`로 남는다.

## 탐색 한도

`budget-exhausted`는 실패가 아니라 **정직한 경계**다. 한도를 넘으면 부분 evidence를 내고 미탐색 영역을 적는다. 탐색하지 않은 것을 탐색한 것처럼 쓰면 이 스킬의 존재 이유가 사라진다.

## 금지

- 실행하지 않은 step을 적기.
- `effects`를 임의로 더하거나 `next`를 고쳐 그래프를 "고쳐서" 실행하기 — 그래프 수정은 사람과 `story-graph-compiler`의 몫이다.
- 품질·재미·주제를 판정하기. 이 증거는 판정의 입력이지 판정이 아니다.
