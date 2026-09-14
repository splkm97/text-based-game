// 지문의 등장 애니메이션 — 단어가 아래에서 떠오르며 흐림이 걷히고, **문단은 위에서부터 차례로**
// 시작한다(사용자 결정, 2026-09-14). 문단 p는 문단 p−1이 완전히 끝난 뒤에 시작한다 — 겹치지
// 않는다. 한 화면이 한꺼번에 차오르지 않고 읽는 순서대로 채워진다.
//
// 목소리마다 박자가 다르다(cadence): 지문은 기본 박자, **루는 유난히 느리고 말줄임표 조각 뒤에
// 멈춘다** — 그녀의 말더듬이 화면에서 실제로 들리게. **문단이 길면 더 느리게** 흐른다: 단어
// 시차가 문단 길이에 비례해 커지므로(성장 상한까지) 긴 문단은 그만큼 오래 걸린다. 루의 글자는 서체도 다르다(Galmuri9,
// 같은 프로젝트·같은 라이선스의 다른 픽셀 격자) — 목소리가 눈에도 다르게 앉는다.
//
// 왜 단어 span인가: 문자를 하나씩 찍는 타이프라이터는 (a) 긴 지문에서 수 초를 기다리게 하고
// (b) DOM의 textContent를 실시간으로 바꿔 선택·복사·스크린리더·테스트를 깬다. 여기서는 **문장을
// 그대로 두고** 단어를 span으로 감싸기만 한다 — textContent는 원문과 한 글자도 다르지 않다.
//
// 왜 CSS인가: Web Animations API는 마운트 뒤에 돌아 첫 프레임이 깜빡이고, jsdom에서는 아예 돌지
// 않아 초기 opacity 0이 남는다. 키프레임 + animation-fill-mode: both는 CSS만으로 시작 상태를
// 잡고, 애니메이션이 없는 환경(테스트·reduced-motion·건너뛴 뒤)에서는 원문 그대로 보인다.

import galmuri9 from "galmuri/dist/Galmuri9.woff2?url";
import type { CharacterId } from "../ids";

/** 한 목소리의 박자. */
export type Cadence = {
  /** 단어 하나가 떠오르는 시간(ms). */
  readonly wordMs: number;
  /** 문단이 짧을 때의 단어 시차(ms). */
  readonly stagger: number;
  /** 단어 하나 늘 때마다 더해지는 시차(ms) — **긴 문단은 더 느리게 표출된다**. */
  readonly staggerGrowth: number;
  /** 시차가 더 늘지 않는 문단 길이(단어) — 아주 긴 문단이 끝없이 늘어지지 않게. */
  readonly growthCap: number;
  /** 말줄임표(`…`)가 붙은 조각 뒤에 멈추는 시간(ms) — 말더듬의 침묵. */
  readonly ellipsisPause: number;
};

/** 지문(1인칭 서술)의 기본 박자 — 16ms에서 시작해 단어마다 조금씩 무거워진다(30단어에서 34ms). */
export const NARRATOR_CADENCE: Cadence = {
  wordMs: 380,
  stagger: 16,
  staggerGrowth: 0.6,
  growthCap: 30,
  ellipsisPause: 0,
};

/** 루의 박자 — 단어 사이가 세 배쯤 길고, 끊긴 조각마다 멈춘다(여전히 가장 느리다). */
export const RU_CADENCE: Cadence = {
  wordMs: 480,
  stagger: 38,
  staggerGrowth: 0.8,
  growthCap: 24,
  ellipsisPause: 260,
};

/**
 * 사람들 화면(田자 창문)의 차례 시차(ms) — 아침 조회처럼 창문이 하나씩 이어서 뜬다.
 * 네 창문이 동시에 차오르면 "조회"가 아니라 "로딩"으로 읽힌다.
 */
export const ROLL_CALL_STEP_MS = 220;

/** 그 문단의 단어 시차(ms) — 길수록 느리다(성장 상한까지). */
export const staggerFor = (wordCount: number, cadence: Cadence): number =>
  cadence.stagger + Math.min(Math.max(wordCount - 1, 0), cadence.growthCap) * cadence.staggerGrowth;

/**
 * 이 인물의 대사에 목소리 연출(느린 박자·다른 서체)을 입히는가 — 지금은 루만 그렇다.
 * 대사 줄은 원래 애니메이션 없이 조용히 앉는다: 움직이는 목소리는 이 한 사람의 표식이다.
 */
export const performsVoice = (character: CharacterId): boolean => character === "ru";

