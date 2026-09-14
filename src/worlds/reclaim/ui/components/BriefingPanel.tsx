// 협회 공문·현장 문서를 A안 문서 서식으로 보여주는 패널. `document`의 네 필드는
// content의 정본이라 여기서 자르거나 다시 쓰지 않고 그대로 출력한다: heading은
// 발신명의·문서명(가운데·밑줄), meta는 작은 머리 줄, items는 번호 항목 `<ol>`, tail은
// 문서 끝 줄. meta·tail은 문서에 없으면 비어 있으므로(빈 배열·빈 문자열) 그때는
// 렌더하지 않는다. 몸체는 세계 공통의 고정폭 픽셀 문서체를 상속하고, 종이 톤 바탕에
// 2px 테두리(radius 0, 그림자 없음)로 종이 한 장을 낸다.
//
// `fill`은 전체화면 공문 단계에서만 쓴다 — 종이가 남는 자리를 다 차지해 화면이 곧 문서가 된다.

import type { StageDocument } from "../../types";

type BriefingPanelProps = {
  readonly document: StageDocument;
  /** 종이가 화면의 남는 자리를 채운다(전체화면 공문). */
  readonly fill?: boolean;
};

export function BriefingPanel({ document, fill = false }: BriefingPanelProps) {
  return (
    <section
      aria-label="문서"
      className={`flex flex-col gap-2 border-2 border-ash bg-parchment px-3 py-2 text-ink ${
        fill ? "flex-1" : ""
      }`}
    >
      <h3 className="text-center text-base leading-prose underline underline-offset-4">
        {document.heading}
      </h3>
      {document.meta.length > 0 && (
        <ul aria-label="문서 머리" className="flex flex-col gap-1 text-xs text-slate">
          {document.meta.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      {document.items.length > 0 && (
        <ol
          aria-label="문서 본문"
          className="flex list-decimal flex-col gap-1 pl-4 text-sm leading-prose"
        >
          {document.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      )}
      {document.tail !== "" && <p className="text-xs leading-prose text-slate">{document.tail}</p>}
    </section>
  );
}
