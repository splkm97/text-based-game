// The wire contract between the editor page and the dev server's save endpoint. This module
// imports nothing relative on purpose: the vite config loads it at config time, where Node's
// native loader rejects extensionless relative imports.

import { z } from "zod";

export const LEAF_KEYS = ["result", "success", "failure", "win", "flee", "leave"] as const;
export type LeafKey = (typeof LEAF_KEYS)[number];

const id = z.string().min(1);
const index = z.number().int().min(0);

export const TextPathSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("eventTitle"), event: id }),
  z.object({ kind: z.literal("eventText"), event: id }),
  z.object({ kind: z.literal("choiceText"), event: id, choice: index }),
  z.object({ kind: z.literal("leafText"), event: id, choice: index, leaf: z.enum(LEAF_KEYS) }),
  z.object({ kind: z.literal("endingTitle"), ending: id }),
  z.object({ kind: z.literal("endingText"), ending: id }),
]);
export type TextPath = z.infer<typeof TextPathSchema>;

export const SaveRequestSchema = z.object({ path: TextPathSchema, value: z.string().min(1) });
export type SaveRequest = z.infer<typeof SaveRequestSchema>;
