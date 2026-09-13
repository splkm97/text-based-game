---
name: narrative-multi-ending-integration
description: "모든 경로, manifest, 앵커, 에필로그, 엔딩 본문이 작성된 뒤 채택된 전체 엔딩 세트를 검토할 때 사용한다. 엔딩 간 배타성, 도달 가능성, 한 회차 누적, 정보 계층, 에필로그 중복, 거짓 선택지, 지배적인 최선 경로를 ID·manifest·앵커·본문 대조로 확인한다. 경로 하나만 검토할 때는 `narrative-ending-route-review`를, 30개 게이트 최종 보고서 조립에는 `narrative-report-assembly`를 사용한다. 장면 하나의 검토는 `narrative-scene-after-generation`이, 본문 재작성은 `narrative-rewriter`가 한다."
---

## 목적

채택된 엔딩 세트를 하나의 결과 집합으로 검토해, 엔딩끼리 서로를 무효화하거나 한 경로가 다른 경로의 보상을 삼키는 지점을 근거와 함께 남긴다. 균형을 자동 초엔딩이나 인공 잠금으로 해결하지 않고, 남은 재플레이 전용 요소와 필수 수정 목록을 호출자에게 돌려준다.

## 사용 시점

- 모든 경로 메모, 에필로그, 엔딩 본문이 작성된 뒤 채택 엔딩 전체를 검토할 때.
- 엔딩 간 배타성, 결과 규칙 순서, 정보 계층, 한 회차 누적을 확인할 때.
- 일반·진엔딩·실패·부분 엔딩이 제목만 다른 변형인지 가릴 때.

## 사용하지 말아야 할 때

- 경로 하나만 검토할 때는 `narrative-ending-route-review`를 사용한다.
- 게이트 전문 메모를 모아 공식 점수를 만들 때는 `narrative-score-synthesis`를 사용한다.
- 최종 30개 게이트 보고서를 조립할 때는 `narrative-report-assembly`를 사용한다.
- 본문을 다시 쓸 때는 `narrative-rewriter`를, 원장을 고칠 때는 `remains-ledger-maintenance`를 사용한다. 이 스킬은 진단만 한다.

## 공통 계약

`RUN_DIR`(=`.outline/<RUN_ID>/`) 안의 산출물만 검토한다. 외부 프로젝트 경로는 읽지 않는다. 제공된 원본 내용과 기존 리뷰 근거를 보존한다. 죽음, 배신, 전투, 시스템, 통화, 플레이 시간, 확률 또는 제공된 범위를 벗어난 사실을 만들지 않는다. 확인된 근거, 예상되는 플레이어 경험, `판단 자료 부족`을 구분한다. 모든 중요한 발견에는 격리된 파일의 줄·노드·선택지·상태·엔딩·재플레이 경로 위치를 붙인다. 해결되지 않은 Critical/Major 발견에는 `FAIL`, 핵심 근거가 없으면 `UNVERIFIABLE`, 그 외에는 `PASS`를 사용한다. 포맷터, 린터, 테스트, 빌드, 커밋 또는 게시 명령을 실행하지 않는다.

## 격리된 작업 디렉터리

