import { describe, expect, test } from "vitest";
import { uuidFromBytes } from "./uuid";

describe("uuidFromBytes", () => {
  test("formats fixed bytes as an RFC 4122 v4 UUID, forcing the version and variant bits", () => {
    // All-0xff input would fail the regex below unless the version/variant masks are actually
    // applied, so this catches a missing mask rather than only a formatting bug.
    const raw = new Uint8Array(16).fill(0xff);
    const id = uuidFromBytes(raw);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(raw).toEqual(new Uint8Array(16).fill(0xff));
  });
});
