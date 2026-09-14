// 월드 셸 — 나가기(허브 복귀)만 소유하고 화면 전환은 판단한다. 기본 화면은 screenStore가
// 고르되 기록 화면을 제외한 title·play·ending은 runStore.run에서 유도된다: run이 없으면
// 타이틀, 종결이면 종결 화면, 그 외 플레이(PlayScreen은 종결에서 스스로 null이 된다).
// 테마는 호스트(HostApp)가 token 변수로 깔아 준다 — 여기서는 토큰 클래스만 쓴다.

import type { ReactElement } from "react";
import type { WorldRootProps } from "../../../host/world";
import { Button } from "../../../shared/ui/Button";
import { DENSITY_STYLE } from "./density";
import { REVEAL_CSS } from "./reveal";
import { useRunStore } from "./runStoreContext";
import { useScreenStore } from "./screenStore";
import { EndingScreen } from "./screens/EndingScreen";
import { PlayScreen } from "./screens/PlayScreen";
import { RecordsScreen } from "./screens/RecordsScreen";
import { TitleScreen } from "./screens/TitleScreen";

export function App({ onExit }: WorldRootProps) {
  const screen = useScreenStore((state) => state.screen);
  const go = useScreenStore((state) => state.go);
  const run = useRunStore((state) => state.run);

  // 다시 들어올 때는 항상 타이틀부터 — 화면 상태를 되돌려 놓고 허브로 나간다.
  const exit = () => {
    go("title");
    onExit();
  };

  let body: ReactElement;
  if (screen === "records") {
    body = <RecordsScreen />;
  } else if (run === null) {
    body = <TitleScreen />;
  } else if (run.terminal !== null) {
    body = <EndingScreen onExit={exit} />;
  } else {
    body = <PlayScreen />;
  }

  return (
    <>
      {/* 등장 애니메이션 키프레임 한 벌 — 세계 래퍼가 한 번만 깐다(reveal.ts). */}
      <style>{REVEAL_CSS}</style>
      <main
        className="safe-area mx-auto flex min-h-dvh w-full max-w-phone flex-col bg-ink-deep text-parchment"
        style={DENSITY_STYLE}
      >
        <header className="flex items-center justify-end border-b-2 border-slate px-4 py-2">
          <Button onClick={exit}>나가기</Button>
        </header>
        {body}
      </main>
    </>
  );
}
