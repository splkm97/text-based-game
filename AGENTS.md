# AGENTS.md

Rules a future agent must keep. Each entry is an obligation and the reason it exists.

## Toolchain

- Run every command under Node 24 (`nvm use`, `.nvmrc`). Vitest 5 rejects Node 25 and `engine-strict` makes `pnpm install` fail on the machine default.
- Treat `pnpm verify && pnpm build` as the completion gate, and require pristine output: no chunk-size warning, no Vitest hints, no Biome fixes. Warnings hide regressions in this repo.
- Keep `test.isolate` set to `true`. The screen, run, and meta stores are module singletons; a shared worker leaks their state between test files.

## Layering

- Keep `src/engine` pure: no React, no zustand, no DOM, no `Date`, no `Math.random`. Content is injected as `ContentRegistry`; randomness comes from the `Rng` parameter. Tests depend on this determinism.
- Let `src/content` import only `src/engine/types.ts` and `src/content/ids.ts`. Content is data; logic in content cannot be tested by the integrity checks.
- Do not re-implement a rule in `src/ui`. Call the engine (`deriveStats`, `choiceAvailable`, `conditionHolds`, `buyPrice`, `sellPrice`, `isActionPhase`, the store's `score`). Two copies of one rule drift.
- Read stores in UI through `src/ui/runStoreContext.ts` and `src/ui/metaStoreContext.ts`, never through a global hook. Tests inject a store built with `createRunStore`/`createMetaStore` over memory storage.

## Content

- Add an item, monster, trait, origin, journey, or ending only by extending the unions in `src/content/ids.ts` first. Every `Readonly<Record<Id, T>>` is total, so the type checker enforces completeness; the integrity test enforces that each id is reachable in play.
- Keep story chains gated by flags `<name>.step<k>` and set the step flag on every resolving path of a `once: true` event, including check failures and flee. A `once` event never returns, so a missing flag dead-ends the chain.
- Give every failure path a cost and every event at least one ungated choice. The tests assert both; the rules keep runs from stalling or becoming free.
- Omit optional keys such as `Monster.drop` instead of writing `undefined`. `exactOptionalPropertyTypes` rejects the explicit value.
- Write user-visible text in Korean and original. Never name any existing game or studio in `src`, `public`, or `index.html`. Use 골드 as the only currency word.

## Persistence

- When `RunState` or `MetaState` changes shape, bump `RUN_KEY`/`META_KEY` in `src/store/persistence.ts` and update `src/store/schemas.ts` to match. There are no migrations by design; an old payload must fail parsing and be discarded, not half-load.
- Keep zod at the localStorage boundary only. Elsewhere trust the types.

## Design

- Use only the PICO-8 tokens declared in `src/styles/theme.css`. The single hex literal allowed in `src/ui` lives in `src/ui/theme.ts` for SVG fills; put no other hex in TSX.
- Keep radius 0, borders 2px, no box-shadow, no gradients, transitions on named properties only at 120ms. This is the committed direction; one exception erodes it.
- Keep every control at least 44×44 px and every text at least 12 px, with a visible focus ring. Reviewers measure these in headless Chrome.
- Keep the service worker in `registerType: "prompt"`. Auto-update reloads the page mid-run.

## Process

- Commit one concern per commit with a Conventional Commits prefix; run `pnpm verify` before each commit.
- Do not commit `.outline/` (agent workspace), `dist/`, or `dev-dist/`.
