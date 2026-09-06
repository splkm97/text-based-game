// Replaces one string literal span with the JSON encoding of `value`. JSON.stringify yields a
// valid double-quoted TypeScript literal, matching Biome's quote style.

export const replaceLiteral = (source: string, start: number, end: number, value: string): string =>
  source.slice(0, start) + JSON.stringify(value) + source.slice(end);
