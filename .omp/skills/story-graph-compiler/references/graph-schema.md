# 이야기 그래프 스키마와 결정성 규칙

`story-graph-compiler`가 2~9단계에서 읽는다. 이 문서는 **형식**만 정한다. 그래프의 형태를 어떻게 잡을지는 `story-graph-architect`의 몫이다.

## 왜 이 형식이 필요한가

검수 surface는 `route manifest`, `ending anchor`, `compiled-content SHA-256`, `runtime evidence`를 입력으로 요구한다(`narrative-ending-route-review/SKILL.md`, `narrative-multi-ending-integration/SKILL.md`). 산문과 scene card는 사람이 읽는 형식이라 그 요구를 채우지 못한다. 그래서 **같은 입력이면 같은 바이트가 나오는** 기계 형식이 하나 필요하다.

## 노드와 선택지 ID

| 대상 | 규칙 | 예 |
|---|---|---|
| 노드 | `scene-` + 원고 `## N. 제목`의 N을 두 자리로 | `## 1. 첫 출동` → `scene-01` |
| 선택지 | `<nodeId>.c` + 문서 순서 1부터 | `scene-02.c1` |
| route | `route-` + 두 자리, id 사전순 정렬 | `route-01` |
| 앵커 | `anchor-` + 슬러그 | `anchor-ending-ru-true` |

원고의 `## N. 제목`을 벗어나는 경계를 만들지 않는다. 경계를 잡을 수 없는 구간은 `boundary-ambiguous`다.

## 정규 순서 — 결정성의 조건

두 번 컴파일하면 **같은 파일**이 나와야 한다. 그러려면 순서가 고정되어야 한다.

- JSON 키: 사전순.
- 배열: `nodes`·`choices`는 원고 문서 순서, `routes`는 `id` 사전순, `flags`·`anchors`·`openEdges`는 `name`/`id`/`from` 사전순.
- `runId`를 그래프에 넣지 않는다. 실행 식별자는 `compile-report.md`에만 쓴다 — 그래프는 입력의 함수이고 실행의 함수가 아니다.
- 타임스탬프·난수·현재 시각을 넣지 않는다.

검증: 같은 정본으로 두 `RUN_DIR`에 컴파일한 뒤 `diff outputs/graph/story-graph.json`이 비어 있어야 한다.

## 상태와 근거

| 필드 | 값 | 근거 표기 |
|---|---|---|
| `entryState`·`exitState` | scene card의 문장, 없으면 `미기재` | `entryStateBasis`: `<card-id>` 또는 `미기재` |
| `requires`·`effects` | 플래그 이름 문자열 배열 | `requiresBasis`·`effectsBasis`: 원고 장면 앵커(`prototype/stories/example.md 「N. 제목」`) 또는 `prototype/remains.json` JSON 경로 또는 `없음` |
| `flags[]` | `{ name, category, basis }` | `category`는 `[INFERENCE]`·`[HYPOTHESIS]`·`[CONFLICT]` 중 하나. **`[FACT]`는 쓰지 않는다** — 확정 플래그는 원장이 정한다 |
| `anchors[]` | `{ id, file, scene, status }` | `scene`은 장면 제목(`## N. 제목`). `status`는 `proposed` 또는 `confirmed`. 근거가 없으면 `proposed` |

### 플래그 표기

- 이름은 원장의 도메인 이름과 같은 어휘를 쓴다. 새 어휘를 만들면 `[HYPOTHESIS]`이고 `Human decision required`에 올라간다(`ungrounded-flag`).
- 부정 조건은 `!` 접두사로 쓴다: `!kit_loaded`.
- 원장에 플래그 도메인이 아직 없으면(현재 상태) 모든 플래그가 `[HYPOTHESIS]`다. 이는 실패가 아니라 정직한 표시다.

## `open-edge` — 없는 것을 만들지 않는다

다음 장면이 아직 작성되지 않았으면 `next`는 `null`이고 `openEdges`에 항목이 생긴다.

```json
{ "from": "scene-02", "choice": "scene-02.c1", "reason": "다음 장면 미작성" }
```

`openEdges`가 있는 동안 그 route의 `status`는 `incomplete`다. 존재하지 않는 노드를 `next`에 쓰는 것은 금지다 — 그것은 결함을 숨기는 방법이다.

## 컴파일 결과의 최소 예

```json
{
  "schemaVersion": "1",
  "compiledFrom": [
    { "role": "manuscript-snapshot", "relativePath": "inputs/example.md", "sha256": "…" },
    { "role": "canon-snapshot", "relativePath": "inputs/remains.json", "sha256": "…" }
  ],
  "nodes": [
    {
      "id": "scene-01",
      "heading": "## 1. 첫 출동",
      "file": "prototype/stories/example.md",
      "entryState": "미기재",
      "exitState": "미기재",
      "entryStateBasis": "미기재",
      "exitStateBasis": "미기재",
      "choices": [],
      "next": "scene-02"
    }
  ],
  "flags": [],
  "anchors": [],
  "openEdges": []
}
```

## 사람이 판단해야 하는 것

컴파일러는 **선택하지 않는다**. 다음은 전부 `Human decision required`로 올라간다.

- 원장에 없는 플래그(모든 `[HYPOTHESIS]`)
- 앵커 후보(`status: proposed`)
- `boundary-ambiguous` 구간
- `entryState`·`exitState`가 `미기재`인 노드
