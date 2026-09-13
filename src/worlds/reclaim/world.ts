import type { WorldModule } from "../../host/world";
import { META } from "./meta";
import { App } from "./ui/App";

// The editor is out of scope for this world (ledger CEO-03, 2026-09-14).
const loadEditor: WorldModule["loadEditor"] = () =>
  Promise.reject(new Error("reclaim editor is not implemented"));

const world: WorldModule = { meta: META, Root: App, loadEditor };

export default world;
