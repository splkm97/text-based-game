import type { Journey } from "../engine/types";
import type { JourneyId } from "./ids";

export const JOURNEYS: Readonly<Record<JourneyId, Journey>> = {
  journey_circus: {
    id: "journey_circus",
    name: "달빛 서커스단",
    description:
      "보름달 밤에만 천막을 여는 떠돌이 서커스단. 단원들은 웃고 있지만, 아무도 가면을 벗지 않는다.",
  },
  journey_lighthouse: {
    id: "journey_lighthouse",
    name: "잊힌 등대",
    description:
      "삼 년 전 불이 꺼진 해안 등대. 마을 사람들은 누가 껐는지보다 왜 껐는지를 묻지 않는다.",
  },
  journey_debt: {
    id: "journey_debt",
    name: "지하 시장의 빚",
    description:
      "지하 시장의 장부에 당신 이름으로 빚이 적혀 있다. 당신은 진 적이 없지만, 장부는 그런 사정을 묻지 않는다.",
  },
};
