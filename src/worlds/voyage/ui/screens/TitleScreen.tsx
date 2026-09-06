import type { WorldRootProps } from "../../../../host/world";
import { PixelSprite } from "../../../../shared/art/PixelSprite";
import { Button } from "../../../../shared/ui/Button";
import { META } from "../../meta";
import { useRun } from "../runStoreContext";
import { useScreenStore } from "../screenStore";

export function TitleScreen({ onExit }: WorldRootProps) {
  const go = useScreenStore((state) => state.go);
  const hasSave = useRun((state) => state.hasSave)();
  const run = useRun((state) => state.run);
  const startRun = useRun((state) => state.startRun);
  const resumeSaved = useRun((state) => state.resume);

  const startNew = () => {
    startRun();
    go("voyage");
  };
  const resume = () => {
    if ((run !== null && run.phase.kind !== "ended") || resumeSaved()) {
      go("voyage");
    }
  };

  return (
    <section className="safe-bottom flex flex-1 flex-col items-center px-4 pt-8 text-center">
      <PixelSprite sprite={META.cover} title="식민선" scale={4} />
      <h1 className="mt-6 text-display">{META.title}</h1>
      <p className="mt-2 text-sm text-ash">{META.tagline}</p>
      <nav aria-label="시작 메뉴" className="mt-auto flex w-full flex-col gap-2 pt-8">
        <Button variant="primary" block onClick={startNew}>
          새 항해
        </Button>
        {hasSave && (
          <Button block onClick={resume}>
            이어하기
          </Button>
        )}
        <Button block onClick={onExit}>
          허브로
        </Button>
      </nav>
    </section>
  );
}
