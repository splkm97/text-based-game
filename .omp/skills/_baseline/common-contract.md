# 공통 계약 정본

`.omp/skills/` 상류(authoring) 스킬이 자기 `SKILL.md`의 `## 공통 계약` 절에 복사해 두는 계약의 **작성 시점 단일 소스**다.

스킬은 단독 실행되어야 하므로 계약을 런타임 포인터나 공유 파일 참조로 두지 않는다. 대신 각 파일에 복사하고, 이 파일과의 일치를 `tools/skills/contract-drift.test.ts`가 강제한다(`pnpm test`, 따라서 `pnpm verify`에 포함).

계약을 고치는 순서: 이 파일의 불릿을 고친다 → `pnpm test`를 돌린다 → 실패한 스킬 파일에 같은 내용을 반영한다 → 다시 통과시킨다.

## 계약을 쓰는 스킬

- `divergent-ideator`
- `character-simulator`
- `scene-architect`
- `continuity-auditor`
- `structural-critic`
- `dialogue-variator`
- `red-team-reader`
- `reverse-outliner`
- `novel-workflow`
- `story-graph-compiler`
- `route-replay-runner`

## 불릿

- 프로젝트 정본(`prototype/remains.json`, `prototype/stories/example.md`)과 확정이 아닌 발산 제안(`docs/ideation/`)은 읽기 전용 입력이다. 원장·원고·발산 문서를 수정하지 않는다. 승인된 변경은 `remains-ledger-maintenance`가 수행한다. 게임 메커니즘 파라미터(`prototype/game-mechanics.md`)도 읽기 전용 입력이며, 변경은 설계 문서 개정으로만 한다.
- 산출물은 `.outline/<RUN_ID>/` 아래에만 쓰고 호출자에게 `RUN_DIR` 경로를 돌려준다. `RUN_ID`는 `[A-Za-z0-9_-]+`만 허용한다. 이미 존재하는 `RUN_ID`는 덮어쓰지 않고 `input-blocked`로 처리한다.
- 읽은 정본은 `RUN_DIR/inputs/manifest.json`과 스냅샷으로 기록한다. manifest 항목은 `runId`, `role`, `relativePath`, `sha256`, 선택적 `sourceVersion`을 가진다. `relativePath`는 정규화 후 `RUN_DIR` 하위여야 하며 절대경로·`..`·심볼릭 링크·`RUN_DIR` 이탈을 거부한다. 스냅샷 해시는 manifest의 `sha256`과 일치해야 한다.
- 사실 범주를 구분한다: `[FACT]` 원장·원고에서 확인, `[INFERENCE]` 확인된 사실에서 추론, `[HYPOTHESIS]` 새로 제안, `[CONFLICT]` 기존 설정과 모순. `[HYPOTHESIS]`를 `[FACT]`로 자동 승격하지 않는다.
- 지식은 작가 지식·독자 지식·인물 지식으로 나눈다. 인물이 알 수 없는 사실을 그 인물의 판단 근거로 쓰지 않는다.
- 선택·승인·최종 결정은 사람이 한다. 이 스킬은 결정을 대신하지 않는다.
- 심각도는 `Critical|Major|Minor`, 판정은 `PASS|FAIL|UNVERIFIABLE`만 쓴다.
- 포맷터, 린터, 테스트, 빌드, 커밋, 게시 명령을 실행하지 않는다.

## 선언된 예외

스킬 하나가 자기 사정으로 불릿 뒤에 문장을 덧붙이는 경우만 허용한다. 아래 펜스에 `<스킬>|<불릿 번호>|<덧붙인 문자열>` 형식으로 적고, 검사는 그 문자열까지 대조한다. 덧붙인 문자열은 정본 불릿 뒤에 공백 하나를 두고 이어진다.

```text
divergent-ideator|2|절차 7단계의 `docs/ideation/` 내보내기만 이 규칙의 예외다.
```
