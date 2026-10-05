"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/Components/app/Providers";
import { curriculum } from "@/lib/data/loaders";
import {
  deriveModuleState,
  evaluateRequirement,
} from "@/lib/domain/requirements";
import type { ComponentStatus, ProgressRecord } from "@/lib/domain/types";
import { ProfileTools } from "./ProfileTools";
import { TranscriptImport } from "./TranscriptImport";
const statuses: ComponentStatus[] = [
  "not_started",
  "registered",
  "in_progress",
  "passed",
  "failed",
];
export function ProgressPage() {
  const { profile, update, locale, t, mt } = useApp(),
    [search, setSearch] = useState(""),
    [semester, setSemester] = useState(0),
    [expanded, setExpanded] = useState<string | null>(null);
  useEffect(() => {
    const id = window.location.hash.replace(/^#module-/, "");
    if (curriculum.modules.some((m) => m.id === id)) {
      setSearch(id);
      setExpanded(id);
    }
  }, []);
  const states = curriculum.modules.map((m) =>
      deriveModuleState(m.id, curriculum, profile),
    ),
    earned = states.reduce((n, s) => n + (s.earnedCredits || 0), 0),
    first = curriculum.firstYearModuleIds.filter(
      (id) => deriveModuleState(id, curriculum, profile).completion === "met",
    ).length;
  const edit = (componentId: string, patch: Partial<ProgressRecord>) =>
    update((p) => {
      const old = p.progress.find((r) => r.componentId === componentId);
      return {
        ...p,
        progress: [
          ...p.progress.filter((r) => r.componentId !== componentId),
          {
            componentId,
            status: old?.status || "not_started",
            ...old,
            ...patch,
            source: "manual",
            updatedAt: new Date().toISOString(),
          },
        ],
      };
    }).catch(() => {});
  return (
    <>
      <div className="page-title">
        <span className="eyebrow">01 / {t("nav.progress")}</span>
        <h1>{t("progress.title")}</h1>
        <p>{t("progress.subtitle")}</p>
      </div>
      <dl className="stats hero-stats">
        <div>
          <dt>{t("progress.earned")}</dt>
          <dd>
            {earned}
            <small> ECTS</small>
          </dd>
        </div>
        <div>
          <dt>{t("progress.firstYear")}</dt>
          <dd>
            {first}
            <small> / {curriculum.firstYearModuleIds.length}</small>
          </dd>
        </div>
        <div>
          <dt>{t("progress.notReviewed")}</dt>
          <dd>
            {states.filter((s) => s.unknownComponentIds.length > 0).length}
          </dd>
        </div>
      </dl>
      <p className="notice">
        {t("progress.milestoneNote")} {t("app.version")}
      </p>
      <section className="panel toolbar">
        <label>
          {t("common.semester")}
          <input
            aria-label={t("common.semester")}
            type="number"
            min="1"
            max="30"
            value={profile.subjectSemester}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (n >= 1 && n <= 30)
                void update((p) => ({ ...p, subjectSemester: n })).catch(
                  () => {},
                );
            }}
          />
        </label>
        <label className="grow">
          {t("common.search")}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("common.searchExample")}
          />
        </label>
        <button
          className="button"
          onClick={() =>
            void update((p) => ({
              ...p,
              progress: [
                ...p.progress,
                ...curriculum.components
                  .filter(
                    (c) => !p.progress.some((r) => r.componentId === c.id),
                  )
                  .map((c) => ({
                    componentId: c.id,
                    status: "not_started" as const,
                    source: "manual" as const,
                    updatedAt: new Date().toISOString(),
                  })),
              ],
            })).catch(() => {})
          }
        >
          {t("progress.markStarted")}
        </button>
      </section>
      <div className="chips" aria-label={t("common.semester")}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
          <button
            className={semester === n ? "active" : ""}
            key={n}
            onClick={() => setSemester(n)}
          >
            {n === 0 ? t("common.all") : n}
          </button>
        ))}
      </div>
      <div className="module-grid">
        {curriculum.modules
          .filter(
            (m) =>
              (!semester || m.recommendedSemester === semester) &&
              [m.name.en, m.name.de, m.id, ...m.officialCodes]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase()),
          )
          .map((m) => {
            const s = deriveModuleState(m.id, curriculum, profile);
            return (
              <article
                className={"module-card state-" + s.primaryBadge}
                key={m.id}
                id={"module-" + m.id}
              >
                <div className="module-top">
                  <span className="module-code">{m.id.toUpperCase()}</span>
                  <span className="credit">{m.credits ?? "?"} ECTS</span>
                </div>
                <h2>{m.name[locale]}</h2>
                <div className="badge-row">
                  <span className={"badge " + s.primaryBadge}>
                    {mt("badge." + s.primaryBadge)}
                  </span>
                  {s.failedExam && (
                    <span className="badge failed">
                      {t("badge.failedExam")}
                    </span>
                  )}
                </div>
                <div className="component-list">
                  {m.componentIds.map((id) => {
                    const c = curriculum.components.find((c) => c.id === id)!,
                      r = profile.progress.find((r) => r.componentId === id);
                    return (
                      <label key={id}>
                        <span>
                          {mt("common." + c.kind)}
                          {m.id === "ls" ? " · " + c.name[locale] : ""}
                        </span>
                        <select
                          aria-label={
                            m.id.toUpperCase() +
                            " " +
                            mt("common." + c.kind) +
                            (m.id === "ls" ? " " + c.name[locale] : "")
                          }
                          value={r?.status || ""}
                          onChange={(e) =>
                            void edit(id, {
                              status: e.target.value as ComponentStatus,
                            })
                          }
                        >
                          <option value="" disabled>
                            {t("common.unknown")}
                          </option>
                          {statuses.map((status) => (
                            <option value={status} key={status}>
                              {mt("status." + status)}
                            </option>
                          ))}
                        </select>
                      </label>
                    );
                  })}
                </div>
                {m.completion.kind === "unknown" && (
                  <p className="micro warning">
                    {t("common.review")} · {t("app.version")}
                  </p>
                )}
                <div className="button-row">
                  <button
                    className="quiet"
                    onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                    aria-expanded={expanded === m.id}
                  >
                    {t("common.details")}
                  </button>
                  {m.componentIds.length > 0 && (
                    <button
                      className="quiet"
                      onClick={() =>
                        void update((p) => ({
                          ...p,
                          progress: [
                            ...p.progress.filter(
                              (r) => !m.componentIds.includes(r.componentId),
                            ),
                            ...m.componentIds.map((componentId) => ({
                              componentId,
                              status: "passed" as const,
                              source: "manual" as const,
                              updatedAt: new Date().toISOString(),
                            })),
                          ],
                        })).catch(() => {})
                      }
                    >
                      {t("progress.passModule")}
                    </button>
                  )}
                </div>
                {expanded === m.id && (
                  <div className="component-details">
                    {m.componentIds.map((id) => {
                      const r = profile.progress.find(
                        (r) => r.componentId === id,
                      );
                      return (
                        <fieldset key={id}>
                          <legend>{id}</legend>
                          <label>
                            {t("progress.grade")}
                            <input
                              maxLength={32}
                              defaultValue={r?.grade || ""}
                              onBlur={(e) =>
                                void edit(id, {
                                  grade: e.target.value || undefined,
                                })
                              }
                            />
                          </label>
                          <label>
                            {t("progress.attempts")}
                            <input
                              type="number"
                              min="0"
                              max="99"
                              defaultValue={r?.attempts ?? ""}
                              onBlur={(e) =>
                                void edit(id, {
                                  attempts: e.target.value
                                    ? Number(e.target.value)
                                    : undefined,
                                })
                              }
                            />
                          </label>
                          <label>
                            {t("progress.date")}
                            <input
                              type="date"
                              defaultValue={r?.completedOn || ""}
                              onBlur={(e) =>
                                void edit(id, {
                                  completedOn: e.target.value || undefined,
                                })
                              }
                            />
                          </label>
                          <label>
                            {t("progress.notes")}
                            <textarea
                              maxLength={2000}
                              defaultValue={r?.notes || ""}
                              onBlur={(e) =>
                                void edit(id, {
                                  notes: e.target.value || undefined,
                                })
                              }
                            />
                          </label>
                        </fieldset>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
      </div>
      <details className="panel">
        <summary>
          {t("progress.firstYear")} ·{" "}
          {mt(
            "truth." +
              evaluateRequirement(
                curriculum.milestones[0].requirement,
                curriculum,
                profile,
              ),
          )}
        </summary>
        <ul className="checklist">
          {curriculum.firstYearModuleIds.map((id) => (
            <li key={id}>
              <span>
                {deriveModuleState(id, curriculum, profile).completion === "met"
                  ? "✓"
                  : "○"}
              </span>{" "}
              {curriculum.modules.find((m) => m.id === id)?.name[locale]}{" "}
              <span className="micro">
                {mt(
                  "badge." +
                    deriveModuleState(id, curriculum, profile).primaryBadge,
                )}
              </span>
            </li>
          ))}
        </ul>
      </details>
      <TranscriptImport />
      <ProfileTools />
    </>
  );
}
