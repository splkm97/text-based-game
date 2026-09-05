import { PixelSprite } from "../../../art/PixelSprite";
import { ORIGIN_PORTRAITS } from "../../../art/sprites/portraits";
import { CONTENT } from "../../../content";
import { ORIGIN_IDS } from "../../../content/ids";
import type { OriginId } from "../../../engine/types";
import { ChoiceCard } from "./ChoiceCard";

type OriginPickerProps = {
  readonly value: OriginId;
  readonly onChange: (origin: OriginId) => void;
};

export function OriginPicker({ value, onChange }: OriginPickerProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">출신</legend>
      {ORIGIN_IDS.map((id) => {
        const origin = CONTENT.origins[id];
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
