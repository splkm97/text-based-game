// The run store reaches components through context so tests can mount a store built over an
// in-memory persistence. Production never renders a provider: the default is the app singleton.

import { createContext, use } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import { type RunStore, runStore } from "../store/runStore";

export const RunStoreContext = createContext<StoreApi<RunStore>>(runStore);

export const useRun = <T>(selector: (state: RunStore) => T): T =>
  useStore(use(RunStoreContext), selector);
