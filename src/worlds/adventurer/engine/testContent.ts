// Hand-built `ContentRegistry` for engine and store tests. Uses real ids from the catalog
// but never imports real content data. Unused ids get a minimal placeholder.

import {
  ENDING_IDS,
  FALLBACK_EVENT_ID,
  ITEM_IDS,
  JOURNEY_IDS,
  MONSTER_IDS,
  ORIGIN_IDS,
  TRAIT_IDS,
} from "../content/ids";
import type {
  Character,
  ContentRegistry,
  Ending,
  EndingId,
  GameEvent,
  Item,
  ItemId,
  Journey,
  JourneyId,
  Monster,
  MonsterId,
  Origin,
  OriginId,
  Rng,
  RunState,
  Stats,
  Trait,
  TraitId,
} from "./types";

const fill = <Id extends string, T>(
  ids: readonly Id[],
  placeholder: (id: Id) => T,
  defined: Partial<Readonly<Record<Id, T>>>,
): Readonly<Record<Id, T>> => {
  const entries = ids.map((id) => [id, defined[id] ?? placeholder(id)] as const);
  return Object.fromEntries(entries) as Readonly<Record<Id, T>>;
};

const placeholderItem = (id: ItemId): Item => ({
  id,
  name: id,
  description: "",
  price: 1,
  kind: "consumable",
  effects: [],
});

const placeholderMonster = (id: MonsterId): Monster => ({
  id,
  name: id,
  description: "",
  hp: 1,
  attack: 0,
  defense: 0,
  fleeDc: 0,
  xpReward: 0,
  goldReward: 0,
});

const defaultTrait = (id: TraitId): Trait => ({
  id,
  name: id,
  description: "",
  statBonus: {},
  goldMultiplier: 1,
  attackBonus: 0,
  defenseBonus: 0,
  sanityLossReduction: 0,
  levelUpPoints: () => 3,
});

const placeholderOrigin = (id: OriginId): Origin => ({
  id,
  name: id,
  description: "",
  startingItems: [],
  startingGold: 0,
  startingFlags: [],
});

const placeholderJourney = (id: JourneyId): Journey => ({ id, name: id, description: "" });

const placeholderEnding = (id: EndingId): Ending => ({
  id,
  title: id,
  text: "",
  scoreBonus: 0,
  tone: "neutral",
});

const items = fill<ItemId, Item>(ITEM_IDS, placeholderItem, {
  rusty_sword: {
    id: "rusty_sword",
    name: "녹슨 검",
    description: "",
    price: 20,
    kind: "weapon",
    weaponKind: "physical",
    twoHanded: false,
    attack: 3,
  },
  giant_cleaver: {
    id: "giant_cleaver",
    name: "거인의 식칼",
    description: "",
    price: 60,
    kind: "weapon",
    weaponKind: "physical",
    twoHanded: true,
    attack: 6,
  },
  apprentice_wand: {
    id: "apprentice_wand",
    name: "견습생의 지팡이",
    description: "",
    price: 40,
    kind: "weapon",
    weaponKind: "magic",
    twoHanded: false,
    attack: 2,
  },
  short_bow: {
    id: "short_bow",
    name: "단궁",
    description: "",
    price: 25,
    kind: "weapon",
    weaponKind: "ranged",
    twoHanded: false,
    attack: 3,
  },
  kite_shield: {
    id: "kite_shield",
    name: "연 방패",
    description: "",
    price: 30,
    kind: "shield",
    defense: 2,
  },
  travel_cloak: {
    id: "travel_cloak",
    name: "여행자의 망토",
    description: "",
    price: 15,
    kind: "armor",
    defense: 1,
  },
  lucky_coin: {
    id: "lucky_coin",
    name: "행운의 동전",
    description: "",
    price: 50,
    kind: "relic",
    statBonus: { con: 2 },
  },
  kings_signet: {
    id: "kings_signet",
    name: "왕의 인장 반지",
    description: "",
    price: 80,
    kind: "relic",
    statBonus: { cha: 6 },
  },
  healing_salve: {
    id: "healing_salve",
    name: "치유 연고",
    description: "",
    price: 10,
    kind: "consumable",
    effects: [{ kind: "hp", delta: 5 }],
  },
  strong_wine: {
    id: "strong_wine",
    name: "독한 포도주",
    description: "",
    price: 8,
    kind: "consumable",
    effects: [
      { kind: "sanity", delta: 3 },
      { kind: "hp", delta: -1 },
    ],
  },
});

