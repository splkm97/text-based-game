import { expect, test } from "vitest";
import { validateSprite } from "../../../shared/art/sprite";
import { JOB_IDS } from "../ids";
import { SCENES } from "./scenes";

// The accent palette a scene may spend: amber, rust, sign red, dusk blue, pale dusk.
const ACCENTS = ["8", "9", "a", "d", "e"] as const;

test("the scene set is exactly the job list, in order", () => {
  expect(Object.keys(SCENES)).toEqual([...JOB_IDS]);
});

test.each(JOB_IDS)("%s is a 32x32 sprite", (id) => {
  const scene = SCENES[id];
  expect(scene.size).toBe(32);
  expect(scene.rows.map((row) => row.length)).toEqual(Array<number>(32).fill(32));
  expect(() => validateSprite(scene)).not.toThrow();
});

test("no two scenes share a silhouette", () => {
  const silhouettes = new Set(JOB_IDS.map((id) => SCENES[id].rows.join("\n")));
  expect(silhouettes.size).toBe(JOB_IDS.length);
});

// A scene draws the eye with one accent color, and the four must not all reach for the same one.
test("every scene spends exactly one accent color, and they are not all alike", () => {
  const spent = JOB_IDS.map((id) => {
    const chars = new Set(SCENES[id].rows.join(""));
    return ACCENTS.filter((accent) => chars.has(accent));
  });
  for (const [index, accents] of spent.entries()) {
    expect(accents, `${JOB_IDS[index]} accents`).toHaveLength(1);
  }
  expect(new Set(spent.map((accents) => accents.join(""))).size).toBeGreaterThan(1);
});
