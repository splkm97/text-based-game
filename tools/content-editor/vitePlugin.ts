// Dev-only Vite plugin exposing POST /__content/api/save, which writes one edited text back into
// its TypeScript content source. Never part of the production bundle (`apply: "serve"`).

import { execFile } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import type { IncomingMessage, ServerResponse } from "node:http";
import { join } from "node:path";
import { promisify } from "node:util";
import type { Plugin } from "vite";
import { contentSourceFiles } from "./files.ts";
import type { SaveIo } from "./save.ts";
import { handleSave } from "./save.ts";

const ROUTE = "/__content/api/save";
const BODY_LIMIT = 64 * 1024;

const run = promisify(execFile);

const fileIo = (root: string): SaveIo => ({
  listFiles: (world) => contentSourceFiles(root, world),
  readFile: (file) => readFile(join(root, file), "utf8"),
  writeFile: (file, source) => writeFile(join(root, file), source, "utf8"),
  format: async (file) => {
    await run("pnpm", ["exec", "biome", "format", "--write", file], { cwd: root });
  },
});

type Body = { readonly ok: true; readonly text: string } | { readonly ok: false };

/** The request body as text, or `ok: false` once it exceeds the limit. */
const readBody = async (req: IncomingMessage): Promise<Body> => {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.from(chunk);
    size += buffer.length;
    if (size > BODY_LIMIT) return { ok: false };
    chunks.push(buffer);
  }
  return { ok: true, text: Buffer.concat(chunks).toString("utf8") };
};

const respond = (res: ServerResponse, status: number, payload: object): void => {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(payload));
};

const isJson = (req: IncomingMessage): boolean =>
  req.headers["content-type"]?.split(";")[0]?.trim() === "application/json";

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const handle = async (req: IncomingMessage, res: ServerResponse, io: SaveIo): Promise<void> => {
  if (req.method !== "POST") return respond(res, 405, { error: "POST only" });
  if (!isJson(req)) return respond(res, 415, { error: "content-type must be application/json" });
  const body = await readBody(req);
  if (!body.ok) return respond(res, 413, { error: `body exceeds ${BODY_LIMIT} bytes` });
  const json = parseJson(body.text);
  if (json === undefined) return respond(res, 400, { error: "body is not valid JSON" });
  const result = await handleSave(json, io);
  respond(res, result.status, result);
};

export const contentEditor = (): Plugin => ({
  name: "content-editor",
  apply: "serve",
  configureServer(server) {
    const io = fileIo(server.config.root);
    server.middlewares.use(ROUTE, (req, res) => {
      handle(req, res, io).catch((error: unknown) => {
        respond(res, 500, { error: error instanceof Error ? error.message : String(error) });
      });
    });
  },
});
