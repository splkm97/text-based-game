// The four endings, all rule-owned: content never fires one directly.

import type { EndingId } from "../ids";
import type { Ending } from "../types";

export const ENDINGS: Readonly<Record<EndingId, Ending>> = {
  captain_dead: {
    id: "captain_dead",
    title: "빈 함교",
    text: "함교 의자가 비어 있다. 항해 일지의 마지막 줄은 당신 글씨가 아니다. 배는 계속 간다. 누가 지휘하는지는 지구가 엿새 뒤에 알게 된다.",
    tone: "bad",
  },
  mutiny: {
    id: "mutiny",
    title: "반란",
    text: "함교 문이 안에서 잠긴다. 밖에서 부르는 목소리는 당신 이름을 계급 없이 부른다. 지구로 가는 다음 통신에는 선장 서명이 없다.",
    tone: "bad",
  },
  outbreak: {
    id: "outbreak",
    title: "정적",
    text: "복도에 발소리가 없다. 격리 구획 문은 열려 있고 그 안도 조용하다. 지구가 마지막으로 받은 것은 자동 위치 신호뿐이다.",
    tone: "bad",
  },
  arrival: {
    id: "arrival",
    title: "도착",
    text: "궤도 진입. 감속이 끝나고 창밖에 갈색 행성이 떠 있다. 생존자 수를 적어 송신한다. 지구는 그 숫자를 엿새 뒤에 읽는다. 당신은 지금 읽는다.",
    tone: "good",
  },
};
