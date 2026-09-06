import { ActionRow } from "../../../../../shared/ui/ActionRow";
import { Button } from "../../../../../shared/ui/Button";
import type { RunState } from "../../../types";
import { useContent } from "../../contentContext";
import { useRun } from "../../runStoreContext";
import { CrewCard } from "./CrewCard";
import { ErrorLine } from "./ErrorLine";

/** Today's log first (choice outcomes and test results live there), then one card per crew. */
export function ActView({ run }: { readonly run: RunState }) {
  const content = useContent();
  const act = useRun((state) => state.act);
  const endDay = useRun((state) => state.endDay);
  const today = run.log.filter((entry) => entry.day === run.day);
  return (
    <>
      <article className="flex flex-col gap-3 p-3">
        {today.length > 0 && (
          <ul
            aria-live="polite"
            aria-label="오늘의 기록"
            className="flex flex-col gap-1 border-2 border-slate bg-ink-deep p-2 text-sm leading-prose text-ash"
          >
            {today.map((entry, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: the log is append-only and lines repeat verbatim
              <li key={index}>{entry.text}</li>
            ))}
          </ul>
        )}
        <ul className="flex flex-col gap-2" aria-label="승무원">
          {content.crew.map((template) => {
            const crew = run.crew.find((member) => member.id === template.id);
            return crew === undefined ? null : (
              <CrewCard key={template.id} run={run} template={template} crew={crew} onAct={act} />
            );
          })}
        </ul>
      </article>
      <ActionRow>
        <ErrorLine />
        <Button variant="primary" block onClick={endDay}>
          밤으로
        </Button>
      </ActionRow>
    </>
  );
}
