import { type MouseEvent, type ReactNode, useEffect, useId, useRef } from "react";
import { ErrorLine } from "./ErrorLine";

type SheetProps = {
  readonly open: boolean;
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
};

/** Native modal <dialog> pinned to the bottom edge. Escape and a backdrop tap both close it. */
export function Sheet({ open, title, onClose, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null || dialog.open === open) {
      return;
    }
    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.close();
    }
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard path is Escape, which <dialog> handles natively
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={onBackdrop}
      className="mx-auto mt-auto mb-0 max-h-[85dvh] w-full max-w-phone overflow-y-auto border-2 border-slate border-b-0 bg-ink-deep p-0 text-parchment backdrop:bg-ink-deep/60"
    >
      <div className="safe-bottom flex flex-col gap-3 p-3">
        <header className="flex items-center justify-between">
          <h2 id={titleId} className="text-2xl">
            {title}
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={() => ref.current?.close()}
            className="flex size-11 items-center justify-center text-parchment"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-4"
              shapeRendering="crispEdges"
            >
              <path
                d="M2 2h2v2H2zM12 2h2v2h-2zM4 4h2v2H4zM10 4h2v2h-2zM6 6h4v4H6zM4 10h2v2H4zM10 10h2v2h-2zM2 12h2v2H2zM12 12h2v2h-2z"
                fill="currentColor"
              />
            </svg>
          </button>
        </header>
        {children}
        <ErrorLine />
      </div>
    </dialog>
  );
}
