// The four employees of 복구 기록. Names and voice rules are fixed in `prototype/remains.json`;
// cards show only what the boss publicly knows at game start.

import type { CharacterId } from "../ids";
import type { CharacterCard } from "../types";

export const CHARACTERS: Readonly<Record<CharacterId, CharacterCard>> = {
  dusik: {
    id: "dusik",
    name: "강두식",
    role: "현장 복구를 맡는 회사 직원. 협회 명부에는 퇴역 히어로(자격만료)로 등재돼 있다.",
    voice:
      "정의감은 있으나 만성적으로 피로해, 옳고 그름을 말할 때도 단정하지 않고 한숨처럼 흘리며 자기 희생을 선언하지 않는다.",
    card: "협회 배상금 때문에 급여의 절반이 매달 압류되는 직원이다. 그런 처지에도 현장에서는 사람 구조를 먼저 외치니, 배차표 맨 위에 올리는 이름이 따로 없다.",
  },
  ru: {
    id: "ru",
    name: "루",
    role: "회사 인물. 배차 현장의 도면과 좌표 해석을 맡는다.",
    voice: "말을 더듬는다 — 문장이 중간에 끊기고 같은 음절이 반복되며, 다급할수록 심해진다.",
    card: "도면을 한 번 받아 들면 전부 외우는 직원이다. 말은 더듬고 사람들과 다른 낯선 분위기를 풍기지만, 그게 뭘 뜻하는지는 아무도 물어 본 적이 없다.",
  },
  banjang: {
    id: "banjang",
    name: "최 반장",
    role: "회사 서류와 현장 사무를 맡는 반장이다.",
    voice:
      "숨기는 것이 많고 말수가 적어, 필요한 최소한만 말하고 자기 속내를 묻는 질문에는 다른 사실로 답을 돌린다.",
    card: "필요한 말만 하고 서류를 넘기는 사람이다. 내가 묻지 않은 것까지는 대답하지 않는다.",
  },
  taesan: {
    id: "taesan",
    name: "배태산",
    role: "출동 파견과 회사 밖 접점을 맡는 회사 인물이다.",
    voice: "유머러스하고 호탕해, 농담으로 핵심을 말하고 감정이 상하는 자리에서도 분위기를 띄운다.",
    card: "지방이든 군 현장이든 아는 사람이 꼭 나오는 마당발이다. 나는 그의 이름을 자꾸 배태식으로 부르고, 그는 그때마다 산이라고 정정한다.",
  },
};
