// Crew lookups and updates shared by actions, night resolution, and conditions.

import { MEDIC_ROLE } from "../ids";
import type { Content, CrewId, CrewState, CrewStatus, RunState } from "../types";
import { RulesError } from "./errors";

export const STRESS_MAX = 100;

export const clampStress = (stress: number): number => Math.max(0, Math.min(STRESS_MAX, stress));

export const findCrew = (run: RunState, id: CrewId): CrewState => {
  const member = run.crew.find((crew) => crew.id === id);
  if (member === undefined) {
    throw new RulesError("UNKNOWN_ID", `crew ${id} is not aboard`);
  }
  return member;
};

export const nameOf = (content: Content, id: CrewId): string =>
  content.crew.find((crew) => crew.id === id)?.name ?? id;

/** Replaces one crew member's state, keeping crew order. */
export const withCrew = (run: RunState, updated: CrewState): RunState => ({
  ...run,
  crew: run.crew.map((crew) => (crew.id === updated.id ? updated : crew)),
});

export const mapCrew = (run: RunState, update: (crew: CrewState) => CrewState): RunState => ({
  ...run,
  crew: run.crew.map(update),
});

export const hasStatus = (crew: CrewState, status: CrewStatus): boolean => {
  switch (status) {
    case "alive":
      return crew.alive;
    case "dead":
      return !crew.alive;
    case "sick":
      return crew.alive && crew.infection === "sick";
    case "healthy":
      return crew.alive && crew.infection === "healthy";
    case "quarantined":
      return crew.alive && crew.quarantined;
  }
};

export const countOf = (run: RunState, status: CrewStatus): number =>
  run.crew.filter((crew) => hasStatus(crew, status)).length;

/** The medic keeps tests honest only while alive and not sick. */
export const medicUnavailable = (run: RunState, content: Content): boolean =>
  content.crew
    .filter((template) => template.role === MEDIC_ROLE)
    .some((template) => {
      const medic = findCrew(run, template.id);
      return !medic.alive || medic.infection === "sick";
    });
