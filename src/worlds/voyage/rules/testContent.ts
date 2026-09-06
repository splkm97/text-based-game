// Minimal content and state builders for rule tests. Not imported by production code.

import type { Content, CrewId, CrewState, Rng, RunState } from "../types";

export const constantRng =
  (value: number): Rng =>
  () =>
    value;

/** Returns the given values in order; throws when a test consumes more than it scripted. */
export const sequenceRng = (values: readonly number[]): Rng => {
  let index = 0;
  return () => {
    const value = values[index];
    if (value === undefined) {
      throw new Error(`sequenceRng exhausted after ${values.length} values`);
    }
    index += 1;
    return value;
  };
};

export const TEST_CONTENT: Content = {
  crew: [
    { id: "first_officer", name: "가온", role: "부함장" },
    { id: "medic", name: "나온", role: "의무관" },
    { id: "engineer", name: "다온", role: "기관장" },
    { id: "navigator", name: "라온", role: "항법사" },
    { id: "comms", name: "마온", role: "통신사" },
    { id: "biologist", name: "바온", role: "생물학자" },
    { id: "security", name: "사온", role: "보안관" },
    { id: "cook", name: "아온", role: "조리사" },
  ],
  symptoms: {
    fever: { id: "fever", name: "발열" },
    cough: { id: "cough", name: "기침" },
    tremor: { id: "tremor", name: "손떨림" },
    insomnia: { id: "insomnia", name: "불면" },
    rash: { id: "rash", name: "발진" },
    nosebleed: { id: "nosebleed", name: "코피" },
  },
  messages: [
    { id: "m_fever", earthDay: 1, title: "발열", text: "발열.", reveals: { confirms: ["fever"] } },
  ],
  events: {
    ev_test: {
      id: "ev_test",
      title: "시험",
      text: "시험 사건.",
      weight: 1,
      once: false,
      requires: [],
      choices: [
        {
          text: "신뢰",
          requires: [],
          outcome: { text: "신뢰.", effects: [{ kind: "trust", delta: 5 }] },
        },
        {
          text: "고신뢰 전용",
          requires: [{ kind: "trust", min: 90 }],
          outcome: { text: "없음.", effects: [] },
        },
      ],
    },
    fallback_quiet_watch: {
      id: "fallback_quiet_watch",
      title: "당직",
      text: "조용하다.",
      weight: 0,
      once: false,
      requires: [],
      choices: [{ text: "대기", requires: [], outcome: { text: "대기.", effects: [] } }],
    },
  },
  confrontations: [
    {
      id: "cf_test",
      title: "대치",
      text: "막아선다.",
      dc: 11,
      success: { text: "물러난다.", effects: [{ kind: "trust", delta: 3 }] },
      failure: { text: "맞는다." },
    },
  ],
  endings: {
    captain_dead: { id: "captain_dead", title: "빈 함교", text: "죽음.", tone: "bad" },
    mutiny: { id: "mutiny", title: "반란", text: "반란.", tone: "bad" },
    outbreak: { id: "outbreak", title: "정적", text: "정적.", tone: "bad" },
    arrival: { id: "arrival", title: "도착", text: "도착.", tone: "good" },
  },
};

export const makeCrew = (id: CrewId, overrides: Partial<CrewState> = {}): CrewState => ({
  id,
  alive: true,
  quarantined: false,
  stress: 0,
  infection: "healthy",
  incubationLeft: 0,
  sickDays: 0,
  symptoms: [],
  ...overrides,
});

const ALL_HEALTHY: readonly CrewState[] = TEST_CONTENT.crew.map((template) =>
  makeCrew(template.id),
);

/** A day-1 act-phase run with a fully healthy crew; `crew` overrides replace members by id. */
export const makeRun = (
  overrides: Partial<Omit<RunState, "crew">> & { readonly crew?: readonly CrewState[] } = {},
): RunState => {
  const { crew = [], ...rest } = overrides;
  return {
    day: 1,
    phase: { kind: "act" },
    captain: { hp: 10, authority: 3 },
    trust: 70,
    kits: 3,
    meds: 4,
    ap: 2,
    crew: ALL_HEALTHY.map((member) => crew.find((c) => c.id === member.id) ?? member),
    inbox: [],
    knownSymptoms: { confirmed: [], retracted: [] },
    seenEvents: [],
    tests: [],
    log: [],
    ...rest,
  };
};
