import { Button } from "../../../../../shared/ui/Button";
import { Panel } from "../../../../../shared/ui/Panel";
import { StatBar } from "../../../../../shared/ui/StatBar";
import { STRESS_MAX } from "../../../rules/crew";
import type {
  Action,
  CrewState,
  CrewTemplate,
  KnownSymptoms,
  RunState,
  SymptomId,
} from "../../../types";
import { useContent } from "../../contentContext";

type CrewCardProps = {
  readonly run: RunState;
  readonly template: CrewTemplate;
  readonly crew: CrewState;
  readonly onAct: (action: Action) => void;
};

const BADGE = "border-2 px-1 text-xs";

type Status = { readonly label: string; readonly tone: string };

/** What the captain can see of a crew member's state; infection stays hidden. */
const statusOf = (crew: CrewState): Status => {
  if (!crew.alive) {
    return { label: "사망", tone: "border-slate text-dusk" };
  }
  return crew.quarantined
    ? { label: "격리", tone: "border-sky text-sky" }
    : { label: "근무", tone: "border-slate text-ash" };
};

/** Earth's current word on a symptom decides its color: confirmed, retracted, or unmentioned. */
const symptomTone = (known: KnownSymptoms, symptom: SymptomId): string => {
  if (known.confirmed.includes(symptom)) {
    return "border-ember text-ember";
  }
  return known.retracted.includes(symptom) ? "border-slate text-dusk" : "border-slate text-ash";
};

export function CrewCard({ run, template, crew, onAct }: CrewCardProps) {
  const content = useContent();
  const noAp = run.ap <= 0;
  const status = statusOf(crew);
  const act = (kind: Action["kind"]) => onAct({ kind, crew: crew.id });
  return (
    <li className={crew.alive ? "" : "text-dusk"}>
      <Panel>
        <div className="flex items-center gap-2">
          <p className="text-base">{template.name}</p>
          <p className="text-xs text-ash">{template.role}</p>
          <span className={`${BADGE} ml-auto ${status.tone}`}>{status.label}</span>
        </div>
        {crew.alive && (
          <>
            <ul aria-label={`${template.name} 증상`} className="mt-2 flex min-h-5 flex-wrap gap-1">
              {crew.symptoms.map((symptom) => (
                <li key={symptom} className={`${BADGE} ${symptomTone(run.knownSymptoms, symptom)}`}>
                  {content.symptoms[symptom].name}
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <StatBar label="스트레스" value={crew.stress} max={STRESS_MAX} color="gold" />
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1">
              <Button
                disabled={noAp}
                onClick={() => act(crew.quarantined ? "release" : "quarantine")}
              >
                {crew.quarantined ? "해제" : "격리"}
              </Button>
              <Button disabled={noAp || run.kits <= 0} onClick={() => act("test")}>
                검사
              </Button>
              <Button disabled={noAp} onClick={() => act("talk")}>
                대화
              </Button>
              <Button disabled={noAp || run.meds <= 0} onClick={() => act("treat")}>
                치료
              </Button>
            </div>
          </>
        )}
      </Panel>
    </li>
  );
}
