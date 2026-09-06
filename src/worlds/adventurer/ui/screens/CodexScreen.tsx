import { type ReactNode, useState } from "react";
import { PixelSprite } from "../../../../shared/art/PixelSprite";
import type { Sprite } from "../../../../shared/art/sprite";
import { type Tab, Tabs } from "../../../../shared/ui/Tabs";
import { TopBar } from "../../../../shared/ui/TopBar";
import { ENDING_IDS, ITEM_IDS, MONSTER_IDS } from "../../content/ids";
import type { Codex, ContentRegistry, Ending } from "../../engine/types";
import { ICONS } from "../../sprites/icons";
import { MONSTER_SPRITES } from "../../sprites/monsters";
import { CodexEntry } from "../components/CodexEntry";
import { useContent } from "../contentContext";
import { useMeta } from "../metaStoreContext";
import { useScreenStore } from "../screenStore";
import { SLATE } from "../theme";

type CodexTab = keyof Codex;

const TABS: readonly Tab<CodexTab>[] = [
  { id: "endings", label: "에필로그" },
  { id: "monsters", label: "몬스터" },
  { id: "items", label: "아이템" },
];

const TOTAL: Readonly<Record<CodexTab, number>> = {
  endings: ENDING_IDS.length,
  monsters: MONSTER_IDS.length,
  items: ITEM_IDS.length,
};

const TONE_LABEL: Readonly<Record<Ending["tone"], string>> = {
  good: "좋음",
  bad: "나쁨",
  neutral: "중립",
};

const art = (sprite: Sprite, title: string, discovered: boolean): ReactNode =>
  discovered ? (
    <PixelSprite sprite={sprite} title={title} scale={3} className="shrink-0" />
  ) : (
    <PixelSprite sprite={sprite} title="미발견" scale={3} className="shrink-0" monochrome={SLATE} />
  );

const entries = (tab: CodexTab, codex: Codex, content: ContentRegistry): readonly ReactNode[] => {
  switch (tab) {
    case "endings":
      return ENDING_IDS.map((id) => {
        const ending = content.endings[id];
        return (
          <CodexEntry
            key={id}
            discovered={codex.endings.includes(id)}
            name={ending.title}
            description={ending.text}
            tag={TONE_LABEL[ending.tone]}
          />
        );
      });
    case "monsters":
      return MONSTER_IDS.map((id) => {
        const monster = content.monsters[id];
        const discovered = codex.monsters.includes(id);
        return (
          <CodexEntry
            key={id}
            discovered={discovered}
            name={monster.name}
            description={monster.description}
            art={art(MONSTER_SPRITES[id], monster.name, discovered)}
          />
        );
      });
    case "items":
      return ITEM_IDS.map((id) => {
        const item = content.items[id];
        const discovered = codex.items.includes(id);
        return (
          <CodexEntry
            key={id}
            discovered={discovered}
            name={item.name}
            description={item.description}
            art={art(ICONS[item.kind], item.name, discovered)}
          />
        );
      });
  }
};

export function CodexScreen() {
  const go = useScreenStore((state) => state.go);
  const codex = useMeta((state) => state.meta.codex);
  const content = useContent();
  const [tab, setTab] = useState<CodexTab>("endings");

  return (
    <>
      <TopBar title="도감" onBack={() => go("title")} />
      <Tabs label="도감 분류" tabs={TABS} value={tab} onChange={setTab}>
        <p className="px-3 pt-3 text-sm text-ash">
          발견{" "}
          <span className="text-parchment tabular-nums">
            {codex[tab].length}/{TOTAL[tab]}
          </span>
        </p>
        <ul className="safe-bottom flex flex-col gap-2 px-3 pt-3">
          {entries(tab, codex, content)}
        </ul>
      </Tabs>
    </>
  );
}
