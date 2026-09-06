// @vitest-environment jsdom

// The editor's two boundaries: the URL query that keeps the selection, and the save endpoint.
// `fetch` is the only stub; everything else runs over the real content registry.

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { EditorApp } from "./EditorApp";

const EVENT_ID = "origin_monk_1_abbey_messenger";
const EVENT_TITLE = "수도원의 전령";

const jsonResponse = (status: number, body: object): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

const nodeButton = (id: string): Element => {
  const node = document.querySelector(`[data-node-id="${id}"]`);
  if (node === null) throw new Error(`no graph node for ${id}`);
  return node;
};

const titleInput = (): HTMLInputElement => {
  const input = screen.getByLabelText("제목");
  if (!(input instanceof HTMLInputElement)) throw new Error("제목 is not an input");
  return input;
};

/** Selects the abbey messenger event and appends `suffix` to its title. */
const editTitle = async (suffix: string): Promise<void> => {
  render(<EditorApp />);
  await userEvent.click(nodeButton(EVENT_ID));
  expect(titleInput().value).toBe(EVENT_TITLE);
  await userEvent.type(titleInput(), suffix);
};

beforeEach(() => {
  window.history.replaceState(null, "", "/__content");
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

test("selecting a node opens its inspector and an edit counts as one change", async () => {
  await editTitle(" 개정");
  expect(screen.getByText("변경 1건")).toBeDefined();
  expect(new URLSearchParams(window.location.search).get("node")).toBe(EVENT_ID);
});

test("saving posts one request per dirty field and clears the draft on success", async () => {
  const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(200, { file: "x.ts" }));
  vi.stubGlobal("fetch", fetchMock);
  await editTitle(" 개정");

  await userEvent.click(screen.getByRole("button", { name: "저장" }));
  await screen.findByText("변경 0건");

  expect(fetchMock).toHaveBeenCalledTimes(1);
  const call = fetchMock.mock.calls[0];
  if (call === undefined) throw new Error("fetch was not called");
  const [url, init] = call;
  expect(url).toBe("/__content/api/save");
  expect(init?.method).toBe("POST");
  if (typeof init?.body !== "string") throw new Error("body is not a JSON string");
  expect(JSON.parse(init.body)).toEqual({
    path: { kind: "eventTitle", event: EVENT_ID },
    value: `${EVENT_TITLE} 개정`,
  });
});

test("a failed save keeps the draft and shows the error", async () => {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValue(jsonResponse(404, { error: "no source holds it" }));
  vi.stubGlobal("fetch", fetchMock);
  await editTitle(" 개정");

  await userEvent.click(screen.getByRole("button", { name: "저장" }));
  expect(await screen.findByRole("status")).toHaveProperty(
    "textContent",
    "저장 실패: no source holds it",
  );
  expect(screen.getByText("변경 1건")).toBeDefined();
});

test("loading with ?node=death selects the death ending", () => {
  window.history.replaceState(null, "", "/__content?node=death");
  render(<EditorApp />);
  expect(titleInput().value).toBe("죽음");
  expect(nodeButton("death").getAttribute("aria-pressed")).toBe("true");
});
