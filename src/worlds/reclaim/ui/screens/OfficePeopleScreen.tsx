// 아침 조회의 둘째 화면(사람들) — 장면에서 일어난 자리에 네 사람이 **田자 창문 격자**로 앉는다:
// 왼쪽 위부터 강두식·루·최 반장·배태산(CHARACTER_IDS 순서 = 좌상·우상·좌하·우하). 창문 하나에
// 초상(32×32 픽셀 스프라이트)·이름·그 사람의 잡담·말 걸기가 담겨, 면담을 열기 전에 네 얼굴이
// 한눈에 걸린다(사용자 지시: "면담 전에 페이지를 초상화 4건으로 창문형태로").
//
// 창문은 **격자의 칸(li)이지 버튼이 아니다**: 안에 이름·잡담 문단이 들어가므로 버튼으로 만들면
// 버튼의 내용 모델(phrasing만)이 깨지고, 화면의 버튼 목록을 세는 쪽이 창문을 행동으로 오인한다.
// 창문 프레임은 2px 테두리(테두리 위계 — 프린터와 같은 계층의 대상)만 두르고, 이 화면에서 실제로
// 만질 수 있는 것은 창문 안의 **말 걸기 버튼 하나**(컨트롤 최소 높이 44px)와 책상 위 프린터다.
//
// 오늘 이미 이야기를 나눈 사람의 창문에는 버튼이 서지 않고 그 행동 정본의 거부 문면이 META 줄로
// 남는다 — 하루 한 번이라는 사실이 숫자가 아니라 문면으로 드러난다(설계 §4.1). 어떤 사람에게
// 말을 걸 수 있는지는 전부 규칙의 목록이 정한다: 화면은 가드를 다시 보지 않고
// availableActions·talks만 읽는다.
//
// 루의 잡담만 Prose로 그린다 — 느린 박자와 다른 서체가 이 화면에서도 보여야 한다(말더듬는
// 목소리가 창문 안에서만 평평해지면 그 사람이 사라진다). 나머지 셋은 한 줄 문면 그대로다.
//
// 읽는 순서는 제목 → 사람들 격자 → 프린터 → 현황 → 나머지 행동이다.

import { PixelSprite } from "../../../../shared/art/PixelSprite";
import { Button } from "../../../../shared/ui/Button";
import type { ActionId, CharacterId } from "../../ids";
import { CHARACTER_IDS } from "../../ids";
import { PORTRAITS } from "../../sprites/portraits";
import type { JobCard, RunState } from "../../types";
import { ActionList } from "../components/ActionList";
import { PrinterObject } from "../components/PrinterObject";
import { StatePanel } from "../components/StatePanel";
import { VoicedLine } from "../components/VoicedLine";
import { useContent } from "../contentContext";
import { INNER_GAP, META, SCREEN_PAD, SECTION_GAP } from "../density";
import { useRunStore } from "../runStoreContext";

/** 인물 → 말 걸기 액션. id 카탈로그의 이름이 화면과 만나는 유일한 자리다. */
const TALK_ACTIONS: Readonly<Record<CharacterId, ActionId>> = {
  dusik: "talk_dusik",
  ru: "talk_ru",
  banjang: "talk_banjang",
  taesan: "talk_taesan",
};

/** 화면이 목록 대신 창문으로 그리는 액션 — 사람들 화면이 행동 목록에서 빼낸다. */
const TALK_IDS: readonly ActionId[] = CHARACTER_IDS.map((id) => TALK_ACTIONS[id]);

/** 창문 하나 — 田자 격자의 칸. 만질 수 있는 대상이므로 2px 테두리·반경 0의 프레임을 두른다. */
const WINDOW = `flex flex-col items-center ${INNER_GAP} border-2 border-slate bg-ink-deep p-2 text-center`;

type OfficePeopleScreenProps = {
  readonly run: RunState;
  readonly job: JobCard;
};

export function OfficePeopleScreen({ run, job }: OfficePeopleScreenProps) {
  const content = useContent();
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  const printer = content.actions.office_printer;
  const rest = available.filter((id) => id !== printer.id && !TALK_IDS.includes(id));
  return (
    <section
      aria-label="사무실 사람들"
      className={`flex flex-1 flex-col ${SECTION_GAP} ${SCREEN_PAD}`}
    >
      <h2 className="text-base text-parchment">{job.title}</h2>
      <ul aria-label="사람들" className={`grid grid-cols-2 ${INNER_GAP}`}>
        {CHARACTER_IDS.map((character) => {
          const talk = TALK_ACTIONS[character];
          const talked = run.talks.includes(character);
          const chatter =
            job.office.chatter.find((line) => line.character === character)?.text ?? null;
          return (
            <li key={character} className={WINDOW}>
              <PixelSprite
                sprite={PORTRAITS[character]}
                title={content.characters[character].name}
                scale={3}
              />
              <p className="text-sm leading-prose text-ember">
                {content.characters[character].name}
              </p>
              {chatter !== null && <VoicedLine character={character} text={chatter} />}
              {talked ? (
                <p className={META}>{content.actions[talk].deny}</p>
              ) : (
                available.includes(talk) && (
                  <Button block onClick={() => act(talk)}>
                    {content.actions[talk].label}
                  </Button>
                )
              )}
            </li>
          );
        })}
      </ul>
      {available.includes(printer.id) && (
        <PrinterObject
          text={job.office.printer}
          label={printer.label}
          onPress={() => act(printer.id)}
        />
      )}
      <StatePanel run={run} />
      <ActionList ids={rest} onAct={act} reason={lastReason} />
    </section>
  );
}
