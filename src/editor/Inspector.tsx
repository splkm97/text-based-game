// Edits the selected node's texts into the draft. `committed` is the registry without the draft:
// each field shows the draft value when one exists and the committed value as the original.

import { useId } from "react";
import { Button } from "../shared/ui/Button";
import type { GraphNode } from "../worlds/adventurer/editor/graph/model";
import type { Draft } from "../worlds/adventurer/editor/textPath";
import { pathKey, readText } from "../worlds/adventurer/editor/textPath";
import type { ContentRegistry, GameEvent } from "../worlds/adventurer/engine/types";
import type { LeafKey, TextPath } from "./textPathSchema";
import { LEAF_KEYS } from "./textPathSchema";

export type InspectorProps = {
  readonly committed: ContentRegistry;
  readonly node: GraphNode | null;
  readonly draft: Draft;
  readonly onChange: (path: TextPath, value: string) => void;
  readonly onRevert: (path: TextPath) => void;
};

type FieldEdit = Pick<InspectorProps, "committed" | "draft" | "onChange" | "onRevert">;

const LEAF_LABEL: Readonly<Record<LeafKey, string>> = {
  result: "결과",
  success: "성공",
  failure: "실패",
  win: "승리",
  flee: "도주",
  leave: "나가기",
};

const CONTROL =
  "w-full min-h-11 border-2 border-slate bg-ink-deep px-3 py-2 font-pixel text-base text-parchment";

type FieldProps = FieldEdit & {
  readonly label: string;
  readonly path: TextPath;
  readonly multiline?: boolean;
};

function Field({
  label,
  path,
  multiline = false,
  committed,
  draft,
  onChange,
  onRevert,
}: FieldProps) {
  const id = useId();
  const original = readText(committed, path) ?? "";
  const entry = draft.get(pathKey(path));
  const value = entry?.value ?? original;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-ash">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          rows={4}
          value={value}
          onChange={(event) => onChange(path, event.target.value)}
          className={`${CONTROL} leading-prose`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          autoComplete="off"
          onChange={(event) => onChange(path, event.target.value)}
          className={CONTROL}
        />
      )}
      {entry !== undefined && (
        <div className="flex items-start gap-2">
          <p className="min-w-0 flex-1 text-xs text-dusk">원래: {original}</p>
          <Button aria-label={`${label} 원래대로`} onClick={() => onRevert(path)}>
            원래대로
          </Button>
        </div>
      )}
    </div>
  );
}

type ChoiceProps = FieldEdit & { readonly event: string; readonly index: number };

function ChoiceFields({ event, index, ...edit }: ChoiceProps) {
  const leafPath = (leaf: LeafKey): TextPath => ({ kind: "leafText", event, choice: index, leaf });
  return (
    <fieldset className="flex flex-col gap-3 border-2 border-slate p-3">
      <legend className="px-1 text-sm text-ash">선택지 {index + 1}</legend>
      <Field label="텍스트" path={{ kind: "choiceText", event, choice: index }} {...edit} />
      {LEAF_KEYS.filter((leaf) => readText(edit.committed, leafPath(leaf)) !== undefined).map(
        (leaf) => (
          <Field key={leaf} label={LEAF_LABEL[leaf]} path={leafPath(leaf)} multiline {...edit} />
        ),
      )}
    </fieldset>
  );
}

function EventFields({ event, ...edit }: FieldEdit & { readonly event: GameEvent }) {
  return (
    <>
      <Field label="제목" path={{ kind: "eventTitle", event: event.id }} {...edit} />
      <Field label="본문" path={{ kind: "eventText", event: event.id }} multiline {...edit} />
      {event.choices.map((_, index) => (
        <ChoiceFields
          key={pathKey({ kind: "choiceText", event: event.id, choice: index })}
          event={event.id}
          index={index}
          {...edit}
        />
      ))}
    </>
  );
}

function Body({ node, ...edit }: FieldEdit & { readonly node: GraphNode }) {
  switch (node.kind) {
    case "origin":
      return (
        <p className="text-sm leading-prose text-ash">
          {edit.committed.origins[node.id].description}
        </p>
      );
    case "journey":
      return (
        <p className="text-sm leading-prose text-ash">
          {edit.committed.journeys[node.id].description}
        </p>
      );
    case "event": {
      const event = edit.committed.events[node.id];
      return event === undefined ? (
        <p className="text-sm text-blood">사건 {node.id}이(가) 콘텐츠에 없습니다.</p>
      ) : (
        <EventFields event={event} {...edit} />
      );
    }
    case "ending":
      return (
        <>
          <Field label="제목" path={{ kind: "endingTitle", ending: node.id }} {...edit} />
          <Field label="본문" path={{ kind: "endingText", ending: node.id }} multiline {...edit} />
        </>
      );
  }
}

export function Inspector({ node, ...edit }: InspectorProps) {
  if (node === null) {
    return <p className="p-3 text-sm text-dusk">그래프에서 노드를 선택하세요.</p>;
  }
  return (
    <div className="flex flex-col gap-3 p-3">
      <header>
        <h2 className="text-base text-parchment">{node.label}</h2>
        <p className="text-xs text-dusk">{node.id}</p>
      </header>
      <Body node={node} {...edit} />
    </div>
  );
}
