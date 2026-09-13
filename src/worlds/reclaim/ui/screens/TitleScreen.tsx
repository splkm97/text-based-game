// 타이틀 화면 — 새 회차·이어하기·기록 보기만 둔다. 배치 선택 UI는 없다(계획 §3.2):
// start()의 기본값 ru_first가 캐논 자리이고 배치 차이는 규칙 파라미터로만 존재한다.
// 나가기는 앱 셸(App)의 상단 바가 소유한다.

import { PixelSprite } from "../../../../shared/art/PixelSprite";
import { Button } from "../../../../shared/ui/Button";
import { META } from "../../meta";
import { COVER } from "../../sprites/cover";
import { useRunStore } from "../runStoreContext";
import { useScreenStore } from "../screenStore";

export function TitleScreen() {
  const go = useScreenStore((state) => state.go);
  const start = useRunStore((state) => state.start);
  const resume = useRunStore((state) => state.resume);
  const hasSave = useRunStore((state) => state.hasSave)();

  const beginRun = () => {
    start();
    go("play");
  };
  const resumeRun = () => {
    if (resume()) {
      go("play");
    }
  };

  return (
    <section className="safe-bottom flex flex-1 flex-col items-center px-4 pt-8 text-center">
      <PixelSprite sprite={COVER} title={META.title} scale={4} />
      <h1 className="mt-6 text-display">{META.title}</h1>
      <p className="mt-2 text-sm text-ash">{META.tagline}</p>
      <nav aria-label="시작 메뉴" className="mt-auto flex w-full flex-col gap-2 pt-8">
        <Button variant="primary" block onClick={beginRun}>
          새 회차
        </Button>
        {hasSave && (
          <Button block onClick={resumeRun}>
            이어하기
          </Button>
        )}
        <Button block onClick={() => go("records")}>
          기록 보기
        </Button>
      </nav>
    </section>
  );
}
