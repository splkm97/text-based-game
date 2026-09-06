import { type ReactNode, useId } from "react";

type ToggleProps = {
  readonly label: string;
  readonly description?: ReactNode;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
};

/** A labelled switch. The whole row is the 44px target; the track is decorative. */
export function Toggle({ label, description, checked, onChange }: ToggleProps) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-center gap-3 py-1">
      <span className="flex-1">
        <span className="block text-base">{label}</span>
        {description !== undefined && (
          <span className="block text-xs leading-prose text-ash">{description}</span>
        )}
      </span>
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        aria-hidden="true"
        className="relative h-6 w-11 shrink-0 border-2 border-slate bg-ink-deep transition-[border-color] duration-120 ease-ink peer-checked:border-ember peer-checked:*:translate-x-5 peer-checked:*:bg-ember peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ember"
      >
        <span className="absolute top-0.5 left-0.5 size-4 bg-dusk transition-transform duration-120 ease-ink motion-reduce:transition-none" />
      </span>
    </label>
  );
}
