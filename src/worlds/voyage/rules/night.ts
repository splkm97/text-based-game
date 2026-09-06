// Night resolution, in this order: incubation, spread, deaths, stress, trust, symptoms,
// then at most one confrontation. Day advance and the ending check belong to `run.ts`.

import { resolveCheck } from "../../../shared/dice";
import { josa } from "../../../shared/josa";
import { pickWeighted } from "../../../shared/rng";
import { SYMPTOM_IDS } from "../ids";
import type { Content, CrewState, Rng, RunState, SymptomId } from "../types";
import { clampStress, mapCrew, nameOf, withCrew } from "./crew";
import { applyEffects } from "./effects";

export const INCUBATION_NIGHTS = 3;
/** Tuned from the design's 0.25: at 0.25 a carrier seeds the crew before any symptom shows and
 * the scripted replay policy reached arrival in 6% of seeds; at 0.15 it does in about 24%. */
export const SPREAD_CHANCE = 0.15;
export const DEATH_SICK_DAYS = 4;
export const NIGHT_STRESS = 8;
export const QUARANTINE_STRESS = 7;
export const TRUST_PER_HEALTHY_QUARANTINE = -5;
export const TRUST_PER_DEATH = -15;
export const STRESS_SYMPTOM_THRESHOLD = 50;
export const COUGH_CHANCE = 0.1;
export const CONFRONTATION_STRESS = 80;
export const CONFRONTATION_RELIEF = 40;
export const CONFRONTATION_TRUST_PENALTY = -10;
export const DEFAULT_FAILURE_HP = -3;

/** Hidden truth: which symptoms the pathogen causes and which stress causes. */
export const VIRAL_SYMPTOMS: readonly SymptomId[] = ["fever", "rash", "nosebleed"];
export const STRESS_SYMPTOMS: readonly SymptomId[] = ["tremor", "insomnia"];
export const NOISE_SYMPTOM: SymptomId = "cough";

export type NightResult = { readonly run: RunState; readonly report: readonly string[] };

type Step = NightResult;

const exposed = (crew: CrewState): boolean => crew.alive && !crew.quarantined;

const tickInfection = (crew: CrewState): CrewState => {
  if (!crew.alive) {
    return crew;
  }
  if (crew.infection === "incubating") {
    const incubationLeft = crew.incubationLeft - 1;
    return incubationLeft <= 0
      ? { ...crew, infection: "sick", incubationLeft: 0, sickDays: 0 }
      : { ...crew, incubationLeft };
  }
  if (crew.infection === "sick") {
    return { ...crew, sickDays: crew.sickDays + 1 };
  }
  return crew;
};

const incubate = (run: RunState, content: Content): Step => {
  const before = run.crew;
  const next = mapCrew(run, tickInfection);
  const fellSick = next.crew.filter(
    (crew, index) => crew.infection === "sick" && before[index]?.infection === "incubating",
  );
  return {
    run: next,
    report: fellSick.map((crew) => `${josa(nameOf(content, crew.id), "이/가")} 앓아눕는다.`),
  };
};

/** Each sick exposed crew member rolls once against every healthy exposed crew member. */
const spread = (run: RunState, rng: Rng): Step => {
  const carriers = run.crew.filter((crew) => exposed(crew) && crew.infection === "sick");
  const infected = carriers.reduce<RunState>(
    (state, _carrier) =>
      mapCrew(state, (crew) =>
        exposed(crew) && crew.infection === "healthy" && rng() < SPREAD_CHANCE
          ? { ...crew, infection: "incubating", incubationLeft: INCUBATION_NIGHTS }
          : crew,
      ),
    run,
  );
  return { run: infected, report: [] };
};

const bury = (run: RunState, content: Content): Step => {
  const dying = run.crew.filter(
    (crew) => crew.alive && crew.infection === "sick" && crew.sickDays >= DEATH_SICK_DAYS,
  );
  const dead = new Set(dying.map((crew) => crew.id));
  return {
    run: mapCrew(run, (crew) =>
      dead.has(crew.id) ? { ...crew, alive: false, symptoms: [] } : crew,
    ),
    report: dying.map((crew) => `${josa(nameOf(content, crew.id), "이/가")} 숨을 거둔다.`),
  };
};

