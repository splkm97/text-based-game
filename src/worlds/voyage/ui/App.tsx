import type { ReactElement } from "react";
import type { WorldRootProps } from "../../../host/world";
import { type Screen, useScreenStore } from "./screenStore";
import { TitleScreen } from "./screens/TitleScreen";
import { VoyageScreen } from "./screens/VoyageScreen";

const screenFor = (screen: Screen, onExit: () => void): ReactElement => {
  switch (screen) {
    case "title":
      return <TitleScreen onExit={onExit} />;
    case "voyage":
      return <VoyageScreen onExit={onExit} />;
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
