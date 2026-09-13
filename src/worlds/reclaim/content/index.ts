// The single content registry a store injects into the rules.
//
// Every record was assembled in its own file, keyed by the world's id unions, so `Content`
// is total by construction: a missing id is a compile error, not a blank card at runtime.

import type { Content } from "../types";
import { ACTIONS_TEXT } from "./actions";
import { CHARACTERS } from "./characters";
import { ENDINGS } from "./endings";
import { EVIDENCE, STAGES } from "./stages";

export const CONTENT: Content = {
  stages: STAGES,
  actions: ACTIONS_TEXT,
  endings: ENDINGS,
  characters: CHARACTERS,
  evidence: EVIDENCE,
};
