// Candidate content sources for one world: every TypeScript file under its content directory
// except tests, as sorted repo-relative paths.

import { readdir } from "node:fs/promises";
import { join, relative } from "node:path";
import type { WorldId } from "./worlds.ts";

const isSource = (name: string): boolean => name.endsWith(".ts") && !name.endsWith(".test.ts");

export const contentSourceFiles = async (
  root: string,
  world: WorldId,
): Promise<readonly string[]> => {
  const dir = join(root, "src", "worlds", world, "content");
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && isSource(entry.name))
    .map((entry) => relative(root, join(entry.parentPath, entry.name)))
    .sort();
};
