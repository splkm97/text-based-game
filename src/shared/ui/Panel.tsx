import type { ReactNode } from "react";

type PanelProps = {
  readonly title?: string;
  readonly children: ReactNode;
};

/** Bordered card: ink-deep ground, slate hairline, 1px inner parchment line for elevation. */
export function Panel({ title, children }: PanelProps) {
  return (
    <section className="border-2 border-slate bg-ink-deep p-3 inset-ring inset-ring-parchment/20">
      {title !== undefined && <h2 className="mb-2 text-sm text-ash">{title}</h2>}
      {children}
    </section>
  );
}
