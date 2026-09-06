import { type RunState, STAT_IDS, STAT_NAMES } from "../../../engine/types";
import { useRun } from "../../runStoreContext";
import { Sheet } from "./Sheet";

const PLUS =
  "flex size-11 items-center justify-center border-2 border-slate text-2xl text-parchment " +
  "transition-[border-color] duration-120 ease-ink " +
  "disabled:pointer-events-none disabled:text-dusk";

type LevelUpSheetProps = {
  readonly run: RunState;
  readonly open: boolean;
  readonly onClose: () => void;
};

/** Six + buttons spending `pendingStatPoints`; the parent closes it once the points hit 0. */
export function LevelUpSheet({ run, open, onClose }: LevelUpSheetProps) {
  const spendPoint = useRun((state) => state.spendPoint);
  const { stats, pendingStatPoints } = run.character;
  return (
    <Sheet open={open} title="능력치 배분" onClose={onClose}>
      <p className="text-sm text-ash" aria-live="polite">
        남은 포인트{" "}
        <span className="text-base text-parchment tabular-nums">{pendingStatPoints}</span>
      </p>
      <ul className="flex flex-col gap-2">
        {STAT_IDS.map((stat) => (
          <li key={stat} className="flex items-center justify-between gap-2">
            <span className="text-base">{STAT_NAMES[stat]}</span>
            <span className="flex items-center gap-3">
              <span className="w-8 text-center text-2xl tabular-nums">{stats[stat]}</span>
              <button
                type="button"
                className={PLUS}
                aria-label={`${STAT_NAMES[stat]} 올리기`}
                disabled={pendingStatPoints <= 0}
                onClick={() => spendPoint(stat)}
              >
                +
              </button>
            </span>
          </li>
        ))}
      </ul>
    </Sheet>
  );
}
