// 인물 한 줄의 문면 — 그 사람의 목소리를 입힐지, 끊을 수 있게 할지 정하는 한 자리.
//
// 목소리 연출(느린 박자·다른 서체)과 끊기(말을 끊는다)는 **같은 사람에게만** 붙는다: 지금은
// 루뿐이다(reveal.ts의 performsVoice). 나머지 인물의 대사는 정지한 문면으로 앉는다 — 움직이는
// 목소리는 이 한 사람의 표식이고, 그래서 끊는 일도 그 한 사람에게만 일어난다.
//
// 끊긴 줄은 회차에 남는다(run.cutLines) — 화면을 닫았다 열어도 뒷말은 돌아오지 않는다.

import type { CharacterId } from "../../ids";
import { META, MUTED } from "../density";
import { lineKey, performsVoice } from "../reveal";
import { useRunStore } from "../runStoreContext";
import { Prose } from "./Prose";

type VoicedLineProps = {
  readonly character: CharacterId;
  readonly text: string;
  /**
   * 앉는 자리. `line`은 대사 줄(짧고 조용히 앉는다), `prose`는 지문 자리(등장 애니메이션을 입고
   * 문단 나눔을 살린다). 자리에 따라 무게가 다르므로 문면의 클래스는 여기서 정한다.
   */
  readonly mode?: "line" | "prose" | "meta";
  /**
   * 차례 시차(ms)를 주면 이 문면도 뜬다 — 사람들 화면이 창문을 하나씩 세울 때 쓴다.
   * 주지 않으면 대사 줄은 조용히 앉는다(움직이는 목소리는 루의 표식).
   */
  readonly startDelay?: number;
  /**
   * 이 자리에서 말을 끊을 수 있는가 — 기본은 그렇다(끊기는 루를 만난 자리의 일이다).
   * 사람들 화면(田자 창문)처럼 여러 줄이 나란한 자리에서는 끄고, 면담에서만 끊게 한다.
   */
  readonly cut?: boolean;
};

export function VoicedLine({
  character,
  text,
  mode = "line",
  startDelay,
  cut = true,
}: VoicedLineProps) {
  const taken = useRunStore(
    (state) => state.run?.cutLines.find((line) => line.key === lineKey(text))?.words ?? null,
  );
  const cutLine = useRunStore((state) => state.cutLine);
  // 대사 줄 자리에서 목소리 연출이 없는 사람은 정지한 한 줄로 앉는다(움직이는 목소리는 루의 표식).
  if (mode !== "prose" && startDelay === undefined && !performsVoice(character)) {
    return <p className={mode === "meta" ? META : MUTED}>{text}</p>;
  }
  return (
    <Prose
      text={text}
      voice={character}
      {...(mode === "prose" ? {} : { className: mode === "meta" ? META : MUTED })}
      {...(startDelay === undefined ? {} : { startDelay })}
      {...(performsVoice(character) && cut
        ? { cut: { taken, onCut: (words) => cutLine(lineKey(text), words) } }
        : {})}
    />
  );
}
