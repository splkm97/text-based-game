// Embedded test play: the real adventure screen over the editor's draft content. Every start
// builds fresh stores over in-memory storage, so the player's save, codex, and ranking are never
// read or written. The engine snapshots the content at start; the rendered text follows the live
// `content` prop, so a text edit shows at once without changing engine behavior.

import { useState } from "react";
import type { StoreApi } from "zustand/vanilla";
import { createRng } from "../../../shared/rng";
import { memoryStorage } from "../../../shared/storage";
import { Button } from "../../../shared/ui/Button";
import { ORIGIN_IDS, TRAIT_IDS } from "../content/ids";
import { mapStats } from "../engine/character";
import type { ContentRegistry } from "../engine/types";
import { createMetaStore, type MetaStoreApi } from "../store/metaStore";
import { createPersistence } from "../store/persistence";
import { createRunStore, type NewRunInput, type RunStore } from "../store/runStore";
import { ContentContext } from "../ui/contentContext";
import { MetaStoreContext } from "../ui/metaStoreContext";
import { RunStoreContext } from "../ui/runStoreContext";
import { AdventureScreen } from "../ui/screens/AdventureScreen";
import type { GraphNode } from "./graph/model";

type TestPlayProps = {
  readonly content: ContentRegistry;
  readonly selected: GraphNode | null;
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

/** An event node starts day 1 on itself, in its own origin or journey; any other node starts a
 * normal run for the first origin. */
const inputFor = (selected: GraphNode | null): NewRunInput => {
  if (selected?.kind !== "event") {
    return { ...TESTER, origin: ORIGIN_IDS[0], journeys: [] };
  }
  const { pool } = selected;
  return {
    ...TESTER,
    origin: pool.kind === "origin" ? pool.origin : ORIGIN_IDS[0],
    journeys: pool.kind === "journey" ? [pool.journey] : [],
    firstEvent: selected.id,
  };
};

const startSession = (content: ContentRegistry, input: NewRunInput): Session => {
  const meta = createMetaStore(createPersistence(memoryStorage()));
  const run = createRunStore({
    content,
    now: Date.now,
    makeRng: createRng,
    persistence: createPersistence(memoryStorage()),
    meta,
  });
  run.getState().startRun(input);
  return { run, meta, input };
};

export function TestPlay({ content, selected }: TestPlayProps) {
  const [session, setSession] = useState<Session | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="primary"
          onClick={() => setSession(startSession(content, inputFor(selected)))}
        >
          {selected?.kind === "event" ? "여기서 시작" : "테스트 시작"}
        </Button>
        {session !== null && (
          <Button onClick={() => setSession(startSession(content, session.input))}>
            다시 시작
          </Button>
        )}
      </div>
      {session !== null && (
        <div className="mx-auto flex w-full max-w-phone flex-col border-2 border-slate bg-ink text-base text-parchment">
          <ContentContext value={content}>
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
