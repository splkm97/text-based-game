import { choiceAvailable } from "../../../rules/events";
import type { Phase, RunState } from "../../../types";
import { useContent } from "../../contentContext";
import { useRun } from "../../runStoreContext";
import { ErrorLine } from "./ErrorLine";

type ObservePhase = Extract<Phase, { kind: "observe" }>;

type ObserveViewProps = { readonly run: RunState; readonly phase: ObservePhase };

const CHOICE =
  "block w-full min-h-11 border-2 border-slate bg-ink-deep px-3 py-2 text-left text-base " +
  "leading-prose text-parchment transition-[border-color] duration-120 ease-ink " +
  "disabled:pointer-events-none disabled:text-dusk";

export function ObserveView({ run, phase }: ObserveViewProps) {
  const content = useContent();
  const choose = useRun((state) => state.choose);
  const event = content.events[phase.event];
  return (
    <article className="flex flex-col gap-3 p-3">
      {event === undefined ? (
        // A save can outlive the event it points at; 뒤로 on the top bar still leads out.
        <p className="text-base text-ash">이 사건은 더 이상 존재하지 않아요.</p>
      ) : (
        <>
          <h2 className="text-2xl">{event.title}</h2>
          <p className="text-base leading-prose">{event.text}</p>
          <ul className="flex flex-col gap-2" aria-label="선택지">
            {event.choices.map((choice, index) => (
              <li key={choice.text}>
                <button
                  type="button"
                  className={CHOICE}
                  disabled={!choiceAvailable(run, choice)}
                  onClick={() => choose(index)}
                >
                  {choice.text}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <ErrorLine />
    </article>
  );
}
