// Save flow over an injected io: validate the request, find the literal in the first file of the
// world that has it, write the rewritten source, then format that file.

import { z } from "zod";
import type { SaveRequest } from "../../src/editor/textPathSchema.ts";
import { SaveRequestSchema } from "../../src/editor/textPathSchema.ts";
import type { LocateResult } from "./locate.ts";
import { locateText } from "./locate.ts";
import { replaceLiteral } from "./rewrite.ts";
import type { WorldId } from "./worlds.ts";

export type SaveIo = {
  readonly listFiles: (world: WorldId) => Promise<readonly string[]>;
  readonly readFile: (file: string) => Promise<string>;
  readonly writeFile: (file: string, source: string) => Promise<void>;
  readonly format: (file: string) => Promise<void>;
};

export type SaveResponse =
  | { readonly status: 200; readonly file: string }
  | { readonly status: 400 | 404 | 422; readonly error: string };

type Target = Pick<SaveRequest, "world" | "id" | "path">;
type Failure = Exclude<LocateResult, { ok: true }>["reason"];
type Search =
  | {
      readonly ok: true;
      readonly file: string;
      readonly source: string;
      readonly start: number;
      readonly end: number;
    }
  | { readonly ok: false; readonly reasons: readonly Failure[] };

/** The first file whose source holds the target, or every file's failure reason. */
const search = async ({ world, id, path }: Target, io: SaveIo): Promise<Search> => {
  const reasons: Failure[] = [];
  for (const file of await io.listFiles(world)) {
    const source = await io.readFile(file);
    const result = locateText(source, file, id, path);
    if (result.ok) return { ok: true, file, source, start: result.start, end: result.end };
    reasons.push(result.reason);
  }
  return { ok: false, reasons };
};

const failure = (reasons: readonly Failure[], { id, path }: Target): SaveResponse => {
  const blocking = reasons.find((reason) => reason !== "notFound");
  const key = `${id} ${JSON.stringify(path)}`;
  if (blocking === undefined) return { status: 404, error: `no source holds ${key}` };
  return { status: 422, error: `${blocking} while locating ${key}` };
};

export const handleSave = async (body: unknown, io: SaveIo): Promise<SaveResponse> => {
  const parsed = SaveRequestSchema.safeParse(body);
  if (!parsed.success) return { status: 400, error: z.prettifyError(parsed.error) };
  const { value, ...target } = parsed.data;

  const found = await search(target, io);
  if (!found.ok) return failure(found.reasons, target);

  await io.writeFile(found.file, replaceLiteral(found.source, found.start, found.end, value));
  await io.format(found.file);
  return { status: 200, file: found.file };
};
