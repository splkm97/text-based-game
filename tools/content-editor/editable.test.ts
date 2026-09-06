// Every shipped event and ending must be reachable by the editor's write-back. An id written as
// an imported constant, or defined in a file the source scan skips, is editable in the UI but
// fails to save; this test turns that into a CI failure instead of a 404 at save time.

import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import { CONTENT } from "../../src/content/index.ts";
import type { TextPath } from "../../src/editor/textPathSchema.ts";
import { contentSourceFiles } from "./files.ts";
import { locateText } from "./locate.ts";

type Source = { readonly file: string; readonly text: string };

const readSources = async (): Promise<readonly Source[]> => {
  const files = await contentSourceFiles(".");
  return Promise.all(files.map(async (file) => ({ file, text: await readFile(file, "utf8") })));
};

/** True when some source file resolves the path to a string literal. */
const editable = (sources: readonly Source[], id: string, path: TextPath): boolean =>
  sources.some(
    // The id must appear as a quoted literal for `locateText` to match it, so the substring
    // check only skips files that cannot possibly hold the object.
    ({ file, text }) => text.includes(JSON.stringify(id)) && locateText(text, file, path).ok,
  );

test("every event and ending id is editable in a scanned source file", async () => {
  const sources = await readSources();

  const missing = [
    ...Object.keys(CONTENT.events)
      .filter((id) => !editable(sources, id, { kind: "eventTitle", event: id }))
      .map((id) => `event ${id}`),
    ...Object.keys(CONTENT.endings)
      .filter((id) => !editable(sources, id, { kind: "endingTitle", ending: id }))
      .map((id) => `ending ${id}`),
  ];

  expect(missing).toEqual([]);
});
