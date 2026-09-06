import type { WorldModule } from "../../host/world";
import { META } from "./meta";
import { App } from "./ui/App";

// The editor import sits behind the DEV check so the production build drops the adapter chunk.
const loadEditor: WorldModule["loadEditor"] = () =>
  import.meta.env.DEV
    ? import("./editor/adapter").then(({ ADAPTER }) => ({ open: (use) => use(ADAPTER) }))
    : Promise.reject(new Error("editor is dev-only"));

const world: WorldModule = { meta: META, Root: App, loadEditor };

export default world;
