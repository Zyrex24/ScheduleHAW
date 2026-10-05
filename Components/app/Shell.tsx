"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "./Providers";
import { termCatalog } from "@/lib/data/loaders";
import { OfflineSupport } from "./OfflineSupport";
export function Shell({ children }: { children: React.ReactNode }) {
  const { t, mt, locale, setLocale, termId, setTermId, storage, ready } =
      useApp(),
    pathname = usePathname();
  const [welcome, setWelcome] = useState(false),
    [offline, setOffline] = useState(false);
  useEffect(() => {
    try {
      setWelcome(!localStorage.getItem("schedulehaw-onboarded"));
    } catch {}
    const on = () => setOffline(!navigator.onLine);
    on();
    window.addEventListener("online", on);
    window.addEventListener("offline", on);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", on);
    };
  }, []);
  return (
    <>
      <a className="skip-link" href="#main">
        {t("app.skip")}
      </a>
      <header className="app-header">
        <div className="brand-row">
          <Link href="/" className="brand" aria-label="ScheduleHAW">
            Schedule<span>HAW</span>
            <sup>2</sup>
          </Link>
          <span className="brand-motto">{t("app.tagline")}</span>
          <label className="language">
            <span className="sr-only">Language / Sprache</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "de")}
              aria-label="Language / Sprache"
            >
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
          </label>
        </div>
        <nav
          aria-label={locale === "de" ? "Hauptnavigation" : "Main navigation"}
        >
          {[
            ["/advisor", "nav.advisor"],
            ["/progress", "nav.progress"],
            ["/schedule", "nav.schedule"],
            ["/degree-map", "nav.map"],
          ].map(([href, key]) => (
            <Link
              key={href}
              href={href}
              aria-current={
                pathname === href || (href === "/schedule" && pathname === "/")
                  ? "page"
                  : undefined
              }
            >
              {mt(key)}
            </Link>
          ))}
        </nav>
      </header>
      <div className="context-bar">
        <label>
          {t("common.term")}
          <select
            aria-label={t("common.term")}
            value={termId}
            onChange={(e) => setTermId(e.target.value)}
          >
            {termCatalog.map((x) => (
              <option key={x.id} value={x.id}>
                {x.label[locale]}
              </option>
            ))}
          </select>
        </label>
        <span role="status" className={"save-status " + storage}>
          {mt("app." + storage)}
        </span>
      </div>
      {offline && <div className="notice">{t("pwa.offline")}</div>}
      {welcome && ready && (
        <div className="welcome">
          <p>{t("app.welcome")}</p>
          <Link href="/progress" className="button">
            {t("nav.progress")} →
          </Link>
          <button
            className="quiet"
            aria-label={t("app.dismiss")}
            onClick={() => {
              setWelcome(false);
              try {
                localStorage.setItem("schedulehaw-onboarded", "1");
              } catch {}
            }}
          >
            ×
          </button>
        </div>
      )}
      <main id="main" className="app-main">
        {ready ? children : <p role="status">{t("app.loading")}</p>}
      </main>
      <footer>
        <span>{t("app.local")}</span>
        <span>{t("app.version")}</span>
        <OfflineSupport />
        <a href="https://github.com/Zyrex24/ScheduleHAW">GitHub ↗</a>
      </footer>
    </>
  );
}
