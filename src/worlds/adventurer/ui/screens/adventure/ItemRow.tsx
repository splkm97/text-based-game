import type { ReactNode } from "react";
import { PixelSprite } from "../../../../../shared/art/PixelSprite";
import { type Item, STAT_IDS, STAT_NAMES } from "../../../engine/types";
import { ICONS } from "../../../sprites/icons";

const KIND_NAME: Readonly<Record<Item["kind"], string>> = {
  weapon: "무기",
  shield: "방패",
  armor: "방어구",
  relic: "유물",
  consumable: "소모품",
};

/** The one-line stat summary shown under an item's name. */
export const itemMeta = (item: Item): string => {
  switch (item.kind) {
    case "weapon":
      return `공격 ${item.attack} · ${item.twoHanded ? "양손" : "한손"}`;
    case "shield":
    case "armor":
      return `방어 ${item.defense}`;
    case "relic":
      return STAT_IDS.filter((stat) => (item.statBonus[stat] ?? 0) !== 0)
        .map((stat) => `${STAT_NAMES[stat]} +${item.statBonus[stat]}`)
        .join(" · ");
    case "consumable":
      return KIND_NAME.consumable;
  }
};

type ItemRowProps = {
  readonly item: Item;
  /** Replaces the stat summary, e.g. a price. */
  readonly meta?: string;
  readonly children?: ReactNode;
};

/** Category icon, name, one meta line, and the row's action buttons on the right. */
export function ItemRow({ item, meta, children }: ItemRowProps) {
  return (
    <li className="flex min-h-11 items-center gap-2">
      <PixelSprite sprite={ICONS[item.kind]} title={KIND_NAME[item.kind]} scale={2} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm">{item.name}</span>
        <span className="block text-xs text-dusk">{meta ?? itemMeta(item)}</span>
      </span>
      {children}
    </li>
  );
}
