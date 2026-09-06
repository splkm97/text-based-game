import { Button } from "../../../../../shared/ui/Button";
import type { RunPhase, RunState } from "../../../engine/types";
import { useRun } from "../../runStoreContext";
import { SaveBar } from "./SaveBar";

type ResolutionPhase = Extract<RunPhase, { kind: "resolution" }>;

type ResolutionViewProps = { readonly run: RunState; readonly phase: ResolutionPhase };

export function ResolutionView({ run, phase }: ResolutionViewProps) {
  const continueRun = useRun((state) => state.continueRun);
  return (
    <>
      <article className="flex flex-col gap-3 p-3">
        <p className="text-base leading-prose">{phase.text}</p>
        {phase.effectsLog.length > 0 && (
          <ul
            aria-live="polite"
            aria-label="결과"
            className="flex flex-col gap-1 border-2 border-slate bg-ink-deep p-2 text-sm text-ash"
          >
            {phase.effectsLog.map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: the log is append-only and lines repeat verbatim
              <li key={index}>{line}</li>
            ))}
          </ul>
        )}
      </article>
      <SaveBar run={run}>
        <Button variant="primary" block onClick={continueRun}>
          계속
        </Button>
      </SaveBar>
    </>
  );
}
