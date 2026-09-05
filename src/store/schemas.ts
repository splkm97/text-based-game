// zod schemas for the persisted `RunState` and `MetaState`. localStorage is the app's only trust
// boundary: a payload must validate here before the engine sees it. The schemas mirror the
// engine types exactly; the parse functions' return types prove the inferred shapes assignable.

import { z } from "zod";
import {
  ENDING_IDS,
  ITEM_IDS,
  JOURNEY_IDS,
  MONSTER_IDS,
  ORIGIN_IDS,
  TRAIT_IDS,
} from "../content/ids";
import { type MetaState, type RunState, STAT_IDS } from "../engine/types";

const statId = z.enum(STAT_IDS);
const itemId = z.enum(ITEM_IDS);
const monsterId = z.enum(MONSTER_IDS);
const traitId = z.enum(TRAIT_IDS);
const originId = z.enum(ORIGIN_IDS);
const journeyId = z.enum(JOURNEY_IDS);
const endingId = z.enum(ENDING_IDS);
const eventId = z.string();
const equipSlot = z.enum(["mainHand", "offHand", "armor", "relic"]);

const effect = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("hp"), delta: z.number() }),
  z.object({ kind: z.literal("sanity"), delta: z.number() }),
  z.object({ kind: z.literal("xp"), delta: z.number() }),
  z.object({ kind: z.literal("gold"), delta: z.number() }),
  z.object({ kind: z.literal("stat"), stat: statId, delta: z.number() }),
  z.object({ kind: z.literal("item"), item: itemId }),
  z.object({ kind: z.literal("removeItem"), item: itemId }),
  z.object({ kind: z.literal("flag"), flag: z.string() }),
  z.object({ kind: z.literal("nextEvent"), event: eventId }),
  z.object({ kind: z.literal("end"), ending: endingId }),
]);

const outcomeText = z.object({ text: z.string(), effects: z.array(effect) });

const combatState = z.object({
  monster: monsterId,
  monsterHp: z.number(),
  monsterMaxHp: z.number(),
  round: z.number(),
  log: z.array(z.string()),
  onWin: outcomeText,
  onFlee: outcomeText,
});

const shopState = z.object({ stock: z.array(itemId), onLeave: outcomeText });

const runPhase = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("event"), event: eventId }),
  z.object({ kind: z.literal("resolution"), text: z.string(), effectsLog: z.array(z.string()) }),
  z.object({ kind: z.literal("combat"), combat: combatState }),
  z.object({ kind: z.literal("shop"), shop: shopState }),
  z.object({
    kind: z.literal("ended"),
    ending: endingId,
    score: z.number(),
    ranked: z.boolean(),
  }),
]);

const character = z.object({
  name: z.string(),
  origin: originId,
  trait: traitId,
  stats: z.record(statId, z.number()),
  hp: z.number(),
  sanity: z.number(),
  xp: z.number(),
  gold: z.number(),
  pendingStatPoints: z.number(),
  levelUps: z.number(),
  inventory: z.array(itemId),
  equipment: z.record(equipSlot, itemId.nullable()),
});

const runState = z.object({
  character,
  day: z.number(),
  kills: z.number(),
  loadCount: z.number(),
  hardMode: z.boolean(),
  journeys: z.array(journeyId),
  flags: z.array(z.string()),
  seenEvents: z.array(eventId),
  queuedEvent: eventId.nullable(),
  pendingEnding: endingId.nullable(),
  phase: runPhase,
  log: z.array(z.object({ day: z.number(), text: z.string() })),
});

const rankingEntry = z.object({
  id: z.string(),
  name: z.string(),
  origin: originId,
  ending: endingId,
  score: z.number(),
  day: z.number(),
  hardMode: z.boolean(),
  ranked: z.boolean(),
  finishedAt: z.string(),
});

const metaState = z.object({
  codex: z.object({
    endings: z.array(endingId),
    monsters: z.array(monsterId),
    items: z.array(itemId),
  }),
  ranking: z.array(rankingEntry),
});

/** `JSON.parse` failures and schema failures both mean "no usable save". */
const parseWith = <S extends z.ZodType>(schema: S, json: string): z.output<S> | null => {
  try {
    const result = schema.safeParse(JSON.parse(json));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

export const parseRun = (json: string): RunState | null => parseWith(runState, json);

export const parseMeta = (json: string): MetaState | null => parseWith(metaState, json);
