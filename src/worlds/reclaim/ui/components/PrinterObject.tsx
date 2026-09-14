// 프린터 오브젝트 — 사무실 책상 위의 **대상**이다. 행동 목록의 버튼 한 줄이 아니라 종이를
// 뱉는 물건으로 그린다: office.printer 문면이 물건의 얼굴이고, 누르면 규칙이 공문을 당긴다
// (`office_printer`). 재질은 문서(BriefingPanel)와 같다 — 종이 톤 바탕에 2px 테두리,
// radius 0·그림자 없음. 누를 수 있는 대상이므로 컨트롤 최소 높이(44px)를 지킨다.
// 물건의 얼굴과 그 동작 이름은 붙어 있어야 하므로 구역 안쪽 간격(INNER_GAP)으로 묶는다.

import { INNER_GAP } from "../density";

const PRINTER =
  `flex min-h-11 w-full flex-col ${INNER_GAP} border-2 border-ash bg-parchment px-3 py-2 ` +
  "text-left text-ink transition-[background-color,border-color] duration-120 ease-ink " +
  "disabled:pointer-events-none disabled:text-dusk";

type PrinterObjectProps = {
  /** 물건의 얼굴 — 그 일감의 office.printer 문면. */
  readonly text: string;
  /** 누르는 동작의 이름 — 행동 정본의 라벨(접근성 이름이 된다). */
  readonly label: string;
  readonly onPress: () => void;
};

export function PrinterObject({ text, label, onPress }: PrinterObjectProps) {
  return (
    <button type="button" className={PRINTER} aria-label={label} onClick={onPress}>
      <span className="text-sm leading-prose">{text}</span>
      <span className="text-xs text-slate underline underline-offset-4">{label}</span>
    </button>
  );
}
