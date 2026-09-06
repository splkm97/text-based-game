import { TRAIT_IDS } from "../../../content/ids";
import type { TraitId } from "../../../engine/types";
import { useContent } from "../../contentContext";
import { ChoiceCard } from "./ChoiceCard";

type TraitPickerProps = {
  readonly value: TraitId;
  readonly onChange: (trait: TraitId) => void;
};

export function TraitPicker({ value, onChange }: TraitPickerProps) {
  const content = useContent();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="sr-only">특성</legend>
      {TRAIT_IDS.map((id) => {
        const trait = content.traits[id];
        return (
          <ChoiceCard
            key={id}
            group="trait"
            value={id}
            checked={value === id}
            onSelect={() => onChange(id)}
          >
            <span className="flex-1">
              <span className="block text-base">{trait.name}</span>
              <span className="block text-xs leading-prose text-ash">{trait.description}</span>
            </span>
          </ChoiceCard>
        );
      })}
    </fieldset>
  );
}
