// Cross-file integrity of the assembled registry: counts the brief fixes, id resolution,
// message timing, and the shape of what Earth eventually tells the ship.

import { describe, expect, test } from "vitest";
import { CREW_IDS, CREW_ROLES, ENDING_IDS, FALLBACK_EVENT_ID, MEDIC_ROLE } from "../ids";
import { ARRIVAL_DAY, arrivalDay } from "../rules/lag";
import { VIRAL_SYMPTOMS } from "../rules/night";
import { applyReveals } from "../rules/run";
import type { Condition, Effect, KnownSymptoms, ObserveEvent } from "../types";
import { CONTENT } from "./index";

const EVENTS: readonly ObserveEvent[] = Object.values(CONTENT.events);
const STORY_EVENTS = EVENTS.filter((event) => event.id !== FALLBACK_EVENT_ID);
const CREW_KEYS = new Set<string>(CONTENT.crew.map((crew) => crew.id));

const conditionsOf = (event: ObserveEvent): readonly Condition[] => [
  ...event.requires,
  ...event.choices.flatMap((choice) => choice.requires),
];

const crewRefsInEffects = (source: string, effects: readonly Effect[]): readonly string[] =>
  effects.flatMap((effect) =>
    effect.kind === "stress" && effect.target !== "all" ? [`${source} -> ${effect.target}`] : [],
  );

describe("crew", () => {
  test("eight templates, one per catalog id, every role used once, exactly one medic", () => {
    expect(CONTENT.crew.map((crew) => crew.id)).toEqual([...CREW_IDS]);
    expect([...CONTENT.crew.map((crew) => crew.role)].sort()).toEqual([...CREW_ROLES].sort());
    expect(CONTENT.crew.filter((crew) => crew.role === MEDIC_ROLE)).toHaveLength(1);
  });
});

describe("messages", () => {
  test("twelve unique messages, each arriving within the voyage", () => {
    expect(CONTENT.messages).toHaveLength(12);
    expect(new Set(CONTENT.messages.map((message) => message.id)).size).toBe(12);
    const outside = CONTENT.messages
      .map((message) => ({ id: message.id, arrives: arrivalDay(message.earthDay) }))
      .filter(({ arrives }) => arrives < 1 || arrives > ARRIVAL_DAY);
    expect(outside).toEqual([]);
  });

  test("Earth confirms cough, retracts it later, and ends up naming exactly the viral symptoms", () => {
    const inOrder = [...CONTENT.messages].sort(
      (a, b) => arrivalDay(a.earthDay) - arrivalDay(b.earthDay),
    );
    const confirmedCough = inOrder.findIndex((m) => m.reveals.confirms?.includes("cough") ?? false);
    const retractedCough = inOrder.findIndex((m) => m.reveals.retracts?.includes("cough") ?? false);
    expect(confirmedCough).toBeGreaterThanOrEqual(0);
    expect(retractedCough).toBeGreaterThan(confirmedCough);

    const known = inOrder.reduce(
      (acc: KnownSymptoms, message) => applyReveals(acc, message.reveals),
      { confirmed: [], retracted: [] },
    );
    expect([...known.confirmed].sort()).toEqual([...VIRAL_SYMPTOMS].sort());
    expect(known.retracted).toContain("cough");
  });
});

describe("events", () => {
  const dayGated = STORY_EVENTS.filter((e) => e.requires.some((c) => c.kind === "day"));
  const crewGated = STORY_EVENTS.filter((e) => e.requires.some((c) => c.kind === "crew"));
  const general = STORY_EVENTS.filter((e) => !dayGated.includes(e) && !crewGated.includes(e));

  test("15 story events: 3 day-ranged, 4 gated on a named crew member, 8 general", () => {
    expect(STORY_EVENTS).toHaveLength(15);
    expect(dayGated).toHaveLength(3);
    expect(crewGated).toHaveLength(4);
    expect(general).toHaveLength(8);
  });

  test("the fallback exists with weight 0 and every registry key matches its event id", () => {
    expect(CONTENT.events[FALLBACK_EVENT_ID]?.weight).toBe(0);
    for (const [key, event] of Object.entries(CONTENT.events)) {
      expect(event.id).toBe(key);
    }
  });

  test("every event has 1..3 choices and at least one ungated choice", () => {
    const failures = EVENTS.flatMap((event) => [
      ...(event.choices.length >= 1 && event.choices.length <= 3
        ? []
        : [`${event.id} has ${event.choices.length} choices`]),
      ...(event.choices.some((choice) => choice.requires.length === 0)
        ? []
        : [`${event.id} has no ungated choice`]),
    ]);
    expect(failures).toEqual([]);
  });

  test("every crew id an event or confrontation names is aboard", () => {
    const refs = [
      ...EVENTS.flatMap((event) => [
        ...conditionsOf(event).flatMap((c) =>
          c.kind === "crew" ? [`${event.id} -> ${c.crew}`] : [],
        ),
        ...event.choices.flatMap((choice) => crewRefsInEffects(event.id, choice.outcome.effects)),
      ]),
      ...CONTENT.confrontations.flatMap((cf) => [
        ...crewRefsInEffects(cf.id, cf.success.effects),
        ...crewRefsInEffects(cf.id, cf.failure.effects ?? []),
      ]),
    ];
    const dangling = refs.filter((ref) => !CREW_KEYS.has(ref.split(" -> ")[1] ?? ""));
    expect(dangling).toEqual([]);
  });
});

describe("confrontations and endings", () => {
  test("four confrontations with unique ids and dc 11..14", () => {
    expect(CONTENT.confrontations).toHaveLength(4);
    expect(new Set(CONTENT.confrontations.map((cf) => cf.id)).size).toBe(4);
    const outside = CONTENT.confrontations.filter((cf) => cf.dc < 11 || cf.dc > 14);
    expect(outside.map((cf) => cf.id)).toEqual([]);
  });

  test("the four endings exist, keyed by their own id", () => {
    expect(Object.keys(CONTENT.endings).sort()).toEqual([...ENDING_IDS].sort());
    for (const [key, ending] of Object.entries(CONTENT.endings)) {
      expect(ending.id).toBe(key);
    }
  });
});
