import { ActionRow } from "../../../../../shared/ui/ActionRow";
import { Button } from "../../../../../shared/ui/Button";
import type { Phase } from "../../../types";
import { useRun } from "../../runStoreContext";
import { ErrorLine } from "./ErrorLine";

type NightPhase = Extract<Phase, { kind: "night" }>;

export function NightView({ phase }: { readonly phase: NightPhase }) {
  const continueRun = useRun((state) => state.continueRun);
  return (
    <>
      <article className="flex flex-col gap-3 p-3">
        <h2 className="text-2xl">밤</h2>
        {phase.report.length === 0 ? (
          <p className="text-base leading-prose text-ash">아무 일도 없었다. 그게 제일 무섭다.</p>
        ) : (
          <ul
            aria-label="야간 보고"
            className="flex flex-col gap-1 border-2 border-slate bg-ink-deep p-2 text-sm leading-prose"
          >
            {phase.report.map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: the report is fixed and lines repeat verbatim
              <li key={index}>{line}</li>
            ))}
          </ul>
        )}
      </article>
      <ActionRow>
        <ErrorLine />
        <Button variant="primary" block onClick={continueRun}>
          다음 날
        </Button>
      </ActionRow>
    </>
  );
}
