// @vitest-environment jsdom

// The test-play boundary: the run starts on the selected event, renders the draft text, and
// never touches the real localStorage keys.

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { CONTENT } from "../content";
import { buildGraph } from "./graph/model";
import { TestPlay } from "./TestPlay";
import { applyDraft, type Draft, pathKey } from "./textPath";

const EVENT_ID = "origin_monk_1_abbey_messenger";
const SENTINEL = "덧씌운 수도원의 전령";

afterEach(cleanup);

test("여기서 시작 opens the selected event with the draft title and leaves localStorage empty", async () => {
  const path = { kind: "eventTitle", event: EVENT_ID } as const;
  const draft: Draft = new Map([[pathKey(path), { path, value: SENTINEL }]]);
  const content = applyDraft(CONTENT, draft);
  const selected = buildGraph(content).nodes.find((node) => node.id === EVENT_ID);
  if (selected === undefined) throw new Error(`no graph node for ${EVENT_ID}`);

  render(<TestPlay content={content} selected={selected} />);
  await userEvent.click(screen.getByRole("button", { name: "여기서 시작" }));

  expect(screen.getByRole("heading", { name: SENTINEL })).toBeTruthy();
  expect(screen.getByRole("button", { name: "다시 시작" })).toBeTruthy();
  expect(localStorage.length).toBe(0);
});
