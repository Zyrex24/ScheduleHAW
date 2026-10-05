"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/Components/app/Providers";
import type { PulseAggregate, PulseVote } from "@/lib/domain/types";
export function CommunityPulse({ courseId }: { courseId: string }) {
  const { termId, t, mt, setPulse } = useApp(),
    [enabled, setEnabled] = useState(false),
    [aggregate, setAggregate] = useState<PulseAggregate | null>(null),
    [error, setError] = useState(false),
    [type, setType] = useState<PulseVote["type"]>("intent"),
    [value, setValue] = useState(1),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setEnabled(false);
    setAggregate(null);
    setError(false);
  }, [courseId, termId]);
  const request = async (method = "GET") => {
    setBusy(true);
    setError(false);
    try {
      let token: string | null = null;
      if (method !== "GET") {
        token = localStorage.getItem(
          "schedulehaw-pulse-token:" + termId + ":" + courseId,
        );
        if (!token) {
          const b = crypto.getRandomValues(new Uint8Array(32));
          token = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join(
            "",
          );
          localStorage.setItem(
            "schedulehaw-pulse-token:" + termId + ":" + courseId,
            token,
          );
        }
      }
      const response = await fetch(
        "/api/pulse?termId=" + encodeURIComponent(termId),
        {
          method,
          cache: "no-store",
          ...(method !== "GET"
            ? {
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                  method === "DELETE"
                    ? { courseId, termId, token }
                    : { courseId, termId, type, value, token },
                ),
              }
            : {}),
        },
      );
      if (!response.ok) throw new Error("pulse");
      const payload = await response.json();
      if (method === "GET") {
        setPulse(payload);
        setAggregate(
          payload.find((a: PulseAggregate) => a.courseId === courseId) || null,
        );
      }
      setEnabled(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="pulse">
      <h3>{t("pulse.title")}</h3>
      <p className="micro">{t("pulse.privacy")}</p>
      {process.env.NEXT_PUBLIC_COMMUNITY_PULSE_ENABLED !== "true" ? (
        <p className="notice">{t("pulse.disabled")}</p>
      ) : (
        <>
          <button
            className="button"
            disabled={busy}
            onClick={() => void request()}
          >
            {t("pulse.optIn")}
          </button>
          {enabled && (
            <>
              <p className="pulse-counts">
                {aggregate?.recommendCount === null || !aggregate
                  ? t("pulse.small")
                  : t("pulse.count") +
                    ": " +
                    aggregate.recommendCount +
                    " · " +
                    aggregate.recommendPercent +
                    "%"}
              </p>
              <dl className="pulse-signals">
                <dt>{t("pulse.intent")}</dt>
                <dd>{aggregate?.intentCount ?? t("pulse.small")}</dd>
                <dt>{t("pulse.workload")}</dt>
                <dd>
                  {aggregate?.workloadCounts
                    ? aggregate.workloadCounts
                        .map(
                          (n, i) =>
                            mt("pulse." + ["light", "moderate", "heavy"][i]) +
                            ": " +
                            n,
                        )
                        .join(" · ")
                    : t("pulse.small")}
                </dd>
              </dl>
              <div className="pulse-controls">
                <label>
                  {t("pulse.vote")}
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value as PulseVote["type"]);
                      setValue(1);
                    }}
                  >
                    {["intent", "recommend", "workload"].map((k) => (
                      <option key={k} value={k}>
                        {mt("pulse." + k)}
                      </option>
                    ))}
                  </select>
                </label>
                {type !== "intent" && (
                  <label>
                    {type === "workload"
                      ? t("pulse.workload")
                      : t("pulse.recommend")}
                    <select
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                    >
                      {type === "workload"
                        ? ["light", "moderate", "heavy"].map((k, i) => (
                            <option key={k} value={i + 1}>
                              {mt("pulse." + k)}
                            </option>
                          ))
                        : [0, 1].map((n) => (
                            <option key={n} value={n}>
                              {n === 1 ? "✓" : "−"}
                            </option>
                          ))}
                    </select>
                  </label>
                )}
                <button
                  className="button"
                  disabled={busy}
                  onClick={() => void request("POST")}
                >
                  {t("pulse.vote")}
                </button>
                <button
                  className="quiet"
                  disabled={busy}
                  onClick={() => void request("DELETE")}
                >
                  {t("pulse.delete")}
                </button>
              </div>
            </>
          )}
          {error && <p role="alert">{t("pulse.error")}</p>}
        </>
      )}
    </section>
  );
}
