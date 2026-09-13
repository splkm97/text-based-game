// 협회 공문·현장 문서를 종이 문서 서식으로 보여주는 패널. `screen` 문자열은 content의
// 정본이라 여기서 자르거나 다시 쓰지 않고 그대로 출력한다. 문서 몸체는 세계 공통의
// 고정폭 픽셀 문서체를 상속하고, 종이 톤 바탕에 2px 테두리(radius 0, 그림자 없음)로
// 종이 한 장을 낸다.

type BriefingPanelProps = {
  readonly screen: string;
};

export function BriefingPanel({ screen }: BriefingPanelProps) {
  return (
    <section aria-label="문서" className="border-2 border-ash bg-parchment px-3 py-2">
      <p className="text-sm leading-prose text-ink">{screen}</p>
    </section>
  );
}
