import { WarningGlyph } from "../../components/WarningGlyph";
import { useRun } from "../../runStoreContext";
import { ERROR_TEXT } from "./errorText";

/** One line under an action row: the last rejected action, cleared by the next accepted one. */
export function ErrorLine() {
  const code = useRun((state) => state.lastError);
  return (
    <p aria-live="polite" className="text-xs text-ash empty:hidden">
      {code !== null && (
        <>
          <WarningGlyph />
          {ERROR_TEXT[code]}
        </>
      )}
    </p>
  );
}
