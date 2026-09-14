// 면담 화면 — 사람들 화면 위에 덮이는 개인면담. 그 사람이 먼저 꺼내는 말(opening)을 읽고,
// 응답 셋(일을 묻는다 · 사정을 묻는다 · 농담으로 넘긴다) 중 하나를 고른다. 고른 뒤에는 그
// 응답에 대한 그 사람의 답(replies[choice])이 그 자리에 남고, 면담을 마치는 버튼 하나만 선다.
//
// 첫 블록은 그 일감의 제목이고 그 아래에 사람 이름이 온다 — 이 화면도 대사로 시작하지 않는다.
// 응답의 효과(의심− · 신뢰+ · 피로−)는 규칙의 델타이고 화면에는 숫자·미터로 오르지 않는다:
// 플레이어가 읽는 것은 그 사람의 답 문면뿐이다(설계 §4.1). 응답 셋은 대화를 여는 선택이므로
// 둘러보기·프린터 같은 사무실 행동은 면담이 열린 동안 이 화면에 서지 않는다.

import type { ActionId, TalkChoice } from "../../ids";
import { TALK_CHOICE_IDS } from "../../ids";
import type { Interview, JobCard } from "../../types";
import { ActionList } from "../components/ActionList";
import { VoicedLine } from "../components/VoicedLine";
import { useContent } from "../contentContext";
import { INNER_GAP, SCREEN_PAD, SECTION_GAP } from "../density";
import { useRunStore } from "../runStoreContext";

/** 응답 → 그 응답의 액션. 고르는 차례는 id 카탈로그의 순서(일 → 사정 → 농담)를 따른다. */
const REPLY_ACTIONS: Readonly<Record<TalkChoice, ActionId>> = {
  work: "interview_reply_work",
  comfort: "interview_reply_comfort",
  joke: "interview_reply_joke",
};

const REPLY_IDS: readonly ActionId[] = TALK_CHOICE_IDS.map((choice) => REPLY_ACTIONS[choice]);

type InterviewScreenProps = {
  /** 열려 있는 면담 — 화면은 면담 밖에서 서지 않는다(PlayScreen이 고른다). */
  readonly interview: Interview;
  readonly job: JobCard;
};

export function InterviewScreen({ interview, job }: InterviewScreenProps) {
  const content = useContent();
  const available = useRunStore((state) => state.availableActions);
  const lastReason = useRunStore((state) => state.lastReason);
  const act = useRunStore((state) => state.act);
  const card = content.interviews[job.id][interview.character];
  const choice = interview.choice;
  // 응답을 고르기 전에는 응답 셋, 고른 뒤에는 마치는 버튼 하나 — 그 밖의 행동은 면담을
  // 닫기 전까지 열리지 않는다(규칙의 when이 면담 중 사무실 밖으로 나가는 문을 막는다).
  const ids =
    choice === null
      ? REPLY_IDS.filter((id) => available.includes(id))
      : available.filter((id) => id === "interview_close");
  return (
    <section aria-label="면담" className={`flex flex-1 flex-col ${SECTION_GAP} ${SCREEN_PAD}`}>
      <h2 className="text-base text-parchment">{job.title}</h2>
      <p className="text-sm leading-prose text-ember">
        {content.characters[interview.character].name}
      </p>
      <VoicedLine character={interview.character} text={card.opening} mode="prose" />
      <section
        aria-label="응답"
        className={`flex flex-col ${INNER_GAP} border-t border-slate pt-2`}
      >
        {choice !== null && (
          <VoicedLine character={interview.character} text={card.replies[choice]} mode="prose" />
        )}
        <ActionList ids={ids} onAct={act} reason={lastReason} />
      </section>
    </section>
  );
}
