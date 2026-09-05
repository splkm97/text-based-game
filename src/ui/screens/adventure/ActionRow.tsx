import type { ReactNode } from "react";
import { ErrorLine } from "./ErrorLine";

/** The sticky bottom row: primary actions in the thumb zone, engine errors right above them. */
export function ActionRow({ children }: { readonly children: ReactNode }) {
  return (
    <div className="safe-bottom sticky bottom-0 z-10 mt-auto flex flex-col gap-2 border-t-2 border-slate bg-ink px-3 pt-2">
      <ErrorLine />
      {children}
    </div>
  );
}
