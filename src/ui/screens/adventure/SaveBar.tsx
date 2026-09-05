import { type ReactNode, use, useRef, useState } from "react";
import { isRanked } from "../../../engine/score";
import type { RunState } from "../../../engine/types";
import { Button } from "../../components/Button";
import { WarningGlyph } from "../../components/WarningGlyph";
import { RunStoreContext, useRun } from "../../runStoreContext";
import { useScreenStore } from "../../screenStore";
import { ActionRow } from "./ActionRow";

const LOAD_NOTE = "불러오기 3회 이상이면 랭킹에 오르지 않아요.";
const UNRANKED_NOTE = "불러오기 3회 이상이라 랭킹에 오르지 않아요.";
const ABANDON_WARNING = "포기하면 이 모험과 저장이 지워져요. 기록에도 남지 않아요.";

type SaveBarProps = {
  readonly run: RunState;
  /** The phase's primary action, placed above the save row. */
  readonly children?: ReactNode;
};

/** A system message tied to the run it was produced for, so the next transition clears it. */
type Notice = { readonly run: RunState | null; readonly text: string };

export function SaveBar({ run, children }: SaveBarProps) {
  const store = use(RunStoreContext);
  const save = useRun((state) => state.save);
  const load = useRun((state) => state.load);
  const abandon = useRun((state) => state.abandon);
  const go = useScreenStore((state) => state.go);
  const confirm = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const unranked = !isRanked(run);

  const announce = (text: string) => setNotice({ run: store.getState().run, text });
  const onSave = () => {
    save();
    announce("저장했어요.");
  };
  const onLoad = () => {
    if (load()) {
      announce("불러왔어요.");
    }
  };
  const onAbandon = () => {
    confirm.current?.close();
    abandon();
    go("title");
  };

  return (
    <ActionRow>
      {children}
      <div className="grid grid-cols-[auto_1fr_auto] gap-2">
        <Button onClick={onSave}>저장</Button>
        <Button onClick={onLoad}>불러오기 ({run.loadCount}회)</Button>
        <Button variant="danger" onClick={() => confirm.current?.showModal()}>
          포기하기
        </Button>
      </div>
      <p className="text-xs text-dusk" aria-live="polite">
        {notice !== null && notice.run === run ? (
          <span className="text-ash">{notice.text}</span>
        ) : unranked ? (
          <>
            <WarningGlyph />
            {UNRANKED_NOTE}
          </>
        ) : (
          LOAD_NOTE
        )}
      </p>
      <dialog
        ref={confirm}
        aria-labelledby="abandon-warning"
        className="m-auto w-80 max-w-full border-2 border-slate bg-ink-deep p-4 text-parchment backdrop:bg-ink-deep/60"
      >
        <p id="abandon-warning" className="text-base leading-prose">
          <WarningGlyph />
          {ABANDON_WARNING}
        </p>
        <div className="mt-4 flex gap-2">
          <Button block onClick={() => confirm.current?.close()}>
            취소
          </Button>
          <Button variant="danger" block onClick={onAbandon}>
            포기하기
          </Button>
        </div>
      </dialog>
    </ActionRow>
  );
}
