import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "../../shared/ui/Button";

/** Bottom toast shown when a new service worker is waiting. Refresh activates it and reloads. */
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) {
    return null;
  }

  return (
    <output className="safe-bottom fixed inset-x-0 bottom-0 z-20 mx-auto flex w-full max-w-phone items-center gap-2 border-slate border-t-2 bg-ink-deep px-3 pt-3">
      <p className="flex-1 text-sm">새 버전이 있어요.</p>
      <Button variant="primary" onClick={() => void updateServiceWorker()}>
        새로고침
      </Button>
      <Button onClick={() => setNeedRefresh(false)}>닫기</Button>
    </output>
  );
}
