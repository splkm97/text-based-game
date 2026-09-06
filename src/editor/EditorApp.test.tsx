// @vitest-environment jsdom

// The editor's boundaries: the URL query that picks the world and keeps the selection, and the
// save endpoint. `fetch` is the only stub; everything else runs over the real adventurer adapter.

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { EditorApp } from "./EditorApp";

const EVENT_ID = "origin_monk_1_abbey_messenger";
const EVENT_TITLE = "수도원의 전령";

type Deferred = {
  readonly promise: Promise<Response>;
  readonly settle: (response: Response) => void;
};

/** A `fetch` result the test releases by hand, so an edit can land while the save is in flight. */
const deferred = (): Deferred => {
  const box: { settle: (response: Response) => void } = { settle: () => undefined };
  const promise = new Promise<Response>((resolve) => {
    box.settle = resolve;
  });
  return { promise, settle: (response) => box.settle(response) };
};

const jsonResponse = (status: number, body: object): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });

/** The graph node for `id`, once the world's adapter has loaded and rendered. */
const nodeButton = (id: string): Promise<Element> =>
  waitFor(() => {
    const node = document.querySelector(`[data-node-id="${id}"]`);
    if (node === null) throw new Error(`no graph node for ${id}`);
    return node;
  });

const titleInput = (): HTMLInputElement => {
  const input = screen.getByLabelText("제목");
  if (!(input instanceof HTMLInputElement)) throw new Error("제목 is not an input");
  return input;
};

/** Selects the abbey messenger event and appends `suffix` to its title. */
const editTitle = async (suffix: string): Promise<void> => {
  render(<EditorApp />);
  await userEvent.click(await nodeButton(EVENT_ID));
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
    world: "adventurer",
    id: EVENT_ID,
    path: ["title"],
    value: `${EVENT_TITLE} 개정`,
  });
});

test("an edit made while a save is in flight survives the response", async () => {
  const inFlight = deferred();
  const fetchMock = vi.fn<typeof fetch>().mockReturnValue(inFlight.promise);
  vi.stubGlobal("fetch", fetchMock);
  await editTitle(" 개정");

  await userEvent.click(screen.getByRole("button", { name: "저장" }));
  await userEvent.type(titleInput(), " 2");

  await act(async () => {
    inFlight.settle(jsonResponse(200, { file: "x.ts" }));
    await new Promise((done) => {
      setTimeout(done, 0);
    });
  });

  expect(titleInput().value).toBe(`${EVENT_TITLE} 개정 2`);
  expect(screen.getByText("변경 1건")).toBeDefined();
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

test("loading with ?world=adventurer&node=death selects the death ending", async () => {
  window.history.replaceState(null, "", "/__content?world=adventurer&node=death");
  render(<EditorApp />);
  const death = await nodeButton("death");
  expect(titleInput().value).toBe("죽음");
  expect(death.getAttribute("aria-pressed")).toBe("true");
});
