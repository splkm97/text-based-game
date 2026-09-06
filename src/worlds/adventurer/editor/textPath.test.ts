import { expect, test } from "vitest";
import type { TextPath } from "../../../editor/textPathSchema";
import { CONTENT } from "../content";
import { applyDraft, pathKey, readText } from "./textPath";

const EVENT = "origin_monk_1_abbey_messenger";

const draftOf = (entries: readonly (readonly [TextPath, string])[]) =>
  new Map(entries.map(([path, value]) => [pathKey(path), { path, value }]));

test("applyDraft overlays every path kind and leaves the original untouched", () => {
  const paths: readonly TextPath[] = [
    { kind: "eventTitle", event: EVENT },
    { kind: "eventText", event: EVENT },
    { kind: "choiceText", event: EVENT, choice: 0 },
    { kind: "leafText", event: EVENT, choice: 0, leaf: "result" },
    { kind: "leafText", event: EVENT, choice: 1, leaf: "success" },
    { kind: "leafText", event: EVENT, choice: 1, leaf: "failure" },
    { kind: "endingTitle", ending: "death" },
    { kind: "endingText", ending: "death" },
  ];
  const before = paths.map((path) => readText(CONTENT, path));
  const overlaid = applyDraft(CONTENT, draftOf(paths.map((path) => [path, pathKey(path)])));

  for (const path of paths) {
    expect(readText(overlaid, path)).toBe(pathKey(path));
  }
  expect(paths.map((path) => readText(CONTENT, path))).toEqual(before);
  expect(overlaid.events[EVENT]?.choices[0]?.outcome.kind).toBe("direct");
  expect(overlaid.events[EVENT]?.choices[1]?.requires).toBe(
    CONTENT.events[EVENT]?.choices[1]?.requires,
  );
});

test("paths that do not resolve are skipped, never invented", () => {
  const draft = draftOf([
    [{ kind: "eventTitle", event: "no_such_event" }, "x"],
    [{ kind: "leafText", event: EVENT, choice: 0, leaf: "success" }, "x"],
    [{ kind: "choiceText", event: EVENT, choice: 99 }, "x"],
  ]);
  expect(applyDraft(CONTENT, draft)).toBe(CONTENT);
  expect(
    readText(CONTENT, { kind: "leafText", event: EVENT, choice: 0, leaf: "success" }),
  ).toBeUndefined();
});
