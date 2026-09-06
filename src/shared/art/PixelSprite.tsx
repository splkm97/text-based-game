import { use } from "react";
import { PaletteContext } from "./paletteContext";
import { type Sprite, spriteRects } from "./sprite";

type PixelSpriteProps = {
  readonly sprite: Sprite;
  readonly title: string;
  /** Pixels per sprite cell. */
  readonly scale?: number;
  readonly className?: string;
  /** When set, every opaque pixel is drawn in this fill (undiscovered "???" silhouettes). */
  readonly monochrome?: string;
};

export function PixelSprite({ sprite, title, scale = 4, className, monochrome }: PixelSpriteProps) {
  const palette = use(PaletteContext);
  const { size } = sprite;
  const side = size * scale;
  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={side}
      height={side}
      role="img"
      aria-label={title}
      shapeRendering="crispEdges"
      className={className}
    >
      {spriteRects(sprite, palette, monochrome).map((rect) => (
        <rect
          key={`${rect.x},${rect.y}`}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={1}
          fill={rect.fill}
        />
      ))}
    </svg>
  );
}
