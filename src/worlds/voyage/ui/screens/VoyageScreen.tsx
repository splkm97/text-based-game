import type { ReactElement } from "react";
import type { WorldRootProps } from "../../../../host/world";
import { Button } from "../../../../shared/ui/Button";
import { StatBar } from "../../../../shared/ui/StatBar";
import { TopBar } from "../../../../shared/ui/TopBar";
import { ARRIVAL_DAY, lag } from "../../rules/lag";
import { AP_PER_DAY } from "../../rules/run";
import type { RunState } from "../../types";
import { useRun } from "../runStoreContext";
import { useScreenStore } from "../screenStore";
import { ActView } from "./voyage/ActView";
import { CommsView } from "./voyage/CommsView";
import { EndingView } from "./voyage/EndingView";
import { NightView } from "./voyage/NightView";
import { ObserveView } from "./voyage/ObserveView";

const TRUST_MAX = 100;
const CAPTAIN_HP_MAX = 10;
const CHIP = "border-2 border-slate px-1 tabular-nums text-parchment";

const phaseView = (run: RunState, onExit: () => void): ReactElement => {
  const { phase } = run;
  switch (phase.kind) {
    case "comms":
      return <CommsView run={run} phase={phase} />;
    case "observe":
      return <ObserveView run={run} phase={phase} />;
    case "act":
      return <ActView run={run} />;
    case "night":
      return <NightView phase={phase} />;
    case "ended":
      return <EndingView run={run} phase={phase} onExit={onExit} />;
  }
};

/** Sticky top: the day count in the bar, then lag, supplies, action points, and the two meters. */
function StatusHeader({ run, onBack }: { readonly run: RunState; readonly onBack: () => void }) {
  return (
    <div className="sticky top-0 z-10">
      <TopBar title={`항해일 ${run.day}/${ARRIVAL_DAY}`} onBack={onBack} />
      <section
        aria-label="함선 상태"
        className="flex flex-col gap-2 border-b-2 border-slate bg-ink px-3 py-2"
      >
        <p className="flex items-center gap-2 text-xs text-ash">
          <span>시차 {lag(run.day)}일</span>
          <span className="ml-auto flex gap-1">
            <span className={CHIP}>키트 {run.kits}</span>
            <span className={CHIP}>의약품 {run.meds}</span>
            <span className={CHIP}>
              행동 {run.ap}/{AP_PER_DAY}
            </span>
          </span>
        </p>
        <StatBar label="신뢰" value={run.trust} max={TRUST_MAX} color="sky" />
        <StatBar label="함장" value={run.captain.hp} max={CAPTAIN_HP_MAX} color="blood" />
      </section>
    </div>
  );
}

export function VoyageScreen({ onExit }: WorldRootProps) {
  const run = useRun((state) => state.run);
  const go = useScreenStore((state) => state.go);

  if (run === null) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-4 p-3">
        <p className="text-base text-ash">진행 중인 항해가 없어요.</p>
        <Button onClick={() => go("title")}>타이틀로</Button>
      </section>
    );
  }

  return (
    <>
      {run.phase.kind !== "ended" && <StatusHeader run={run} onBack={() => go("title")} />}
      {phaseView(run, onExit)}
    </>
  );
}
