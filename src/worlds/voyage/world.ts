import type { WorldModule } from "../../host/world";
import { META } from "./meta";
import { App } from "./ui/App";

// Placeholder until the editor adapter lands; the DEV check mirrors the adventurer world so the
// production build never reaches editor code.
const loadEditor: WorldModule["loadEditor"] = () =>
  Promise.reject(new Error(import.meta.env.DEV ? "editor adapter pending" : "editor is dev-only"));

const world: WorldModule = { meta: META, Root: App, loadEditor };

export default world;
