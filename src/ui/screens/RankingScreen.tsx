import { TopBar } from "../components/TopBar";
import { useScreenStore } from "../screenStore";

export function RankingScreen() {
  const go = useScreenStore((state) => state.go);
  return <TopBar title="랭킹" onBack={() => go("title")} />;
}
