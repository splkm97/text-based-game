// The meta store reaches components through context so tests can mount a store built over an
// in-memory persistence. Production never renders a provider: the default is the app singleton.

import { createContext, use } from "react";
import { useStore } from "zustand";
import type { StoreApi } from "zustand/vanilla";
import { type MetaStore, metaStore } from "../store/metaStore";

export const MetaStoreContext = createContext<StoreApi<MetaStore>>(metaStore);

export const useMetaStore = <T>(selector: (state: MetaStore) => T): T =>
  useStore(use(MetaStoreContext), selector);
