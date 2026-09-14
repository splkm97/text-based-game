// 일감별 뒷정리 규칙 — 네 현장이 서로 다른 미니게임을 튼다. 작업 이름(CONTENT.cleanupTasks)과
// 픽 액션(cleanup_pick_*)은 세계 공통이고 늘 넷 다 보이지만, "무엇을 마치면 되는가"와
// "무엇을 하면 안 되는가"는 현장마다 다르다. 그 답은 site.document(지침서)에만 있다 — 화면은
// 규칙을 다시 설명하지 않는다.
//
// - order(관악): 안전 → 차단 → 확인 → 기록, 네 작업 전부를 그 순서 그대로. 첫 출동의 정석이다.
// - subset(관측소): 가스관이 없는 폐허라 차단이 필요 없다 — 표지·확인·기록 셋만 마치면 된다.
//   차단까지 얹어도 벌점은 없다(순서 무관, 너그러운 규칙).
// - exclude(문서고): 서가엔 사람이 숨을 곳이 없다 — 잔해 안쪽 확인은 이 현장에서 금지된 절차다.
//   나머지 셋(표지·차단·기록)만 마치면 되고, 금지된 확인을 하면 그것만으로 등급이 내려간다.
// - count(폐허): 밤의 최소 요건 — 표지와 확인 둘만 마치면 판정에 들어갈 수 있다. 전원 차단과
//   기록은 판정 이후 회사가 처리하므로 여기서는 선택이다.

import type { CleanupTaskId, JobId } from "../ids";

export const CLEANUP_KIND_IDS = ["order", "subset", "exclude", "count"] as const;
export type CleanupKind = (typeof CLEANUP_KIND_IDS)[number];

export const CLEANUP_KINDS: Readonly<Record<JobId, CleanupKind>> = {
  gwanak: "order",
  observatory: "subset",
  hq: "exclude",
  ruins: "count",
};

/** subset·count 종류가 요구하는 필수 작업 집합(순서 무관). exclude 종류에서는 "금지 작업을
 * 뺀 나머지"를 완료 조건으로 쓴다 — 금지 작업 자체는 CLEANUP_FORBIDDEN이 따로 쥔다. */
export const CLEANUP_REQUIRED: Readonly<Partial<Record<JobId, readonly CleanupTaskId[]>>> = {
  observatory: ["sign", "search", "photo"],
  hq: ["sign", "power", "photo"],
  ruins: ["sign", "search"],
};

/** exclude 종류에서 손대면 안 되는 작업. */
export const CLEANUP_FORBIDDEN: Readonly<Partial<Record<JobId, CleanupTaskId>>> = {
  hq: "search",
};
