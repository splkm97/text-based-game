// Reads and overlays one editable text inside the content registry. The editor keeps unsaved
// edits as a draft keyed by path and overlays them on the registry for preview; the wire schema
// lives in `textPathSchema.ts` so the dev server can share it.

import type { LeafKey, TextPath } from "../../../editor/textPathSchema";
import type { Choice, ContentRegistry, Ending, GameEvent, Outcome } from "../engine/types";

export type DraftEntry = { readonly path: TextPath; readonly value: string };
export type Draft = ReadonlyMap<string, DraftEntry>;

/** Stable key for a path, e.g. `leafText:origin_monk_1:2:failure`. */
export const pathKey = (path: TextPath): string => {
  switch (path.kind) {
    case "eventTitle":
    case "eventText":
      return `${path.kind}:${path.event}`;
    case "choiceText":
      return `${path.kind}:${path.event}:${path.choice}`;
    case "leafText":
      return `${path.kind}:${path.event}:${path.choice}:${path.leaf}`;
    case "endingTitle":
    case "endingText":
      return `${path.kind}:${path.ending}`;
  }
};

/** The leaf text of an outcome under `leaf`, or undefined when that kind has no such leaf. */
const leafOf = (outcome: Outcome, leaf: LeafKey): string | undefined => {
  switch (outcome.kind) {
    case "direct":
      return leaf === "result" ? outcome.result.text : undefined;
    case "check":
      if (leaf === "success") return outcome.success.text;
      return leaf === "failure" ? outcome.failure.text : undefined;
    case "combat":
      if (leaf === "win") return outcome.win.text;
      return leaf === "flee" ? outcome.flee.text : undefined;
    case "shop":
      return leaf === "leave" ? outcome.leave.text : undefined;
  }
};

const withLeaf = (outcome: Outcome, leaf: LeafKey, text: string): Outcome | undefined => {
  switch (outcome.kind) {
    case "direct":
      return leaf === "result" ? { ...outcome, result: { ...outcome.result, text } } : undefined;
    case "check":
      if (leaf === "success") return { ...outcome, success: { ...outcome.success, text } };
      return leaf === "failure" ? { ...outcome, failure: { ...outcome.failure, text } } : undefined;
    case "combat":
      if (leaf === "win") return { ...outcome, win: { ...outcome.win, text } };
      return leaf === "flee" ? { ...outcome, flee: { ...outcome.flee, text } } : undefined;
    case "shop":
      return leaf === "leave" ? { ...outcome, leave: { ...outcome.leave, text } } : undefined;
  }
};

/** Endings are keyed by the closed `EndingId` union, so a free-form id needs a scan. */
const findEnding = (content: ContentRegistry, id: string): Ending | undefined =>
  Object.values(content.endings).find((ending) => ending.id === id);

/** The current text at `path`, or undefined when the path does not resolve in `content`. */
export const readText = (content: ContentRegistry, path: TextPath): string | undefined => {
  switch (path.kind) {
    case "eventTitle":
      return content.events[path.event]?.title;
    case "eventText":
      return content.events[path.event]?.text;
    case "choiceText":
      return content.events[path.event]?.choices[path.choice]?.text;
    case "leafText": {
      const outcome = content.events[path.event]?.choices[path.choice]?.outcome;
      return outcome === undefined ? undefined : leafOf(outcome, path.leaf);
    }
    case "endingTitle":
      return findEnding(content, path.ending)?.title;
    case "endingText":
      return findEnding(content, path.ending)?.text;
  }
};

const withChoice = (
  event: GameEvent,
  at: number,
  change: (choice: Choice) => Choice | undefined,
): GameEvent | undefined => {
  const choice = event.choices[at];
  const changed = choice === undefined ? undefined : change(choice);
  if (changed === undefined) return undefined;
  return { ...event, choices: event.choices.map((c, i) => (i === at ? changed : c)) };
};

const withEventText = (event: GameEvent, path: TextPath, value: string): GameEvent | undefined => {
  switch (path.kind) {
    case "eventTitle":
      return { ...event, title: value };
    case "eventText":
      return { ...event, text: value };
    case "choiceText":
      return withChoice(event, path.choice, (choice) => ({ ...choice, text: value }));
    case "leafText":
      return withChoice(event, path.choice, (choice) => {
        const outcome = withLeaf(choice.outcome, path.leaf, value);
        return outcome === undefined ? undefined : { ...choice, outcome };
      });
    case "endingTitle":
    case "endingText":
      return undefined;
  }
};

const withEndingText = (ending: Ending, path: TextPath, value: string): Ending | undefined => {
  switch (path.kind) {
    case "endingTitle":
      return { ...ending, title: value };
    case "endingText":
      return { ...ending, text: value };
    default:
      return undefined;
  }
};

const applyOne = (content: ContentRegistry, { path, value }: DraftEntry): ContentRegistry => {
  if (path.kind === "endingTitle" || path.kind === "endingText") {
    const ending = findEnding(content, path.ending);
    const changed = ending === undefined ? undefined : withEndingText(ending, path, value);
    return changed === undefined
      ? content
      : { ...content, endings: { ...content.endings, [changed.id]: changed } };
  }
  const event = content.events[path.event];
  const changed = event === undefined ? undefined : withEventText(event, path, value);
  return changed === undefined
    ? content
    : { ...content, events: { ...content.events, [path.event]: changed } };
};

/** Overlays every draft entry on `content` without mutating it. Entries that do not resolve are skipped. */
export const applyDraft = (content: ContentRegistry, draft: Draft): ContentRegistry =>
  [...draft.values()].reduce(applyOne, content);
