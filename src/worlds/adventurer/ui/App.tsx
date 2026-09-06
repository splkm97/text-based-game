import type { ReactElement } from "react";
import { UpdateToast } from "../../../host/pwa/UpdateToast";
import { type Screen, useScreenStore } from "./screenStore";
import { AdventureScreen } from "./screens/AdventureScreen";
import { CodexScreen } from "./screens/CodexScreen";
import { CreateScreen } from "./screens/CreateScreen";
import { RankingScreen } from "./screens/RankingScreen";
import { TitleScreen } from "./screens/TitleScreen";

const screenFor = (screen: Screen): ReactElement => {
  switch (screen) {
    case "title":
      return <TitleScreen />;
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

export function App() {
  const screen = useScreenStore((state) => state.screen);
  return (
    <main className="safe-area mx-auto flex min-h-dvh w-full max-w-phone flex-col">
      {screenFor(screen)}
      <UpdateToast />
    </main>
  );
}
