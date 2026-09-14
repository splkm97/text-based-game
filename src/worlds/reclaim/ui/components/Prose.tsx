// 지문 한 블록 — 원문을 단어 span으로 감싸 등장 애니메이션을 입힌다(reveal.ts).
//
// 계약: 이 컴포넌트의 textContent는 넘긴 text와 **정확히 같다**(끊긴 뒤에는 보인 앞부분과
// 같다). 단어 사이 공백과 문단 사이 빈 줄(`\n\n`)을 텍스트 노드로 그대로 흘려보내기 때문이다 —
// 복사·검색·스크린리더·테스트가 원문을 본다.
//
// 문단은 위에서부터 차례로 뜨고(겹치지 않는다), 뜨는 동안 **자리도 함께 자란다**: 단어의
// transform은 레이아웃을 건드리지 않으므로, 문단 상자를 grid-template-rows 0fr→1fr로 늘려
// 아래 내용이 조금씩 밀려 내려가게 한다(세로 공간이 점점 넓어지는 느낌).
//
// 끊을 수 있는 문면(루)에는 **위쪽**에 `말을 끊는다`가 선다 — 읽는 흐름의 앞자리에서 결정하고,
// 아래에 남는 것은 글과 다음 행동뿐이게. 끊으면 그때까지 보인 앞부분만 남고 뒷말은 회차에
// 기록되어 다시 오지 않는다. 건너뛰기 버튼은 두지 않는다: 지문을 대하는 방법은 읽거나 끊거나 둘뿐이다.

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import type { CharacterId } from "../../ids";
import { META, PROSE } from "../density";
import { cadenceFor, schedule, settledWords, visiblePrefix } from "../reveal";

/** 루의 말을 끊는 자리 — 누르면 그때까지 보인 단어 수가 회차에 남는다(되돌릴 수 없다). */
export type CutHandle = {
  /** 이미 끊겼다면 그때까지 보였던 단어 수, 아니면 null. */
  readonly taken: number | null;
  readonly onCut: (words: number) => void;
};

type ProseProps = {
  readonly text: string;
  /** 이 문면을 말하는 사람 — 루면 말더듬 박자와 다른 서체가 붙는다. */
  readonly voice?: CharacterId;
  /** 문면의 무게 — 기본은 지문(PROSE). 대사 줄은 MUTED를 넘긴다. */
  readonly className?: string;
  /** 끊을 수 있는 문면이면 넘긴다(루의 목소리). */
  readonly cut?: CutHandle;
};

export function Prose({ text, voice, className, cut }: ProseProps) {
  const cadence = cadenceFor(voice);
  const paragraphs = text.split("\n\n");
  const delays = schedule(paragraphs, cadence);
  const started = useRef(Date.now());
  const [grown, setGrown] = useState(false);
  const [settled, setSettled] = useState(false);
  const total = (delays.at(-1)?.at(-1) ?? 0) + cadence.wordMs;
  const block = `${className ?? PROSE}${voice === "ru" ? " reclaim-voice-ru" : ""}`;

  // 자라는 것은 마운트 뒤 한 번 뒤집어야 CSS 전환이 걸린다(첫 프레임은 0fr로 그린다).
  useEffect(() => {
    const flip = requestAnimationFrame(() => setGrown(true));
    const timer = setTimeout(() => setSettled(true), total);
    return () => {
      cancelAnimationFrame(flip);
      clearTimeout(timer);
    };
  }, [total]);

  const taken = cut?.taken ?? null;
  if (taken !== null) {
    return (
      <>
        <p className={`whitespace-pre-line ${block}`}>{visiblePrefix(text, Math.max(taken, 1))}</p>
        <p className={META}>…말을 끊었다 — 뒷말은 듣지 못했다.</p>
      </>
    );
  }

  return (
    <>
      {cut !== undefined && !settled && (
        <button
          type="button"
          className={`inline-flex min-h-11 items-center self-end px-2 ${META} underline`}
          onClick={() =>
            cut.onCut(Math.max(settledWords(delays, cadence, Date.now() - started.current), 1))
          }
        >
          말을 끊는다
        </button>
      )}
      <p
        className={`whitespace-pre-line ${block}`}
        style={{ "--reclaim-word-ms": `${cadence.wordMs}ms` } as CSSProperties}
      >
        {paragraphs.map((paragraph, index) => {
          const start = delays[index]?.[0] ?? 0;
          const span = Math.max((delays[index]?.at(-1) ?? start) - start + cadence.wordMs, 1);
          const words: ReactNode[] = paragraph.split(" ").flatMap((word, wordIndex) => {
            const span_ = (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: 문단·단어 위치가 곧 서열이다(문면은 불변).
                key={`${index}-${wordIndex}`}
                className="reclaim-reveal-word"
                style={{ animationDelay: `${delays[index]?.[wordIndex] ?? 0}ms` }}
              >
                {word}
              </span>
            );
            return wordIndex === 0 ? [span_] : [" ", span_];
          });
          return (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: 문단 위치가 곧 서열이다(문면은 불변).
              key={index}
              className={`reclaim-grow${grown ? " reclaim-grown" : ""}`}
              style={
                {
                  "--reclaim-grow-ms": `${span}ms`,
                  transitionDelay: `${start}ms`,
                } as CSSProperties
              }
            >
              <span className="block">{index === 0 ? words : ["\n\n", ...words]}</span>
            </span>
          );
        })}
      </p>
    </>
  );
}