const monsters = fill<MonsterId, Monster>(MONSTER_IDS, placeholderMonster, {
  wild_boar: {
    id: "wild_boar",
    name: "멧돼지",
    description: "",
    hp: 8,
    attack: 3,
    defense: 10,
    fleeDc: 10,
    xpReward: 5,
    goldReward: 10,
    drop: "healing_salve",
  },
  dragon_of_ash: {
    id: "dragon_of_ash",
    name: "잿빛 용",
    description: "",
    hp: 40,
    attack: 10,
    defense: 18,
    fleeDc: 18,
    xpReward: 30,
    goldReward: 100,
  },
});

const traits = fill<TraitId, Trait>(TRAIT_IDS, defaultTrait, {
  strong_arms: { ...defaultTrait("strong_arms"), statBonus: { str: 2 }, attackBonus: 1 },
  late_bloomer: {
    ...defaultTrait("late_bloomer"),
    levelUpPoints: (levelIndex) => (levelIndex < 4 ? 2 : 5),
  },
  miser: { ...defaultTrait("miser"), goldMultiplier: 1.5, sanityLossReduction: 1 },
});

const origins = fill<OriginId, Origin>(ORIGIN_IDS, placeholderOrigin, {
  origin_mercenary: {
    id: "origin_mercenary",
    name: "떠돌이 용병",
    description: "",
    startingItems: ["rusty_sword"],
    startingGold: 30,
    startingFlags: ["mercenary"],
  },
});

const endings = fill<EndingId, Ending>(ENDING_IDS, placeholderEnding, {
  retire: { ...placeholderEnding("retire"), title: "은퇴", scoreBonus: 50, tone: "good" },
  mercenary_banner: {
    ...placeholderEnding("mercenary_banner"),
    title: "용병의 깃발",
    scoreBonus: 100,
    tone: "good",
  },
});

const common = { kind: "common" } as const;

