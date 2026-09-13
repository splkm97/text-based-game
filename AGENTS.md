# AGENTS.md

Rules a future agent must keep. Each entry is an obligation and the reason it exists.

## Toolchain

- Run every command under Node 24 (`nvm use`, `.nvmrc`). Vitest 5 rejects Node 25 and `engine-strict` makes `pnpm install` fail on the machine default.
- Treat `pnpm verify && pnpm build` as the completion gate, and require pristine output: no chunk-size warning, no Vitest hints, no Biome fixes. Warnings hide regressions in this repo.
- Keep `tools/` node-side and typed by `tsconfig.node.json`, not by the app config. It runs in the Vite dev server process, so it needs node globals and must stay out of the browser type surface.
- Keep `test.isolate` set to `true`. The screen, run, and meta stores are module singletons; a shared worker leaks their state between test files.

## Layering

- Keep `src/shared` owned by no world. It holds UI primitives, the pixel sprite renderer, `josa`, `rng`, `dice`, `uuid`, and storage slots, and it imports nothing from `src/host`, `src/worlds`, or `src/editor`. Code only one world can use belongs in that world.
- Let `src/host` import each world's `meta.ts` statically and each world's `world.ts` only through a dynamic `import()`. The hub draws every card at startup, so a static `world.ts` import would pull every world's code into the first chunk.
- Let `src/worlds/<id>` import `src/shared` and its own files only. Never another world, never `src/host` except the types in `src/host/world.ts`, never `src/editor` except its own `editor/adapter.ts` importing adapter types. A world must be removable by deleting its folder, its `src/host/registry.ts` entry, and every place `WorldId` is enumerated: the union in `src/host/world.ts`, the `world` enum in `src/editor/textPathSchema.ts`, `EDITABLE_WORLDS` in `tools/content-editor/worlds.ts`, the switch in `tools/content-editor/editable.test.ts`, and the chunk matchers in `vite.config.ts`.
- Register a new world in `src/host/registry.ts` and add its id to `WorldId` in `src/host/world.ts`. The id is a union member, so the type checker finds every place the world must be handled.
- Keep `src/editor` the dev-only editor frame, importing `src/shared`, `src/host/registry`, `src/host/theme`, and adapter types. It is a host-side page, not a world, and it must never become a world's dependency.
- Let `tools/content-editor` plugin code import from `src` only `src/editor/textPathSchema.ts`. Its test files may additionally import world content and a world's `editor/model.ts`, which are pure. The plugin runs in Node, so any other `src` import drags browser code into the dev server.
- Keep a world's rules pure: no React, no zustand, no DOM, no `Date`, no `Math.random`. Content is injected (`ContentRegistry` in `모험가 이야기`, `Content` in `정적의 항로`); randomness comes from the `Rng` parameter. Tests depend on this determinism.
- Let a world's `content/` import only that world's `types.ts` and `ids.ts`. Content is data; logic in content cannot be tested by the integrity checks.
- Do not re-implement a rule in a world's `ui/`. Call that world's rules module. Two copies of one rule drift.
- Read stores in a world's UI through its context modules (`runStoreContext.ts`, plus `metaStoreContext.ts` where the world keeps cross-run records), never through a global hook. Tests inject a store built over memory storage.
- Read the content registry in a world's UI through its `contentContext.ts` (`useContent()`), never through the `CONTENT` singleton. The editor overlays a draft registry on that context; a direct import shows the saved text instead of the edit.
- Keep the editor dev-only: `src/main.tsx` reaches `src/editor` only inside an `import.meta.env.DEV` branch, each world's `loadEditor` guards its adapter import the same way, and `tools/content-editor` runs only as a Vite dev-server plugin. A production build must contain no chunk from any of them; the editor writes to source files and has no place in a shipped bundle.

## Content

