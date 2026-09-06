import { useId } from "react";
import { PixelSprite } from "../../../art/PixelSprite";
import { MONSTER_SPRITES } from "../../../art/sprites/monsters";
import { CONTENT } from "../../../content";
import type { RunPhase, RunState } from "../../../engine/types";
import { ActionRow } from "../../components/ActionRow";
import { Button } from "../../components/Button";
import { StatBar } from "../../components/StatBar";
import { useRun } from "../../runStoreContext";
import { ErrorLine } from "./ErrorLine";

const LOG_LINES = 6;

type CombatPhase = Extract<RunPhase, { kind: "combat" }>;

type CombatViewProps = {
  readonly run: RunState;
  readonly phase: CombatPhase;
  readonly onOpenInventory: () => void;
};

export function CombatView({ run, phase, onOpenInventory }: CombatViewProps) {
  const fight = useRun((state) => state.fight);
  const flee = useRun((state) => state.flee);
  const reasonId = useId();
  const { combat } = phase;
  const monster = CONTENT.monsters[combat.monster];
  const hasConsumable = run.character.inventory.some(
    (id) => CONTENT.items[id].kind === "consumable",
  );
  // Keyed by absolute log position: lines repeat verbatim, so the text alone is no key.
  const recent = combat.log.map((line, at) => ({ at, line })).slice(-LOG_LINES);
  const last = recent.at(-1);
  return (
    <>
      <section className="flex flex-col items-center gap-3 p-3 text-center">
        <PixelSprite sprite={MONSTER_SPRITES[combat.monster]} title={monster.name} scale={6} />
        <div>
          <h2 className="text-2xl">{monster.name}</h2>
          <p className="mt-1 text-xs leading-prose text-ash">{monster.description}</p>
        </div>
        <div className="w-full">
          <StatBar label="적" value={combat.monsterHp} max={combat.monsterMaxHp} color="blood" />
        </div>
        <p className="text-xs text-dusk tabular-nums">{combat.round}라운드</p>
        <ol
          aria-live="polite"
          aria-label="전투 기록"
          className="flex w-full flex-col gap-1 border-2 border-slate bg-ink-deep p-2 text-left text-sm text-ash"
        >
          {recent.map((entry) => (
            <li key={entry.at} className={entry === last ? "text-parchment" : ""}>
              {entry.line}
            </li>
          ))}
        </ol>
      </section>
      <ActionRow>
        <ErrorLine />
        <div className="grid grid-cols-3 gap-2">
          <Button variant="primary" onClick={fight}>
            공격
          </Button>
          <Button onClick={flee}>도주</Button>
          <Button
            onClick={onOpenInventory}
            disabled={!hasConsumable}
            aria-describedby={hasConsumable ? undefined : reasonId}
          >
            아이템
          </Button>
        </div>
        {!hasConsumable && (
          <p id={reasonId} className="text-right text-xs text-dusk">
            소모품 없음
          </p>
        )}
      </ActionRow>
    </>
  );
}