const stressNight = (run: RunState): Step => ({
  run: mapCrew(run, (crew) =>
    crew.alive
      ? {
          ...crew,
          stress: clampStress(
            crew.stress + NIGHT_STRESS + (crew.quarantined ? QUARANTINE_STRESS : 0),
          ),
        }
      : crew,
  ),
  report: [],
});

const trustNight = (run: RunState, deaths: number): Step => {
  const healthyQuarantined = run.crew.filter(
    (crew) => crew.alive && crew.quarantined && crew.infection === "healthy",
  ).length;
  const delta = healthyQuarantined * TRUST_PER_HEALTHY_QUARANTINE + deaths * TRUST_PER_DEATH;
  return {
    run: { ...run, trust: Math.max(0, run.trust + delta) },
    report: delta === 0 ? [] : [`신뢰 ${delta}`],
  };
};

const pickOne = <T>(items: readonly T[], rng: Rng): T => pickWeighted(items, () => 1, rng);

const viralSymptoms = (rng: Rng): readonly SymptomId[] => {
  const first = pickOne(VIRAL_SYMPTOMS, rng);
  if (rng() < 0.5) {
    return [first];
  }
  const second = pickOne(
    VIRAL_SYMPTOMS.filter((symptom) => symptom !== first),
    rng,
  );
  return [first, second];
};

const symptomsOf = (crew: CrewState, rng: Rng): readonly SymptomId[] => {
  if (!crew.alive) {
    return [];
  }
  const shown = new Set<SymptomId>([
    ...(crew.infection === "sick" ? viralSymptoms(rng) : []),
    ...(crew.stress >= STRESS_SYMPTOM_THRESHOLD ? [pickOne(STRESS_SYMPTOMS, rng)] : []),
    ...(rng() < COUGH_CHANCE ? [NOISE_SYMPTOM] : []),
  ]);
  return SYMPTOM_IDS.filter((symptom) => shown.has(symptom));
};

const recomputeSymptoms = (run: RunState, rng: Rng): Step => ({
  run: mapCrew(run, (crew) => ({ ...crew, symptoms: symptomsOf(crew, rng) })),
  report: [],
});

/** The most stressed exposed crew member at or above the threshold, ties by id. */
const agitator = (run: RunState): CrewState | undefined =>
  run.crew
    .filter((crew) => exposed(crew) && crew.stress >= CONFRONTATION_STRESS)
    .sort((a, b) => b.stress - a.stress || (a.id < b.id ? -1 : 1))[0];

const confront = (run: RunState, content: Content, rng: Rng): Step => {
  const crew = agitator(run);
  if (crew === undefined) {
    return { run, report: [] };
  }
  const event = pickOne(content.confrontations, rng);
  const name = nameOf(content, crew.id);
  const { roll, success } = resolveCheck(run.captain.authority, event.dc, rng);
  const header = `${josa(name, "이/가")} 막아선다: ${event.title} (권위 판정 d20 ${roll})`;
  if (success) {
    const applied = applyEffects(
      withCrew(run, { ...crew, stress: CONFRONTATION_RELIEF }),
      event.success.effects,
      content,
    );
    return { run: applied.run, report: [header, event.success.text, ...applied.log] };
  }
  const applied = applyEffects(
    run,
    [
      ...(event.failure.effects ?? [{ kind: "hp", delta: DEFAULT_FAILURE_HP }]),
      { kind: "trust", delta: CONFRONTATION_TRUST_PENALTY },
    ],
    content,
  );
  return { run: applied.run, report: [header, event.failure.text, ...applied.log] };
};

const chain = (first: Step, next: (run: RunState) => Step): Step => {
  const step = next(first.run);
  return { run: step.run, report: [...first.report, ...step.report] };
};

export const resolveNight = (run: RunState, content: Content, rng: Rng): NightResult => {
  const aliveBefore = run.crew.filter((crew) => crew.alive).length;
  const buried = chain(
    chain(incubate(run, content), (state) => spread(state, rng)),
    (state) => bury(state, content),
  );
  const deaths = aliveBefore - buried.run.crew.filter((crew) => crew.alive).length;
  return [
    stressNight,
    (state: RunState) => trustNight(state, deaths),
    (state: RunState) => recomputeSymptoms(state, rng),
    (state: RunState) => confront(state, content, rng),
  ].reduce(chain, buried);
};
