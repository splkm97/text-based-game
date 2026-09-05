import { TopBar } from "../components/TopBar";
import { useScreenStore } from "../screenStore";

export function AdventureScreen() {
  const go = useScreenStore((state) => state.go);
  return <TopBar title="모험" onBack={() => go("title")} />;
}
