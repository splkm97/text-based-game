// The meta store reaches components through context so tests can mount a store built over an
// in-memory persistence. Production never renders a provider: the default is the app singleton.

import { createContext, use } from "react";
import { useStore } from "zustand";
import { type MetaStore, type MetaStoreApi, metaStore } from "../store/metaStore";

export const MetaStoreContext = createContext<MetaStoreApi>(metaStore);

export const useMeta = <T>(selector: (state: MetaStore) => T): T =>
  useStore(use(MetaStoreContext), selector);
