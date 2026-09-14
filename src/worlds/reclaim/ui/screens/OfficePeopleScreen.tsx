// 아침 조회의 둘째 화면(사람들) — 장면에서 일어난 자리에 네 사람이 **田자 창문 격자**로 앉는다:
// 왼쪽 위부터 강두식·루·최 반장·배태산(CHARACTER_IDS 순서 = 좌상·우상·좌하·우하).
//
// 창문은 **명패**다(사용자 선택: B 명패): 위에 이름 띠, 아래에 초상(64px)과 그 사람의 잡담 두 칸,
// 맨 아래에 그 사람에게 말을 거는 버튼. 격자 행이 높이를 맞추고(`h-full`) 버튼이 바닥에 붙어
// (`mt-auto`) 잡담 길이와 무관하게 田자 네 칸이 어긋나지 않는다 — 이전 격자의 들쭉날쭉이 사라진다.
//
// 창문은 **격자의 칸(li) 안의 상자**이지 버튼이 아니다: 안에 이름·잡담이 들어가므로 창문을 버튼으로
// 만들면 내용 모델(phrasing만)이 깨진다. 만질 수 있는 것은 창문 안의 **말 걸기 버튼 하나**(44px)와
// 책상 위 프린터뿐이고, 2px 테두리는 그 대상들의 표식이다(오늘 마친 창문은 테두리가 한 단계
// 가라앉아 "잠긴 것이지 사라진 것이 아니다"를 색으로 말한다).
//
// 오늘 이미 이야기를 나눈 사람의 창문에는 버튼이 서지 않고 그 행동 정본의 거부 문면이 남는다 —
// 하루 한 번이라는 사실이 숫자가 아니라 문면으로 드러난다(설계 §4.1). 어떤 사람에게 말을 걸 수
// 있는지는 전부 규칙의 목록이 정한다: 화면은 가드를 다시 보지 않고 availableActions·talks만 읽는다.
//
// 잡담은 창문마다 시차를 두고 떠오르고(ROLL_CALL_STEP_MS), 루의 줄만 느린 박자·다른 서체다 —
// 아침 조회는 한 사람씩 말한다. 다만 이 자리에서는 글자를 한 단계 줄이고(META 12px) **끊기를 두지
// 않는다**: 네 줄이 나란한 화면에서 한 줄만 끊을 수 있으면 격자가 아니라 그 줄이 특별해진다.
// 끊기는 루와 마주 앉는 자리(면담)에서만 있다. 읽는 순서는 제목 → 사람들 격자 → 프린터 → 현황.

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
import { INNER_GAP, SCREEN_PAD, SECTION_GAP } from "../density";
import { ROLL_CALL_STEP_MS } from "../reveal";
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

/**
 * 창문 하나(명패) — 이름 띠 · 초상·잡담 두 칸 · 바닥의 행동 줄. 높이는 격자 행이 맞춘다.
 */
const WINDOW = `flex h-full flex-col ${INNER_GAP} border-2 bg-ink-deep p-2`;
/** 오늘 이미 이야기를 나눈 창문 — 테두리가 한 단계 가라앉는다. */
const WINDOW_TALKED = `${WINDOW} border-ink`;
/** 아직 말을 걸 수 있는 창문. */
const WINDOW_OPEN = `${WINDOW} border-slate`;
/** 이름 띠 — 명패. 아래 헤어라인 하나로 몸통과 가른다. */
const PLATE = "flex items-baseline border-b border-slate pb-2";
const NAME = "text-sm leading-prose text-ember";
/** 초상(64px)과 그 사람의 말 두 칸. */
const FACE = `grid grid-cols-[auto_1fr] ${INNER_GAP} items-start`;
/** 오늘 마친 창문의 바닥 줄 — 그 행동의 거부 문면 그대로. */
const TALKED_ROW = "mt-auto w-full min-h-11 flex items-center text-xs leading-prose text-ash";

/**
 * 창문의 몸통 — 이름 띠와 초상·잡담 두 칸. 잡담은 창문마다 시차를 두고 떠오른다:
 * 아침 조회는 한 사람씩 말한다(이 화면만의 차례다 — 다른 자리의 대사는 조용히 앉는다).
 */
function WindowFace({
  character,
  chatter,
  order,
}: {
  readonly character: CharacterId;
  readonly chatter: string | null;
  readonly order: number;
}) {
  const content = useContent();
  return (
    <>
      <span className={PLATE}>
        <span className={NAME}>{content.characters[character].name}</span>
      </span>
      <span className={FACE}>
        <PixelSprite
          sprite={PORTRAITS[character]}
          title={content.characters[character].name}
          scale={2}
        />
        {chatter !== null && (
          <VoicedLine
            character={character}
            text={chatter}
            mode="meta"
            cut={false}
            startDelay={order * ROLL_CALL_STEP_MS}
          />
        )}
      </span>
    </>
  );
}

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
        {CHARACTER_IDS.map((character, index) => {
          const talk = TALK_ACTIONS[character];
          const talked = run.talks.includes(character);
          const chatter =
            job.office.chatter.find((line) => line.character === character)?.text ?? null;
          return (
            <li key={character}>
              <div className={talked ? WINDOW_TALKED : WINDOW_OPEN}>
                <WindowFace character={character} chatter={chatter} order={index} />
                {talked ? (
                  <span className={TALKED_ROW}>{content.actions[talk].deny}</span>
                ) : (
                  available.includes(talk) && (
                    <Button block onClick={() => act(talk)}>
                      {content.actions[talk].label}
                    </Button>
                  )
                )}
              </div>
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
