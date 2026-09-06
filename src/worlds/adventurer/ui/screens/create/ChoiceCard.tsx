import type { ReactNode } from "react";

type ChoiceCardProps = {
  readonly group: string;
  readonly value: string;
  readonly checked: boolean;
  readonly onSelect: () => void;
  readonly children: ReactNode;
};

/** A radio rendered as a bordered card; the input stays in the tree for keyboard and a11y. */
export function ChoiceCard({ group, value, checked, onSelect, children }: ChoiceCardProps) {
  return (
    <label className="flex min-h-11 cursor-pointer gap-3 border-2 border-slate bg-ink-deep p-2 transition-[border-color] duration-120 ease-ink has-checked:border-ember has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ember">
      <input
        type="radio"
        name={group}
        value={value}
        checked={checked}
        onChange={onSelect}
        className="sr-only"
      />
      {children}
    </label>
  );
}
