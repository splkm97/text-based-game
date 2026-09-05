import { TopBar } from "../components/TopBar";
import { useScreenStore } from "../screenStore";

export function CodexScreen() {
  const go = useScreenStore((state) => state.go);
  return <TopBar title="도감" onBack={() => go("title")} />;
}
