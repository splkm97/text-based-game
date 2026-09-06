// All twelve endings: three common, two per origin, one per journey.
// Text is second person, past tense, three to five sentences.

import type { Ending } from "../engine/types";
import type { EndingId } from "./ids";

export const ENDINGS: Readonly<Record<EndingId, Ending>> = {
  death: {
    id: "death",
    title: "죽음",
    text: "당신은 길 위에서 숨을 거두었다. 아무도 이름을 묻지 않았고, 아무도 무덤을 파 주지 않았다. 지나가던 까마귀 한 마리만이 잠시 당신을 내려다보았다. 이야기는 여기서 끝났다.",
    scoreBonus: 0,
    tone: "bad",
  },
  madness: {
    id: "madness",
    title: "광기",
    text: "어느 아침, 당신은 길이 어디로 이어지는지 잊어버렸다. 그다음에는 왜 걷고 있었는지를 잊었다. 사람들은 당신이 웃으며 무언가에게 말을 거는 모습을 보았다고 했다. 당신은 그들이 무엇을 보았는지 이해하지 못했다.",
    scoreBonus: 0,
    tone: "bad",
  },
  retire: {
    id: "retire",
    title: "은퇴",
    text: "충분히 많은 것을 보았다고 판단한 날, 당신은 검을 벽에 걸었다. 작은 집을 사고, 닭 몇 마리를 키우고, 밤이면 옛이야기를 조금 부풀려 들려주었다. 무릎은 비 오는 날마다 쑤셨지만, 그것도 나쁘지 않았다.",
    scoreBonus: 50,
    tone: "neutral",
  },
  mercenary_banner: {
    id: "mercenary_banner",
    title: "용병의 깃발",
    text: "당신은 찢어진 깃발을 어깨에 두르고 산채를 내려왔다. 소문은 발보다 빨랐고, 이듬해 봄에는 옛 동료 열둘이 주막 앞에 모여 있었다. 급료는 여전히 적었고 밥은 여전히 형편없었다. 그래도 깃발은 다시 바람을 받았다.",
    scoreBonus: 200,
    tone: "good",
  },
  mercenary_betrayal: {
    id: "mercenary_betrayal",
    title: "용병의 배신",
    text: "당신은 대장의 은화를 받았고, 깃발은 불쏘시개가 되었다. 옛 동료들은 당신의 이름을 들으면 침을 뱉었지만, 침으로는 아무것도 살 수 없었다. 당신은 잘 먹고 잘 잤다. 가끔은 깃발이 꿈에 나왔을 뿐이다.",
    scoreBonus: 80,
    tone: "bad",
  },
  monk_absolution: {
    id: "monk_absolution",
    title: "수도사의 사면",
    text: "책은 재가 되었고, 당신은 무릎에서 일어났다. 대수도원장은 당신을 용서한다고 말하지 않았지만 문을 닫지도 않았다. 당신은 다시 종을 치고 빵을 굽고 필사를 했다. 밤마다 페이지 넘기는 소리가 들리지 않는 것이, 처음에는 조금 허전했다.",
    scoreBonus: 200,
    tone: "good",
  },
  monk_heresy: {
    id: "monk_heresy",
    title: "수도사의 이단",
    text: "당신은 마지막 장을 읽었고, 그 뒤로는 돌아갈 곳이 없었다. 수도원은 당신의 이름을 명부에서 지웠고, 당신은 새 이름을 지었다. 따르는 자들이 생겼고, 그들은 당신이 무슨 말을 하든 고개를 끄덕였다. 책은 이제 당신 대신 페이지를 넘길 필요가 없었다.",
    scoreBonus: 80,
    tone: "bad",
  },
  heir_restored: {
    id: "heir_restored",
    title: "되찾은 가문",
    text: "법정은 인장을 확인했고, 사촌은 그날 밤 조용히 도시를 떠났다. 저택은 돌아왔지만 초상화는 돌아오지 않았고, 당신은 빈 벽을 그냥 두기로 했다. 채권자들은 다시 정중해졌다. 당신은 그들의 정중함이 얼마짜리인지 이제 정확히 알고 있었다.",
    scoreBonus: 200,
    tone: "good",
  },
  heir_exile: {
    id: "heir_exile",
    title: "추방된 후계자",
    text: "법정은 당신의 이름을 인정하지 않았고, 사촌은 관대하게도 국경까지의 여비를 내주었다. 당신은 가문의 문장을 외투에서 뜯어 강에 던졌다. 강 건너 마을에서는 아무도 그 이름을 몰랐다. 그것이 생각보다 편했다.",
    scoreBonus: 80,
    tone: "bad",
  },
  circus_finale: {
    id: "circus_finale",
    title: "서커스의 피날레",
    text: "마지막 공연이 끝나고 달빛 서커스단의 천막은 조용히 접혔다. 단장은 당신에게 낡은 가면 하나를 건네며 다음 보름달에 다시 오라고 말했다. 다음 보름달에 그 자리에는 아무것도 없었다. 그래도 당신은 가면을 버리지 않았다.",
    scoreBonus: 150,
    tone: "good",
  },
  lighthouse_keeper: {
    id: "lighthouse_keeper",
    title: "등대지기",
    text: "당신은 잊힌 등대의 불을 다시 켰고, 그날 밤 처음으로 배 한 척이 암초를 피해 갔다. 아무도 등대지기가 바뀐 것을 알아채지 못했다. 당신은 매일 저녁 계단을 오르고, 매일 아침 계단을 내려왔다. 바다는 당신에게 고맙다고 말한 적이 없었고, 당신도 바라지 않았다.",
    scoreBonus: 150,
    tone: "good",
  },
  debt_settled: {
    id: "debt_settled",
    title: "청산된 빚",
    text: "지하 시장의 장부에서 당신의 이름이 지워지는 데 걸린 시간은 잉크가 마르는 시간뿐이었다. 채권자는 웃으며 다음에 또 오라고 말했고, 당신은 웃지 않았다. 지상으로 올라오니 해가 지고 있었다. 당신은 오랜만에 뒤를 돌아보지 않고 걸었다.",
    scoreBonus: 150,
    tone: "good",
  },
};
