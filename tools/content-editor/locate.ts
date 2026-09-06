// Finds the source span of one editable text inside a TypeScript content file. Pure: parses the
// given source text, walks the ESTree AST oxc produces, and returns the literal's span including
// its quotes. oxc `start`/`end` are UTF-16 code-unit offsets, so they index the JS string directly.

import type {
  ArrayExpression,
  Expression,
  ObjectExpression,
  ObjectProperty,
  PropertyKey,
  StringLiteral,
} from "oxc-parser";
import { parseSync, Visitor } from "oxc-parser";
import type { SaveRequest } from "../../src/editor/textPathSchema.ts";

export type LocateResult =
  | { readonly ok: true; readonly start: number; readonly end: number }
  | { readonly ok: false; readonly reason: "notFound" | "notLiteral" | "parseError" };

const isStringLiteral = (node: Expression): node is StringLiteral =>
  node.type === "Literal" && typeof node.value === "string";

const keyName = (key: PropertyKey): string | undefined => {
  if (key.type === "Identifier") return key.name;
  return key.type === "Literal" && typeof key.value === "string" ? key.value : undefined;
};

const property = (object: ObjectExpression, name: string): Expression | undefined =>
  object.properties.find(
    (p): p is ObjectProperty => p.type === "Property" && !p.computed && keyName(p.key) === name,
  )?.value;

const element = (array: ArrayExpression, index: number): Expression | undefined => {
  const node = array.elements[index];
  return node === null || node === undefined || node.type === "SpreadElement" ? undefined : node;
};

const hasId = (object: ObjectExpression, id: string): boolean => {
  const value = property(object, "id");
  return value !== undefined && isStringLiteral(value) && value.value === id;
};

/** One step down: a property name into an object literal, an index into an array literal. */
const step = (node: Expression | undefined, key: string | number): Expression | undefined => {
  if (node === undefined) return undefined;
  if (typeof key === "number") {
    return node.type === "ArrayExpression" ? element(node, key) : undefined;
  }
  return node.type === "ObjectExpression" ? property(node, key) : undefined;
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

/** The string literal reached by walking `path` from the first object literal whose `id` is `id`. */
export const locateText = (
  source: string,
  filename: string,
  id: string,
  path: SaveRequest["path"],
): LocateResult => {
  const objects = objectLiterals(source, filename);
  if (objects === undefined) return { ok: false, reason: "parseError" };
  const owner = objects.find((object) => hasId(object, id));
  const node = path.reduce<Expression | undefined>(step, owner);
  if (node === undefined) return { ok: false, reason: "notFound" };
  if (!isStringLiteral(node)) return { ok: false, reason: "notLiteral" };
  return { ok: true, start: node.start, end: node.end };
};
