---
name: narrative-ending-route-review
description: "엔딩 본문과 경로 에필로그가 작성된 뒤 시작부터 엔딩까지의 완전한 경로 하나를 검토할 때 사용한다. 경로 도달 가능성, 종료 완결성, 여섯 축 종결, 즉시·지연·인물·세계·엔딩 결과 추적, replay 근거를 runtime evidence와 대조해 확인한다. 채택된 전체 엔딩 세트를 검토할 때는 `narrative-multi-ending-integration`을, 최종 서사 보고서 조립에는 `narrative-report-assembly`를 사용한다. 장면 하나의 검토는 `narrative-scene-after-generation`이, 본문 재작성은 `narrative-rewriter`가, 원장 반영은 `remains-ledger-maintenance`가 한다."
---

## 목적

작성된 경로 하나를 시작부터 엔딩까지 따라가며, 도달 가능성·종료 완결성·여섯 축 종결·결과 전파가 runtime evidence와 일치하는지 검토한다. 엔딩을 다시 쓰지 않고, 해결되지 않은 Critical/Major 발견과 확인하지 못한 범위를 `RUN_DIR` 안의 보고서 하나로 돌려준다.

## 사용 시점

- 엔딩 본문과 경로 에필로그가 작성된 뒤, 그 경로 하나의 완결성을 판정할 때.
- runtime evidence로 경로 도달 가능성과 종료 상태를 대조해야 할 때.
- replay 이유와 실제 엔딩 앵커의 근거를 확인할 때.

## 사용하지 말아야 할 때

- 여러 엔딩을 함께 놓고 배타성·균형·한 회차 누적을 볼 때는 `narrative-multi-ending-integration`을 사용한다.
- 30개 게이트 최종 보고서를 조립할 때는 `narrative-report-assembly`를 사용한다.
- 장면 하나만 검토할 때는 `narrative-scene-after-generation`을 사용한다.
- 본문을 다시 쓸 때는 `narrative-rewriter`를, 원장을 고칠 때는 `remains-ledger-maintenance`를 사용한다. 이 스킬은 진단만 한다.

## 공통 계약

`RUN_DIR`(=`.outline/<RUN_ID>/`) 안의 산출물만 검토한다. 외부 프로젝트 경로는 읽지 않는다. 제공된 원본 내용과 기존 리뷰 근거를 보존한다. 죽음, 배신, 전투, 시스템, 통화, 플레이 시간, 확률 또는 제공된 범위를 벗어난 사실을 만들지 않는다. 확인된 근거, 예상되는 플레이어 경험, `판단 자료 부족`을 구분한다. 모든 중요한 발견에는 격리된 파일의 줄·노드·선택지·상태·엔딩·재플레이 경로 위치를 붙인다. 이 단계의 해결되지 않은 Critical/Major 발견에는 `FAIL`, 핵심 근거가 없으면 `UNVERIFIABLE`, 그 외에는 `PASS`를 사용한다. 포맷터, 린터, 테스트, 빌드, 커밋 또는 게시 명령을 실행하지 않는다.

## 격리된 작업 디렉터리

