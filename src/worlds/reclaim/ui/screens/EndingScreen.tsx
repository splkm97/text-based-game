// 종결 화면 — 종결 카드(title·text·epilogue)를 content의 정본 그대로 보여주고
// 새 회차·기록 보기·나가기를 둔다. 종결 상태가 아니면 그릴 것이 없다(플레이 화면과
// 같은 계약): App이 종결에서만 이 화면을 놓는다.

import type { WorldRootProps } from "../../../../host/world";
import { Button } from "../../../../shared/ui/Button";
import { Prose } from "../components/Prose";
import { useContent } from "../contentContext";
import { INNER_GAP, META, SCREEN_PAD, SECTION_GAP } from "../density";
import { useRunStore } from "../runStoreContext";
import { useScreenStore } from "../screenStore";

export function EndingScreen({ onExit }: WorldRootProps) {
  const run = useRunStore((state) => state.run);
  const start = useRunStore((state) => state.start);
  const go = useScreenStore((state) => state.go);
  const content = useContent();

  const terminal = run?.terminal ?? null;
  if (terminal === null) {
    return null;
  }
  const ending = content.endings[terminal];

  return (
    <section aria-label="종결" className={`flex flex-1 flex-col ${SECTION_GAP} ${SCREEN_PAD}`}>
      <h2 className="text-base text-ember">{ending.title}</h2>
      <Prose text={ending.text} />
      <ul aria-label="에필로그" className={`flex flex-col ${INNER_GAP}`}>
        {ending.epilogue.map((line) => (
          <li key={line} className={META}>
            · {line}
          </li>
        ))}
      </ul>
      <nav aria-label="종결 메뉴" className={`mt-auto flex flex-col ${INNER_GAP} pt-4`}>
        <Button
          variant="primary"
          block
          onClick={() => {
            start();
            go("play");
          }}
        >
          새 회차
        </Button>
        <Button block onClick={() => go("records")}>
          기록 보기
        </Button>
        <Button block onClick={onExit}>
          나가기
        </Button>
      </nav>
    </section>
  );
}
