// Display names of the six observable symptoms. Which ones the pathogen causes is a rule, not content.

import type { SymptomId } from "../ids";
import type { Symptom } from "../types";

export const SYMPTOMS: Readonly<Record<SymptomId, Symptom>> = {
  fever: { id: "fever", name: "발열" },
  cough: { id: "cough", name: "기침" },
  tremor: { id: "tremor", name: "손떨림" },
  insomnia: { id: "insomnia", name: "불면" },
  rash: { id: "rash", name: "발진" },
  nosebleed: { id: "nosebleed", name: "코피" },
};
