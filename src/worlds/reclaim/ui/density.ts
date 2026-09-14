// reclaim의 밀도 토큰 — 공용 타이포 토큰(src/styles/theme.css)은 앱 전체가 쓰므로 건드리지
// 않고, 세계 래퍼(App.tsx)에서 CSS 변수 하나만 덮어쓴다. 다른 세계와 허브는 이 값을 보지
// 않는다: 블라스트 레디어스가 이 세계 안에서 닫힌다.
//
// 확정된 리듬(2026-09-14, 사용자 선택 "reclaim만"):
//   산문 16px(text-base) · 행간 1.75(--leading-prose 오버라이드) · 구역 간격 24px ·
//   화면 여백 16px · 구역 안쪽 8px. 문단은 `\n\n`이 만드는 빈 줄이 간격이다(pre-line).
//   테두리(2px)는 **대상**에만 쓴다 — 프린터, 초상, 문서처럼 만질 수 있는 것. 뉴스·잡담·
//   기록은 테두리 대신 무게(크기·색)로 위계를 준다. 같은 테두리를 모든 블록에 두르면
//   위계가 사라지고 화면이 가득 차 보인다(이 리듬이 고친 실제 결함).

import type { CSSProperties } from "react";

/** 세계 래퍼에 깔리는 변수 — 공용 --leading-prose(1.6)를 이 세계에서만 덮는다. */
export const DENSITY_STYLE = {
  "--leading-prose": "1.75",
} as CSSProperties;

/** 화면 여백 — 바깥 프레임. */
export const SCREEN_PAD = "p-4";

/** 구역 사이 — 문단 블록과 다음 블록 사이. */
export const SECTION_GAP = "gap-6";

/** 구역 안쪽 — 이름과 그 사람의 말처럼 붙어 있어야 하는 사이. */
export const INNER_GAP = "gap-2";

/** 산문 — 이 세계의 본문 크기(토큰 주석의 body 16px). 모든 1인칭 지문이 이 클래스를 쓴다. */
export const PROSE = "text-base leading-prose text-parchment";

/** 보조 문면 — 뉴스·문서 밖 안내·인물 한 줄. 본문보다 한 단계 아래. */
export const MUTED = "text-sm leading-prose text-ash";

/** 메타 — 기록 줄·상태 요약. 가장 작고 가장 흐리다. */
export const META = "text-xs leading-prose text-ash";
