// Which top-level screen is showing. In memory only: a reload always lands on the title.

import { create } from "zustand";

export type Screen = "title" | "voyage";

type ScreenStore = {
  readonly screen: Screen;
  readonly go: (screen: Screen) => void;
};

export const useScreenStore = create<ScreenStore>()((set) => ({
  screen: "title",
  go: (screen) => set({ screen }),
}));
