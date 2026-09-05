// The run reducer surface the store drives: start, choose, continue, and character actions.

import { allocateStatPoint, effectiveStats, equip, unequip } from "./character";
import { resolveCheck } from "./checks";
import { consumeItemInCombat, startCombat } from "./combat";
import { applyConsumable, applyEffects } from "./effects";
import { determineEnding, finishRun } from "./endings";
import { EngineError } from "./errors";
import { choiceAvailable, pickNextEvent } from "./events";
import { enterResolution, journal, requireOneOfPhases, requirePhase } from "./phase";
import {
  type Character,
  type ContentRegistry,
  type EquipSlot,
  type ItemId,
  type JourneyId,
  type Outcome,
  type OutcomeText,
  type Rng,
  type RunPhase,
  type RunState,
  STAT_NAMES,
  type StatId,
} from "./types";

export { buyItem, leaveShop, sellItem } from "./shop";

export type StartRunInput = {
  readonly character: Character;
  readonly hardMode: boolean;
  readonly journeys: readonly JourneyId[];
};

/** Phases in which the player may manage the character without spending a turn. */
const ACTION_PHASES: readonly RunPhase["kind"][] = ["event", "resolution", "shop"];

/** Whether equip, unequip, use-item, and spend-stat-point are allowed right now. */
export const isActionPhase = (run: RunState): boolean => ACTION_PHASES.includes(run.phase.kind);

const advanceToEvent = (
  run: Omit<RunState, "phase">,
  content: ContentRegistry,
  rng: Rng,
): RunState => {
  const event = pickNextEvent(run, content, rng);
  return {
    ...run,
    queuedEvent: null,
    seenEvents: run.seenEvents.includes(event) ? run.seenEvents : [...run.seenEvents, event],
    phase: { kind: "event", event },
  };
};

export const startRun = (input: StartRunInput, content: ContentRegistry, rng: Rng): RunState =>
  advanceToEvent(
    {
      character: input.character,
      day: 1,
      kills: 0,
      loadCount: 0,
      hardMode: input.hardMode,
      journeys: input.journeys,
      flags: content.origins[input.character.origin].startingFlags,
      seenEvents: [],
      queuedEvent: null,
      pendingEnding: null,
      log: [],
    },
    content,
    rng,
  );

const resolveOutcome = (
  run: RunState,
  outcome: OutcomeText,
  content: ContentRegistry,
  prefix: readonly string[],
): RunState => {
  const applied = applyEffects(run, outcome.effects, content);
  return enterResolution(applied.run, outcome.text, [...prefix, ...applied.log]);
};

const dispatchOutcome = (
  run: RunState,
  outcome: Outcome,
  content: ContentRegistry,
  rng: Rng,
): RunState => {
  switch (outcome.kind) {
    case "direct":
      return resolveOutcome(run, outcome.result, content, []);
    case "check": {
      const stat = effectiveStats(run.character, content)[outcome.stat];
      const { roll, success } = resolveCheck(stat, outcome.dc, rng);
      const verdict = success ? "성공" : "실패";
      return resolveOutcome(run, success ? outcome.success : outcome.failure, content, [
        `${STAT_NAMES[outcome.stat]} 판정 (d20 ${roll}): ${verdict}`,
      ]);
    }
    case "combat":
      return startCombat(run, outcome.monster, outcome.win, outcome.flee, content);
    case "shop":
      return {
        ...run,
        phase: { kind: "shop", shop: { stock: outcome.stock, onLeave: outcome.leave } },
      };
  }
};

export const chooseOption = (
  run: RunState,
  choiceIndex: number,
  content: ContentRegistry,
  rng: Rng,
): RunState => {
  const { event: eventId } = requirePhase(run, "event");
  const event = content.events[eventId];
  if (event === undefined) {
    throw new EngineError("UNKNOWN_ID", `event ${eventId} is not defined in content`);
  }
  const choice = event.choices[choiceIndex];
  if (choice === undefined) {
    throw new EngineError("INVALID_CHOICE", `event ${eventId} has no choice ${choiceIndex}`);
  }
  if (!choiceAvailable(run, choice, content)) {
    throw new EngineError("INVALID_CHOICE", `choice ${choiceIndex} requirements are not met`);
  }
  return dispatchOutcome(run, choice.outcome, content, rng);
};

/** From resolution: finalize an ending if one applies, else start the next day. */
export const continueRun = (run: RunState, content: ContentRegistry, rng: Rng): RunState => {
  requirePhase(run, "resolution");
  const ending = determineEnding(run, run.pendingEnding);
  if (ending !== null) {
    return finishRun(run, ending, content);
  }
  return advanceToEvent({ ...run, day: run.day + 1 }, content, rng);
};

const withCharacter = (run: RunState, character: Character): RunState => ({ ...run, character });

export const equipItem = (run: RunState, item: ItemId, content: ContentRegistry): RunState => {
  requireOneOfPhases(run, ACTION_PHASES);
  return withCharacter(run, equip(run.character, item, content));
};

export const unequipItem = (run: RunState, slot: EquipSlot, content: ContentRegistry): RunState => {
  requireOneOfPhases(run, ACTION_PHASES);
  return withCharacter(run, unequip(run.character, slot, content));
};

export const spendStatPoint = (run: RunState, stat: StatId): RunState => {
  requireOneOfPhases(run, ACTION_PHASES);
  return withCharacter(run, allocateStatPoint(run.character, stat));
};

/** In combat, using an item is the player's action and the monster strikes back once.
 * Outside combat, the item's log lines go to the run journal. */
export const consumeItem = (run: RunState, item: ItemId, content: ContentRegistry): RunState => {
  if (run.phase.kind === "combat") {
    return consumeItemInCombat(run, item, content);
  }
  requireOneOfPhases(run, ACTION_PHASES);
  const used = applyConsumable(run, item, content);
  return { ...used.run, log: [...used.run.log, ...journal(run.day, used.log)] };
};
