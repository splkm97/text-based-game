import { PixelSprite } from "../../../../../shared/art/PixelSprite";
import { ORIGIN_IDS } from "../../../content/ids";
import type { OriginId } from "../../../engine/types";
import { ORIGIN_PORTRAITS } from "../../../sprites/portraits";
import { useContent } from "../../contentContext";
import { ChoiceCard } from "./ChoiceCard";

type OriginPickerProps = {
  readonly value: OriginId;
  readonly onChange: (origin: OriginId) => void;
};

export function OriginPicker({ value, onChange }: OriginPickerProps) {
  const content = useContent();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">출신</legend>
      {ORIGIN_IDS.map((id) => {
        const origin = content.origins[id];
        return (
          <ChoiceCard
            key={id}
            group="origin"
            value={id}
            checked={value === id}
            onSelect={() => onChange(id)}
          >
            <PixelSprite sprite={ORIGIN_PORTRAITS[id]} title={origin.name} scale={3} />
            <span className="flex-1">
              <span className="block text-base">{origin.name}</span>
              <span className="mt-1 block text-xs leading-prose text-ash">
                {origin.description}
              </span>
              <span className="mt-1 block text-xs text-dusk">시작 골드 {origin.startingGold}</span>
            </span>
          </ChoiceCard>
        );
      })}
    </fieldset>
  );
}
