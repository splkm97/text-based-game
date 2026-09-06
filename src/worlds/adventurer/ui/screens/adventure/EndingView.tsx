import { ActionRow } from "../../../../../shared/ui/ActionRow";
import { Button } from "../../../../../shared/ui/Button";
import { Panel } from "../../../../../shared/ui/Panel";
import { WarningGlyph } from "../../../../../shared/ui/WarningGlyph";
import type { Ending, RunPhase, RunState } from "../../../engine/types";
import { useContent } from "../../contentContext";
import { useRun } from "../../runStoreContext";
import { useScreenStore } from "../../screenStore";
import { ErrorLine } from "./ErrorLine";

type EndedPhase = Extract<RunPhase, { kind: "ended" }>;

type EndingViewProps = { readonly run: RunState; readonly phase: EndedPhase };

const TONE: Readonly<Record<Ending["tone"], string>> = {
  good: "text-moss",
  bad: "text-blood",
  neutral: "text-ash",
};

const UNRANKED_REASON = "불러오기 3회 이상이라 랭킹에 오르지 않아요.";

type Row = { readonly label: string; readonly value: number };

export function EndingView({ run, phase }: EndingViewProps) {
  const abandon = useRun((state) => state.abandon);
  const content = useContent();
  const go = useScreenStore((state) => state.go);
  const ending = content.endings[phase.ending];
  const { character } = run;
  // Labels mirror `computeScore`; the total is the engine's own number, never re-derived here.
  const rows: readonly Row[] = [
    { label: "경험치 ×10", value: character.xp },
    { label: "골드", value: character.gold },
    { label: "처치 ×15", value: run.kills },
    { label: "날짜 ×2", value: run.day },
    { label: "결말 보너스", value: ending.scoreBonus },
  ];
  const leave = (screen: "ranking" | "title") => {
    abandon();
    go(screen);
  };
  return (
    <>
      <article className="flex flex-col gap-3 p-3">
        <header className={`border-b-2 border-slate pb-2 ${TONE[ending.tone]}`}>
          <p className="text-xs">결말 · {run.day}일째</p>
          <h2 className="text-2xl">{ending.title}</h2>
        </header>
        <p className="text-base leading-prose">{ending.text}</p>
        <Panel title="점수">
          <dl className="grid grid-cols-[1fr_auto] gap-y-1 text-sm tabular-nums">
            {rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-ash">{row.label}</dt>
                <dd className="text-right">{row.value}</dd>
              </div>
            ))}
            {run.hardMode && (
              <div className="contents">
                <dt className="text-ash">어려움</dt>
                <dd className="text-right">×1.5</dd>
              </div>
            )}
            <div className="contents">
              <dt className="mt-1 border-t-2 border-slate pt-1 text-base text-parchment">합계</dt>
              <dd className="mt-1 border-t-2 border-slate pt-1 text-right text-base text-parchment">
                {phase.score}
              </dd>
            </div>
          </dl>
        </Panel>
        <p className="text-sm">
          {phase.ranked ? (
            <span className="text-moss">랭킹에 올랐어요.</span>
          ) : (
            <span className="text-ash">
              <WarningGlyph />
              {UNRANKED_REASON}
            </span>
          )}
        </p>
      </article>
      <ActionRow>
        <ErrorLine />
        <Button variant="primary" block onClick={() => leave("ranking")}>
          랭킹 보기
        </Button>
        <Button block onClick={() => leave("title")}>
          타이틀로
        </Button>
      </ActionRow>
    </>
  );
}
