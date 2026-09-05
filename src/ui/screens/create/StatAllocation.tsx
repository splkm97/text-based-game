import { STAT_IDS, STAT_NAMES, type StatId, type Stats } from "../../../engine/types";
import { Stepper } from "../../components/Stepper";
import { canLower, canRaise, remainingPoints } from "./draft";

type StatAllocationProps = {
  readonly allocation: Stats;
  readonly onChange: (stat: StatId, delta: 1 | -1) => void;
};

export function StatAllocation({ allocation, onChange }: StatAllocationProps) {
  const remaining = remainingPoints(allocation);
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-ash" aria-live="polite">
        남은 포인트 <span className="text-base text-parchment tabular-nums">{remaining}</span>
      </p>
      {STAT_IDS.map((stat) => (
        <Stepper
          key={stat}
          label={STAT_NAMES[stat]}
          value={allocation[stat]}
          canDecrement={canLower(allocation, stat)}
          canIncrement={canRaise(allocation, stat)}
          onDecrement={() => onChange(stat, -1)}
          onIncrement={() => onChange(stat, 1)}
        />
      ))}
    </div>
  );
}
