// 인물 한 줄의 문면 — 그 사람의 목소리를 입힐지, 끊을 수 있게 할지 정하는 한 자리.
//
// 목소리 연출(느린 박자·다른 서체)과 끊기(말을 끊는다)는 **같은 사람에게만** 붙는다: 지금은
// 루뿐이다(reveal.ts의 performsVoice). 나머지 인물의 대사는 정지한 문면으로 앉는다 — 움직이는
// 목소리는 이 한 사람의 표식이고, 그래서 끊는 일도 그 한 사람에게만 일어난다.
//
// 끊긴 줄은 회차에 남는다(run.cutLines) — 화면을 닫았다 열어도 뒷말은 돌아오지 않는다.

import type { CharacterId } from "../../ids";
import { MUTED } from "../density";
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
  readonly mode?: "line" | "prose";
};

export function VoicedLine({ character, text, mode = "line" }: VoicedLineProps) {
  const taken = useRunStore(
    (state) => state.run?.cutLines.find((line) => line.key === lineKey(text))?.words ?? null,
  );
  const cutLine = useRunStore((state) => state.cutLine);
  // 대사 줄 자리에서 목소리 연출이 없는 사람은 정지한 한 줄로 앉는다(움직이는 목소리는 루의 표식).
  if (mode === "line" && !performsVoice(character)) {
    return <p className={MUTED}>{text}</p>;
  }
  return (
    <Prose
      text={text}
      voice={character}
      {...(mode === "line" ? { className: MUTED } : {})}
      {...(performsVoice(character)
        ? { cut: { taken, onCut: (words) => cutLine(lineKey(text), words) } }
        : {})}
    />
  );
}
