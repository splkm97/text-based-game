import { STAT_IDS, STAT_NAMES } from "../../../engine/types";
import { useContent } from "../../contentContext";
import { type Draft, finalStats, previewDerived } from "./draft";

type SummaryProps = { readonly draft: Draft };

export function Summary({ draft }: SummaryProps) {
  const content = useContent();
  const derived = previewDerived(draft, content);
  const stats = finalStats(draft, content);
  const bonus = content.traits[draft.trait].statBonus;
  const journeys = draft.journeys.map((id) => content.journeys[id].name).join(", ");
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      <dt className="text-ash">출신</dt>
      <dd>{content.origins[draft.origin].name}</dd>
      <dt className="text-ash">특성</dt>
      <dd>{content.traits[draft.trait].name}</dd>
      <dt className="text-ash">여정</dt>
      <dd>{journeys === "" ? "없음" : journeys}</dd>
      <dt className="text-ash">난이도</dt>
      <dd>{draft.hardMode ? "어려움" : "보통"}</dd>
      <dt className="text-ash">능력치</dt>
      <dd className="flex flex-wrap gap-x-3 tabular-nums">
        {STAT_IDS.map((stat) => (
          <span key={stat}>
            {STAT_NAMES[stat]} {stats[stat]}
            {(bonus[stat] ?? 0) > 0 && <span className="text-moss"> (+{bonus[stat]})</span>}
          </span>
        ))}
      </dd>
      <dt className="text-ash">체력</dt>
      <dd className="tabular-nums">{derived.maxHp}</dd>
      <dt className="text-ash">정신력</dt>
      <dd className="tabular-nums">{derived.maxSanity}</dd>
      <dt className="text-ash">가방 칸</dt>
      <dd className="tabular-nums">{derived.inventorySlots}</dd>
    </dl>
  );
}
