// @vitest-environment jsdom

// 지문 등장 애니메이션의 계약:
//  ① 단어를 span으로 감싸도 **원문이 한 글자도 바뀌지 않는다** — 이 검사가 없으면 분할 로직이
//     조용히 공백이나 문단 빈 줄(`\n\n`)을 잃어도 아무도 모른다(복사·검색·스크린리더·다른
//     화면 테스트가 전부 이 성질 위에 서 있다).
//  ② 문단은 위에서부터 차례로 뜨고 **겹치지 않는다** — 다음 문단의 시작은 앞 문단이 다 앉은 뒤다.
//  ③ 루의 목소리는 유난히 느리고, 말줄임표 조각 뒤에 멈춘다(말더듬이 화면에서 들린다).
//  ④ 끊을 수 있는 문면은 `말을 끊는다`를 세우고, 끊긴 뒤에는 **보인 앞부분과 표시만** 남는다 —
//     뒷말은 다시 오지 않는다.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import {
  cadenceFor,
  lineKey,
  NARRATOR_CADENCE,
  performsVoice,
  REVEAL_CSS,
  RU_CADENCE,
  schedule,
  settledWords,
  visiblePrefix,
} from "../reveal";
import { Prose } from "./Prose";

afterEach(cleanup);

const TEXT = "첫 문단의 문장이다. 조금 길게 쓴다.\n\n둘째 문단은 여기서 시작한다.";
const RU_TEXT = "…뉴, 뉴스가… …말, 말한… …곳은… …지도에… …표시해… …뒀어요.";

const paragraphWordCounts = (text: string): readonly number[] =>
  text.split("\n\n").map((paragraph) => paragraph.split(" ").length);

const wordSpans = (container: HTMLElement): readonly HTMLElement[] => [
  ...container.querySelectorAll<HTMLElement>(".reclaim-reveal-word"),
];

const delay = (span: HTMLElement): number => Number.parseFloat(span.style.animationDelay);

test("단어 span으로 감싸도 textContent는 원문 그대로다", () => {
  const { container } = render(<Prose text={TEXT} />);
  const block = container.querySelector("p");
  const expected = paragraphWordCounts(TEXT).reduce((a, b) => a + b, 0);
  expect(block?.textContent).toBe(TEXT);
  expect(wordSpans(container).length).toBe(expected);
});

test("문단은 위에서부터 차례로 뜬다 — 다음 문단은 앞 문단이 다 앉은 뒤에 시작한다", () => {
  const paragraphs = TEXT.split("\n\n");
  const { container } = render(<Prose text={TEXT} />);
  const lines = schedule(paragraphs, NARRATOR_CADENCE);
  const spans = wordSpans(container);

  expect(spans.map(delay)).toEqual(lines.flat());
  for (const [index, line] of lines.entries()) {
    if (index > 0) {
      const previousLast = lines[index - 1]?.at(-1) ?? -1;
      expect(line[0], `${index}번째 문단 시작`).toBe(previousLast + NARRATOR_CADENCE.wordMs);
    }
    for (let i = 1; i < line.length; i++) {
      expect(line[i], `${index}번째 문단 ${i}번째 단어`).toBeGreaterThanOrEqual(line[i - 1] ?? -1);
    }
  }
});

test("문단이 길면 더 느리게 흐른다 — 단어 시차가 문단 길이에 비례한다", () => {
  const short = schedule(["가 나 다 라 마"], NARRATOR_CADENCE)[0] ?? [];
  const long =
    schedule([Array.from({ length: 40 }, (_, i) => `말${i}`).join(" ")], NARRATOR_CADENCE)[0] ?? [];
  const shortGap = (short[1] ?? 0) - (short[0] ?? 0);
  const longGap = (long[10] ?? 0) - (long[9] ?? 0);
  expect(longGap).toBeGreaterThan(shortGap);
  expect(long.at(-1) ?? 0).toBeGreaterThan((short.at(-1) ?? 0) * 8);
});

