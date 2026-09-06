import { ActionRow } from "../../../../../shared/ui/ActionRow";
import { Button } from "../../../../../shared/ui/Button";
import { Panel } from "../../../../../shared/ui/Panel";
import { countOf } from "../../../rules/crew";
import type { Ending, Phase, RunState } from "../../../types";
import { useContent } from "../../contentContext";
import { useRun } from "../../runStoreContext";
import { ErrorLine } from "./ErrorLine";

type EndedPhase = Extract<Phase, { kind: "ended" }>;

type EndingViewProps = {
  readonly run: RunState;
  readonly phase: EndedPhase;
  readonly onExit: () => void;
};

const TONE: Readonly<Record<Ending["tone"], string>> = {
  good: "text-moss",
  bad: "text-blood",
};

type Row = { readonly label: string; readonly value: number };

export function EndingView({ run, phase, onExit }: EndingViewProps) {
  const content = useContent();
  const startRun = useRun((state) => state.startRun);
  const abandon = useRun((state) => state.abandon);
  const ending = content.endings[phase.ending];
  // Labels mirror `computeScore`, which scores arrival only; the total is the rules' own number.
  const rows: readonly Row[] =
    phase.ending === "arrival"
      ? [
          { label: "생존 ×10", value: countOf(run, "alive") },
          { label: "건강 ×5", value: countOf(run, "healthy") },
          { label: "신뢰", value: run.trust },
        ]
      : [];
  const leave = () => {
    abandon();
    onExit();
  };
  return (
    <>
      <article className="flex flex-col gap-3 p-3">
        <header className={`border-b-2 border-slate pb-2 ${TONE[ending.tone]}`}>
          <p className="text-xs">결말 · 항해 {run.day}일째</p>
          <h2 className="text-2xl">{ending.title}</h2>
        </header>
        <p className="text-base leading-prose">{ending.text}</p>
        <Panel title="점수">
          <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-sm tabular-nums">
            {rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-ash">{row.label}</dt>
                <dd className="text-right">{row.value}</dd>
              </div>
            ))}
            <div className="contents">
              <dt className="mt-1 border-t-2 border-slate pt-1 text-base text-parchment">합계</dt>
              <dd className="mt-1 border-t-2 border-slate pt-1 text-right text-base text-parchment">
                {phase.score}
              </dd>
            </div>
          </dl>
        </Panel>
      </article>
      <ActionRow>
        <ErrorLine />
        <Button variant="primary" block onClick={startRun}>
          다시
        </Button>
        <Button block onClick={leave}>
          허브로
        </Button>
      </ActionRow>
    </>
  );
}