- 호출자가 제공한 인라인 입력으로 고유한 `RUN_ID`를 정하고, 존재하지 않는 `.outline/<RUN_ID>/`를 먼저 만든다. 생성한 `.outline/<RUN_ID>/`를 `RUN_DIR`로 사용한다. 이미 존재하면 `input-blocked`로 처리한다.
- `RUN_ID`, `ENDING_ID`, `ROUTE_ID`는 `[A-Za-z0-9_-]+` 형식만 허용한다.
- 인라인 입력을 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest에는 `runId`, 입력·중간 산출물·출력별 `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 기록한다.
- 모든 `relativePath`를 정규화하고 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 실제 스냅샷 해시가 manifest의 `sha256`과 일치해야 한다.

## 입력

- `ENDING_ID`와 `ROUTE_ID`.
- 완전한 경로와 엔딩 본문의 인라인 내용.
- 엔진 runtime evidence의 인라인 내용.
- 현재 컴파일 콘텐츠·소스 커밋과 아티팩트 SHA-256, 관련 장면 메모 지문의 인라인 내용.

`ENDING_ID`, `ROUTE_ID`, 경로·엔딩 본문, 컴파일 콘텐츠·소스 커밋과 아티팩트 SHA-256 중 하나라도 없으면 `input-blocked`로 처리하고 파일을 작성하지 않는다.

## 절차

1. 실행 디렉터리를 만들고 인라인 입력을 `inputs/manifest.json`과 스냅샷 파일로 기록한다. 완료 조건: 모든 manifest 항목의 `relativePath`가 `RUN_DIR` 하위이고 스냅샷 해시가 `sha256`과 일치한다.
2. runtime evidence가 없거나 오래되었거나 형식이 잘못되었거나 지문이 맞지 않으면 mechanics 검사를 `UNVERIFIABLE`로 표시한다. 수동 가드 읽기는 replay 증거가 아니다. 완료 조건: mechanics 검사마다 판정(`PASS|FAIL|UNVERIFIABLE`)과 사용한 runtime evidence 위치가 있다.
3. 현재 컴파일 콘텐츠·소스 커밋과 아티팩트 SHA-256, 관련 장면 메모 지문을 비교한다. 누락·오래됨·불일치가 있으면 `input-blocked`로 처리한다. 완료 조건: 보고서에 `Reviewed commit`, `Reviewed compiled-content SHA-256`, `Related scene memo fingerprints`가 원문 그대로 인용된다.
4. 경로 도달 가능성과 종료 완결성을 발명된 선택 없이 확인한다. 완료 조건: 도달 경로의 각 단계에 격리된 파일의 노드·선택지 위치가 붙는다.
5. 즉시·지연·인물·세계·엔딩 결과를 추적한다. 완료 조건: 다섯 결과 범주 각각에 최소 하나의 근거 위치가 있거나 `판단 자료 부족`으로 표시된다.
6. Narrative, Character, Thematic, Emotional, Consequence, Memorability 여섯 축의 종결을 평가한다. 완료 조건: 여섯 축이 모두 `종결|미종결|판단 자료 부족` 중 하나로 판정된다.
7. 독립적인 완결성, 의도적으로 남긴 질문, 실패·대가·지속 의무의 보존을 확인하고 복구·생존·진입·인계·이관을 근거 없이 주장하지 않았는지 확인한다. 완료 조건: 의도적으로 남긴 질문이 `Unresolved intentional questions`에 열거되고, 근거 없는 주장이 있으면 severity와 위치가 붙는다.
8. 엔딩이 직전 클라이맥스를 반복하거나 체크리스트가 되지 않았는지 확인한다. 완료 조건: 반복·체크리스트 판정과 근거 위치가 있거나 `없음`으로 적는다.
9. 구체적인 replay 이유와 실제 엔딩 앵커를 확인한다. 완료 조건: `Replay evidence`에 replay 이유마다 실제 앵커 위치가 붙는다.
10. `RUN_DIR/outputs/endings/<ENDING_ID>/<ROUTE_ID>.md`에 결과를 작성한다. 완료 조건: 출력 파일 하나에 필수 12개 필드와 `PASS|FAIL|UNVERIFIABLE` 중 하나의 판정이 들어 있다.

## 출력 계약

- 경로: `RUN_DIR/outputs/endings/<ENDING_ID>/<ROUTE_ID>.md` 한 파일. 정규화 후 `RUN_DIR` 하위여야 하고 심볼릭 링크를 거부한다.
- 필수 필드 12개: `Ending ID`, `Route`, `Reviewed commit`, `Reviewed compiled-content SHA-256`, `Related scene memo fingerprints`, `Status`, `Replay evidence`, `Six-axis closure`, `Findings`, `Required fixes`, `Unresolved intentional questions`, `Limitations`.
- 정확한 경로 선택과 종료 상태 근거를 포함한다. 각 finding은 severity(`Critical|Major|Minor`), status(`open|resolved`), 근거 위치, `Required fixes` 배정 여부를 포함한다.
- 호출자 반환: `RUN_DIR` 경로와 `Status`. `input-blocked`면 파일 없이 부족한 입력 목록을 돌려준다.

## 실패 처리

- **input-blocked:** `ENDING_ID`·`ROUTE_ID`가 없거나, 경로·엔딩 본문·컴파일 콘텐츠 지문이 없거나, `RUN_ID`가 이미 존재하거나, `relativePath`·스냅샷 해시 검증에 실패한 경우. 파일을 작성하지 않고 부족한 입력을 나열한다.
- **replay-evidence-missing:** runtime evidence가 없거나 오래되었거나 형식이 잘못된 경우. mechanics 검사만 `UNVERIFIABLE`로 표시하고 나머지 절차는 계속해 파일을 작성하며, 확인하지 못한 검사를 `Limitations`에 남긴다.
- **unresolved-critical:** 해결되지 않은 Critical/Major 발견이 남은 경우. 발견을 삭제하지 않고 severity와 위치를 붙여 기록하고 판정을 `FAIL`로 쓴다.
- **path-escape:** 정규화 후 출력 경로가 `RUN_DIR`을 벗어나는 경우. 파일을 작성하지 않고 거부한다.
- **unknown-route:** `ENDING_ID`·`ROUTE_ID`가 제공된 경로 manifest에 없는 경우. 유사 ID를 추측해 대체하지 않고 파일을 작성하지 않는다.
- **missing-source-evidence:** 여섯 축 또는 결과 추적에 쓸 근거가 없는 경우. 그 항목을 `판단 자료 부족`으로 표시하고 `Six-axis closure`에 `판단 자료 부족`, 판정을 `UNVERIFIABLE`로 적는다.

## 금지

- 엔딩 본문, 원장, 기존 리뷰 파일 수정.
- runtime evidence 대신 수동 가드 읽기를 replay 증거로 쓰는 것.
- 제공된 범위 밖의 죽음·배신·전투·시스템·통화·플레이 시간·확률을 채우는 것.
- Critical/Major 발견을 삭제하거나 severity를 낮춰 `PASS`로 만드는 것.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령 실행.
