// Dev-only content editor page. Picks the world from `?world=` (the first registered world by
// default) and loads its editor adapter; the frame then owns the draft, the selection (mirrored
// to `?node=`), and the group filter, with the graph and inspector as views over them.
// `registry` overlays the draft on the committed registry so test play runs over unsaved edits.

import { useEffect, useMemo, useState } from "react";
import { WORLDS } from "../host/registry";
import { themeStyle } from "../host/theme";
import type { WorldMeta } from "../host/world";
import { PaletteContext } from "../shared/art/paletteContext";
import { Button } from "../shared/ui/Button";
import type { ContentGraph, EditorAdapter, EditorAdapterHandle, TextPath } from "./adapter";
import { saveText } from "./api";
import { ALL_GROUPS, GraphView, LAYOUT_OPTIONS } from "./graph/GraphView";
import { layoutGraph } from "./graph/layout";
import type { Draft } from "./Inspector";
import { draftKey, Inspector } from "./Inspector";

const NODE_PARAM = "node";
const WORLD_PARAM = "world";

const readParam = (name: string): string | null =>
  new URLSearchParams(window.location.search).get(name);

const writeNodeParam = (id: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set(NODE_PARAM, id);
  window.history.replaceState(null, "", url);
};

const without = (draft: Draft, key: string): Draft =>
  new Map([...draft].filter(([k]) => k !== key));

type GroupOption = { readonly value: string; readonly label: string };

/** The groups of the first lane, labeled by the first node carrying each. */
const groupOptions = (graph: ContentGraph): readonly GroupOption[] => {
  const first = graph.lanes[0]?.id;
  const options = graph.nodes.flatMap((node) =>
    node.lane === first && node.group !== undefined
      ? [{ value: node.group, label: node.label }]
      : [],
  );
  return options.filter((o, i) => options.findIndex((p) => p.value === o.value) === i);
};

type EditorProps<R> = { readonly adapter: EditorAdapter<R>; readonly meta: WorldMeta };

function Editor<R>({ adapter, meta }: EditorProps<R>) {
  const [draft, setDraft] = useState<Draft>(() => new Map());
  const [selectedId, setSelectedId] = useState<string | null>(() => readParam(NODE_PARAM));
  const [filter, setFilter] = useState(ALL_GROUPS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registry = useMemo(
    () =>
      [...draft.values()].reduce(
        (acc, entry) => adapter.applyText(acc, entry.id, entry.path, entry.value),
        adapter.registry,
      ),
    [adapter, draft],
  );
  const graph = useMemo(() => adapter.graph(registry), [adapter, registry]);
  const layout = useMemo(() => layoutGraph(graph, LAYOUT_OPTIONS), [graph]);
  const dirtyIds = useMemo(() => new Set([...draft.values()].map((entry) => entry.id)), [draft]);
  const selected = graph.nodes.find((node) => node.id === selectedId) ?? null;
  const fields = selected === null ? [] : adapter.fields(adapter.registry, selected.id);

  const select = (id: string) => {
    setSelectedId(id);
    writeNodeParam(id);
  };

  const change = (path: TextPath, value: string) => {
    if (selected === null) return;
    const id = selected.id;
    const key = draftKey(id, path);
    setDraft((prev) =>
      value === adapter.readText(adapter.registry, id, path)
        ? without(prev, key)
        : new Map([...prev, [key, { id, path, value }]]),
    );
  };

  const revert = (path: TextPath) => {
    if (selected === null) return;
    setDraft((prev) => without(prev, draftKey(selected.id, path)));
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    for (const [key, entry] of draft) {
      const result = await saveText({ world: adapter.worldId, ...entry });
      if (!result.ok) {
        setError(`저장 실패: ${result.error}`);
        break;
      }
      // The field stays editable while its request is in flight, so drop the entry only when the
      // draft still holds the value that was saved; a newer edit outlives the save.
      setDraft((prev) => (prev.get(key)?.value === entry.value ? without(prev, key) : prev));
    }
    setSaving(false);
  };

  return (
    <div className="flex h-dvh flex-col bg-ink text-parchment">
      <header className="flex min-h-11 flex-wrap items-center gap-3 border-b-2 border-slate px-3 py-2">
        <h1 className="text-2xl">콘텐츠 편집기</h1>
        <span className="text-sm text-ash">{meta.title}</span>
        <select
          aria-label="그룹 필터"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="min-h-11 border-2 border-slate bg-ink-deep px-2 font-pixel text-base text-parchment"
        >
          <option value={ALL_GROUPS}>전체</option>
          {groupOptions(graph).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="ml-auto text-sm text-ash">변경 {draft.size}건</span>
        <Button variant="primary" disabled={draft.size === 0 || saving} onClick={save}>
          저장
        </Button>
        <Button onClick={() => setDraft(new Map())}>모두 되돌리기</Button>
      </header>
      {error !== null && (
        <p role="status" className="border-b-2 border-blood px-3 py-2 text-sm text-blood">
          {error}
        </p>
      )}
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-auto">
          <GraphView
            layout={layout}
            edges={graph.edges}
            selectedId={selectedId}
            dirtyIds={dirtyIds}
            filter={filter}
            onSelect={select}
          />
        </div>
        <aside className="flex w-120 shrink-0 flex-col overflow-y-auto border-l-2 border-slate">
          <Inspector
            node={selected}
            fields={fields}
            original={(path) =>
              selected === null ? undefined : adapter.readText(adapter.registry, selected.id, path)
            }
            draft={draft}
            onChange={change}
            onRevert={revert}
          />
          <section
            aria-label="테스트 플레이"
            style={themeStyle(meta.theme)}
            className="border-t-2 border-slate bg-ink p-3 text-sm text-dusk"
          >
            <PaletteContext value={meta.theme.palette}>
              <adapter.TestPlay registry={registry} selectedId={selectedId} />
            </PaletteContext>
          </section>
        </aside>
      </div>
    </div>
  );
}

type LoadState =
  | { readonly kind: "loading" }
  | { readonly kind: "ready"; readonly handle: EditorAdapterHandle; readonly meta: WorldMeta }
  | { readonly kind: "failed"; readonly error: string };

/** The world named by `?world=`, else the first registered one. */
const worldEntry = () => {
  const id = readParam(WORLD_PARAM);
  const entry = WORLDS.find((world) => world.meta.id === id) ?? WORLDS[0];
  if (entry === undefined) throw new Error("no world is registered");
  return entry;
};

export function EditorApp() {
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    const entry = worldEntry();
    const cancelled = new AbortController();
    entry
      .load()
      .then((module) => module.loadEditor())
      .then(
        (handle) => {
          if (!cancelled.signal.aborted) setState({ kind: "ready", handle, meta: entry.meta });
        },
        (error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          if (!cancelled.signal.aborted) setState({ kind: "failed", error: message });
        },
      );
    return () => cancelled.abort();
  }, []);

  switch (state.kind) {
    case "loading":
      return (
        <p role="status" className="p-3 text-sm text-ash">
          편집기를 불러오는 중…
        </p>
      );
    case "failed":
      return (
        <p role="alert" className="p-3 text-sm text-blood">
          편집기를 불러오지 못했습니다: {state.error}
        </p>
      );
    case "ready":
      return state.handle.open((adapter) => <Editor adapter={adapter} meta={state.meta} />);
  }
}
