// 지문 한 블록 — 원문을 단어 span으로 감싸 등장 애니메이션을 입힌다(reveal.ts).
//
// 계약: 이 컴포넌트의 textContent는 넘긴 text와 **정확히 같다**(끊긴 뒤에는 보인 앞부분과
// 같다). 단어 사이 공백과 문단 사이 빈 줄(`\n\n`)을 텍스트 노드로 그대로 흘려보내기 때문이다 —
// 복사·검색·스크린리더·테스트가 원문을 본다.
//
// 문단은 위에서부터 차례로 뜬다(겹치지 않는다). 단어는 제 차례가 될 때까지 투명하고, 차례가 되면
// 제자리에서 떠오른다 — **자리(레이아웃)는 처음부터 끝까지 그대로다**: 예전에는 문단 상자를
// grid-template-rows 0fr→1fr로 늘려 아래 내용을 밀어 내려갔지만, 그러면 공문처럼 지문 아래에
// 놓인 것이 애니메이션 내내 밀려 내려간다(모바일에서 문서가 화면 밖으로 밀리는 결함).
//
// 끊을 수 있는 문면(루)에는 **위쪽**에 `말을 끊는다`가 선다 — 읽는 흐름의 앞자리에서 결정하고,
// 아래에 남는 것은 글과 다음 행동뿐이게. 끊으면 그때까지 보인 앞부분만 남고 뒷말은 회차에
// 기록되어 다시 오지 않는다. 건너뛰기 버튼은 두지 않는다: 지문을 대하는 방법은 읽거나 끊거나 둘뿐이다.

import { type CSSProperties, Fragment, type ReactNode, useEffect, useRef, useState } from "react";
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
  /** 이 문면이 뜨기 시작하는 시각(ms) — 여러 문면이 차례로 뜰 때의 시차. */
  readonly startDelay?: number;
};

export function Prose({ text, voice, className, cut, startDelay = 0 }: ProseProps) {
  const cadence = cadenceFor(voice);
  const paragraphs = text.split("\n\n");
  const delays = schedule(paragraphs, cadence);
  const started = useRef(Date.now());
  const [settled, setSettled] = useState(false);
  const total = startDelay + (delays.at(-1)?.at(-1) ?? 0) + cadence.wordMs;
  // 서체는 목소리의 것, 크기는 자리의 것 — 기본 지문 자리에서만 한 단계 크게 앉는다.
  const voiceClass =
    voice === "ru" ? ` reclaim-voice-ru${className === undefined ? " reclaim-voice-lg" : ""}` : "";
  const block = `${className ?? PROSE}${voiceClass}`;

  // 다 앉기 전까지만 끊을 수 있다 — 다 앉으면 끊을 것이 남지 않는다.
  useEffect(() => {
    const timer = setTimeout(() => setSettled(true), total);
    return () => clearTimeout(timer);
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
            cut.onCut(
              Math.max(settledWords(delays, cadence, Date.now() - started.current - startDelay), 1),
            )
          }
        >
          말을 끊는다
        </button>
      )}
      <p
        className={`whitespace-pre-line ${block}`}
        style={{ "--reclaim-word-ms": `${cadence.wordMs}ms` } as CSSProperties}
      >
        {paragraphs.map((paragraph, index) => (
          <Fragment
            // biome-ignore lint/suspicious/noArrayIndexKey: 문단 위치가 곧 서열이다(문면은 불변).
            key={index}
          >
            {index > 0 && "\n\n"}
            {paragraph.split(" ").flatMap((word, wordIndex) => {
              const revealed: ReactNode = (
                <span
                  // biome-ignore lint/suspicious/noArrayIndexKey: 문단·단어 위치가 곧 서열이다(문면은 불변).
                  key={`${index}-${wordIndex}`}
                  className="reclaim-reveal-word"
                  style={{ animationDelay: `${startDelay + (delays[index]?.[wordIndex] ?? 0)}ms` }}
                >
                  {word}
                </span>
              );
              return wordIndex === 0 ? [revealed] : [" ", revealed];
            })}
          </Fragment>
        ))}
      </p>
    </>
  );
}
