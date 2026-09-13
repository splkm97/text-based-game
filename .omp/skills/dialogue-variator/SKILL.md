---
name: dialogue-variator
description: "동일한 표면 의도를 서로 다른 subtext로 변주한 대사 후보가 필요할 때 사용한다. 대사 한 줄을 여러 대안으로 늘리거나 비교할 때, 인물 대사가 `말투가 다 똑같다`는 지적을 받았을 때, 감정·위협·거래·침묵 같은 변주 축을 바꿔 같은 의도를 다시 말할 때 사용한다. 최종 대사 선택은 사람이 하고, 원장·원고 반영에는 `remains-ledger-maintenance`를, 장면 선택지나 사건 후보 발산에는 `divergent-ideator`를 사용한다."
---

## 공통 계약

- 프로젝트 정본(`prototype/remains.json`, `prototype/stories/example.md`)과 확정이 아닌 발산 제안(`docs/ideation/`)은 읽기 전용 입력이다. 원장·원고·발산 문서를 수정하지 않는다. 승인된 변경은 `remains-ledger-maintenance`가 수행한다. 게임 메커니즘 파라미터(`prototype/game-mechanics.md`)도 읽기 전용 입력이며, 변경은 설계 문서 개정으로만 한다.
- 산출물은 `.outline/<RUN_ID>/` 아래에만 쓰고 호출자에게 `RUN_DIR` 경로를 돌려준다. `RUN_ID`는 `[A-Za-z0-9_-]+`만 허용한다. 이미 존재하는 `RUN_ID`는 덮어쓰지 않고 `input-blocked`로 처리한다.
- 읽은 정본은 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest 항목은 `runId`, `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 가진다. `relativePath`는 정규화 후 `RUN_DIR` 하위여야 하며 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 스냅샷 해시는 manifest의 `sha256`과 일치해야 한다.
- 사실 범주를 구분한다: `[FACT]` 원장·원고에서 확인, `[INFERENCE]` 확인된 사실에서 추론, `[HYPOTHESIS]` 새로 제안, `[CONFLICT]` 기존 설정과 모순. `[HYPOTHESIS]`를 `[FACT]`로 자동 승격하지 않는다.
- 지식은 작가 지식·독자 지식·인물 지식으로 나눈다. 인물이 알 수 없는 사실을 그 인물의 판단 근거로 쓰지 않는다.
- 선택·승인·최종 결정은 사람이 한다. 이 스킬은 결정을 대신하지 않는다.
- 심각도는 `Critical|Major|Minor`, 판정은 `PASS|FAIL|UNVERIFIABLE`만 쓴다.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령을 실행하지 않는다.

## 목적

하나의 표면 의도를 유지한 채 서로 다른 subtext를 가진 대사 후보를 만든다. 새 대사나 새 사건을 발명하는 작업이 아니라, 같은 의도를 직접 표현·우회·침묵의 다른 높이로 다시 말하는 작업이다. 인물의 말투 분리와 지식 경계를 함께 점검한다.

## 사용 시점

- 대사 한 줄을 여러 대안으로 늘리거나, 감정·위협·거래·침묵 같은 변주 축으로 같은 의도를 다시 말할 때.
- 인물 대사가 `말투가 다 똑같다`는 지적을 받았거나 네 인물의 문장이 서로 구별되지 않을 때.

## 사용하지 말아야 할 때

- 줄거리·설정 변경과 원장·원고 파일 수정 요청에는 `remains-ledger-maintenance`를 사용한다.
- 장면의 선택지 대안이나 사건 후보를 발산할 때는 `divergent-ideator`를 사용한다. 이 스킬은 이미 정해진 하나의 표면 의도를 다시 말하는 작업만 한다.
- 엔딩·분기 판정과 서사 게이트 채점에는 G01~G27 게이트와 synthesis 스킬을 사용한다.
- `Surface Intent`가 정해지지 않은 상태에는 의도 확정을 먼저 요청한다.

## 입력

- `Surface Intent`: 대사가 표면적으로 전달해야 하는 한 문장.
- 인물·관계·상황: 화자와 청자, 원장 `settings.characters` 근거, 현재 관계 상태와 직전 사건, 장면 제목·번호와 대사가 놓일 위치.
- 현재 voice 규칙: 원장 `narrativeRules.characterVoice`. `status`가 `"별도 규칙 필요"`이므로 확정 규칙이 없으면 `[HYPOTHESIS]`로 만든다.

인물, `Surface Intent`, 상황 중 하나라도 없으면 `input-blocked`로 처리하고 파일을 작성하지 않는다.

## 절차

1. `RUN_DIR`을 만들고 읽은 정본을 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. 표면 의도와 실제 의도를 분리해 한 문장씩 쓴다. 완료 조건: `RUN_DIR`이 새로 만들어졌고 모든 manifest 항목의 `relativePath`가 `RUN_DIR` 하위이며 스냅샷 해시가 `sha256`과 일치하고, `Surface Intent`와 `Actual Intent` 문장이 각각 하나씩 있고 서로 다르다.
2. 인물의 지식 경계와 관계 상태를 원장 근거로 고정한다. 완료 조건: 화자와 청자가 아는 사실·모르는 사실·관계 상태 항목마다 `[FACT]` 근거 위치가 붙는다.
3. 서로 다른 축 6~10개를 골라 대안을 만든다. 같은 축의 반복 변형은 하나로 병합한다. 완료 조건: 사용한 축이 6개 이상이고 중복 축이 없으며 `references/variation-axes.md`의 축 목록에 있다.
4. 각 대안에 `Axis`, `Dialogue`, `Surface Meaning`, `Actual Intent`, `Subtext`, `Power Shift`, `Risk` 일곱 필드를 붙인다. `silence` 축은 지문/행동으로 표현한다. 완료 조건: 모든 대안의 일곱 필드가 비어 있지 않고 `silence` 대안에 인용 대사가 없다.
5. 새 정보나 새 설정이 필요하면 `[HYPOTHESIS]`로 표시하고 canon으로 다루지 않는다. 완료 조건: 모든 `[HYPOTHESIS]`에 기존 `[FACT]`로 충분하지 않은 이유가 붙고 `[FACT]`로 승격된 항목이 없다.
6. `RUN_DIR/outputs/dialogue/<intent-slug>.md`에 쓴다. 완료 조건: 경로가 정규화 후 `RUN_DIR` 하위이고 `intent-slug`가 `[A-Za-z0-9_-]+`이며 파일이 실제로 존재한다.

## 금지

- 최종 대사를 선택하거나 추천 순위를 매기지 않는다. 선택은 사람이 한다.
- 줄거리, 사건, 선택지, 엔딩, 설정을 바꾸는 대안을 만들지 않는다.
- 인물이 알 수 없는 사실을 대사·지문·subtext로 누설하지 않는다. `[HYPOTHESIS]`를 `[FACT]`나 canon으로 표시하지 않는다.
- 감정을 대사 뒤에 해설하거나(예: 화가 나서 말했다) 같은 축의 변형을 여러 항목으로 중복 나열하지 않는다.

## 출력 계약

`RUN_DIR/outputs/dialogue/<intent-slug>.md`에 다음을 담고 호출자에게 `RUN_DIR`을 돌려준다.

- 대안 목록: 대안마다 `Axis`, `Dialogue`, `Surface Meaning`, `Actual Intent`, `Subtext`, `Power Shift`, `Risk` 일곱 필드를 나열한다.
- 기록: 머리의 `Surface Intent`, `Actual Intent`, 화자, 청자, 관계 상태, 입력 manifest 경로와 사실 범주 표시, `[HYPOTHESIS]`·`[CONFLICT]` 목록, 인물별 말투 관찰, 지식 경계 위반 검사 결과(위반이 없어도 명시).

## 실패 처리

- **input-blocked:** 필수 입력이 없거나 기존 `RUN_ID`가 존재하면 파일을 만들지 않고 중단하며, 호출자에게 부족한 입력을 나열해 돌려준다.
- **axis-mismatch:** 목록 밖 축이거나 같은 축이 두 번 나오면 그 대안을 버리거나 하나로 병합하고, 병합·폐기한 축을 보고한다.
- **knowledge-leak:** 인물 지식 밖 사실이 들어간 대안을 삭제하고 위반 축을 보고한다. 나머지 대안은 계속 작성한다.
- **empty-field:** 대안의 일곱 필드 중 빈 항목이 있다. 근거가 있으면 채우고, 없으면 그 대안을 버린 뒤 버린 이유를 `Limitations`에 적는다. 유효한 대안은 남기고 완료로 보고하지 않는다.
- **unverifiable-voice:** voice 규칙 없이 말투를 확정 규칙처럼 단정한다. 그 표현을 `[HYPOTHESIS]`로 낮추고 나머지 대안 작성을 계속하되 완료로 보고하지 않는다.

## 참조

| 파일 | 로드 시점 |
|---|---|
| `references/variation-axes.md` | 변주 축 10개 정의, subtext 사다리, power shift·Risk 기준, 금지 패턴, 인물 말투 분리 목표가 필요할 때 |
