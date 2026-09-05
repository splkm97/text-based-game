export type BarColor = "blood" | "sky" | "gold";

type StatBarProps = {
  readonly label: string;
  readonly value: number;
  readonly max: number;
  readonly color: BarColor;
};

const FILL: Readonly<Record<BarColor, string>> = {
  blood: "bg-blood",
  sky: "bg-sky",
  gold: "bg-gold",
};

const TEXT: Readonly<Record<BarColor, string>> = {
  blood: "text-blood",
  sky: "text-sky",
  gold: "text-gold",
};

export function StatBar({ label, value, max, color }: StatBarProps) {
  const ratio = max <= 0 ? 0 : Math.min(1, Math.max(0, value / max));
  return (
    // biome-ignore lint/a11y/useSemanticElements: a native <meter> cannot take the pixel bar styling
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className="flex items-center gap-2 text-xs"
    >
      <span className={`w-12 ${TEXT[color]}`}>{label}</span>
      <span className="h-2 flex-1 border border-slate bg-ink-deep">
        <span
          className={`block h-full ${FILL[color]} transition-[width] duration-240 ease-ink`}
          style={{ width: `${ratio * 100}%` }}
        />
      </span>
      <span className="w-14 text-right tabular-nums text-parchment">
        {value}/{max}
      </span>
    </div>
  );
}
