import { type KeyboardEvent, type ReactNode, useId } from "react";

export type Tab<Id extends string> = { readonly id: Id; readonly label: string };

type TabsProps<Id extends string> = {
  /** Accessible name of the tab list. */
  readonly label: string;
  readonly tabs: readonly Tab<Id>[];
  readonly value: Id;
  readonly onChange: (id: Id) => void;
  /** Content of the panel for the selected tab. */
  readonly children: ReactNode;
};

/** The tab the arrow, Home, or End key moves to; null for any other key. */
const nextTab = <Id extends string>(
  tabs: readonly Tab<Id>[],
  current: Id,
  key: string,
): Id | null => {
  const index = tabs.findIndex((tab) => tab.id === current);
  const last = tabs.length - 1;
  const target =
    key === "ArrowRight"
      ? (index + 1) % tabs.length
      : key === "ArrowLeft"
        ? (index + last) % tabs.length
        : key === "Home"
          ? 0
          : key === "End"
            ? last
            : -1;
  return tabs[target]?.id ?? null;
};

const TAB =
  "-mb-0.5 flex min-h-11 flex-1 items-center justify-center border-b-2 border-transparent " +
  "text-sm text-ash transition-[border-color,color] duration-120 ease-ink " +
  "aria-selected:border-ember aria-selected:text-parchment";

/** Tab list with roving focus: arrow keys select and focus the neighbour tab. */
export function Tabs<Id extends string>({ label, tabs, value, onChange, children }: TabsProps<Id>) {
  const base = useId();
  const tabId = (id: Id) => `${base}-tab-${id}`;
  const panelId = `${base}-panel`;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = nextTab(tabs, value, event.key);
    if (next === null) {
      return;
    }
    event.preventDefault();
    onChange(next);
    document.getElementById(tabId(next))?.focus();
  };

  return (
    <>
      {/* Sits under the 46px top bar (44px row + 2px border). */}
      <div
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="sticky top-11.5 z-10 flex border-b-2 border-slate bg-ink"
      >
        {tabs.map((tab) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={tabId(tab.id)}
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              className={TAB}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={tabId(value)} className="flex-1">
        {children}
      </div>
    </>
  );
}
