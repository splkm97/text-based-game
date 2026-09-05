type TopBarProps = {
  readonly title: string;
  readonly onBack: () => void;
};

export function TopBar({ title, onBack }: TopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex min-h-11 items-center gap-2 border-b-2 border-slate bg-ink px-2">
      <button
        type="button"
        onClick={onBack}
        aria-label="뒤로"
        className="flex size-11 items-center justify-center text-parchment"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" shapeRendering="crispEdges">
          <path
            d="M10 2h2v2h-2zM8 4h2v2H8zM6 6h2v4H6zM8 10h2v2H8zM10 12h2v2h-2z"
            fill="currentColor"
          />
        </svg>
      </button>
      <h1 className="text-2xl">{title}</h1>
    </header>
  );
}
