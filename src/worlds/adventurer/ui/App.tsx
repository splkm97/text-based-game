import type { ReactElement } from "react";
import type { WorldRootProps } from "../../../host/world";
import { type Screen, useScreenStore } from "./screenStore";
import { AdventureScreen } from "./screens/AdventureScreen";
import { CodexScreen } from "./screens/CodexScreen";
import { CreateScreen } from "./screens/CreateScreen";
import { RankingScreen } from "./screens/RankingScreen";
import { TitleScreen } from "./screens/TitleScreen";

const screenFor = (screen: Screen, onExit: () => void): ReactElement => {
  switch (screen) {
    case "title":
      return <TitleScreen onExit={onExit} />;
    case "create":
      return <CreateScreen />;
    case "adventure":
      return <AdventureScreen />;
    case "codex":
      return <CodexScreen />;
    case "ranking":
      return <RankingScreen />;
  }
};

export function App({ onExit }: WorldRootProps) {
  const screen = useScreenStore((state) => state.screen);
  const go = useScreenStore((state) => state.go);
  // The screen store is a module singleton: reset it so re-entering the world lands on the title.
  const exit = () => {
    go("title");
    onExit();
  };
  return (
    <main className="safe-area mx-auto flex min-h-dvh w-full max-w-phone flex-col">
      {screenFor(screen, exit)}
    </main>
  );
}
