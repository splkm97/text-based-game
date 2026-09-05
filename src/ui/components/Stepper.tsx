type StepperProps = {
  readonly label: string;
  readonly value: number;
  readonly canDecrement: boolean;
  readonly canIncrement: boolean;
  readonly onDecrement: () => void;
  readonly onIncrement: () => void;
};

const STEP =
  "flex size-11 items-center justify-center border-2 border-slate text-xl text-parchment " +
  "transition-[border-color,color] duration-120 ease-ink " +
  "disabled:pointer-events-none disabled:text-dusk";

export function Stepper({
  label,
  value,
  canDecrement,
  canIncrement,
  onDecrement,
  onIncrement,
}: StepperProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-base">{label}</span>
      <span className="flex items-center gap-2">
        <button
          type="button"
          className={STEP}
          aria-label={`${label} 줄이기`}
          disabled={!canDecrement}
          onClick={onDecrement}
        >
          −
        </button>
        <span className="w-8 text-center text-xl tabular-nums">{value}</span>
        <button
          type="button"
          className={STEP}
          aria-label={`${label} 늘리기`}
          disabled={!canIncrement}
          onClick={onIncrement}
        >
          +
        </button>
      </span>
    </div>
  );
}
