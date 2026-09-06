// Edits the selected node's texts into the draft. Each field shows the draft value when one exists
// and the committed value as the original. A field is single-line when its label ends with 제목
// or contains 선택지, otherwise a textarea.

import { useId } from "react";
import { Button } from "../shared/ui/Button";
import type { EditableField, GraphNode, TextPath } from "./adapter";

export type DraftEntry = { readonly id: string; readonly path: TextPath; readonly value: string };
export type Draft = ReadonlyMap<string, DraftEntry>;

/** Stable key for a draft entry, e.g. `origin_monk_1/choices.1.outcome.failure.text`. */
export const draftKey = (id: string, path: TextPath): string => `${id}/${path.join(".")}`;

export type InspectorProps = {
  readonly node: GraphNode | null;
  /** The node's editable texts; empty when the node has none. */
  readonly fields: readonly EditableField[];
  /** The committed text at a path of the selected node, without the draft. */
  readonly original: (path: TextPath) => string | undefined;
  readonly draft: Draft;
  readonly onChange: (path: TextPath, value: string) => void;
  readonly onRevert: (path: TextPath) => void;
};

type FieldEdit = Pick<InspectorProps, "original" | "draft" | "onChange" | "onRevert">;

const CONTROL =
  "w-full min-h-11 border-2 border-slate bg-ink-deep px-3 py-2 font-pixel text-base text-parchment";

const singleLine = (label: string): boolean => label.endsWith("제목") || label.includes("선택지");

type FieldProps = FieldEdit & { readonly nodeId: string; readonly field: EditableField };

function Field({
  nodeId,
  field: { label, path },
  original,
  draft,
  onChange,
  onRevert,
}: FieldProps) {
  const id = useId();
  const committed = original(path) ?? "";
  const entry = draft.get(draftKey(nodeId, path));
  const value = entry?.value ?? committed;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-ash">
        {label}
      </label>
      {singleLine(label) ? (
        <input
          id={id}
          type="text"
          value={value}
          autoComplete="off"
          onChange={(event) => onChange(path, event.target.value)}
          className={CONTROL}
        />
      ) : (
        <textarea
          id={id}
          rows={4}
          value={value}
          onChange={(event) => onChange(path, event.target.value)}
          className={`${CONTROL} leading-prose`}
        />
      )}
      {entry !== undefined && (
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-xs text-dusk">원래: {committed}</p>
          <Button aria-label={`${label} 원래대로`} onClick={() => onRevert(path)}>
            원래대로
          </Button>
        </div>
      )}
    </div>
  );
}

export function Inspector({ node, fields, ...edit }: InspectorProps) {
  if (node === null) {
    return <p className="p-3 text-sm text-dusk">그래프에서 노드를 선택하세요.</p>;
  }
  return (
    <div className="flex flex-col gap-3 p-3">
      <header>
        <h2 className="text-base text-parchment">{node.label}</h2>
        <p className="text-xs text-dusk">{node.id}</p>
      </header>
      {fields.length === 0 ? (
        <p className="text-sm text-ash">편집할 텍스트가 없습니다.</p>
      ) : (
        fields.map((field) => (
          <Field key={field.path.join(".")} nodeId={node.id} field={field} {...edit} />
        ))
      )}
    </div>
  );
}
