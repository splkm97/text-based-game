import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import type { SaveRequest } from "../../src/editor/textPathSchema.ts";
import { locateText } from "./locate.ts";
import { replaceLiteral } from "./rewrite.ts";

type Path = SaveRequest["path"];

// Same shape as src/worlds/adventurer/content/events/origins/monk.ts plus an endings record.
// Korean text precedes every located literal so a UTF-8 byte offset base would slice the wrong span.
const FIXTURE = `// 파문당한 수도사 story chain: 금서와 수도원으로 돌아가는 길.
import type { GameEvent } from "../../../engine/types";

const POOL = { kind: "origin", origin: "origin_monk" } as const;
const step = (k: number) => ({ kind: "flag", flag: \`monk.step\${k}\` }) as const;

export const MONK_EVENTS: readonly GameEvent[] = [
  {
    id: "origin_monk_1_abbey_messenger",
    title: "수도원의 전령",
    text: "수도원 문이 닫힌 지 하루 만에 전령이 당신을 따라잡는다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [{ kind: "flag", flag: "monk.start" }],
    choices: [
      {
        text: "책을 더 깊이 품고 묵묵히 걷는다.",
        requires: [],
        outcome: {
          kind: "direct",
          result: {
            text: "전령은 한참 뒤따르다가 말머리를 돌렸다.",
            effects: [{ kind: "sanity", delta: -1 }, step(1)],
          },
        },
      },
      {
        text: "전령을 설득해 시간을 번다.",
        requires: [],
        outcome: {
          kind: "check",
          stat: "cha",
          dc: 12,
          success: {
            text: "전령은 여비까지 조금 남기고 떠났다.",
            effects: [{ kind: "gold", delta: 5 }, step(1)],
          },
          failure: {
            text: "전령은 절차에는 관심이 없었다.",
            effects: [{ kind: "hp", delta: -2 }, step(1)],
          },
        },
      },
    ],
  },
  {
    id: "origin_monk_2_wayside_shrine",
    title: \`길가의 사당\`,
    text: "이끼 낀 사당 앞에서 책이 품속에서 떨린다.",
    pool: POOL,
    weight: 6,
    once: true,
    requires: [step(1)],
    choices: [],
  },
];

export const ENDINGS = {
  death: {
    id: "death",
    title: "죽음",
    text: "당신은 길 위에서 숨을 거두었다.",
    scoreBonus: 0,
    tone: "bad",
  },
};
`;

const EVENT = "origin_monk_1_abbey_messenger";
const FILE = "monk.ts";

const locate = (source: string, id: string, path: Path) => {
  const result = locateText(source, FILE, id, path);
  if (!result.ok) throw new Error(`expected ok, got ${result.reason}`);
  return result;
};

const CASES: readonly (readonly [string, Path, string])[] = [
  [EVENT, ["title"], "수도원의 전령"],
  [EVENT, ["text"], "수도원 문이 닫힌 지 하루 만에 전령이 당신을 따라잡는다."],
  [EVENT, ["choices", 1, "text"], "전령을 설득해 시간을 번다."],
  [EVENT, ["choices", 0, "outcome", "result", "text"], "전령은 한참 뒤따르다가 말머리를 돌렸다."],
  [EVENT, ["choices", 1, "outcome", "failure", "text"], "전령은 절차에는 관심이 없었다."],
  ["death", ["title"], "죽음"],
  ["death", ["text"], "당신은 길 위에서 숨을 거두었다."],
];

test.each(CASES)("locates %s %j as the quoted literal", (id, path, expected) => {
  const { start, end } = locate(FIXTURE, id, path);
  expect(FIXTURE.slice(start, end)).toBe(JSON.stringify(expected));
});

test.each(CASES)("replacing %s %j changes only that literal", (id, path) => {
  const before = locate(FIXTURE, id, path);
  const value = '새 문장 "따옴표" 포함';
  const next = replaceLiteral(FIXTURE, before.start, before.end, value);
  const after = locate(next, id, path);

  expect(next.slice(after.start, after.end)).toBe(JSON.stringify(value));
  expect(next.slice(0, after.start)).toBe(FIXTURE.slice(0, before.start));
  expect(next.slice(after.end)).toBe(FIXTURE.slice(before.end));
});

test("unknown id, missing property, and mismatched step kinds are notFound", () => {
  const targets: readonly (readonly [string, Path])[] = [
    ["no_such_event", ["title"]],
    ["no_such_ending", ["title"]],
    [EVENT, ["choices", 2, "text"]],
    [EVENT, ["choices", 0, "outcome", "success", "text"]],
    [EVENT, ["choices", "0", "text"]],
    [EVENT, ["title", 0]],
    [EVENT, ["title", "length"]],
  ];
  for (const [id, path] of targets) {
    expect(locateText(FIXTURE, FILE, id, path), `${id} ${path.join(".")}`).toEqual({
      ok: false,
      reason: "notFound",
    });
  }
});

test("a template literal or an object at the end of the path is notLiteral", () => {
  const targets: readonly (readonly [string, Path])[] = [
    ["origin_monk_2_wayside_shrine", ["title"]],
    [EVENT, ["choices", 0, "outcome"]],
  ];
  for (const [id, path] of targets) {
    expect(locateText(FIXTURE, FILE, id, path), `${id} ${path.join(".")}`).toEqual({
      ok: false,
      reason: "notLiteral",
    });
  }
});

test("locates real content sources on disk", async () => {
  const monk = await readFile("src/worlds/adventurer/content/events/origins/monk.ts", "utf8");
  const endings = await readFile("src/worlds/adventurer/content/endings.ts", "utf8");

  const title = locate(monk, EVENT, ["title"]);
  expect(monk.slice(title.start, title.end)).toBe(JSON.stringify("수도원의 전령"));

  const death = locate(endings, "death", ["title"]);
  expect(endings.slice(death.start, death.end)).toBe(JSON.stringify("죽음"));

  const fallback = await readFile(
    "src/worlds/adventurer/content/events/common/fallback.ts",
    "utf8",
  );
  const rest = locate(fallback, "fallback_rest", ["title"]);
  expect(fallback.slice(rest.start, rest.end)).toBe(JSON.stringify("조용한 하루"));
});
