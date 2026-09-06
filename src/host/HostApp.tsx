// The PWA shell. Owns which world is open; a world renders inside its own theme and palette,
// and the hub renders with the defaults in `src/styles/theme.css`.

import { useState } from "react";
import { PaletteContext } from "../shared/art/paletteContext";
import { HubScreen } from "./HubScreen";
import { InstallPrompt } from "./pwa/InstallPrompt";
import { UpdateToast } from "./pwa/UpdateToast";
import type { WorldEntry } from "./registry";
import { themeStyle } from "./theme";
import type { WorldModule } from "./world";

type HostState =
  | { readonly kind: "hub" }
  | { readonly kind: "loading"; readonly entry: WorldEntry }
  | { readonly kind: "world"; readonly entry: WorldEntry; readonly module: WorldModule };

const HUB: HostState = { kind: "hub" };

export function HostApp() {
  const [state, setState] = useState<HostState>(HUB);
  const toHub = () => setState(HUB);
  const enter = (entry: WorldEntry) => {
    setState({ kind: "loading", entry });
    // A chunk that fails to fetch returns the player to the hub, where the card can be retried.
    entry.load().then((module) => setState({ kind: "world", entry, module }), toHub);
  };

  // The PWA banners stay mounted across hub and world: the browser offers install once per load.
  return (
    <div className="flex min-h-dvh flex-col">
      {state.kind === "world" ? (
        <div
          style={themeStyle(state.module.meta.theme)}
          className="min-h-dvh bg-ink text-parchment"
        >
          <PaletteContext value={state.module.meta.theme.palette}>
            <state.module.Root onExit={toHub} />
          </PaletteContext>
        </div>
      ) : (
        <main className="safe-area mx-auto flex w-full max-w-phone flex-1 flex-col">
          {state.kind === "hub" ? (
            <HubScreen onEnter={enter} />
          ) : (
            <p role="status" className="m-auto text-xs text-ash">
              불러오는 중…
            </p>
          )}
        </main>
      )}
      <div className="mx-auto w-full max-w-phone px-4">
        <InstallPrompt />
      </div>
      <UpdateToast />
    </div>
  );
}
