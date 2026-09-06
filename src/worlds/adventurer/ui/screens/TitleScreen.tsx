import { useRef } from "react";
import { InstallPrompt } from "../../../../host/pwa/InstallPrompt";
import { PixelSprite } from "../../../../shared/art/PixelSprite";
import { Button } from "../../../../shared/ui/Button";
import { ICONS } from "../../sprites/icons";
import { useRun } from "../runStoreContext";
import { useScreenStore } from "../screenStore";

const TAGLINE = "주사위 한 번에 하루가 갈리는 짧은 여정";
const OVERWRITE_WARNING = "저장된 모험이 있어요. 새로 시작하면 지워져요.";

export function TitleScreen() {
  const go = useScreenStore((state) => state.go);
  const hasSave = useRun((state) => state.hasSave)();
  const inMemory = useRun((state) => state.run) !== null;
  const resumeSaved = useRun((state) => state.resume);
  const abandon = useRun((state) => state.abandon);
  const dialog = useRef<HTMLDialogElement>(null);

  const resume = () => {
    if (inMemory || resumeSaved()) {
      go("adventure");
    }
  };
  const startNew = () => {
    if (hasSave) {
      dialog.current?.showModal();
    } else {
      go("create");
    }
  };
  const confirmNew = () => {
    dialog.current?.close();
    abandon();
    go("create");
  };

  return (
    <section className="safe-bottom flex flex-1 flex-col items-center px-4 pt-8 text-center">
      <PixelSprite sprite={ICONS.d20} title="20면체 주사위" scale={5} />
      <h1 className="mt-6 text-display">모험가 이야기</h1>
      <p className="mt-2 text-sm text-ash">{TAGLINE}</p>
      <nav aria-label="시작 메뉴" className="mt-auto flex w-full flex-col gap-2 pt-8">
        <Button variant="primary" block onClick={startNew}>
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
      <InstallPrompt />
      <dialog
        ref={dialog}
        aria-labelledby="overwrite-warning"
        className="m-auto w-80 max-w-full border-2 border-slate bg-ink-deep p-4 text-parchment backdrop:bg-ink-deep/60"
      >
        <p id="overwrite-warning" className="text-base leading-prose">
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
