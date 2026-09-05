import { PixelSprite } from "../../../art/PixelSprite";
import { ICONS } from "../../../art/sprites/icons";
import { ORIGIN_PORTRAITS } from "../../../art/sprites/portraits";
import { CONTENT } from "../../../content";
import { deriveStats } from "../../../engine/character";
import { isActionPhase } from "../../../engine/run";
import type { RunState } from "../../../engine/types";
import { StatBar } from "../../components/StatBar";

const XP_MAX = 100;

const CHIP =
  "flex min-h-11 min-w-11 items-center justify-center gap-1 border-2 px-2 text-sm text-parchment " +
  "transition-[border-color] duration-120 ease-ink";

type StatusHeaderProps = {
  readonly run: RunState;
  readonly onOpenInventory: () => void;
  readonly onOpenLevelUp: () => void;
};

/** Sticky top strip: who you are, the three resource bars, gold, bag, and pending points. */
export function StatusHeader({ run, onOpenInventory, onOpenLevelUp }: StatusHeaderProps) {
  const { character } = run;
  const origin = CONTENT.origins[character.origin];
  const derived = deriveStats(character, CONTENT);
  const pending = character.pendingStatPoints;
  const canSpend = pending > 0 && isActionPhase(run);
  return (
    <header className="sticky top-0 z-10 flex flex-col gap-2 border-b-2 border-slate bg-ink px-3 py-2">
      <div className="flex items-center gap-2">
        <PixelSprite sprite={ORIGIN_PORTRAITS[character.origin]} title={origin.name} scale={2} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base">{character.name}</p>
          <p className="flex items-center gap-2 text-xs text-ash">
            <span>{run.day}일째</span>
            {run.hardMode && <span className="border-2 border-slate px-1 text-ash">어려움</span>}
          </p>
        </div>
        <p className="flex items-center gap-1 text-sm tabular-nums">
          <PixelSprite sprite={ICONS.gold} title="골드" scale={1} />
          {character.gold}
        </p>
        <button
          type="button"
          onClick={onOpenInventory}
          aria-label={`가방 ${character.inventory.length}/${derived.inventorySlots}`}
          className={`${CHIP} border-slate tabular-nums`}
        >
          가방 {character.inventory.length}/{derived.inventorySlots}
        </button>
        {canSpend && (
          <button
            type="button"
            onClick={onOpenLevelUp}
            aria-label={`능력치 포인트 ${pending} 배분`}
            className={`${CHIP} border-ember text-ember tabular-nums`}
          >
            +{pending}
          </button>
        )}
      </div>
      <StatBar label="체력" value={character.hp} max={derived.maxHp} color="blood" />
      <StatBar label="정신력" value={character.sanity} max={derived.maxSanity} color="sky" />
      <StatBar label="경험치" value={character.xp} max={XP_MAX} color="gold" />
    </header>
  );
}