export const TEST_EVENTS: Readonly<Record<string, GameEvent>> = {
  ev_crossroad: {
    id: "ev_crossroad",
    title: "갈림길",
    text: "길이 갈라진다.",
    pool: common,
    weight: 10,
    once: false,
    requires: [{ kind: "notFlag", flag: "skip_crossroad" }],
    choices: [
      {
        text: "쉰다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "잠시 쉬었다.",
            effects: [
              { kind: "xp", delta: 5 },
              { kind: "hp", delta: -3 },
            ],
          },
        },
      },
      {
        text: "바위를 든다",
        requires: [],
        outcome: {
          kind: "check",
          stat: "str",
          dc: 12,
          success: { text: "바위를 들어 올렸다.", effects: [{ kind: "gold", delta: 10 }] },
          failure: { text: "허리를 삐끗했다.", effects: [{ kind: "hp", delta: -2 }] },
        },
      },
      {
        text: "멧돼지와 싸운다",
        requires: [],
        outcome: {
          kind: "combat",
          monster: "wild_boar",
          win: { text: "멧돼지를 쓰러뜨렸다.", effects: [{ kind: "flag", flag: "boar_slayer" }] },
          flee: { text: "숲으로 달아났다.", effects: [{ kind: "sanity", delta: -2 }] },
        },
      },
      {
        text: "행상인과 거래한다",
        requires: [{ kind: "gold", min: 1 }],
        outcome: {
          kind: "shop",
          stock: ["healing_salve", "kite_shield"],
          leave: { text: "행상인과 헤어졌다.", effects: [] },
        },
      },
      {
        text: "귀족 행세를 한다",
        requires: [{ kind: "stat", stat: "cha", min: 15 }],
        outcome: { kind: "direct", result: { text: "통했다.", effects: [] } },
      },
    ],
  },
  ev_shrine: {
    id: "ev_shrine",
    title: "버려진 사당",
    text: "낡은 사당이 보인다.",
    pool: common,
    weight: 5,
    once: true,
    requires: [],
    choices: [
      {
        text: "기도한다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "무언가 응답했다.",
            effects: [{ kind: "nextEvent", event: "ev_followup" }],
          },
        },
      },
    ],
  },
  ev_followup: {
    id: "ev_followup",
    title: "응답",
    text: "목소리가 들린다.",
    pool: common,
    weight: 0,
    once: false,
    requires: [],
    choices: [
      {
        text: "따른다",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "깃발을 들었다.",
            effects: [{ kind: "end", ending: "mercenary_banner" }],
          },
        },
      },
    ],
  },
  ev_mercenary_camp: {
    id: "ev_mercenary_camp",
    title: "용병 야영지",
    text: "옛 동료들이 있다.",
    pool: { kind: "origin", origin: "origin_mercenary" },
    weight: 100,
    once: false,
    requires: [{ kind: "flag", flag: "mercenary" }],
    choices: [
      {
        text: "합류한다",
        requires: [],
        outcome: { kind: "direct", result: { text: "합류했다.", effects: [] } },
      },
    ],
  },
  ev_circus_tent: {
    id: "ev_circus_tent",
    title: "달빛 천막",
    text: "서커스단이다.",
    pool: { kind: "journey", journey: "journey_circus" },
    weight: 100,
    once: false,
    requires: [],
    choices: [
      {
        text: "들어간다",
        requires: [],
        outcome: { kind: "direct", result: { text: "들어갔다.", effects: [] } },
      },
    ],
  },
  ev_rich_only: {
    id: "ev_rich_only",
    title: "경매장",
    text: "부자만 입장.",
    pool: common,
    weight: 1,
    once: false,
    requires: [{ kind: "gold", min: 1000 }],
    choices: [
      {
        text: "입찰한다",
        requires: [],
        outcome: { kind: "direct", result: { text: "낙찰.", effects: [] } },
      },
    ],
  },
  [FALLBACK_EVENT_ID]: {
    id: FALLBACK_EVENT_ID,
    title: "휴식",
    text: "조용한 하루.",
    pool: common,
    weight: 0,
    once: false,
    requires: [],
    choices: [
      {
        text: "쉰다",
        requires: [],
        outcome: {
          kind: "direct",
          result: { text: "쉬었다.", effects: [{ kind: "hp", delta: 2 }] },
        },
      },
    ],
  },
};

export const TEST_CONTENT: ContentRegistry = {
  items,
  monsters,
  traits,
  origins,
  journeys: fill<JourneyId, Journey>(JOURNEY_IDS, placeholderJourney, {}),
  endings,
  events: TEST_EVENTS,
};

export const withEvents = (events: Readonly<Record<string, GameEvent>>): ContentRegistry => ({
  ...TEST_CONTENT,
  events,
});

/** 8/6/4/4/10/10: 42 points, every stat within 4..10. */
export const TEST_ALLOCATION: Stats = { str: 8, agi: 6, int: 4, cha: 4, con: 10, wis: 10 };

/** Mercenary with `strong_arms` (str 10 after bonus), full hp 30 and sanity 30, one rusty sword. */
export const makeHero = (overrides: Partial<Character> = {}): Character => ({
  name: "테스트",
  origin: "origin_mercenary",
  trait: "strong_arms",
  stats: { ...TEST_ALLOCATION, str: 10 },
  hp: 30,
  sanity: 30,
  xp: 0,
  gold: 30,
  pendingStatPoints: 0,
  levelUps: 0,
  inventory: ["rusty_sword"],
  equipment: { mainHand: null, offHand: null, armor: null, relic: null },
  ...overrides,
});

export const makeRun = (overrides: Partial<RunState> = {}): RunState => ({
  character: makeHero(),
  day: 1,
  kills: 0,
  loadCount: 0,
  hardMode: false,
  journeys: [],
  flags: ["mercenary"],
  seenEvents: [],
  queuedEvent: null,
  pendingEnding: null,
  phase: { kind: "event", event: "ev_crossroad" },
  log: [],
  ...overrides,
});

/** Rng that yields the given d20 results in order, then repeats the last one. */
export const fixedRolls = (...rolls: readonly number[]): Rng => {
  let index = 0;
  return () => {
    const roll = rolls[Math.min(index, rolls.length - 1)] ?? 1;
    index += 1;
    return (roll - 0.5) / 20;
  };
};

export const constantRng =
  (value: number): Rng =>
  () =>
    value;
