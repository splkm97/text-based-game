import { ActionRow } from "../../../../../shared/ui/ActionRow";
import { Button } from "../../../../../shared/ui/Button";
import { Panel } from "../../../../../shared/ui/Panel";
import { lag } from "../../../rules/lag";
import type { Message, Phase, RunState } from "../../../types";
import { useContent } from "../../contentContext";
import { useRun } from "../../runStoreContext";
import { ErrorLine } from "./ErrorLine";

type CommsPhase = Extract<Phase, { kind: "comms" }>;

type CommsViewProps = { readonly run: RunState; readonly phase: CommsPhase };

type MessageCardProps = {
  readonly day: number;
  readonly message: Message;
  readonly fresh: boolean;
};

function MessageCard({ day, message, fresh }: MessageCardProps) {
  return (
    <li>
      <Panel title={message.title}>
        <p className="mb-2 flex items-center gap-2 text-xs text-ash">
          <span>지구 기준 {day - message.earthDay}일 전</span>
          {fresh && <span className="text-sky">새 통신</span>}
        </p>
        <p className="text-sm leading-prose text-parchment">{message.text}</p>
      </Panel>
    </li>
  );
}

/** The whole inbox, newest first; today's arrivals are flagged. */
export function CommsView({ run, phase }: CommsViewProps) {
  const content = useContent();
  const continueRun = useRun((state) => state.continueRun);
  // A save can outlive a message it points at; unknown ids are skipped.
  const inbox = run.inbox
    .flatMap((id) => content.messages.filter((message) => message.id === id))
    .toReversed();
  return (
    <>
      <article className="flex flex-col gap-3 p-3">
        <h2 className="text-2xl">지구 통신</h2>
        {inbox.length === 0 ? (
          <p className="text-base leading-prose text-ash">
            아직 지구에서 온 통신이 없다. 지금 보낸 말은 {lag(run.day)}일 뒤에 닿는다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="수신함">
            {inbox.map((message) => (
              <MessageCard
                key={message.id}
                day={run.day}
                message={message}
                fresh={phase.arrived.includes(message.id)}
              />
            ))}
          </ul>
        )}
      </article>
      <ActionRow>
        <ErrorLine />
        <Button variant="primary" block onClick={continueRun}>
          다음
        </Button>
      </ActionRow>
    </>
  );
}
