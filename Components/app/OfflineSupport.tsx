"use client";
import { useEffect, useState } from "react";
import { useApp } from "./Providers";
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
export function OfflineSupport() {
  const { t } = useApp(),
    [install, setInstall] = useState<InstallEvent | null>(null),
    [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    let alive = true;
    const listen = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", listen);
    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((reg) => {
        if (!alive) return;
        if (reg.waiting) setWaiting(reg.waiting);
        reg.addEventListener("updatefound", () => {
          const worker = reg.installing;
          worker?.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            )
              setWaiting(worker);
          });
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
      window.removeEventListener("beforeinstallprompt", listen);
    };
  }, []);
  return (
    <>
      {install && (
        <button
          className="button"
          onClick={async () => {
            await install.prompt();
            await install.userChoice;
            setInstall(null);
          }}
        >
          {t("pwa.install")}
        </button>
      )}
      {waiting && (
        <button
          className="button"
          onClick={() => {
            navigator.serviceWorker.addEventListener(
              "controllerchange",
              () => window.location.reload(),
              { once: true },
            );
            waiting.postMessage("ACTIVATE_UPDATE");
          }}
        >
          {t("pwa.update")}
        </button>
      )}
    </>
  );
}
