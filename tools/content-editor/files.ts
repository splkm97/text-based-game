// Candidate content sources: every event file plus the endings record, as repo-relative paths.

import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const EVENTS_DIR = "src/content/events";
const ENDINGS_FILE = "src/content/endings.ts";

const isEventSource = (name: string): boolean =>
  name.endsWith(".ts") && !name.endsWith(".test.ts") && name !== "index.ts";

export const contentSourceFiles = async (root: string): Promise<readonly string[]> => {
  const entries = await readdir(join(root, EVENTS_DIR), { recursive: true, withFileTypes: true });
  const events = entries
    .filter((entry) => entry.isFile() && isEventSource(entry.name))
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .sort();
  return [...events, ENDINGS_FILE];
};
