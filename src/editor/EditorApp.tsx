// Dev-only content editor page. Owns the draft, the selection (mirrored to `?node=`), and the
// pool filter; the graph and inspector are views over them. `content` overlays the draft on the
// committed registry so the test-play section runs the engine over unsaved edits.

import { useMemo, useState } from "react";
import { Button } from "../shared/ui/Button";
import { CONTENT } from "../worlds/adventurer/content";
import { JOURNEY_IDS, ORIGIN_IDS } from "../worlds/adventurer/content/ids";
import { layoutGraph } from "../worlds/adventurer/editor/graph/layout";
import type { GraphNode } from "../worlds/adventurer/editor/graph/model";
import { buildGraph } from "../worlds/adventurer/editor/graph/model";
import { TestPlay } from "../worlds/adventurer/editor/TestPlay";
import type { Draft } from "../worlds/adventurer/editor/textPath";
import { applyDraft, pathKey, readText } from "../worlds/adventurer/editor/textPath";
import { saveText } from "./api";
import type { PoolFilter } from "./graph/GraphView";
import { GraphView, LAYOUT_OPTIONS } from "./graph/GraphView";
import { Inspector } from "./Inspector";
import type { TextPath } from "./textPathSchema";

const NODE_PARAM = "node";

const readNodeParam = (): string | null =>
  new URLSearchParams(window.location.search).get(NODE_PARAM);

const writeNodeParam = (id: string): void => {
  const url = new URL(window.location.href);
  url.searchParams.set(NODE_PARAM, id);
  window.history.replaceState(null, "", url);
};

const without = (draft: Draft, key: string): Draft =>
  new Map([...draft].filter(([k]) => k !== key));

const ownerOf = (path: TextPath): string =>
  path.kind === "endingTitle" || path.kind === "endingText" ? path.ending : path.event;

const isFilter = (value: string): value is PoolFilter =>
  value === "all" ||
  ORIGIN_IDS.some((id) => id === value) ||
  JOURNEY_IDS.some((id) => id === value);

export function EditorApp() {
  const [draft, setDraft] = useState<Draft>(() => new Map());
  const [selectedId, setSelectedId] = useState<string | null>(readNodeParam);
  const [filter, setFilter] = useState<PoolFilter>("all");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = useMemo(() => applyDraft(CONTENT, draft), [draft]);
  const graph = useMemo(() => buildGraph(content), [content]);
  const layout = useMemo(() => layoutGraph(graph, LAYOUT_OPTIONS), [graph]);
  const dirtyIds = useMemo(
    () => new Set([...draft.values()].map((entry) => ownerOf(entry.path))),
    [draft],
  );
  const selected: GraphNode | null = graph.nodes.find((node) => node.id === selectedId) ?? null;

  const select = (id: string) => {
    setSelectedId(id);
    writeNodeParam(id);
  };

  const change = (path: TextPath, value: string) => {
    const key = pathKey(path);
    setDraft((prev) =>
      value === readText(CONTENT, path)
        ? without(prev, key)
        : new Map([...prev, [key, { path, value }]]),
    );
  };

  const revert = (path: TextPath) => setDraft((prev) => without(prev, pathKey(path)));

  const save = async () => {
    setSaving(true);
    setError(null);
    for (const [key, entry] of draft) {
      const result = await saveText(entry);
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
        <select
          aria-label="풀 필터"
          value={filter}
          onChange={(event) => {
            if (isFilter(event.target.value)) setFilter(event.target.value);
          }}
          className="min-h-11 border-2 border-slate bg-ink-deep px-2 font-pixel text-base text-parchment"
        >
          <option value="all">전체</option>
          {ORIGIN_IDS.map((id) => (
            <option key={id} value={id}>
              {CONTENT.origins[id].name}
            </option>
          ))}
          {JOURNEY_IDS.map((id) => (
            <option key={id} value={id}>
              {CONTENT.journeys[id].name}
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
            committed={CONTENT}
            node={selected}
            draft={draft}
            onChange={change}
            onRevert={revert}
          />
          <section
            aria-label="테스트 플레이"
            className="border-t-2 border-slate p-3 text-sm text-dusk"
          >
            <TestPlay content={content} selected={selected} />
          </section>
        </aside>
      </div>
    </div>
  );
}
