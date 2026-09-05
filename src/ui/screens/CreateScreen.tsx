import { type FormEvent, use, useState } from "react";
import { CONTENT } from "../../content";
import { JOURNEY_IDS } from "../../content/ids";
import { Button } from "../components/Button";
import { Panel } from "../components/Panel";
import { Toggle } from "../components/Toggle";
import { TopBar } from "../components/TopBar";
import { WarningGlyph } from "../components/WarningGlyph";
import { RunStoreContext, useRun } from "../runStoreContext";
import { useScreenStore } from "../screenStore";
import {
  canStart,
  type Draft,
  FREE_POINTS,
  INITIAL_DRAFT,
  NAME_MAX,
  remainingPoints,
  toggleJourney,
  toRunInput,
} from "./create/draft";
import { OriginPicker } from "./create/OriginPicker";
import { StatAllocation } from "./create/StatAllocation";
import { Summary } from "./create/Summary";
import { TraitPicker } from "./create/TraitPicker";

const HARD_MODE_WARNING = "주의: 적이 더 강해지고 금화는 줄어요. 점수는 1.5배예요.";

export function CreateScreen() {
  const go = useScreenStore((state) => state.go);
  const store = use(RunStoreContext);
  const startRun = useRun((state) => state.startRun);
  const lastError = useRun((state) => state.lastError);
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const patch = (change: Partial<Draft>) => setDraft((current) => ({ ...current, ...change }));
  const remaining = remainingPoints(draft.allocation);
  const ready = canStart(draft);

  const start = (event: FormEvent) => {
    event.preventDefault();
    if (!ready) {
      return;
    }
    startRun(toRunInput(draft));
    if (store.getState().run !== null) {
      go("adventure");
    }
  };

  return (
    <>
      <TopBar title="새 모험" onBack={() => go("title")} />
      <form onSubmit={start} className="flex flex-1 flex-col gap-3 p-3">
        <Panel title="이름">
          <input
            type="text"
            name="name"
            aria-label="이름"
            aria-describedby="name-hint"
            value={draft.name}
            maxLength={NAME_MAX}
            autoComplete="off"
            onChange={(event) => patch({ name: event.target.value })}
            className="w-full min-h-11 border-2 border-slate bg-ink-deep px-3 text-base text-parchment"
          />
          <p id="name-hint" className="mt-1 text-xs text-dusk">
            최대 {NAME_MAX}자
          </p>
        </Panel>
        <Panel title="출신">
          <OriginPicker value={draft.origin} onChange={(origin) => patch({ origin })} />
        </Panel>
        <Panel title="특성">
          <TraitPicker value={draft.trait} onChange={(trait) => patch({ trait })} />
        </Panel>
        <Panel title="여정">
          <p className="mb-1 text-xs text-dusk">켜 두면 그 이야기의 사건이 여정에 섞여요.</p>
          {JOURNEY_IDS.map((id) => (
            <Toggle
              key={id}
              label={CONTENT.journeys[id].name}
              description={CONTENT.journeys[id].description}
              checked={draft.journeys.includes(id)}
              onChange={() => patch({ journeys: toggleJourney(draft.journeys, id) })}
            />
          ))}
        </Panel>
        <Panel title="난이도">
          <Toggle
            label="어려움"
            description={
              <>
                <WarningGlyph />
                {HARD_MODE_WARNING}
              </>
            }
            checked={draft.hardMode}
            onChange={(hardMode) => patch({ hardMode })}
          />
        </Panel>
        <Panel title={`능력치 (${FREE_POINTS}포인트)`}>
          <StatAllocation
            allocation={draft.allocation}
            onChange={(stat, delta) =>
              patch({
                allocation: { ...draft.allocation, [stat]: draft.allocation[stat] + delta },
              })
            }
          />
        </Panel>
        <Panel title="요약">
          <Summary draft={draft} />
        </Panel>
        <div className="safe-bottom sticky bottom-0 -mx-3 -mb-3 mt-auto flex flex-col gap-2 border-t-2 border-slate bg-ink px-3 pt-3">
          <p className="text-xs text-ash" aria-live="polite">
            {lastError !== null
              ? "시작하지 못했어요. 능력치를 다시 확인해 주세요."
              : remaining > 0
                ? `포인트가 ${remaining} 남았어요. 모두 배분하면 시작할 수 있어요.`
                : ready
                  ? "준비가 끝났어요."
                  : "이름을 1자 이상 입력해 주세요."}
          </p>
          <Button type="submit" variant="primary" block disabled={!ready}>
            모험 시작
          </Button>
        </div>
      </form>
    </>
  );
}
