// @vitest-environment jsdom

// The test-play boundary: the run starts on the selected event, renders the draft text, and
// never touches the real localStorage keys.

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { CONTENT } from "../content";
import { MODEL } from "./model";
import { TestPlay } from "./TestPlay";

const EVENT_ID = "ev_general_rumor";
const SENTINEL = "덧씌운 소문";

afterEach(cleanup);

test("여기서 시작 opens the selected event with the draft title and leaves localStorage empty", async () => {
  const registry = MODEL.applyText(CONTENT, EVENT_ID, ["title"], SENTINEL);

  render(<TestPlay registry={registry} selectedId={EVENT_ID} />);
  await userEvent.click(screen.getByRole("button", { name: "여기서 시작" }));

  expect(screen.getByRole("heading", { name: SENTINEL })).toBeTruthy();
  expect(screen.getByRole("button", { name: "다시 시작" })).toBeTruthy();
  expect(localStorage.length).toBe(0);
});
