import { type Rng, rollD20 } from "./rng";

export type CheckResult = { readonly roll: number; readonly success: boolean };

/** d20 check: natural 20 always succeeds, natural 1 always fails, else `roll + stat >= dc`. */
export const resolveCheck = (stat: number, dc: number, rng: Rng): CheckResult => {
  const roll = rollD20(rng);
  if (roll === 20) {
    return { roll, success: true };
  }
  if (roll === 1) {
    return { roll, success: false };
  }
  return { roll, success: roll + stat >= dc };
};
