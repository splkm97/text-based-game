// Client side of the dev server's save endpoint. The response is untrusted input at the editor's
// HTTP boundary, so zod reads it; every failure mode collapses to `{ ok: false, error }`.

import { z } from "zod";
import type { SaveRequest } from "./textPathSchema";

const SAVE_URL = "/__content/api/save";

const Saved = z.object({ file: z.string() });
const Failed = z.object({ error: z.string() });

export type SaveResult =
  | { readonly ok: true; readonly file: string }
  | { readonly ok: false; readonly error: string };

const message = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const bodyOf = (response: Response): Promise<unknown> => response.json().catch(() => undefined);

export const saveText = async (request: SaveRequest): Promise<SaveResult> => {
  try {
    const response = await fetch(SAVE_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
    });
    const body = await bodyOf(response);
    if (response.ok) {
      const saved = Saved.safeParse(body);
      return saved.success
        ? { ok: true, file: saved.data.file }
        : { ok: false, error: `응답을 읽지 못했습니다 (HTTP ${response.status})` };
    }
    const failed = Failed.safeParse(body);
    return { ok: false, error: failed.success ? failed.data.error : `HTTP ${response.status}` };
  } catch (error) {
    return { ok: false, error: message(error) };
  }
};
