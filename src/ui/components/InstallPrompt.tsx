import { useEffect, useState } from "react";
import { Button } from "./Button";

/** The part of Chromium's install event the banner uses. */
type BeforeInstallPromptEvent = Event & { readonly prompt: () => Promise<void> };

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

/** Offers "add to home screen" once the browser says the app qualifies. Dismissal lasts for the
 * mounted component only: the browser fires the event once per page load. */
export function InstallPrompt() {
  const [offer, setOffer] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const capture = (event: BeforeInstallPromptEvent) => {
      event.preventDefault();
      setOffer(event);
    };
    window.addEventListener("beforeinstallprompt", capture);
    return () => window.removeEventListener("beforeinstallprompt", capture);
  }, []);

  if (offer === null) {
    return null;
  }
  const install = () => {
    setOffer(null);
    void offer.prompt();
  };

  return (
    <aside
      aria-label="앱 설치"
      className="mt-4 flex w-full flex-col gap-2 border-2 border-slate bg-ink-deep p-3 text-left inset-ring inset-ring-parchment/20"
    >
      <p className="text-sm leading-prose text-ash">홈 화면에 추가하면 앱처럼 바로 열 수 있어요.</p>
      <div className="flex gap-2">
        <Button variant="primary" block onClick={install}>
          홈 화면에 추가
        </Button>
        <Button block onClick={() => setOffer(null)}>
          닫기
        </Button>
      </div>
    </aside>
  );
}
