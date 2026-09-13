// 사무실 화면 — 하루의 시작. 1인칭 아침 지문(office.prompt), 협회 발표 뉴스(office.news),
// 인원 잡담(office.chatter), 그리고 책상 위 프린터 오브젝트(office_printer)를 놓는다.
//
// 프린터는 행동 목록의 한 줄이 아니라 장면의 대상이다(PrinterObject) — 그 일감의
// office.printer 문면이 물건의 얼굴이고, 누르면 규칙이 공문을 당겨 전체화면 공문으로 넘긴다.
// 파견 결정(배태산/다른 사람)은 조건이 선 일감에서만 목록에 오르므로, 화면은 규칙이 이미
// 올려 준 목록(availableActions)에서 프린터만 떼어내고 나머지를 그대로 그린다.

import type { JobCard, RunState } from "../../types";
import { ActionList } from "../components/ActionList";
import { PartyRow } from "../components/PartyRow";
import { PrinterObject } from "../components/PrinterObject";
import { StatePanel } from "../components/StatePanel";
import { useContent } from "../contentContext";
import { useRunStore } from "../runStoreContext";

type OfficeScreenProps = {
  readonly run: RunState;
  readonly job: JobCard;
};

export function OfficeScreen({ run, job }: OfficeScreenProps) {
  const content = useContent();
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  const printer = content.actions.office_printer;
  const rest = available.filter((id) => id !== printer.id);
  return (
    <section aria-label="사무실" className="flex flex-1 flex-col gap-3 p-3">
      <h2 className="text-base text-parchment">{job.title}</h2>
      <p className="text-sm leading-prose text-parchment">{job.office.prompt}</p>
      <section aria-label="뉴스" className="border-2 border-slate bg-ink-deep p-2">
        <p className="text-sm leading-prose text-ash">{job.office.news}</p>
      </section>
      {available.includes(printer.id) && (
        <PrinterObject
          text={job.office.printer}
          label={printer.label}
          onPress={() => act(printer.id)}
        />
      )}
      {job.office.chatter.length > 0 && (
        <ul aria-label="잡담" className="flex flex-col gap-2">
          {job.office.chatter.map((line) => (
            <PartyRow key={line.character} character={line.character} text={line.text} />
          ))}
        </ul>
      )}
      <StatePanel run={run} />
      <ActionList ids={rest} onAct={act} reason={lastReason} />
    </section>
  );
}
