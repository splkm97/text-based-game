/** Uniform random number in [0, 1). */
export type Rng = () => number;

/**
 * mulberry32: a 32-bit seeded generator. Small, fast, and good enough for
 * game randomness. The closure holds the only mutable word of state; the
 * engine treats the returned function as an opaque `Rng`.
 */
export const createRng = (seed: number): Rng => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Uniform integer in 1..20. */
export const rollD20 = (rng: Rng): number => Math.floor(rng() * 20) + 1;

/**
 * Weighted random pick. Items with weight <= 0 are never chosen.
 * Throws `RangeError` when no item has a positive weight (including empty input).
 */
export const pickWeighted = <T>(
  items: readonly T[],
  weightOf: (item: T) => number,
  rng: Rng,
): T => {
  const weighted = items.map((item) => ({ item, weight: weightOf(item) }));
  const total = weighted.reduce((sum, { weight }) => (weight > 0 ? sum + weight : sum), 0);
  if (total <= 0) {
    throw new RangeError("pickWeighted: no item has a positive weight");
  }
  const target = rng() * total;
  let cumulative = 0;
  for (const { item, weight } of weighted) {
    if (weight <= 0) {
      continue;
    }
    cumulative += weight;
    if (target < cumulative) {
      return item;
    }
  }
  // Reachable only if `rng` breaks its [0, 1) contract.
  throw new RangeError("pickWeighted: rng returned a value outside [0, 1)");
};
