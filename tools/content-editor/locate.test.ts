import { readFile } from "node:fs/promises";
import { expect, test } from "vitest";
import type { TextPath } from "../../src/editor/textPathSchema.ts";
import { locateText } from "./locate.ts";
import { replaceLiteral } from "./rewrite.ts";

// Same shape as src/content/events/origins/monk.ts plus an endings record. Korean text precedes
// every located literal so a UTF-8 byte offset base would slice the wrong span.
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

const locate = (source: string, path: TextPath) => {
  const result = locateText(source, FILE, path);
  if (!result.ok) throw new Error(`expected ok, got ${result.reason}`);
  return result;
};

const CASES: readonly (readonly [TextPath, string])[] = [
  [{ kind: "eventTitle", event: EVENT }, "수도원의 전령"],
  [{ kind: "eventText", event: EVENT }, "수도원 문이 닫힌 지 하루 만에 전령이 당신을 따라잡는다."],
  [{ kind: "choiceText", event: EVENT, choice: 1 }, "전령을 설득해 시간을 번다."],
  [
    { kind: "leafText", event: EVENT, choice: 0, leaf: "result" },
    "전령은 한참 뒤따르다가 말머리를 돌렸다.",
  ],
  [
    { kind: "leafText", event: EVENT, choice: 1, leaf: "failure" },
    "전령은 절차에는 관심이 없었다.",
  ],
  [{ kind: "endingTitle", ending: "death" }, "죽음"],
  [{ kind: "endingText", ending: "death" }, "당신은 길 위에서 숨을 거두었다."],
];

test.each(CASES)("locates %j as the quoted literal", (path, expected) => {
  const { start, end } = locate(FIXTURE, path);
  expect(FIXTURE.slice(start, end)).toBe(JSON.stringify(expected));
});

test.each(CASES)("replacing %j changes only that literal", (path) => {
  const before = locate(FIXTURE, path);
  const value = '새 문장 "따옴표" 포함';
  const next = replaceLiteral(FIXTURE, before.start, before.end, value);
  const after = locate(next, path);

  expect(next.slice(after.start, after.end)).toBe(JSON.stringify(value));
  expect(next.slice(0, after.start)).toBe(FIXTURE.slice(0, before.start));
  expect(next.slice(after.end)).toBe(FIXTURE.slice(before.end));
});

test("unknown event, out-of-range choice, and missing leaf are notFound", () => {
  const paths: readonly TextPath[] = [
    { kind: "eventTitle", event: "no_such_event" },
    { kind: "choiceText", event: EVENT, choice: 2 },
    { kind: "leafText", event: EVENT, choice: 0, leaf: "success" },
    { kind: "endingTitle", ending: "no_such_ending" },
  ];
  for (const path of paths) {
    expect(locateText(FIXTURE, FILE, path)).toEqual({ ok: false, reason: "notFound" });
  }
});

test("a template literal value is notLiteral", () => {
  const path: TextPath = { kind: "eventTitle", event: "origin_monk_2_wayside_shrine" };
  expect(locateText(FIXTURE, FILE, path)).toEqual({ ok: false, reason: "notLiteral" });
});

test("locates real content sources on disk", async () => {
  const monk = await readFile("src/content/events/origins/monk.ts", "utf8");
  const endings = await readFile("src/content/endings.ts", "utf8");

  const title = locate(monk, { kind: "eventTitle", event: EVENT });
  expect(monk.slice(title.start, title.end)).toBe(JSON.stringify("수도원의 전령"));

  const death = locate(endings, { kind: "endingTitle", ending: "death" });
  expect(endings.slice(death.start, death.end)).toBe(JSON.stringify("죽음"));
});
