// The run reducer surface a store drives: start, continue, choose, act, end the day.
// Phases: comms -> observe -> act -> night -> (day + 1, ending check) -> comms | ended.

import { pickWeighted } from "../../../shared/rng";
import type {
  Action,
  Content,
  CrewState,
  EventId,
  KnownSymptoms,
  Message,
  Phase,
  Reveals,
  Rng,
  RunState,
} from "../types";
import { applyAction } from "./actions";
import { applyEffects } from "./effects";
import { determineEnding } from "./endings";
import { RulesError } from "./errors";
import { choiceAvailable, drawEvent, requireEvent } from "./events";
import { messagesArriving } from "./lag";
import { INCUBATION_NIGHTS, resolveNight } from "./night";
import { computeScore } from "./score";

export const AP_PER_DAY = 2;
const START_CAPTAIN = { hp: 10, authority: 3 } as const;
const START_TRUST = 70;
const START_KITS = 3;
const START_MEDS = 4;

const requirePhase = <K extends Phase["kind"]>(
  run: RunState,
  kind: K,
): Extract<Phase, { kind: K }> => {
  if (run.phase.kind !== kind) {
    throw new RulesError("INVALID_PHASE", `expected phase ${kind}, got ${run.phase.kind}`);
  }
  return run.phase as Extract<Phase, { kind: K }>;
};

const journal = (run: RunState, lines: readonly string[]): RunState => ({
  ...run,
  log: [...run.log, ...lines.map((text) => ({ day: run.day, text }))],
});

/** A later message overrides an earlier one symptom by symptom. */
export const applyReveals = (known: KnownSymptoms, reveals: Reveals): KnownSymptoms => {
  const confirms = reveals.confirms ?? [];
  const retracts = reveals.retracts ?? [];
  return {
    confirmed: [
      ...known.confirmed.filter((symptom) => !retracts.includes(symptom)),
      ...confirms.filter((symptom) => !known.confirmed.includes(symptom)),
    ],
    retracted: [
      ...known.retracted.filter((symptom) => !confirms.includes(symptom)),
      ...retracts.filter((symptom) => !known.retracted.includes(symptom)),
    ],
  };
};

/** Collects today's messages, applies their reveals, and resets action points. */
const enterComms = (run: RunState, content: Content): RunState => {
  const arrived = messagesArriving(content.messages, run.day);
  const known = arrived.reduce(
    (acc: KnownSymptoms, message: Message) => applyReveals(acc, message.reveals),
    run.knownSymptoms,
  );
  return journal(
    {
      ...run,
      ap: AP_PER_DAY,
      inbox: [...run.inbox, ...arrived.map((message) => message.id)],
      knownSymptoms: known,
      phase: { kind: "comms", arrived: arrived.map((message) => message.id) },
    },
    arrived.map((message) => `지구 통신 수신: ${message.title}`),
  );
};

const freshCrew = (content: Content): readonly CrewState[] =>
  content.crew.map((template) => ({
    id: template.id,
    alive: true,
    quarantined: false,
    stress: 0,
    infection: "healthy",
    incubationLeft: 0,
    sickDays: 0,
    symptoms: [],
  }));

/** Marks `event` as today's observe draw. */
const observe = (run: RunState, event: EventId): RunState => ({
  ...run,
  seenEvents: run.seenEvents.includes(event) ? run.seenEvents : [...run.seenEvents, event],
  phase: { kind: "observe", event },
});

/** Day 1 comms with one random crew member already incubating. `firstEvent` lands day 1 in
 * observe on that event whatever its weight or requirements: the editor's test play starts there. */
export const startRun = (content: Content, rng: Rng, firstEvent?: EventId): RunState => {
  const crew = freshCrew(content);
  const carrier = pickWeighted(crew, () => 1, rng);
  const run = enterComms(
    {
      day: 1,
      phase: { kind: "comms", arrived: [] },
      captain: START_CAPTAIN,
      trust: START_TRUST,
      kits: START_KITS,
      meds: START_MEDS,
      ap: AP_PER_DAY,
      crew: crew.map((member) =>
        member.id === carrier.id
          ? { ...member, infection: "incubating", incubationLeft: INCUBATION_NIGHTS }
          : member,
      ),
      inbox: [],
      knownSymptoms: { confirmed: [], retracted: [] },
      seenEvents: [],
      tests: [],
      log: [],
    },
    content,
  );
  return firstEvent === undefined ? run : observe(run, requireEvent(firstEvent, content).id);
};

const advanceToObserve = (run: RunState, content: Content, rng: Rng): RunState =>
  observe(run, drawEvent(run, content, rng));

const finishNight = (run: RunState, content: Content): RunState => {
  const next = { ...run, day: run.day + 1 };
  const ending = determineEnding(next);
  if (ending === null) {
    return enterComms(next, content);
  }
  return journal({ ...next, phase: { kind: "ended", ending, score: computeScore(next, ending) } }, [
    content.endings[ending].title,
  ]);
};

/** From comms: draw today's event. From night: advance the day and check for an ending. */
export const continueRun = (run: RunState, content: Content, rng: Rng): RunState => {
  switch (run.phase.kind) {
    case "comms":
      return advanceToObserve(run, content, rng);
    case "night":
      return finishNight(run, content);
    default:
      throw new RulesError("INVALID_PHASE", `cannot continue from phase ${run.phase.kind}`);
  }
};

export const chooseOption = (run: RunState, choiceIndex: number, content: Content): RunState => {
  const { event: eventId } = requirePhase(run, "observe");
  const event = requireEvent(eventId, content);
  const choice = event.choices[choiceIndex];
  if (choice === undefined) {
    throw new RulesError("INVALID_CHOICE", `event ${eventId} has no choice ${choiceIndex}`);
  }
  if (!choiceAvailable(run, choice)) {
    throw new RulesError("INVALID_CHOICE", `choice ${choiceIndex} requirements are not met`);
  }
  const applied = applyEffects(run, choice.outcome.effects, content);
  return journal({ ...applied.run, phase: { kind: "act" } }, [choice.outcome.text, ...applied.log]);
};

/** Spends one action point. */
export const performAction = (
  run: RunState,
  action: Action,
  content: Content,
  rng: Rng,
): RunState => {
  requirePhase(run, "act");
  if (run.ap <= 0) {
    throw new RulesError("NO_AP", "no action points left today");
  }
  const result = applyAction(run, action, content, rng);
  return journal({ ...result.run, ap: run.ap - 1 }, result.log);
};

/** Ends the act phase early or when AP is spent; the night resolves at once. */
export const endDay = (run: RunState, content: Content, rng: Rng): RunState => {
  requirePhase(run, "act");
  const night = resolveNight(run, content, rng);
  return journal({ ...night.run, phase: { kind: "night", report: night.report } }, night.report);
};
