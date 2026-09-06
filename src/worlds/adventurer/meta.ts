import type { WorldMeta } from "../../host/world";
import { ORIGIN_PORTRAITS } from "./sprites/portraits";
import { THEME } from "./theme";

export const META: WorldMeta = {
  id: "adventurer",
  title: "모험가 이야기",
  tagline: "주사위 한 번에 하루가 갈리는 짧은 여정",
  cover: ORIGIN_PORTRAITS.origin_mercenary,
  theme: THEME,
};
