// The eight crew members of the colony ship. Ids and roles are fixed in `ids.ts`.

import type { CrewTemplate } from "../types";

export const CREW: readonly CrewTemplate[] = [
  { id: "first_officer", name: "한서율", role: "부함장" },
  { id: "medic", name: "문지호", role: "의무관" },
  { id: "engineer", name: "백도윤", role: "기관장" },
  { id: "navigator", name: "강나래", role: "항법사" },
  { id: "comms", name: "임세준", role: "통신사" },
  { id: "biologist", name: "오하린", role: "생물학자" },
  { id: "security", name: "차민혁", role: "보안관" },
  { id: "cook", name: "유보라", role: "조리사" },
];