- 호출자가 제공한 인라인 입력으로 고유한 `RUN_ID`를 정하고, 존재하지 않는 `.outline/<RUN_ID>/`를 먼저 만든다. 생성한 `.outline/<RUN_ID>/`를 `RUN_DIR`로 사용한다. 이미 존재하면 `input-blocked`로 처리한다.
- `RUN_ID`와 엔딩·경로 식별자는 `[A-Za-z0-9_-]+` 형식만 허용한다.
- 인라인 입력을 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest에는 `runId`, 입력·중간 산출물·출력별 `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 기록한다.
- 모든 `relativePath`를 정규화하고 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 실제 스냅샷 해시가 manifest의 `sha256`과 일치해야 한다.

## 입력

- 채택 엔딩 세트와 경로 manifest의 인라인 내용.
- 모든 경로 메모의 인라인 내용.
- 모든 채택 경로의 runtime evidence 인라인 내용.
- 컴파일 콘텐츠, 최종 검토 스키마, 소스·콘텐츠 지문의 인라인 내용.

채택 엔딩 세트, 경로 manifest, 컴파일 콘텐츠 지문 중 하나라도 없으면 `input-blocked`로 처리하고 파일을 작성하지 않는다.

## 절차

1. 실행 디렉터리를 만들고 인라인 입력을 `inputs/manifest.json`과 스냅샷 파일로 기록한다. 완료 조건: 모든 manifest 항목의 `relativePath`가 `RUN_DIR` 하위이고 스냅샷 해시가 `sha256`과 일치한다.
2. runtime evidence가 없거나 오래되었거나 형식이 잘못되었거나 불완전하면 mechanics, 도달 가능성, 배타성, 한 회차 누적 검사를 `UNVERIFIABLE`로 표시한다. 수동 읽기는 runtime 증거가 아니다. 완료 조건: 네 검사 각각에 판정과 사용한 runtime evidence 위치가 있거나 `UNVERIFIABLE` 표시와 이유가 있다.
3. 모든 경로 메모의 지문이 현재 컴파일 콘텐츠 지문과 일치하는지 확인한다. 누락·오래됨·불일치가 있으면 `input-blocked`로 처리한다. 완료 조건: 보고서에 `Reviewed commit`, `Reviewed compiled-content SHA-256`, `Route memo fingerprints`가 인용된다.
4. 모든 채택 엔딩에 도달 가능한 경로, 고유 앵커, 여섯 축 종결 근거가 있는지 확인한다. 완료 조건: `Ending inventory`의 엔딩마다 경로·앵커·여섯 축 근거 위치가 있거나 `판단 자료 부족`으로 표시된다.
5. ID, manifest, 결과 규칙, 앵커, 예시, 에필로그, 엔딩 본문을 대조한다. 완료 조건: `Route/result matrix`가 채택 경로 수만큼 행을 갖고 각 칸에 근거 위치가 있다.
6. 일반·진엔딩·실패·부분 엔딩을 제목만 다른 변형과 구분한다. 완료 조건: 같은 내용의 변형으로 판정된 엔딩 쌍이 근거와 함께 열거되거나 `없음`으로 적는다.
7. 배타 상태, 독립적으로 얻는 결과, 규칙 순서 은닉, 거짓 선택지, 콘텐츠 손실, 지배적인 최선 경로를 확인한다. 완료 조건: 여섯 항목 각각에 발견 목록 또는 `없음` 판정이 있다.
8. 실제 경로 결과 집합에서 한 회차 누적을 점검한다. 한 경로가 네 인물의 진엔딩 전부 또는 모든 배타 콘텐츠를 포함하면 해당 엔딩을 재플레이 동기에서 제외하고 남은 재플레이 전용 요소를 식별한다. 완료 조건: `One-run accumulation findings`에 해당 경로와 남은 재플레이 전용 요소가 적힌다.
9. 정보 계층, 에필로그 중복, 모순, 종료 상태 덮어쓰기, 스키마를 확인한다. 정확히 30개 게이트와 기존 18개 공식 점수 키를 유지하고 supplemental scores는 별도로 둔다. 18개 공식 점수 키와 4개 supplemental 키의 정의는 `narrative-score-synthesis`의 점수 계약을 따르며 여기서 다시 열거하지 않는다. 완료 조건: 정보 계층과 중복 발견이 근거 위치와 함께 있고, 스키마 키 개수가 확인된다.
10. 자동 초엔딩이나 인공 잠금으로 불균형을 해결하지 않는다. 완료 조건: `Required revisions`에 균형 수정안이 자동 잠금 없이 적힌다.
11. `RUN_DIR/outputs/multi-ending-complete.md`에 결과를 작성한다. 완료 조건: 출력 파일 하나에 필수 13개 필드와 `PASS|FAIL|UNVERIFIABLE` 중 하나의 판정이 들어 있다.

## 출력 계약

- 경로: `RUN_DIR/outputs/multi-ending-complete.md` 한 파일. 정규화 후 `RUN_DIR` 하위여야 하고 심볼릭 링크를 거부한다.
- 필수 필드 13개: `Reviewed commit`, `Reviewed compiled-content SHA-256`, `Route memo fingerprints`, `Ending inventory`, `Route/result matrix`, `One-run accumulation findings`, `Replay motivation`, `Information layers`, `Cross-ending contradictions`, `Status`, `Critical/Major findings`, `Required revisions`, `Limitations`.
- 각 finding은 severity(`Critical|Major|Minor`), status(`open|resolved`), 근거 위치(`파일:줄`), 영향을 받는 엔딩·경로, `Required revisions` 배정 여부를 포함한다.
- 호출자 반환: `RUN_DIR` 경로와 `Status`. `input-blocked`면 파일 없이 부족한 입력 목록을 돌려준다.

## 실패 처리

- **input-blocked:** 채택 엔딩 세트·경로 manifest·컴파일 콘텐츠 지문이 없거나, `RUN_ID`가 이미 존재하거나, 경로 메모 지문이 현재 지문과 불일치하거나, `relativePath`·스냅샷 해시 검증에 실패한 경우. 파일을 작성하지 않고 부족한 입력을 나열한다.
- **runtime-evidence-missing:** runtime evidence가 없거나 오래되었거나 불완전한 경우. mechanics·도달 가능성·배타성·한 회차 누적 검사만 `UNVERIFIABLE`로 표시하고 나머지 절차는 계속해 파일을 작성하며, 확인하지 못한 검사를 `Limitations`에 남긴다.
- **unresolved-critical:** 해결되지 않은 Critical/Major 발견이 남은 경우. 발견을 삭제하지 않고 severity·위치·영향 엔딩을 붙여 기록하고 판정을 `FAIL`로 쓴다.
- **dominant-path:** 한 경로가 모든 배타 콘텐츠를 포함하는 경우. 해당 엔딩을 재플레이 동기에서 제외하고 남은 재플레이 전용 요소를 `One-run accumulation findings`에 적는다.
- **path-escape:** 정규화 후 출력 경로가 `RUN_DIR`을 벗어나는 경우. 파일을 작성하지 않고 거부한다.
- **missing-source-evidence:** 엔딩별 근거가 없는 경우. 그 엔딩을 `판단 자료 부족`으로 표시하고 `Status`를 `UNVERIFIABLE`로 적는다.

## 금지

- 엔딩 본문, 원장, 기존 리뷰 파일 수정.
- 자동 초엔딩이나 인공 잠금으로 엔딩 균형을 맞추는 것.
- 제공된 범위 밖의 죽음·배신·전투·시스템·통화·플레이 시간·확률을 채우는 것.
- Critical/Major 발견을 삭제하거나 severity를 낮춰 `PASS`로 만드는 것.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령 실행.
