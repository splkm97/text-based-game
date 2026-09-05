import { CONTENT } from "../../content";
import type { RankingEntry } from "../../engine/types";

type RankingRowProps = {
  readonly entry: RankingEntry;
  /** 1-based position; absent for entries outside the ranking. */
  readonly rank?: number;
  /** Why the entry is outside the ranking. */
  readonly reason?: string;
};

export function RankingRow({ entry, rank, reason }: RankingRowProps) {
  return (
    <li className="flex items-start gap-3 border-2 border-slate bg-ink-deep p-2 inset-ring inset-ring-parchment/20">
      {rank !== undefined && (
        <span className="w-8 shrink-0 pt-0.5 text-sm text-ash tabular-nums">{rank}위</span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-base">{entry.name}</span>
          {entry.hardMode && (
            <span className="border border-slate px-1 text-xs text-ash">어려움</span>
          )}
        </span>
        <span className="mt-1 flex flex-wrap gap-x-2 text-xs text-ash">
          <span>{CONTENT.origins[entry.origin].name}</span>
          <span aria-hidden="true">·</span>
          <span>{CONTENT.endings[entry.ending].title}</span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">{entry.day}일차</span>
        </span>
        {reason !== undefined && <span className="mt-1 block text-xs text-dusk">{reason}</span>}
      </span>
      <span className="flex shrink-0 flex-col items-end">
        <span className="text-base tabular-nums">{entry.score}</span>
        <span className="text-xs text-ash">점수</span>
      </span>
    </li>
  );
}