- Add an item, monster, trait, origin, journey, crew member, symptom, event, or ending only by extending the unions in that world's ids file first. Every `Readonly<Record<Id, T>>` is total, so the type checker enforces completeness; the world's integrity test enforces that each id is reachable in play.
- Keep story chains in `모험가 이야기` gated by flags `<name>.step<k>` and set the step flag on every resolving path of a `once: true` event, including check failures and flee. A `once` event never returns, so a missing flag dead-ends the chain; the flag-coverage test catches a flag no effect ever sets.
- Give every failure path in the common event pool a cost, and keep at least two reachable choices in every common event. The tests assert both; the rules keep runs from stalling or becoming free.
- Omit optional keys such as `Monster.drop` instead of writing `undefined`. `exactOptionalPropertyTypes` rejects the explicit value.
- Write every `title` and `text` in a world's `content/` as a plain double-quoted string literal, not a template literal, a concatenation, or a computed value. The editor's write-back parses the file, locates that literal, and replaces it; any other form is not editable.
- Write the `id` of every editable object as a plain double-quoted string literal too, never an imported constant. The write-back finds the object by matching that `id` literal and then walks a property path, so an object whose id is a reference is invisible to the editor.
- Add a world to `EDITABLE_WORLDS` in `tools/content-editor/worlds.ts` once it ships an `editor/model.ts`. The editable-coverage test runs over every entry, so an unlisted world gets no write-back check.
- Write user-visible text in Korean and original. Never name any existing game or studio in `src`, `public`, or `index.html`. Use 골드 as the only currency word in `모험가 이야기`.

## 프로토타입 원장

- `prototype/remains.json`은 프로토타입의 테마·세계관·인물·사건을 기록하는 기준 원장이다. `prototype/stories/example.md`는 현재 1인칭 스토리라인 원고다. `prototype/remains.md`는 현재 권위 자료가 아니므로 참조하거나 새로 만들지 않는다.
- `prototype/game-mechanics.md`는 게임 메커니즘 파라미터의 단일 출처다. 세계 사실은 원장에, 파라미터는 이 문서에만 적고, 원장은 `narrativeRules.gameMechanics.reference`로 이 문서를 가리킨다. 같은 값을 두 곳에 적으면 이터레이션마다 드리프트한다.
- `prototype/remains.json`에 항목을 추가·삭제·수정할 때는 `remains-ledger-maintenance` 스킬을 사용한다.
- 원장 항목의 의미, 정보 공개 범위, 기존 관계, 참조 무결성을 보존한다.
- 인물의 공개 정보와 비밀 정보는 별도 필드로 기록한다. 비밀 정보를 게임 시작 시 공개된 것처럼 기록하지 않는다.
- 원장에 기록한 경로는 저장소에 실제로 존재해야 한다.
- 원장을 변경한 후 Node 24에서 JSON이 유효해야 하며, 변경 필드와 참조가 일관되어야 한다.

## Persistence

- Give each world its own save keys, `lia.<worldId>.run.v1` and, where the world keeps cross-run records, `lia.<worldId>.meta.v1`. Worlds share one `localStorage`, so an unprefixed key would let one world read another's payload.
- When a world's `RunState` or `MetaState` changes shape, bump that key in the world's `store/persistence.ts` and update its `store/schemas.ts` to match. There are no migrations by design; an old payload must fail parsing and be discarded, not half-load.
- Keep zod at two boundaries only: the storage slots in each world's `store/` and the editor's HTTP save endpoint (`tools/content-editor`). Both take input the type checker cannot vouch for. Elsewhere trust the types.

## Design

- Give every world a `WorldTheme` in its `theme.ts`: a 16-entry hex palette indexed by sprite digits `0`-`f`, plus the twelve role tokens `ink`, `ink-deep`, `slate`, `ash`, `parchment`, `ember`, `blood`, `moss`, `sky`, `gold`, `sand`, `dusk`. The host writes the tokens as CSS variables on a wrapper, so a world re-themes everything inside it without touching a component.
- Reference role tokens only in TSX and CSS (`bg-ink`, `var(--color-ember)`). A hex literal belongs in a world's `theme.ts`, in the shared palette constants (`src/shared/art/pico8.ts`), or in `src/styles/theme.css`, which holds the hub's default token values because the hub renders outside `themeStyle`, and nowhere else. PICO-8 is the palette `모험가 이야기` picked, not a house rule; `정적의 항로` declares its own.
- Keep sprites square and sized by their own `size` field: 32×32 for monsters, portraits, and world covers, 16×16 for icons. `PixelSprite` reads the palette from `PaletteContext`, so a sprite must index its world's palette, not a hard-coded one.
- Keep radius 0, borders 2px, no box-shadow, no gradients, transitions on named properties only at 120ms. This is the committed direction; one exception erodes it.
- Keep every control at least 44×44 px and every text at least 12 px, with a visible focus ring. Reviewers measure these in headless Chrome.
- Keep the service worker in `registerType: "prompt"`. Auto-update reloads the page mid-run.

## Process

- Commit one concern per commit with a Conventional Commits prefix; run `pnpm verify` before each commit.
- Do not commit `.outline/` (agent workspace), `.claude/`, `dist/`, or `dev-dist/`.
