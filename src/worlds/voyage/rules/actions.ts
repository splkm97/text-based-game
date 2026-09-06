// Act phase: each action costs one action point; the phase and AP checks live in `run.ts`.

import { josa } from "../../../shared/josa";
import type { Action, Content, CrewId, CrewState, Rng, RunState } from "../types";
import { clampStress, findCrew, medicUnavailable, nameOf, withCrew } from "./crew";
import { RulesError } from "./errors";

export const TALK_STRESS_RELIEF = 20;
/** Chance a test result flips while the medic is sick or dead. */
export const TEST_FLIP_CHANCE = 0.2;
/** Chance a treated sick crew member recovers outright. */
export const TREAT_CURE_CHANCE = 0.7;

export type ActionResult = { readonly run: RunState; readonly log: readonly string[] };

const requireLiving = (run: RunState, id: CrewId): CrewState => {
  const crew = findCrew(run, id);
  if (!crew.alive) {
    throw new RulesError("INVALID_TARGET", `${id} is dead`);
  }
  return crew;
};

const quarantine = (run: RunState, id: CrewId, content: Content): ActionResult => {
  const crew = requireLiving(run, id);
  if (crew.quarantined) {
    throw new RulesError("INVALID_TARGET", `${id} is already quarantined`);
  }
  return {
    run: withCrew(run, { ...crew, quarantined: true }),
    log: [`${josa(nameOf(content, id), "을/를")} 격리한다.`],
  };
};

const release = (run: RunState, id: CrewId, content: Content): ActionResult => {
  const crew = requireLiving(run, id);
  if (!crew.quarantined) {
    throw new RulesError("INVALID_TARGET", `${id} is not quarantined`);
  }
  return {
    run: withCrew(run, { ...crew, quarantined: false }),
    log: [`${josa(nameOf(content, id), "을/를")} 격리에서 해제한다.`],
  };
};

/** Consumes a kit. The rng is consulted only when the medic is unavailable. */
const test = (run: RunState, id: CrewId, content: Content, rng: Rng): ActionResult => {
  const crew = requireLiving(run, id);
  if (run.kits <= 0) {
    throw new RulesError("NO_RESOURCE", "no test kits left");
  }
  const truth = crew.infection !== "healthy";
  const flipped = medicUnavailable(run, content) && rng() < TEST_FLIP_CHANCE;
  const positive = truth !== flipped;
  return {
    run: {
      ...run,
      kits: run.kits - 1,
      tests: [...run.tests, { day: run.day, crew: id, positive }],
    },
    log: [`${nameOf(content, id)} 검사 결과: ${positive ? "양성" : "음성"}`],
  };
};

const talk = (run: RunState, id: CrewId, content: Content): ActionResult => {
  const crew = requireLiving(run, id);
  return {
    run: withCrew(run, { ...crew, stress: clampStress(crew.stress - TALK_STRESS_RELIEF) }),
    log: [`${josa(nameOf(content, id), "을/를")} 불러 이야기한다. 스트레스 -${TALK_STRESS_RELIEF}`],
  };
};

/** Consumes a med. Only a sick crew member responds: cured with p 0.7, else the clock resets. */
const treat = (run: RunState, id: CrewId, content: Content, rng: Rng): ActionResult => {
  const crew = requireLiving(run, id);
  if (run.meds <= 0) {
    throw new RulesError("NO_RESOURCE", "no meds left");
  }
  const spent = { ...run, meds: run.meds - 1 };
  const name = nameOf(content, id);
  if (crew.infection !== "sick") {
    return { run: spent, log: [`${josa(name, "을/를")} 치료한다. 반응이 없다.`] };
  }
  if (rng() < TREAT_CURE_CHANCE) {
    return {
      run: withCrew(spent, { ...crew, infection: "healthy", sickDays: 0 }),
      log: [`${josa(name, "을/를")} 치료한다. 열이 내린다.`],
    };
  }
  return {
    run: withCrew(spent, { ...crew, sickDays: 0 }),
    log: [`${josa(name, "을/를")} 치료한다. 버티고는 있다.`],
  };
};

export const applyAction = (
  run: RunState,
  action: Action,
  content: Content,
  rng: Rng,
): ActionResult => {
  switch (action.kind) {
    case "quarantine":
      return quarantine(run, action.crew, content);
    case "release":
      return release(run, action.crew, content);
    case "test":
      return test(run, action.crew, content, rng);
    case "talk":
      return talk(run, action.crew, content);
    case "treat":
      return treat(run, action.crew, content, rng);
  }
};