/** 그 목소리의 박자 — 루만 다르다(나머지는 지문과 같은 박자로 읽는다). */
export const cadenceFor = (voice?: CharacterId): Cadence =>
  voice === "ru" ? RU_CADENCE : NARRATOR_CADENCE;

const ELLIPSIS = "…";

/**
 * 문단별·단어별 지연(ms). 문단은 앞 문단이 다 앉은 뒤에 시작하고(겹침 없음), 문단 안에서는
 * 단어 시차가 쌓이며, 말줄임표로 끝난 단어 뒤에는 그 목소리의 침묵이 붙는다.
 */
export const schedule = (
  paragraphs: readonly string[],
  cadence: Cadence,
): readonly (readonly number[])[] => {
  const starts: number[][] = [];
  let at = 0;
  for (const paragraph of paragraphs) {
    const words = paragraph.split(" ");
    const stagger = staggerFor(words.length, cadence);
    const delays: number[] = [];
    let pause = 0;
    for (const [index, word] of words.entries()) {
      delays.push(at + index * stagger + pause);
      if (word.endsWith(ELLIPSIS)) pause += cadence.ellipsisPause;
    }
    starts.push(delays);
    const last = delays.at(-1) ?? at;
    at = last + cadence.wordMs; // 다음 문단은 이 문단이 다 앉은 뒤에 시작한다
  }
  return starts;
};

/**
 * 문면의 지문(키) — 끊긴 줄을 회차에 기록할 때 쓴다. 문면이 바뀌면 키도 바뀌므로, 다시 쓴
 * 줄은 새 줄로 취급된다(옛 끊김이 새 문장을 잘라 먹지 않는다). FNV-1a 32비트.
 */
export const lineKey = (text: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
};

/** 처음 `words`개 단어만 남긴 문면 — 문단 구조는 살린다(끊긴 줄의 화면 표시). */
export const visiblePrefix = (text: string, words: number): string => {
  const kept: string[] = [];
  let left = words;
  for (const paragraph of text.split("\n\n")) {
    if (left <= 0) break;
    const tokens = paragraph.split(" ");
    kept.push(tokens.slice(0, left).join(" "));
    left -= tokens.length;
  }
  return kept.join("\n\n");
};

/** 그 시각(ms)까지 **다 앉은** 단어 수 — 끊는 순간의 앞부분을 세는 데 쓴다. */
export const settledWords = (
  lines: readonly (readonly number[])[],
  cadence: Cadence,
  elapsedMs: number,
): number => {
  let count = 0;
  for (const line of lines) {
    for (const delay of line) {
      if (delay + cadence.wordMs <= elapsedMs) count += 1;
    }
  }
  return count;
};

/** 세계 래퍼(App)가 한 번 렌더하는 키프레임·서체·클래스·예외. */
export const REVEAL_CSS = `
@font-face {
  font-family: "Galmuri9";
  src: url("${galmuri9}") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@keyframes reclaim-reveal {
  from { opacity: 0; transform: translateY(6px); filter: blur(6px); }
  to   { opacity: 1; transform: none; filter: none; }
}
.reclaim-reveal-word {
  display: inline-block;
  animation: reclaim-reveal var(--reclaim-word-ms, 380ms) var(--ease-ink) both;
}
/*
 * 문단 성장 — 단어는 transform으로 떠오르지만 transform은 자리를 만들지 않는다. 그래서 문단을
 * grid-template-rows 0fr → 1fr로 함께 늘려, 글이 나오는 만큼 **아래 내용이 조금씩 밀려 내려가게**
 * 한다(사용자 지시: 세로 공간이 점점 넓어지는 느낌). 늘어나는 시간은 그 문단의 등장 시간과 같다.
 */
.reclaim-grow {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--reclaim-grow-ms, 600ms) var(--ease-ink);
}
.reclaim-grow.reclaim-grown { grid-template-rows: 1fr; }
.reclaim-grow > * { overflow: hidden; }
@media (prefers-reduced-motion: reduce) {
  .reclaim-grow { transition: none; }
}

/* 루의 목소리 — 다른 픽셀 격자(Galmuri9)로 앉는다. 크기는 자리가 정한다: 지문 자리에서만
   한 단계 크게(9px 격자는 정수배에서 또렷하다), 대사 줄·격자처럼 작은 자리에서는 그 자리의
   크기를 그대로 쓴다(서체만 다르고 크기는 이웃과 같다 — 작은 자리에서 혼자 커지면 튄다). */
.reclaim-voice-ru { font-family: "Galmuri9", var(--font-pixel); }
.reclaim-voice-ru.reclaim-voice-lg { font-size: 1.125rem; }
@media (prefers-reduced-motion: reduce) {
  .reclaim-reveal-word { animation: none; }
}
`;
