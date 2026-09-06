import { useRef } from "react";
import type { MetaState } from "../../engine/types";
import { ActionRow } from "../components/ActionRow";
import { Button } from "../components/Button";
import { RankingRow } from "../components/RankingRow";
import { TopBar } from "../components/TopBar";
import { useMeta } from "../metaStoreContext";
import { useScreenStore } from "../screenStore";

const UNRANKED_REASON = "불러오기 3회 이상";
const RESET_WARNING = "도감과 랭킹 기록이 모두 지워져요.";

const isEmpty = ({ codex, ranking }: MetaState): boolean =>
  ranking.length + codex.endings.length + codex.monsters.length + codex.items.length === 0;

/** Pixel chevron; flex on <summary> drops the native disclosure marker, so this stands in. */
function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4 transition-transform duration-120 ease-ink group-open:rotate-180 motion-reduce:transition-none"
      shapeRendering="crispEdges"
    >
      <path d="M2 5h2v2H2zM4 7h2v2H4zM6 9h4v2H6zM10 7h2v2h-2zM12 5h2v2h-2z" fill="currentColor" />
    </svg>
  );
}

export function RankingScreen() {
  const go = useScreenStore((state) => state.go);
  const meta = useMeta((state) => state.meta);
  const reset = useMeta((state) => state.reset);
  const dialog = useRef<HTMLDialogElement>(null);
  const ranked = meta.ranking.filter((entry) => entry.ranked);
  const unranked = meta.ranking.filter((entry) => !entry.ranked);
  const nothingToReset = isEmpty(meta);
  const emptyRankingMessage =
    unranked.length > 0 ? "랭킹에 오른 기록이 없어요." : "아직 기록이 없어요.";

  const confirmReset = () => {
    dialog.current?.close();
    reset();
  };

  return (
    <>
      <TopBar title="랭킹" onBack={() => go("title")} />
      <section className="flex flex-1 flex-col">
        <div className="flex flex-col gap-3 p-3">
          {ranked.length === 0 ? (
            <p className="py-8 text-center text-sm text-ash">{emptyRankingMessage}</p>
          ) : (
            <ol aria-label="랭킹" className="flex flex-col gap-2">
              {ranked.map((entry, index) => (
                <RankingRow key={entry.id} entry={entry} rank={index + 1} />
              ))}
            </ol>
          )}
          {unranked.length > 0 && (
            <details className="group border-2 border-slate">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-3 text-sm text-ash">
                <span className="flex-1">랭킹 제외 기록 ({unranked.length})</span>
                <Chevron />
              </summary>
              <ul className="flex flex-col gap-2 border-slate border-t-2 p-2">
                {unranked.map((entry) => (
                  <RankingRow key={entry.id} entry={entry} reason={UNRANKED_REASON} />
                ))}
              </ul>
            </details>
          )}
        </div>
        <ActionRow>
          <Button block disabled={nothingToReset} onClick={() => dialog.current?.showModal()}>
            기록 초기화
          </Button>
        </ActionRow>
      </section>
      <dialog
        ref={dialog}
        aria-labelledby="reset-warning"
        className="m-auto w-80 max-w-full border-2 border-slate bg-ink-deep p-4 text-parchment backdrop:bg-ink-deep/60"
      >
        <p id="reset-warning" className="text-base leading-prose">
          {RESET_WARNING}
        </p>
        <div className="mt-4 flex gap-2">
          <Button block onClick={() => dialog.current?.close()}>
            취소
          </Button>
          <Button variant="danger" block onClick={confirmReset}>
            초기화
          </Button>
        </div>
      </dialog>
    </>
  );
}
