// The craft skills under `.omp/skills/` each carry their own copy of one shared contract block:
// a skill must stay executable on its own, so the contract cannot be a runtime pointer. Copies
// drift silently, and a drifted contract means two skills disagree about canon write limits or the
// RUN_DIR rules while both look correct. This test makes the baseline in
// `.omp/skills/_baseline/common-contract.md` the single source and fails on any divergence.

import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { expect, test } from "vitest";

const SKILLS_DIR = ".omp/skills";
const BASELINE = join(SKILLS_DIR, "_baseline", "common-contract.md");
const CONTRACT_HEADING = "## 공통 계약";
const BULLETS_HEADING = "## 불릿";
const FAMILY_HEADING = "## 계약을 쓰는 스킬";
const EXCEPTIONS_HEADING = "## 선언된 예외";

/** `- ` lines of the section that starts at `heading`, stopping at the next `## ` heading. */
const bulletsOf = (text: string, heading: string): readonly string[] => {
  const start = text.indexOf(`\n${heading}\n`);
  if (start === -1) return [];
  const rest = text.slice(start + heading.length + 2);
  const end = rest.indexOf("\n## ");
  const body = end === -1 ? rest : rest.slice(0, end);
  return body
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2));
};

const slugOf = (bullet: string): string => bullet.replace(/`/g, "").trim();

const skillDirs = async (): Promise<readonly string[]> => {
  const entries = await readdir(SKILLS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => entry.name)
    .sort();
};

const readSkill = async (slug: string): Promise<string> =>
  readFile(join(SKILLS_DIR, slug, "SKILL.md"), "utf8");

type Exception = { readonly index: number; readonly appended: string };

/** Non-empty lines of the ```text fence under `## 선언된 예외`. */
const exceptionLines = (baseline: string): readonly string[] => {
  const start = baseline.indexOf(`\n${EXCEPTIONS_HEADING}\n`);
  if (start === -1) return [];
  const fenced = /```text\n([\s\S]*?)```/.exec(baseline.slice(start));
  return (fenced?.[1] ?? "").split("\n").filter((line) => line.trim().length > 0);
};

/** `divergent-ideator|2|덧붙인 문자열` lines inside the fenced block under `## 선언된 예외`. */
const parseExceptions = (baseline: string): Record<string, Exception> => {
  const parsed: Record<string, Exception> = {};
  for (const line of exceptionLines(baseline)) {
    const [slug, index, appended] = line.split("|");
    if (slug === undefined || index === undefined || appended === undefined) continue;
    parsed[slug.trim()] = { index: Number(index.trim()), appended };
  }
  return parsed;
};

test("every craft skill copies the baseline contract byte for byte", async () => {
  const baseline = await readFile(BASELINE, "utf8");
  const expected = bulletsOf(baseline, BULLETS_HEADING);
  const family = bulletsOf(baseline, FAMILY_HEADING).map(slugOf);
  const exceptions = parseExceptions(baseline);

  expect(expected.length).toBeGreaterThan(0);
  expect(family.length).toBeGreaterThan(0);

  const dirs = await skillDirs();
  for (const slug of family) {
    expect(dirs, `${slug} is listed in the baseline but has no skill directory`).toContain(slug);
    const actual = bulletsOf(await readSkill(slug), CONTRACT_HEADING);
    expect(actual.length, `${slug}: ${CONTRACT_HEADING} bullet count`).toBe(expected.length);
    const exception: Exception | undefined = exceptions[slug];
    expected.forEach((bullet, i) => {
      const line = actual[i] ?? "";
      const declared =
        exception !== undefined &&
        exception.index === i + 1 &&
        line === `${bullet} ${exception.appended}`;
      expect(
        declared || line === bullet,
        `${slug}: bullet ${i + 1} drifted from ${BASELINE}\n  baseline: ${bullet}\n  skill:    ${line}`,
      ).toBe(true);
    });
  }
});

test("a declared exception is actually used, so the list cannot rot", async () => {
  const baseline = await readFile(BASELINE, "utf8");
  const exceptions = parseExceptions(baseline);
  const declaredLines = exceptionLines(baseline).length;
  expect(Object.keys(exceptions).length, "선언된 예외 항목을 파싱하지 못했다").toBe(declaredLines);
  const expected = bulletsOf(baseline, BULLETS_HEADING);
  for (const [slug, exception] of Object.entries(exceptions)) {
    const base = expected[exception.index - 1] ?? "";
    const bullet = bulletsOf(await readSkill(slug), CONTRACT_HEADING)[exception.index - 1] ?? "";
    expect(
      bullet === `${base} ${exception.appended}`,
      `${slug}: 불릿 ${exception.index}가 선언된 예외를 쓰지 않는다`,
    ).toBe(true);
  }
});

test("a skill outside the family does not carry the contract", async () => {
  const baseline = await readFile(BASELINE, "utf8");
  const firstBullet = bulletsOf(baseline, BULLETS_HEADING)[0] ?? "";
  const family = new Set(bulletsOf(baseline, FAMILY_HEADING).map(slugOf));
  expect(firstBullet.length).toBeGreaterThan(0);

  for (const slug of await skillDirs()) {
    if (family.has(slug)) continue;
    const carries = (await readSkill(slug)).includes(firstBullet);
    expect(carries, `${slug} copies the contract but is missing from ${FAMILY_HEADING}`).toBe(
      false,
    );
  }
});
