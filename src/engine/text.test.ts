import { expect, test } from "vitest";
import { josa } from "./text";

test("josa picks the particle from the last syllable's final consonant", () => {
  expect(josa("멧돼지", "이/가")).toBe("멧돼지가");
  expect(josa("서리 거인", "이/가")).toBe("서리 거인이");
  expect(josa("잿빛 용", "을/를")).toBe("잿빛 용을");
  expect(josa("노상강도", "을/를")).toBe("노상강도를");
});

test("josa falls back to the final-consonant form for non-Hangul endings", () => {
  expect(josa("Wyvern", "이/가")).toBe("Wyvern이");
  expect(josa("", "을/를")).toBe("을");
});
