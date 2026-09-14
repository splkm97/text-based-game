// 지문 한 블록 — 원문을 단어 span으로 감싸 등장 애니메이션을 입힌다(reveal.ts).
//
// 계약: 이 컴포넌트의 textContent는 넘긴 text와 **정확히 같다**(끊긴 뒤에는 보인 앞부분과
// 같다). 단어 사이 공백과 문단 사이 빈 줄(`\n\n`)을 텍스트 노드로 그대로 흘려보내기 때문이다 —
// 복사·검색·스크린리더·테스트가 원문을 본다. whitespace-pre-line이 그 빈 줄을 문단 간격으로 그린다.
//
// 문단은 위에서부터 차례로 뜬다(겹치지 않는다). 건너뛰기 버튼은 두지 않는다 — 이 세계에서
// 지문을 대하는 방법은 읽거나, **끊거나**(`cut`) 둘뿐이다. 끊으면 그때까지 보인 앞부분만 남고
// 뒷말은 회차에 기록되어 다시 오지 않는다.

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
  const [settled, setSettled] = useState(false);
  const total = (delays.at(-1)?.at(-1) ?? 0) + cadence.wordMs;
  const voiceClass = voice === "ru" ? " reclaim-voice-ru" : "";

  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), total);
    return () => clearTimeout(timer);
  }, [total]);

  // 끊긴 줄: 보인 앞부분만 남기고, 나머지는 영영 오지 않는다(문단 구조는 살린다).
  const taken = cut?.taken ?? null;
  if (taken !== null) {
    return (
      <>
        <p className={`whitespace-pre-line ${className ?? PROSE}${voiceClass}`}>
          {visiblePrefix(text, Math.max(taken, 1))}
        </p>
        <p className={META}>…말을 끊었다 — 뒷말은 듣지 못했다.</p>
      </>
    );
  }

  return (
    <>
      <p
        className={`whitespace-pre-line ${className ?? PROSE}${voiceClass}`}
        style={{ "--reclaim-word-ms": `${cadence.wordMs}ms` } as CSSProperties}
      >
        {paragraphs.flatMap((paragraph, index) => {
          const line: ReactNode[] = paragraph.split(" ").flatMap((word, wordIndex) => {
            const span = (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: 문단·단어 위치가 곧 서열이다(문면은 불변).
                key={`${index}-${wordIndex}`}
                className="reclaim-reveal-word"
                style={{ animationDelay: `${delays[index]?.[wordIndex] ?? 0}ms` }}
              >
                {word}
              </span>
            );
            return wordIndex === 0 ? [span] : [" ", span];
          });
          return index === 0 ? line : ["\n\n", ...line];
        })}
      </p>
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
    </>
  );
}
