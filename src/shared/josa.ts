// Korean particle selection for log lines built from content names.

/** Particle pairs written as "after a final consonant/after a vowel". */
export type JosaPair = "이/가" | "을/를";

const PARTICLES: Readonly<Record<JosaPair, readonly [string, string]>> = {
  "이/가": ["이", "가"],
  "을/를": ["을", "를"],
};

const HANGUL_SYLLABLE_FIRST = 0xac00;
const HANGUL_SYLLABLE_LAST = 0xd7a3;
const FINAL_CONSONANT_COUNT = 28;

/** Non-Hangul endings (Latin, digits, empty) take the final-consonant form. */
const endsWithFinalConsonant = (word: string): boolean => {
  const code = word.charCodeAt(word.length - 1);
  if (code < HANGUL_SYLLABLE_FIRST || code > HANGUL_SYLLABLE_LAST) {
    return true;
  }
  return (code - HANGUL_SYLLABLE_FIRST) % FINAL_CONSONANT_COUNT !== 0;
};

/** The word with the particle that matches its last syllable: "멧돼지가", "거인이". */
export const josa = (word: string, pair: JosaPair): string => {
  const [afterConsonant, afterVowel] = PARTICLES[pair];
  return `${word}${endsWithFinalConsonant(word) ? afterConsonant : afterVowel}`;
};
