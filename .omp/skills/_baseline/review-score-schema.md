# 최종 검토 스키마 — 점수 키와 레코드 필드

검수 surface가 공유하는 스키마의 단일 열거다. 값도 판정 기준도 만들지 않는다 — 키 이름·개수·표시 순서와 레코드 필드 형태만 고정한다. 점수 키의 소유자는 `narrative-score-synthesis`, verdict enum의 소유자는 `narrative-final-verdict`다.

소비자: `narrative-score-synthesis`(G28), `narrative-final-verdict`(G29), `narrative-report-assembly`(G30 조립), `narrative-multi-ending-integration`.

이 파일은 런 입력이 아니라 스킬 저장소의 정본이다. 각 런은 이 파일을 계약으로 읽고, `RUN_DIR/inputs/` 스냅샷 대상 입력으로 세지 않는다.

## 공식 점수 키 18개

표시 순서를 고정한다 — 같은 입력에서 같은 순서가 나와야 조립이 결정적이다. 각 값은 정수 `0-100` 또는 `null`이다.

| # | 키 | primary owner gate |
|---|---|---|
| 1 | First Playthrough | G01 |
| 2 | Replay Value | G02 |
| 3 | True Ending | G03 |
| 4 | Choice Consequence | G04 |
| 5 | Branching | G05 |
| 6 | Character | G06 |
| 7 | Player Agency | G07 |
| 8 | Causality | G08 |
| 9 | Foreshadowing / Payoff | G09 |
| 10 | Twist | G10 |
| 11 | Emotional Payoff | G11 |
| 12 | Villain | G12 |
| 13 | World Reactivity | G13 |
| 14 | Ending Quality | G14 |
| 15 | Theme | G21 |
| 16 | Pacing | G20 |
| 17 | Immersion | G25 |
| 18 | Originality | G27 |

키가 18개가 아니거나 이름이 다르면 그 런은 `input-blocked`/`export-blocked`다. 키를 새로 만들지 않는다.

## supplemental 점수 키 4개

공식 점수와 섞지 않고 별도 섹션으로 둔다. 각 값은 정수 `0-100` 또는 `null`이다.

- `World Integration`
- `Professional Fantasy`
- `Management–Story Integration`
- `Field / Crisis Quality`

## 게이트 레코드 — G28·G29·G30 공통

레코드는 다음 11개 필드를 정확히 포함한다.

`Gate`, `Status`, `Reason`, `Score`, `Reviewed commit`, `Reviewed artifact SHA-256`, `Scope`, `Evidence`, `Findings`, `Required revisions`, `Limitations`

- `Status`: `PASS|FAIL|UNVERIFIABLE`
- `Score`: 정수 `0-100` 또는 `null`
- `Findings`: finding 목록

## finding 필드

finding은 다음 9개 필드를 포함한다.

`id`, `severity`, `status`, `file`, `location`, `problem`, `why`, `playerImpact`, `fix`

- `severity`: `Critical|Major|Minor`
- `status`: `open|resolved`
- `location`: 장면 제목 또는 원장 JSON 키 경로. 행 번호를 쓰지 않는다.

## verdict 필드 — G29 전용

verdict 필드와 enum은 `narrative-final-verdict`의 판정 계약을 따른다. 여기서 다시 열거하지 않는다.

## 규칙

- 근거가 없는 키는 값을 지어내지 않고 `null`로 두며 이유를 `Limitations`에 남긴다.
- 충돌하는 점수는 평균내지 않는다. 근거로 판정하거나 차단 처리한다.
- 이 파일에 없는 점수 키를 만들지 않는다. 필요한 키가 생기면 이 파일을 먼저 고치고 네 소비 스킬을 같은 커밋에서 맞춘다.
