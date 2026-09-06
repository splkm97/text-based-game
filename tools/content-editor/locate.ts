// Finds the source span of one editable text inside a TypeScript content file. Pure: parses the
// given source text, walks the ESTree AST oxc produces, and returns the literal's span including
// its quotes. oxc `start`/`end` are UTF-16 code-unit offsets, so they index the JS string directly.

import type {
  ArrayExpressionElement,
  Expression,
  ObjectExpression,
  ObjectProperty,
  PropertyKey,
  StringLiteral,
} from "oxc-parser";
import { parseSync, Visitor } from "oxc-parser";
import type { TextPath } from "../../src/editor/textPathSchema.ts";

export type LocateResult =
  | { readonly ok: true; readonly start: number; readonly end: number }
  | { readonly ok: false; readonly reason: "notFound" | "notLiteral" | "parseError" };

const isStringLiteral = (node: Expression): node is StringLiteral =>
  node.type === "Literal" && typeof node.value === "string";

const isObject = (node: ArrayExpressionElement | undefined): node is ObjectExpression =>
  node?.type === "ObjectExpression";

const keyName = (key: PropertyKey): string | undefined => {
  if (key.type === "Identifier") return key.name;
  return key.type === "Literal" && typeof key.value === "string" ? key.value : undefined;
};

const property = (object: ObjectExpression, name: string): Expression | undefined =>
  object.properties.find(
    (p): p is ObjectProperty => p.type === "Property" && !p.computed && keyName(p.key) === name,
  )?.value;

const hasId = (object: ObjectExpression, id: string): boolean => {
  const value = property(object, "id");
  return value !== undefined && isStringLiteral(value) && value.value === id;
};

const choiceAt = (event: ObjectExpression, index: number): ObjectExpression | undefined => {
  const choices = property(event, "choices");
  const element = choices?.type === "ArrayExpression" ? choices.elements[index] : undefined;
  return isObject(element) ? element : undefined;
};

const leafOf = (choice: ObjectExpression, leaf: string): ObjectExpression | undefined => {
  const outcome = property(choice, "outcome");
  const node = isObject(outcome) ? property(outcome, leaf) : undefined;
  return isObject(node) ? node : undefined;
};

/** All object literals in the program, in source order. */
const objectLiterals = (
  source: string,
  filename: string,
): readonly ObjectExpression[] | undefined => {
  const { program, errors } = parseSync(filename, source, { lang: "ts" });
  if (errors.length > 0) return undefined;
  const found: ObjectExpression[] = [];
  new Visitor({ ObjectExpression: (node) => void found.push(node) }).visit(program);
  return found;
};

const isEvent = (object: ObjectExpression, id: string): boolean =>
  hasId(object, id) && property(object, "choices") !== undefined;

const isEnding = (object: ObjectExpression, id: string): boolean =>
  hasId(object, id) && property(object, "tone") !== undefined;

/** The expression holding the path's text, or undefined when the path does not resolve. */
const resolve = (objects: readonly ObjectExpression[], path: TextPath): Expression | undefined => {
  switch (path.kind) {
    case "eventTitle":
    case "eventText": {
      const event = objects.find((o) => isEvent(o, path.event));
      return event ? property(event, path.kind === "eventTitle" ? "title" : "text") : undefined;
    }
    case "choiceText": {
      const event = objects.find((o) => isEvent(o, path.event));
      const choice = event ? choiceAt(event, path.choice) : undefined;
      return choice ? property(choice, "text") : undefined;
    }
    case "leafText": {
      const event = objects.find((o) => isEvent(o, path.event));
      const choice = event ? choiceAt(event, path.choice) : undefined;
      const leaf = choice ? leafOf(choice, path.leaf) : undefined;
      return leaf ? property(leaf, "text") : undefined;
    }
    case "endingTitle":
    case "endingText": {
      const ending = objects.find((o) => isEnding(o, path.ending));
      return ending ? property(ending, path.kind === "endingTitle" ? "title" : "text") : undefined;
    }
  }
};

export const locateText = (source: string, filename: string, path: TextPath): LocateResult => {
  const objects = objectLiterals(source, filename);
  if (objects === undefined) return { ok: false, reason: "parseError" };
  const node = resolve(objects, path);
  if (node === undefined) return { ok: false, reason: "notFound" };
  if (!isStringLiteral(node)) return { ok: false, reason: "notLiteral" };
  return { ok: true, start: node.start, end: node.end };
};
