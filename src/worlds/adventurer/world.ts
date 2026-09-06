import type { WorldModule } from "../../host/world";
import { META } from "./meta";
import { App } from "./ui/App";

const world: WorldModule = {
  meta: META,
  Root: App,
  loadEditor: () => Promise.reject(new Error("editor adapter pending")),
};

export default world;
