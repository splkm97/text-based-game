// The single content registry a store injects into the rules.
//
// Every record was assembled in its own file, keyed by the world's id unions, so `Content`
// is total by construction: a missing id is a compile error, not a blank card at runtime.
// Jobs walk office → briefing → party → site (content/jobs.ts); chains are the
// condition-triggered procedures that slot between jobs (content/chains.ts).

import type { Content } from "../types";
import { ACTIONS_TEXT } from "./actions";
import { CHAINS } from "./chains";
import { CHARACTERS } from "./characters";
import { ENDINGS } from "./endings";
import { JOBS } from "./jobs";

export const CONTENT: Content = {
  jobs: JOBS,
  chains: CHAINS,
  actions: ACTIONS_TEXT,
  endings: ENDINGS,
  characters: CHARACTERS,
};