test("루의 목소리는 유난히 느리고, 말줄임표 조각 뒤에 멈춘다", () => {
  const { container } = render(<Prose text={RU_TEXT} voice="ru" />);
  const delays = wordSpans(container).map(delay);
  const words = RU_TEXT.split(" ");

  expect(delays.at(-1) ?? 0).toBeGreaterThan(schedule([RU_TEXT], NARRATOR_CADENCE)[0]?.at(-1) ?? 0);

  const afterEllipsis = words.findIndex((word) => word.endsWith("…"));
  expect(afterEllipsis).toBeGreaterThanOrEqual(0);
  const gap = (delays[afterEllipsis + 1] ?? 0) - (delays[afterEllipsis] ?? 0);
  expect(gap).toBeGreaterThanOrEqual(RU_CADENCE.ellipsisPause);

  expect(container.querySelector("p")?.className).toContain("reclaim-voice-ru");
  expect(REVEAL_CSS).toContain('font-family: "Galmuri9"');
});

test("목소리 판정은 한 곳에 있다 — 지금 연출을 입는 사람은 루뿐이다", () => {
  expect(performsVoice("ru")).toBe(true);
  expect(performsVoice("dusik")).toBe(false);
  expect(cadenceFor("ru")).toBe(RU_CADENCE);
  expect(cadenceFor(undefined)).toBe(NARRATOR_CADENCE);
});

test("끊을 수 있는 문면은 `말을 끊는다`를 세우고, 누르면 지금까지 보인 단어 수를 넘긴다", () => {
  const onCut = vi.fn();
  const { container } = render(<Prose text={RU_TEXT} voice="ru" cut={{ taken: null, onCut }} />);
  const button = screen.getByRole("button", { name: "말을 끊는다" });
  fireEvent.click(button);

  expect(onCut).toHaveBeenCalledTimes(1);
  const words = onCut.mock.calls[0]?.[0] ?? 0;
  // 누른 순간까지 다 앉은 단어 수 = 화면이 보여 준 앞부분. 0이어도 한 단어는 나온 것으로 친다.
  expect(words).toBeGreaterThanOrEqual(1);
  expect(words).toBeLessThanOrEqual(wordSpans(container).length);
});

test("끊긴 문면은 보인 앞부분과 표시만 남고, 뒷말은 화면에서 사라진다", () => {
  const taken = 3;
  const { container } = render(
    <Prose text={RU_TEXT} voice="ru" cut={{ taken, onCut: () => {} }} />,
  );
  const block = container.querySelector("p");
  expect(block?.textContent).toBe(visiblePrefix(RU_TEXT, taken));
  expect(block?.textContent).not.toBe(RU_TEXT);
  expect(container.textContent).toContain("뒷말은 듣지 못했다");
  // 끊긴 뒤에는 끊을 것이 없다 — 버튼도, 움직이는 단어도 없다.
  expect(screen.queryByRole("button")).toBeNull();
  expect(wordSpans(container).length).toBe(0);
});

test("문단 구조를 살려 앞부분만 남긴다 — 끊긴 자리가 문단을 넘어가도 빈 줄이 남는다", () => {
  expect(visiblePrefix("가 나 다\n\n라 마 바", 4)).toBe("가 나 다\n\n라");
  expect(visiblePrefix("가 나 다\n\n라 마 바", 2)).toBe("가 나");
});

test("settledWords는 그 시각까지 다 앉은 단어를 센다", () => {
  const lines = schedule(["가 나 다", "라 마"], NARRATOR_CADENCE);
  expect(settledWords(lines, NARRATOR_CADENCE, 0)).toBe(0);
  const all = settledWords(lines, NARRATOR_CADENCE, 10_000);
  expect(all).toBe(5);
});

test("지문 키는 문면마다 다르고 같은 문면이면 같다", () => {
  expect(lineKey("가")).toBe(lineKey("가"));
  expect(lineKey("가")).not.toBe(lineKey("나"));
  expect(lineKey(RU_TEXT)).toMatch(/^[0-9a-f]{8}$/);
});

test("키프레임·모션 최소화·레이어 승격 금지", () => {
  expect(REVEAL_CSS).toContain("@keyframes reclaim-reveal");
  expect(REVEAL_CSS).toContain("blur(");
  expect(REVEAL_CSS).toContain("prefers-reduced-motion");
  // 단어 span이 한 장면에 수백 개 생긴다 — will-change로 레이어를 승격시키면 안 된다.
  expect(REVEAL_CSS).not.toContain("will-change");
});
