// Every text the editor offers must be reachable by the save endpoint. An id written as an
// imported constant, or defined in a file the source scan skips, is editable in the UI but fails
// to save; this test turns that into a CI failure instead of a 404 at save time.

import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import type { EditableField, EditorModel } from "../../src/editor/adapter.ts";
import { contentSourceFiles } from "./files.ts";
import { locateText } from "./locate.ts";
import { EDITABLE_WORLDS, type WorldId } from "./worlds.ts";

type Source = { readonly file: string; readonly text: string };
type Editable = { readonly id: string; readonly field: EditableField };

const readSources = async (world: WorldId): Promise<readonly Source[]> => {
  const files = await contentSourceFiles(".", world);
  return Promise.all(files.map(async (file) => ({ file, text: await readFile(file, "utf8") })));
};

/** The first field of every node that has one; the others share that node's object literal. */
const editables = <R>(model: EditorModel<R>): readonly Editable[] =>
  model.graph(model.registry).nodes.flatMap((node) => {
    const [field] = model.fields(model.registry, node.id);
    return field === undefined ? [] : [{ id: node.id, field }];
  });

/** Each world's pure model, never its adapter: this test runs under node without React. */
const worldEditables = async (world: WorldId): Promise<readonly Editable[]> => {
  switch (world) {
    case "adventurer":
      return editables((await import("../../src/worlds/adventurer/editor/model.ts")).MODEL);
    case "voyage":
      return editables((await import("../../src/worlds/voyage/editor/model.ts")).MODEL);
  }
};

/** True when some source file resolves the field to a string literal. */
const locatable = (sources: readonly Source[], { id, field }: Editable): boolean =>
  sources.some(
    // The id must appear as a quoted literal for `locateText` to match it, so the substring
    // check only skips files that cannot possibly hold the object.
    ({ file, text }) =>
      text.includes(JSON.stringify(id)) && locateText(text, file, id, field.path).ok,
  );

test.each(EDITABLE_WORLDS)(
  "%s: every node with a field locates it in a scanned source file",
  async (world) => {
    const sources = await readSources(world);
    const missing = (await worldEditables(world))
      .filter((editable) => !locatable(sources, editable))
      .map(({ id, field }) => `${id} ${field.path.join(".")}`);
    expect(missing).toEqual([]);
  },
);
