// Embedded test play: the real adventure screen over the editor's draft registry. Every start
// builds fresh stores over in-memory storage, so the player's save, codex, and ranking are never
// read or written. The engine snapshots the registry at start; the rendered text follows the live
// `registry` prop, so a text edit shows at once without changing engine behavior.

import { useState } from "react";
import type { StoreApi } from "zustand/vanilla";
import { createRng } from "../../../shared/rng";
import { memoryStorage } from "../../../shared/storage";
import { Button } from "../../../shared/ui/Button";
import { ORIGIN_IDS, TRAIT_IDS } from "../content/ids";
import { mapStats } from "../engine/character";
import type { ContentRegistry, GameEvent } from "../engine/types";
import { createMetaStore, type MetaStoreApi } from "../store/metaStore";
import { createPersistence } from "../store/persistence";
import { createRunStore, type NewRunInput, type RunStore } from "../store/runStore";
import { ContentContext } from "../ui/contentContext";
import { MetaStoreContext } from "../ui/metaStoreContext";
import { RunStoreContext } from "../ui/runStoreContext";
import { AdventureScreen } from "../ui/screens/AdventureScreen";

type TestPlayProps = {
  readonly registry: ContentRegistry;
  readonly selectedId: string | null;
};

/** One test run: its stores and the input that started it, so 다시 시작 replays the same start. */
type Session = {
  readonly run: StoreApi<RunStore>;
  readonly meta: MetaStoreApi;
  readonly input: NewRunInput;
};

/** Every stat at 7: total 42, the creation budget, with no point of choice. */
const TESTER = {
  name: "테스터",
  trait: TRAIT_IDS[0],
  allocation: mapStats(() => 7),
  hardMode: false,
} as const;

/** A selected event starts day 1 on itself, in its own origin or journey; anything else starts a
 * normal run for the first origin. */
const inputFor = (event: GameEvent | undefined): NewRunInput => {
  if (event === undefined) {
    return { ...TESTER, origin: ORIGIN_IDS[0], journeys: [] };
  }
  const { pool } = event;
  return {
    ...TESTER,
    origin: pool.kind === "origin" ? pool.origin : ORIGIN_IDS[0],
    journeys: pool.kind === "journey" ? [pool.journey] : [],
    firstEvent: event.id,
  };
};

const startSession = (registry: ContentRegistry, input: NewRunInput): Session => {
  const meta = createMetaStore(createPersistence(memoryStorage()));
  const run = createRunStore({
    content: registry,
    now: Date.now,
    makeRng: createRng,
    persistence: createPersistence(memoryStorage()),
    meta,
  });
  run.getState().startRun(input);
  return { run, meta, input };
};

export function TestPlay({ registry, selectedId }: TestPlayProps) {
  const [session, setSession] = useState<Session | null>(null);
  const event = selectedId === null ? undefined : registry.events[selectedId];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          onClick={() => setSession(startSession(registry, inputFor(event)))}
        >
          {event === undefined ? "테스트 시작" : "여기서 시작"}
        </Button>
        {session !== null && (
          <Button onClick={() => setSession(startSession(registry, session.input))}>
            다시 시작
          </Button>
        )}
      </div>
      {session !== null && (
        <div className="mx-auto flex w-full max-w-phone flex-col border-2 border-slate bg-ink text-base text-parchment">
          <ContentContext value={registry}>
            <MetaStoreContext value={session.meta}>
              <RunStoreContext value={session.run}>
                <AdventureScreen />
              </RunStoreContext>
            </MetaStoreContext>
          </ContentContext>
        </div>
      )}
    </div>
  );
}
