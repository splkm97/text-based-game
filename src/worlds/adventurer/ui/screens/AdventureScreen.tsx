import { type ReactElement, useState } from "react";
import { Button } from "../../../../shared/ui/Button";
import type { RunState } from "../../engine/types";
import { useRun } from "../runStoreContext";
import { useScreenStore } from "../screenStore";
import { CombatView } from "./adventure/CombatView";
import { EndingView } from "./adventure/EndingView";
import { EventView } from "./adventure/EventView";
import { InventorySheet } from "./adventure/InventorySheet";
import { LevelUpSheet } from "./adventure/LevelUpSheet";
import { ResolutionView } from "./adventure/ResolutionView";
import { ShopView } from "./adventure/ShopView";
import { StatusHeader } from "./adventure/StatusHeader";

type Sheet = "none" | "inventory" | "levelUp";

const phaseView = (run: RunState, openInventory: () => void): ReactElement => {
  const { phase } = run;
  switch (phase.kind) {
    case "event":
      return <EventView run={run} phase={phase} />;
    case "resolution":
      return <ResolutionView run={run} phase={phase} />;
    case "combat":
      return <CombatView run={run} phase={phase} onOpenInventory={openInventory} />;
    case "shop":
      return <ShopView run={run} phase={phase} />;
    case "ended":
      return <EndingView run={run} phase={phase} />;
  }
};

export function AdventureScreen() {
  const run = useRun((state) => state.run);
  const go = useScreenStore((state) => state.go);
  const [sheet, setSheet] = useState<Sheet>("none");

  if (run === null) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 p-3">
        <p className="text-base text-ash">진행 중인 모험이 없어요.</p>
        <Button onClick={() => go("title")}>타이틀로</Button>
      </section>
    );
  }

  const close = () => setSheet("none");
  const ended = run.phase.kind === "ended";
  return (
    <>
      {!ended && (
        <StatusHeader
          run={run}
          onOpenInventory={() => setSheet("inventory")}
          onOpenLevelUp={() => setSheet("levelUp")}
        />
      )}
      {phaseView(run, () => setSheet("inventory"))}
      <InventorySheet
        run={run}
        open={sheet === "inventory"}
        consumableOnly={run.phase.kind === "combat"}
        onClose={close}
      />
      <LevelUpSheet
        run={run}
        open={sheet === "levelUp" && run.character.pendingStatPoints > 0}
        onClose={close}
      />
    </>
  );
}
