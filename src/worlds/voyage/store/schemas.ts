// zod schema for the persisted `RunState`. localStorage is this world's only trust boundary: a
// payload must validate here before the rules see it. The parse function's return type proves the
// inferred shape assignable to `RunState`.

import { z } from "zod";
import { CREW_IDS, ENDING_IDS, SYMPTOM_IDS } from "../ids";
import type { RunState } from "../types";

const crewId = z.enum(CREW_IDS);
const symptomId = z.enum(SYMPTOM_IDS);
const endingId = z.enum(ENDING_IDS);
const count = z.number().int().nonnegative();

const crewState = z.object({
  id: crewId,
  alive: z.boolean(),
  quarantined: z.boolean(),
  stress: z.number(),
  infection: z.enum(["healthy", "incubating", "sick"]),
  incubationLeft: count,
  sickDays: count,
  symptoms: z.array(symptomId),
});

const phase = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("comms"), arrived: z.array(z.string()) }),
  z.object({ kind: z.literal("observe"), event: z.string() }),
  z.object({ kind: z.literal("act") }),
  z.object({ kind: z.literal("night"), report: z.array(z.string()) }),
  z.object({ kind: z.literal("ended"), ending: endingId, score: z.number().int() }),
]);

const runState = z.object({
  day: count,
  phase,
  captain: z.object({ hp: z.number().int(), authority: z.number().int() }),
  trust: z.number(),
  kits: count,
  meds: count,
  ap: count,
  crew: z.array(crewState),
  inbox: z.array(z.string()),
  knownSymptoms: z.object({ confirmed: z.array(symptomId), retracted: z.array(symptomId) }),
  seenEvents: z.array(z.string()),
  tests: z.array(z.object({ day: count, crew: crewId, positive: z.boolean() })),
  log: z.array(z.object({ day: z.number(), text: z.string() })),
});

/** `JSON.parse` failures and schema failures both mean "no usable save". */
export const parseRun = (json: string): RunState | null => {
  try {
    const result = runState.safeParse(JSON.parse(json));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};
