import { deriveStats } from "../../../engine/character";
import type { EquipSlot, Item, ItemId, RunState } from "../../../engine/types";
import { Button } from "../../components/Button";
import { useContent } from "../../contentContext";
import { useRun } from "../../runStoreContext";
import { ItemRow } from "./ItemRow";
import { Sheet } from "./Sheet";

const SLOT_NAME: Readonly<Record<EquipSlot, string>> = {
  mainHand: "주무기",
  offHand: "보조",
  armor: "방어구",
  relic: "유물",
};

const SLOTS: readonly EquipSlot[] = ["mainHand", "offHand", "armor", "relic"];

type InventorySheetProps = {
  readonly run: RunState;
  readonly open: boolean;
  /** Combat: only consumables, and using one closes the sheet so the round log shows. */
  readonly consumableOnly: boolean;
  readonly onClose: () => void;
};

export function InventorySheet({ run, open, consumableOnly, onClose }: InventorySheetProps) {
  const equip = useRun((state) => state.equip);
  const unequip = useRun((state) => state.unequip);
  const use = useRun((state) => state.use);
  const content = useContent();
  const { character } = run;
  const derived = deriveStats(character, content);
  const rows = character.inventory
    .map((id, index) => ({ id, index, item: content.items[id] }))
    .filter((row) => !consumableOnly || row.item.kind === "consumable");

  const actionFor = (id: ItemId, index: number, item: Item) => {
    if (item.kind === "consumable") {
      return (
        <Button
          aria-label={`${item.name} 사용`}
          onClick={() => {
            use(id);
            if (consumableOnly) {
              onClose();
            }
          }}
        >
          사용
        </Button>
      );
    }
    const wornSlot = SLOTS.find((slot) => character.equipment[slot] === id);
    // With duplicates, the first copy is the worn one.
    if (wornSlot !== undefined && character.inventory.indexOf(id) === index) {
      return (
        <Button aria-label={`${item.name} 해제`} onClick={() => unequip(wornSlot)}>
          해제
        </Button>
      );
    }
    return (
      <Button aria-label={`${item.name} 장착`} onClick={() => equip(id)}>
        장착
      </Button>
    );
  };

  return (
    <Sheet open={open} title={consumableOnly ? "아이템 사용" : "가방"} onClose={onClose}>
      <p className="text-xs text-ash tabular-nums">
        {character.inventory.length}/{derived.inventorySlots} 칸 · 공격 {derived.attack} · 방어{" "}
        {derived.defense}
      </p>
      {!consumableOnly && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 border-2 border-slate p-2 text-sm">
          {SLOTS.map((slot) => {
            const held = character.equipment[slot];
            return (
              <div key={slot} className="contents">
                <dt className="text-ash">{SLOT_NAME[slot]}</dt>
                <dd className={held === null ? "text-dusk" : ""}>
                  {held === null ? "없음" : content.items[held].name}
                </dd>
              </div>
            );
          })}
        </dl>
      )}
      {rows.length === 0 ? (
        <p className="text-sm text-dusk">
          {consumableOnly ? "쓸 수 있는 소모품이 없어요." : "가방이 비었어요."}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map(({ id, index, item }) => (
            <ItemRow key={`${id}-${index}`} item={item}>
              {actionFor(id, index, item)}
            </ItemRow>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
