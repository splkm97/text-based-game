import { useRef } from "react";
import type { WorldRootProps } from "../../../../host/world";
import { PixelSprite } from "../../../../shared/art/PixelSprite";
import { Button } from "../../../../shared/ui/Button";
import { META } from "../../meta";
import { useRun } from "../runStoreContext";
import { useScreenStore } from "../screenStore";

const OVERWRITE_WARNING = "진행 중인 항해가 있어요. 새로 시작하면 지워져요.";

export function TitleScreen({ onExit }: WorldRootProps) {
  const go = useScreenStore((state) => state.go);
  const hasSave = useRun((state) => state.hasSave)();
  const run = useRun((state) => state.run);
  const startRun = useRun((state) => state.startRun);
  const resumeSaved = useRun((state) => state.resume);
  const dialog = useRef<HTMLDialogElement>(null);
  const live = hasSave || (run !== null && run.phase.kind !== "ended");

  const beginVoyage = () => {
    startRun();
    go("voyage");
  };
  const startNew = () => {
    if (live) {
      dialog.current?.showModal();
    } else {
      beginVoyage();
    }
  };
  const confirmNew = () => {
    dialog.current?.close();
    beginVoyage();
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
      <dialog
        ref={dialog}
        aria-labelledby="voyage-overwrite-warning"
        className="m-auto w-80 max-w-full border-2 border-slate bg-ink-deep p-4 text-parchment backdrop:bg-ink-deep/60"
      >
        <p id="voyage-overwrite-warning" className="text-base leading-prose">
          {OVERWRITE_WARNING}
        </p>
        <div className="mt-4 flex gap-2">
          <Button block onClick={() => dialog.current?.close()}>
            취소
          </Button>
          <Button variant="danger" block onClick={confirmNew}>
            새로 시작
          </Button>
        </div>
      </dialog>
    </section>
  );
}
