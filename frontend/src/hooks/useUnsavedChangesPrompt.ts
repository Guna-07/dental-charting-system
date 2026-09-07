import { useEffect } from "react";
import { useRouter } from "next/router";

const MESSAGE = "You have unsaved changes. Leave this page and lose them?";

/**
 * Warns before an in-app route change or a browser unload while `when` is true.
 */
export function useUnsavedChangesPrompt(when: boolean): void {
  const router = useRouter();

  useEffect(() => {
    if (!when) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = MESSAGE;
    };

    const handleRouteChange = () => {
      if (!window.confirm(MESSAGE)) {
        // Abort the navigation Next.js has already started.
        router.events.emit("routeChangeError");
        // eslint-disable-next-line no-throw-literal
        throw "Route change aborted by unsaved-changes guard";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    router.events.on("routeChangeStart", handleRouteChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [when, router.events]);
}
