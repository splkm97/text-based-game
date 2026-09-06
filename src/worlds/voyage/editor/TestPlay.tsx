// Embedded test play: the real voyage screen over the editor's draft registry. Every start builds
// a fresh store over in-memory storage, so the player's save is never read or written. The rules
// snapshot the registry at start; the rendered text follows the live `registry` prop, so a text
// edit shows at once without changing rule behavior.

import { useState } from "react";
import type { StoreApi } from "zustand/vanilla";
import { createRng } from "../../../shared/rng";
import { memoryStorage } from "../../../shared/storage";
import { Button } from "../../../shared/ui/Button";
import { createPersistence } from "../store/persistence";
import { createRunStore, type RunStore } from "../store/runStore";
import type { Content, EventId } from "../types";
import { ContentContext } from "../ui/contentContext";
import { RunStoreContext } from "../ui/runStoreContext";
import { VoyageScreen } from "../ui/screens/VoyageScreen";

type TestPlayProps = {
  readonly registry: Content;
  readonly selectedId: string | null;
};

/** One test run: its store and the event it started on, so 다시 시작 replays the same start. */
type Session = {
  readonly store: StoreApi<RunStore>;
  readonly firstEvent: EventId | undefined;
};

/** A selected event becomes day 1's observe draw; anything else starts a normal run. */
const startSession = (registry: Content, firstEvent: EventId | undefined): Session => {
  const store = createRunStore({
    content: registry,
    now: Date.now,
    makeRng: createRng,
    persistence: createPersistence(memoryStorage()),
  });
  store.getState().startRun(firstEvent);
  return { store, firstEvent };
};

export function TestPlay({ registry, selectedId }: TestPlayProps) {
  const [session, setSession] = useState<Session | null>(null);
  const event = selectedId === null ? undefined : registry.events[selectedId];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="primary" onClick={() => setSession(startSession(registry, event?.id))}>
          {event === undefined ? "테스트 시작" : "여기서 시작"}
        </Button>
        {session !== null && (
          <Button onClick={() => setSession(startSession(registry, session.firstEvent))}>
            다시 시작
          </Button>
        )}
      </div>
      {session !== null && (
        <div className="mx-auto flex w-full max-w-phone flex-col border-2 border-slate bg-ink text-base text-parchment">
          <ContentContext value={registry}>
            <RunStoreContext value={session.store}>
              <VoyageScreen onExit={() => setSession(null)} />
            </RunStoreContext>
          </ContentContext>
        </div>
      )}
    </div>
  );
}
