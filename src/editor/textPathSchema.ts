// The wire contract between the editor page and the dev server's save endpoint. This module
// imports nothing relative on purpose: the vite config loads it at config time, where Node's
// native loader rejects extensionless relative imports.

import { z } from "zod";

/** Names the object literal carrying `id`, then walks `path` (property names and array indices)
 * down to one string literal, which becomes `value`. */
export const SaveRequestSchema = z.object({
  world: z.enum(["adventurer", "voyage"]),
  id: z.string().min(1),
  path: z.array(z.union([z.string(), z.number().int().min(0)])).readonly(),
  value: z.string().min(1),
});
export type SaveRequest = z.infer<typeof SaveRequestSchema>;
