import { useId } from "react";
import { CONTENT } from "../../../content";
import { deriveStats, effectiveStats, hasRoom } from "../../../engine/character";
import { buyPrice, sellPrice } from "../../../engine/shop";
import type { RunPhase, RunState } from "../../../engine/types";
import { Button } from "../../components/Button";
import { Panel } from "../../components/Panel";
import { useRun } from "../../runStoreContext";
import { ItemRow, itemMeta } from "./ItemRow";
import { SaveBar } from "./SaveBar";

type ShopPhase = Extract<RunPhase, { kind: "shop" }>;

type ShopViewProps = { readonly run: RunState; readonly phase: ShopPhase };

export function ShopView({ run, phase }: ShopViewProps) {
  const buy = useRun((state) => state.buy);
  const sell = useRun((state) => state.sell);
  const leaveShop = useRun((state) => state.leaveShop);
  const { character } = run;
  const cha = effectiveStats(character, CONTENT).cha;
  const room = hasRoom(character, CONTENT);
  const slots = deriveStats(character, CONTENT).inventorySlots;
  const reasonBase = useId();
  return (
    <>
      <section className="flex flex-col gap-3 p-3">
        <div>
          <h2 className="text-2xl">상점</h2>
          <p className="mt-1 text-xs text-ash tabular-nums">
            골드 {character.gold} · 가방 {character.inventory.length}/{slots}
          </p>
        </div>
        <Panel title="팔아요">
          <ul className="flex flex-col gap-2">
            {phase.shop.stock.map((id) => {
              const item = CONTENT.items[id];
              const price = buyPrice(item, cha);
              const reason = character.gold < price ? "골드 부족" : room ? null : "가방 가득";
              const reasonId = `${reasonBase}${id}`;
              return (
                <ItemRow key={id} item={item} meta={`${price} 골드 · ${itemMeta(item)}`}>
                  <span className="flex flex-col items-end gap-1">
                    <Button
                      onClick={() => buy(id)}
                      disabled={reason !== null}
                      aria-describedby={reason === null ? undefined : reasonId}
                      aria-label={`${item.name} 구매`}
                    >
                      구매
                    </Button>
                    {reason !== null && (
                      <span id={reasonId} className="text-xs text-dusk">
                        {reason}
                      </span>
                    )}
                  </span>
                </ItemRow>
              );
            })}
          </ul>
        </Panel>
        <Panel title="내 가방">
          {character.inventory.length === 0 ? (
            <p className="text-sm text-dusk">가방이 비었어요.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {character.inventory.map((id, index) => {
                const item = CONTENT.items[id];
                return (
                  // biome-ignore lint/suspicious/noArrayIndexKey: the bag may hold the same item twice
                  <ItemRow key={`${id}-${index}`} item={item} meta={`${sellPrice(item, cha)} 골드`}>
                    <Button onClick={() => sell(id)} aria-label={`${item.name} 판매`}>
                      판매
                    </Button>
                  </ItemRow>
                );
              })}
            </ul>
          )}
        </Panel>
      </section>
      <SaveBar run={run}>
        <Button variant="primary" block onClick={leaveShop}>
          떠나기
        </Button>
      </SaveBar>
    </>
  );
}
