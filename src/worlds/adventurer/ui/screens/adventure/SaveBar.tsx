import { type ReactNode, use, useState } from "react";
import { ActionRow } from "../../../../../shared/ui/ActionRow";
import { Button } from "../../../../../shared/ui/Button";
import { WarningGlyph } from "../../../../../shared/ui/WarningGlyph";
import { isRanked } from "../../../engine/score";
import type { RunState } from "../../../engine/types";
import { RunStoreContext, useRun } from "../../runStoreContext";
import { useScreenStore } from "../../screenStore";
import { ErrorLine } from "./ErrorLine";
import { Sheet } from "./Sheet";

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
  const [confirming, setConfirming] = useState(false);
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
    abandon();
    go("title");
  };

  return (
    <ActionRow>
      <ErrorLine />
      {children}
      <div className="grid grid-cols-[auto_1fr_auto] gap-2">
        <Button onClick={onSave}>저장</Button>
        <Button onClick={onLoad}>불러오기 ({run.loadCount}회)</Button>
        <Button variant="danger" onClick={() => setConfirming(true)}>
          포기하기
        </Button>
      </div>
      <p className="text-xs text-dusk">
        {unranked ? (
          <>
            <WarningGlyph />
            {UNRANKED_NOTE}
          </>
        ) : (
          LOAD_NOTE
        )}
      </p>
      {/* Always mounted so the live region exists before the notice text lands in it. */}
      <p className="min-h-4 text-xs text-ash" aria-live="polite">
        {notice !== null && notice.run === run ? notice.text : null}
      </p>
      <Sheet open={confirming} title="포기하기" onClose={() => setConfirming(false)}>
        <p className="text-base leading-prose">
          <WarningGlyph />
          {ABANDON_WARNING}
        </p>
        <div className="flex gap-2">
          <Button block onClick={() => setConfirming(false)}>
            취소
          </Button>
          <Button variant="danger" block onClick={onAbandon}>
            포기하기
          </Button>
        </div>
      </Sheet>
    </ActionRow>
  );
}
