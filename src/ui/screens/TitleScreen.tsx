import { PixelSprite } from "../../art/PixelSprite";
import { ICONS } from "../../art/sprites/icons";
import { Button } from "../components/Button";
import { useRun } from "../runStoreContext";
import { useScreenStore } from "../screenStore";

const TAGLINE = "주사위 한 번에 하루가 갈리는 짧은 여정";

export function TitleScreen() {
  const go = useScreenStore((state) => state.go);
  const hasSave = useRun((state) => state.hasSave)();
  const load = useRun((state) => state.load);

  const resume = () => {
    if (load()) {
      go("adventure");
    }
  };

  return (
    <section className="flex flex-1 flex-col items-center px-4 pt-16 pb-6 text-center">
      <PixelSprite sprite={ICONS.d20} title="20면체 주사위" scale={5} />
      <h1 className="mt-6 text-display">모험가 이야기</h1>
      <p className="mt-2 text-sm text-ash">{TAGLINE}</p>
      <nav aria-label="시작 메뉴" className="mt-auto flex w-full flex-col gap-2 pt-12">
        <Button variant="primary" block onClick={() => go("create")}>
          새 모험
        </Button>
        {hasSave && (
          <Button block onClick={resume}>
            이어하기
          </Button>
        )}
        <Button block onClick={() => go("codex")}>
          도감
        </Button>
        <Button block onClick={() => go("ranking")}>
          랭킹
        </Button>
      </nav>
    </section>
  );
}
