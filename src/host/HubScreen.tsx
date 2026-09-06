import { PixelSprite } from "../shared/art/PixelSprite";
import { Button } from "../shared/ui/Button";
import { WORLDS, type WorldEntry } from "./registry";

type HubScreenProps = { readonly onEnter: (entry: WorldEntry) => void };

export function HubScreen({ onEnter }: HubScreenProps) {
  return (
    <section className="safe-bottom flex flex-1 flex-col px-4 pt-8">
      <h1 className="text-center text-display">TXT GAME BOX</h1>
      <ul className="mt-8 flex flex-col gap-4">
        {WORLDS.map((entry) => (
          <li key={entry.meta.id}>
            <article
              aria-labelledby={`world-${entry.meta.id}`}
              className="flex flex-col gap-3 border-2 border-slate bg-ink-deep p-3 inset-ring inset-ring-parchment/20"
            >
              <div className="flex items-center gap-3">
                <PixelSprite sprite={entry.meta.cover} title={entry.meta.title} scale={2} />
                <div className="flex min-w-0 flex-col gap-1">
                  <h2 id={`world-${entry.meta.id}`} className="text-2xl">
                    {entry.meta.title}
                  </h2>
                  <p className="text-sm text-ash">{entry.meta.tagline}</p>
                </div>
              </div>
              <Button
                variant="primary"
                block
                aria-label={`${entry.meta.title} 시작`}
                onClick={() => onEnter(entry)}
              >
                시작
              </Button>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
