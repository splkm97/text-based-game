import { describe, expect, test } from "vitest";
import { FALLBACK_EVENT_ID } from "../content/ids";
import { EngineError } from "./errors";
import { choiceAvailable, conditionHolds, eligibleEvents, pickNextEvent } from "./events";
import {
  constantRng,
  makeHero,
  makeRun,
  TEST_CONTENT,
  TEST_EVENTS,
  withEvents,
} from "./testContent";

const ids = (run = makeRun()) => eligibleEvents(run, TEST_CONTENT).map((event) => event.id);

describe("eligibleEvents", () => {
  test("includes common and matching origin events; excludes other pools and weight 0", () => {
    expect(ids()).toEqual(["ev_crossroad", "ev_shrine", "ev_mercenary_camp"]);
  });

  test("adds journey events only when the journey is enabled", () => {
    expect(ids(makeRun({ journeys: ["journey_circus"] }))).toContain("ev_circus_tent");
  });

  test("drops events whose requires fail", () => {
    expect(ids(makeRun({ flags: [] }))).not.toContain("ev_mercenary_camp");
    expect(ids(makeRun({ character: makeHero({ gold: 1000 }) }))).toContain("ev_rich_only");
  });

  test("drops once events already seen", () => {
    expect(ids(makeRun({ seenEvents: ["ev_shrine"] }))).not.toContain("ev_shrine");
    expect(ids(makeRun({ seenEvents: ["ev_crossroad"] }))).toContain("ev_crossroad");
  });
});

describe("pickNextEvent", () => {
  test("prefers the queued event even when it would not qualify", () => {
    const run = makeRun({ queuedEvent: "ev_followup" });
    expect(pickNextEvent(run, TEST_CONTENT, constantRng(0))).toBe("ev_followup");
  });

  test("throws UNKNOWN_ID for a queued event missing from content", () => {
    expect(() =>
      pickNextEvent(makeRun({ queuedEvent: "nope" }), TEST_CONTENT, constantRng(0)),
    ).toThrow(EngineError);
  });

  test("picks by weight from the eligible pool", () => {
    const run = makeRun({ flags: [] });
    expect(pickNextEvent(run, TEST_CONTENT, constantRng(0))).toBe("ev_crossroad");
    expect(pickNextEvent(run, TEST_CONTENT, constantRng(0.99))).toBe("ev_shrine");
  });

  test("falls back to fallback_rest when the pool is empty", () => {
    const run = makeRun({ flags: ["skip_crossroad"], seenEvents: ["ev_shrine"] });
    expect(pickNextEvent(run, TEST_CONTENT, constantRng(0))).toBe(FALLBACK_EVENT_ID);
  });

  test("throws UNKNOWN_ID when the fallback event is missing from content", () => {
    const { [FALLBACK_EVENT_ID]: _omitted, ...rest } = TEST_EVENTS;
    const run = makeRun({ flags: ["skip_crossroad"], seenEvents: ["ev_shrine"] });
    expect(() => pickNextEvent(run, withEvents(rest), constantRng(0))).toThrow(EngineError);
  });
});

describe("conditionHolds / choiceAvailable", () => {
  test("stat uses effective stats including the relic", () => {
    const run = makeRun({
      character: makeHero({
        inventory: ["kings_signet"],
        equipment: { mainHand: null, offHand: null, armor: null, relic: "kings_signet" },
      }),
    });
    expect(conditionHolds(run, { kind: "stat", stat: "cha", min: 10 }, TEST_CONTENT)).toBe(true);
    expect(conditionHolds(makeRun(), { kind: "stat", stat: "cha", min: 10 }, TEST_CONTENT)).toBe(
      false,
    );
  });

  test("item, flag, notFlag, gold, trait, hardMode", () => {
    const run = makeRun({ hardMode: true });
    expect(conditionHolds(run, { kind: "item", item: "rusty_sword" }, TEST_CONTENT)).toBe(true);
    expect(conditionHolds(run, { kind: "item", item: "kite_shield" }, TEST_CONTENT)).toBe(false);
    expect(conditionHolds(run, { kind: "flag", flag: "mercenary" }, TEST_CONTENT)).toBe(true);
    expect(conditionHolds(run, { kind: "notFlag", flag: "mercenary" }, TEST_CONTENT)).toBe(false);
    expect(conditionHolds(run, { kind: "gold", min: 30 }, TEST_CONTENT)).toBe(true);
    expect(conditionHolds(run, { kind: "gold", min: 31 }, TEST_CONTENT)).toBe(false);
    expect(conditionHolds(run, { kind: "trait", trait: "strong_arms" }, TEST_CONTENT)).toBe(true);
    expect(conditionHolds(run, { kind: "hardMode" }, TEST_CONTENT)).toBe(true);
    expect(conditionHolds(makeRun(), { kind: "hardMode" }, TEST_CONTENT)).toBe(false);
  });

  test("choiceAvailable requires every condition", () => {
    const choices = TEST_EVENTS.ev_crossroad?.choices ?? [];
    expect(choices.map((choice) => choiceAvailable(makeRun(), choice, TEST_CONTENT))).toEqual([
      true,
      true,
      true,
      true,
      false,
    ]);
  });
});
