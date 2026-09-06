import { useId } from "react";
import type { Choice, RunPhase, RunState } from "../../../engine/types";
import { useContent } from "../../contentContext";
import { useRun } from "../../runStoreContext";
import { unavailableReason } from "./choiceReason";
import { SaveBar } from "./SaveBar";

type EventPhase = Extract<RunPhase, { kind: "event" }>;

type EventViewProps = { readonly run: RunState; readonly phase: EventPhase };

const CHOICE =
  "block w-full min-h-11 border-2 border-slate bg-ink-deep px-3 py-2 text-left text-base " +
  "leading-prose text-parchment transition-[border-color] duration-120 ease-ink " +
  "disabled:pointer-events-none disabled:text-dusk";

type ChoiceButtonProps = {
  readonly run: RunState;
  readonly choice: Choice;
  readonly onChoose: () => void;
};

/** A full-width choice. When a requirement fails, the button is disabled and says why. */
function ChoiceButton({ run, choice, onChoose }: ChoiceButtonProps) {
  const content = useContent();
  const reasonId = useId();
  const reason = unavailableReason(run, choice, content);
  return (
    <li>
      <button
        type="button"
        className={CHOICE}
        disabled={reason !== null}
        aria-describedby={reason === null ? undefined : reasonId}
        onClick={onChoose}
      >
        {choice.text}
      </button>
      {reason !== null && (
        <p id={reasonId} className="mt-1 text-xs text-dusk">
          {reason}
        </p>
      )}
    </li>
  );
}

export function EventView({ run, phase }: EventViewProps) {
  const content = useContent();
  const choose = useRun((state) => state.choose);
  const event = content.events[phase.event];
  return (
    <>
      <article className="flex flex-col gap-3 p-3">
        {event === undefined ? (
          // A save can outlive the event it points at; the save row below still offers a way out.
          <p className="text-base text-ash">이 사건은 더 이상 존재하지 않아요.</p>
        ) : (
          <>
            <h2 className="text-2xl">{event.title}</h2>
            <p className="text-base leading-prose">{event.text}</p>
            <ul className="flex flex-col gap-2" aria-label="선택지">
              {event.choices.map((choice, index) => (
                <ChoiceButton
                  key={choice.text}
                  run={run}
                  choice={choice}
                  onChoose={() => choose(index)}
                />
              ))}
            </ul>
          </>
        )}
      </article>
      <SaveBar run={run} />
    </>
  );
}
