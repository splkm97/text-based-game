import type { ReactNode } from "react";

type CodexEntryProps = {
  readonly discovered: boolean;
  readonly name: string;
  readonly description: string;
  /** Sprite or icon, already drawn as a silhouette by the caller when undiscovered. */
  readonly art?: ReactNode;
  /** Short text label beside the name (an ending's tone). */
  readonly tag?: string;
};

/** One codex row. Undiscovered entries show "???" and keep their description hidden. */
export function CodexEntry({ discovered, name, description, art, tag }: CodexEntryProps) {
  return (
    <li className="flex gap-3 border-2 border-slate bg-ink-deep p-2 inset-ring inset-ring-parchment/20">
      {art}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className={`text-base ${discovered ? "" : "text-dusk"}`}>
            {discovered ? name : "???"}
          </span>
          {discovered && tag !== undefined && (
            <span className="border border-slate px-1 text-xs text-ash">{tag}</span>
          )}
        </span>
        {discovered && (
          <span className="mt-1 block text-xs leading-prose text-ash">{description}</span>
        )}
      </span>
    </li>
  );
}
