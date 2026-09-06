// Applies content effects to a run and produces Korean log lines.

import type { Content, Effect, RunState } from "../types";
import { clampStress, findCrew, mapCrew, nameOf, withCrew } from "./crew";

export const CAPTAIN_HP_MAX = 10;
export const TRUST_MAX = 100;

export type EffectsResult = { readonly run: RunState; readonly log: readonly string[] };

const signed = (n: number): string => (n < 0 ? `${n}` : `+${n}`);

const clamp = (value: number, max: number): number => Math.max(0, Math.min(max, value));

const applyStress = (
  run: RunState,
  effect: Extract<Effect, { kind: "stress" }>,
  content: Content,
): EffectsResult => {
  if (effect.target === "all") {
    return {
      run: mapCrew(run, (crew) =>
        crew.alive ? { ...crew, stress: clampStress(crew.stress + effect.delta) } : crew,
      ),
      log: [`전원 스트레스 ${signed(effect.delta)}`],
    };
  }
  const crew = findCrew(run, effect.target);
  if (!crew.alive) {
    return { run, log: [] };
  }
  return {
    run: withCrew(run, { ...crew, stress: clampStress(crew.stress + effect.delta) }),
    log: [`${nameOf(content, crew.id)} 스트레스 ${signed(effect.delta)}`],
  };
};

const applyOne = (run: RunState, effect: Effect, content: Content): EffectsResult => {
  switch (effect.kind) {
    case "trust":
      return {
        run: { ...run, trust: clamp(run.trust + effect.delta, TRUST_MAX) },
        log: [`신뢰 ${signed(effect.delta)}`],
      };
    case "hp":
      return {
        run: {
          ...run,
          captain: { ...run.captain, hp: clamp(run.captain.hp + effect.delta, CAPTAIN_HP_MAX) },
        },
        log: [`선장 체력 ${signed(effect.delta)}`],
      };
    case "authority":
      return {
        run: {
          ...run,
          captain: { ...run.captain, authority: Math.max(0, run.captain.authority + effect.delta) },
        },
        log: [`권위 ${signed(effect.delta)}`],
      };
    case "kits":
      return {
        run: { ...run, kits: Math.max(0, run.kits + effect.delta) },
        log: [`검사 키트 ${signed(effect.delta)}`],
      };
    case "meds":
      return {
        run: { ...run, meds: Math.max(0, run.meds + effect.delta) },
        log: [`약품 ${signed(effect.delta)}`],
      };
    case "ap":
      return {
        run: { ...run, ap: Math.max(0, run.ap + effect.delta) },
        log: [`행동력 ${signed(effect.delta)}`],
      };
    case "stress":
      return applyStress(run, effect, content);
  }
};

export const applyEffects = (
  run: RunState,
  effects: readonly Effect[],
  content: Content,
): EffectsResult =>
  effects.reduce<EffectsResult>(
    (acc, effect) => {
      const step = applyOne(acc.run, effect, content);
      return { run: step.run, log: [...acc.log, ...step.log] };
    },
    { run, log: [] },
  );
