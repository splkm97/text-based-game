import { expect, test } from "vitest";
import type { SaveIo } from "./save.ts";
import { handleSave } from "./save.ts";

const EVENTS_FILE = "src/content/events/origins/monk.ts";
const ENDINGS_FILE = "src/content/endings.ts";

const SOURCES: Readonly<Record<string, string>> = {
  [EVENTS_FILE]: `export const MONK_EVENTS = [
  { id: "origin_monk_1", title: "수도원의 전령", text: "본문", choices: [] },
];
`,
  [ENDINGS_FILE]: `export const ENDINGS = {
  death: { id: "death", title: "죽음", text: "본문", tone: "bad" },
};
`,
};

// The io is the boundary: writes and format calls are recorded, nothing touches disk.
const memoryIo = () => {
  const written: [string, string][] = [];
  const formatted: string[] = [];
  const io: SaveIo = {
    listFiles: async () => Object.keys(SOURCES),
    readFile: async (file) => {
      const source = SOURCES[file];
      if (source === undefined) throw new Error(`no such file: ${file}`);
      return source;
    },
    writeFile: async (file, source) => {
      written.push([file, source]);
    },
    format: async (file) => {
      formatted.push(file);
    },
  };
  return { io, written, formatted };
};

test("400 on a body that fails the save schema", async () => {
  const { io, written } = memoryIo();
  const bodies: readonly unknown[] = [
    null,
    {},
    { path: { kind: "eventTitle", event: "x" } },
    { path: { kind: "eventTitle", event: "x" }, value: "" },
    { path: { kind: "leafText", event: "x", choice: 0, leaf: "nope" }, value: "y" },
  ];
  for (const body of bodies) {
    const response = await handleSave(body, io);
    expect(response.status).toBe(400);
  }
  expect(written).toEqual([]);
});

test("404 when no file contains the id", async () => {
  const { io, written, formatted } = memoryIo();
  const response = await handleSave(
    { path: { kind: "eventTitle", event: "origin_nobody" }, value: "새 제목" },
    io,
  );
  expect(response).toEqual({ status: 404, error: expect.stringContaining("origin_nobody") });
  expect(written).toEqual([]);
  expect(formatted).toEqual([]);
});

test("200 writes the rewritten file and formats it once", async () => {
  const { io, written, formatted } = memoryIo();
  const response = await handleSave(
    { path: { kind: "endingTitle", ending: "death" }, value: "새 죽음" },
    io,
  );
  expect(response).toEqual({ status: 200, file: ENDINGS_FILE });
  expect(written).toEqual([
    [
      ENDINGS_FILE,
      `export const ENDINGS = {
  death: { id: "death", title: "새 죽음", text: "본문", tone: "bad" },
};
`,
    ],
  ]);
  expect(formatted).toEqual([ENDINGS_FILE]);
});
