"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/Components/app/Providers";
import { curriculum } from "@/lib/data/loaders";
import {
  rankWithoutTimetable,
  ALGORITHM_VERSION,
  applyPlan,
} from "@/lib/planner";
import type {
  Preferences,
  PlannerInput,
  PlanResult,
  WorkerResponse,
  Plan,
  Reason,
} from "@/lib/domain/types";
function Reasons({ reasons }: { reasons: Reason[] }) {
  const { mt, locale } = useApp();
  return (
    <ul className="reasons">
      {reasons.map((r, index) => (
        <li key={index}>
          <span>
            {r.entityIds
              .map(
                (id) =>
                  curriculum.modules.find((m) => m.id === id)?.name[locale] ||
                  id,
              )
              .join(", ")}
          </span>
          <strong>{mt(r.code)}</strong>
          {r.ruleIds.length > 0 && <small>{r.ruleIds.join(", ")}</small>}
        </li>
      ))}
    </ul>
  );
}
function ContactChart({ plan }: { plan: Plan }) {
  const { t } = useApp(),
    data = Object.entries(plan.metrics.weeklyContactMinutes),
    max = Math.max(60, ...data.map(([, value]) => value));
  return (
    <div
      className="contact-chart"
      role="img"
      aria-label={
        t("advisor.chart") +
        ": " +
        data
          .map(([week, value]) => week + " " + (value / 60).toFixed(1) + "h")
          .join(", ")
      }
    >
      <span>{t("advisor.chart")}</span>
      <div className="bars">
        {data.map(([week, value]) => (
          <div key={week} title={week + ": " + (value / 60).toFixed(1) + "h"}>
            <i style={{ height: Math.max(2, (value / max) * 80) + "px" }} />
            <small>{week.slice(5)}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
export function AdvisorPage() {
  const { profile, update, dataset, locale, t, mt, pulse, storage } = useApp(),
    router = useRouter(),
    [result, setResult] = useState<PlanResult | null>(null),
    [busy, setBusy] = useState(false),
    [nodes, setNodes] = useState(0),
    [error, setError] = useState(false),
    worker = useRef<Worker | undefined>(undefined),
    input = useRef<PlannerInput | undefined>(undefined),
    request = useRef("");
  useEffect(() => {
    worker.current?.terminate();
    setBusy(false);
    setResult(null);
    setError(false);
  }, [profile.revision, dataset, pulse]);
  useEffect(() => () => worker.current?.terminate(), []);
  const preferences = profile.preferences;
  const edit = (patch: Partial<Preferences>) =>
    void update((p) => ({
      ...p,
      preferences: { ...p.preferences, ...patch },
    })).catch(() => {});
  const generate = () => {
    if (!dataset) return;
    worker.current?.terminate();
    const id = crypto.randomUUID();
    request.current = id;
    input.current = {
      curriculum,
      dataset,
      profile,
      pulse,
      algorithmVersion: ALGORITHM_VERSION,
      asOf: new Date().toISOString().slice(0, 10),
    };
    const w = new Worker(
      new URL("../../workers/planner.worker.ts", import.meta.url),
    );
    worker.current = w;
    setBusy(true);
    setNodes(0);
    setError(false);
    setResult(null);
    w.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === "progress" && message.requestId === request.current)
        setNodes(message.exploredNodes);
      if (
        message.type === "result" &&
        message.result.requestId === request.current
      ) {
        setResult(message.result);
        setBusy(false);
        w.terminate();
      }
      if (message.type === "error" && message.requestId === request.current) {
        setError(true);
        setBusy(false);
        w.terminate();
      }
    };
    w.onerror = () => {
      setError(true);
      setBusy(false);
      w.terminate();
    };
    w.postMessage({
      type: "generate",
      requestId: id,
      input: input.current,
      nodeBudget: 150000,
    });
  };
  const handleUsePlan = async (plan: Plan) => {
    if (!result || !input.current) return;
    try {
      const fresh = { ...input.current, profile, dataset: dataset! };
      const selection = applyPlan(result, plan.id, fresh);
      try {
        sessionStorage.setItem(
          "schedulehaw-undo",
          JSON.stringify(profile.selections),
        );
      } catch {}
      await update((p) => ({
        ...p,
        selections: [
          ...p.selections.filter((s) => s.termId !== selection.termId),
          selection,
        ],
      }));
      router.push("/schedule");
    } catch {
      setError(true);
    }
  };
  const priorities = rankWithoutTimetable(curriculum, profile);
  return (
    <>
      <div className="page-title">
        <span className="eyebrow">02 / {t("nav.advisor")}</span>
        <h1>{t("advisor.title")}</h1>
        <p>{t("advisor.subtitle")}</p>
      </div>
      {!dataset ? (
        <p className="notice">{t("common.unavailable")}</p>
      ) : (
        <p className="notice">
          {t("common.historical")} · {dataset.term.label[locale]}
        </p>
      )}
      <section className="panel preferences">
        <h2>{t("advisor.preferences")}</h2>
        <div className="form-grid">
          <label>
            {t("advisor.goal")}
            <select
              value={preferences.goal}
              onChange={(e) =>
                edit({ goal: e.target.value as Preferences["goal"] })
              }
            >
              {[
                "internship",
                "credits",
                "bank_pvl",
                "backlog",
                "curriculum",
                "custom",
              ].map((goal) => (
                <option key={goal} value={goal}>
                  {mt("goal." + goal)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("advisor.maxLabs")}
            <select
              value={preferences.maxNewLabs}
              onChange={(e) =>
                edit({
                  maxNewLabs: Number(
                    e.target.value,
                  ) as Preferences["maxNewLabs"],
                })
              }
            >
              {[2, 3, 4, 5, 6].map((n) => (
                <option value={n} key={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("advisor.maxHours")}
            <input
              type="number"
              min="1"
              max="3000"
              value={preferences.maxWorkloadHours ?? ""}
              onChange={(e) => {
                const n = Number(e.target.value);
                if (!e.target.value || (n > 0 && n <= 3000))
                  edit({ maxWorkloadHours: e.target.value ? n : null });
              }}
            />
          </label>
          <label>
            {t("advisor.style")}
            <select
              value={preferences.scheduleStyle}
              onChange={(e) =>
                edit({
                  scheduleStyle: e.target.value as Preferences["scheduleStyle"],
                })
              }
            >
              {["even", "compressed"].map((value) => (
                <option value={value} key={value}>
                  {mt("style." + value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("advisor.campus")}
            <select
              value={preferences.campus}
              onChange={(e) =>
                edit({ campus: e.target.value as Preferences["campus"] })
              }
            >
              {["neutral", "fewer_days"].map((value) => (
                <option key={value} value={value}>
                  {mt("campus." + value)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("advisor.lectures")}
            <select
              value={preferences.lectures}
              onChange={(e) =>
                edit({ lectures: e.target.value as Preferences["lectures"] })
              }
            >
              {["low", "medium", "high"].map((value) => (
                <option key={value} value={value}>
                  {mt("importance." + value)}
                </option>
              ))}
            </select>
          </label>
          {(["before", "after"] as const).map((direction) => (
            <label key={direction}>
              {mt("advisor." + direction)}
              <input
                type="time"
                value={
                  preferences[
                    direction === "before"
                      ? "avoidBeforeMinute"
                      : "avoidAfterMinute"
                  ] === null
                    ? ""
                    : String(
                        Math.floor(
                          preferences[
                            direction === "before"
                              ? "avoidBeforeMinute"
                              : "avoidAfterMinute"
                          ]! / 60,
                        ),
                      ).padStart(2, "0") +
                      ":" +
                      String(
                        preferences[
                          direction === "before"
                            ? "avoidBeforeMinute"
                            : "avoidAfterMinute"
                        ]! % 60,
                      ).padStart(2, "0")
                }
                onChange={(e) =>
                  edit({
                    [direction === "before"
                      ? "avoidBeforeMinute"
                      : "avoidAfterMinute"]: e.target.value
                      ? Number(e.target.value.slice(0, 2)) * 60 +
                        Number(e.target.value.slice(3))
                      : null,
                  })
                }
              />
            </label>
          ))}
        </div>
        <details>
          <summary>
            {t("advisor.avoidDays")} / {t("advisor.friends")} /{" "}
            {t("advisor.preferredGroups")}
          </summary>
          <div className="weekday-options">
            {[1, 2, 3, 4, 5].map((day) => (
              <label key={day}>
                <input
                  type="checkbox"
                  checked={preferences.avoidWeekdays.includes(day)}
                  onChange={(e) =>
                    edit({
                      avoidWeekdays: e.target.checked
                        ? [...preferences.avoidWeekdays, day]
                        : preferences.avoidWeekdays.filter((x) => x !== day),
                    })
                  }
                />
                {mt("day." + day)}
              </label>
            ))}
          </div>
          <div className="form-grid">
            <label>
              {t("advisor.friends")}
              <select
                multiple
                value={preferences.friendModuleIds}
                onChange={(e) =>
                  edit({
                    friendModuleIds: Array.from(e.target.selectedOptions).map(
                      (o) => o.value,
                    ),
                  })
                }
              >
                {curriculum.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name[locale]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("advisor.preferredGroups")}
              <select
                multiple
                value={preferences.preferredGroupIds}
                onChange={(e) =>
                  edit({
                    preferredGroupIds: Array.from(e.target.selectedOptions).map(
                      (o) => o.value,
                    ),
                  })
                }
              >
                {dataset?.offerings.flatMap((o) =>
                  o.groupChoices.flatMap((c) =>
                    c.options.map((g) => (
                      <option value={g.id} key={g.id}>
                        {o.moduleId.toUpperCase()} · {g.sourceCodes.join(", ")}
                      </option>
                    )),
                  ),
                )}
              </select>
            </label>
          </div>
          {preferences.goal === "custom" && (
            <div className="priority-grid">
              {curriculum.modules.map((m) => (
                <label key={m.id}>
                  {m.id.toUpperCase()}
                  <select
                    value={preferences.customModulePriority[m.id] || 0}
                    onChange={(e) =>
                      edit({
                        customModulePriority: {
                          ...preferences.customModulePriority,
                          [m.id]: Number(e.target.value),
                        },
                      })
                    }
                  >
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          )}
        </details>
        <div className="button-row">
          {dataset &&
            (busy ? (
              <button
                className="button"
                onClick={() => {
                  worker.current?.terminate();
                  request.current = "";
                  setBusy(false);
                }}
              >
                {t("advisor.cancel")}
              </button>
            ) : (
              <button
                className="button primary generate"
                disabled={storage === "saving" || storage === "error"}
                onClick={generate}
              >
                {t("advisor.generate")} →
              </button>
            ))}
          <Link href="/progress" className="quiet">
            {t("nav.progress")}
          </Link>
        </div>
        {busy && (
          <p role="status">
            {t("advisor.running")} {nodes.toLocaleString(locale)}
          </p>
        )}
        {error && <p role="alert">{t("advisor.stale")}</p>}
      </section>
      {result && (
        <section aria-live="polite">
          <p className="search-status">
            {t("advisor.coverage")}:{" "}
            {result.search.complete
              ? t("advisor.complete")
              : t("advisor.bounded")}{" "}
            · {result.search.exploredNodes.toLocaleString(locale)}
          </p>
          {result.search.duplicateIntensities.length > 0 && (
            <p className="notice">{t("advisor.identical")}</p>
          )}
          {!result.plans.length && <p>{t("advisor.noPlans")}</p>}
          <div className="plan-grid">
            {result.plans.map((plan) => (
              <article
                className={"plan-card " + plan.intensity}
                key={plan.intensity}
              >
                <div className="plan-heading">
                  <span className="eyebrow">
                    {mt("intensity." + plan.intensity)}
                  </span>
                  <strong>
                    {plan.potentialCredits}
                    <small> ECTS</small>
                  </strong>
                  <p>{t("advisor.potential")}</p>
                </div>
                <dl className="plan-stats">
                  {[
                    ["common.modules", plan.actions.length],
                    ["metric.newLabs", plan.newLabs],
                    ["metric.otherPVLs", plan.newOtherPVLs],
                    ["metric.examBacklog", plan.examOnlyModuleIds.length],
                    ["common.hours", plan.estimatedHours],
                    ["metric.hard", plan.metrics.hardConflicts],
                    ["metric.soft", plan.metrics.softConflicts],
                    ["metric.heavyDays", plan.metrics.heavyDates.length],
                    ["metric.heavyWeeks", plan.metrics.heavyWeekStarts.length],
                    ["metric.campus", plan.metrics.campusDates.length],
                    ["metric.idle", plan.metrics.idleMinutes],
                    ["metric.activeWeeks", plan.metrics.activeWeeks],
                    ["metric.unlocks", plan.unlocks.length],
                  ].map(([key, value]) => (
                    <div key={key}>
                      <dt>{mt(String(key))}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="plan-modules">
                  {plan.actions.map((a) => (
                    <li key={a.moduleId}>
                      <strong>{a.moduleId.toUpperCase()}</strong>
                      <span>
                        {
                          curriculum.modules.find((m) => m.id === a.moduleId)!
                            .name[locale]
                        }
                      </span>
                      <small>
                        {a.mode === "exam_only"
                          ? t("badge.exam_only")
                          : a.mode === "bank_components"
                            ? t("goal.bank_pvl")
                            : a.componentIds
                                .map((id) =>
                                  mt(
                                    "common." +
                                      curriculum.components.find(
                                        (c) => c.id === id,
                                      )!.kind,
                                  ),
                                )
                                .join(" + ")}
                      </small>
                    </li>
                  ))}
                </ul>
                <details>
                  <summary>
                    {t("common.groups")} ({plan.groupIds.length})
                  </summary>
                  <ul>
                    {plan.groupIds.map((id) => (
                      <li key={id}>
                        {dataset!.offerings
                          .flatMap((o) =>
                            o.groupChoices.flatMap((c) => c.options),
                          )
                          .find((g) => g.id === id)
                          ?.sourceCodes.join(", ")}
                      </li>
                    ))}
                  </ul>
                </details>
                <ContactChart plan={plan} />
                <details>
                  <summary>{t("advisor.explain")}</summary>
                  <p>{t("advisor.noRemote")}</p>
                  <Reasons reasons={plan.reasons} />
                </details>
                <details>
                  <summary>{t("advisor.whatIf")}</summary>
                  {plan.milestonePreview.map((m) => (
                    <p key={m.id}>
                      {
                        curriculum.milestones.find((x) => x.id === m.id)!.name[
                          locale
                        ]
                      }
                      : {mt("truth." + m.actual)} →{" "}
                      {mt("truth." + m.ifAllPassed)}
                      <br />
                      {t("advisor.remaining")}:{" "}
                      {m.remainingIfPassed.join(", ") || t("common.none")}
                    </p>
                  ))}
                  <ul>
                    {plan.unlocks.map((u) => (
                      <li key={u.targetId}>
                        {u.targetId} ·{" "}
                        {u.kind === "hard"
                          ? t("map.prerequisites")
                          : t("map.recommended")}
                      </li>
                    ))}
                  </ul>
                </details>
                <details className="warning">
                  <summary>
                    {t("advisor.warnings")} ({plan.warnings.length})
                  </summary>
                  <Reasons reasons={plan.warnings} />
                </details>
                <details>
                  <summary>
                    {t("advisor.excluded")} ({plan.omissions?.length || 0})
                  </summary>
                  <Reasons
                    reasons={plan.omissions?.flatMap((x) => x.reasons) || []}
                  />
                </details>
                <button
                  className="button primary"
                  onClick={() => void handleUsePlan(plan)}
                >
                  {t("advisor.use")} →
                </button>
              </article>
            ))}
          </div>
          {result.conditionalProposal && (
            <section className="panel conditional-proposal">
              <h2>{t("advisor.conditional")}</h2>
              <p className="notice">{t("reason.conditionalCollision")}</p>
              <p>
                {t("metric.newLabs")}: {result.conditionalProposal.newLabs} ·{" "}
                {t("common.hours")}: {result.conditionalProposal.estimatedHours}{" "}
                · {t("advisor.potential")}:{" "}
                {result.conditionalProposal.potentialCredits} ECTS
              </p>
              <p>
                {t("common.modules")}:{" "}
                {result.conditionalProposal.actions
                  .map((a) => a.moduleId.toUpperCase())
                  .join(", ")}
              </p>
              <p>
                {t("common.groups")}:{" "}
                {result.conditionalProposal.groupIds.join(", ")}
              </p>
              <ul>
                {result.conditionalProposal.conflicts
                  .filter((c) => c.severity === "hard")
                  .map((c) => (
                    <li key={c.occurrenceA + c.occurrenceB}>
                      {c.date} · {c.overlapMinutes} min · {c.occurrenceA} ↔{" "}
                      {c.occurrenceB}
                    </li>
                  ))}
              </ul>
            </section>
          )}
          <details className="panel">
            <summary>
              {t("advisor.excluded")} ({result.excluded.length})
            </summary>
            <Reasons reasons={result.excluded.flatMap((x) => x.reasons)} />
          </details>
        </section>
      )}
      <details className="panel" open={!dataset}>
        <summary>{t("advisor.priorities")}</summary>
        <ol className="academic-list">
          {priorities.map((priority) => (
            <li key={priority.moduleId}>
              <strong>
                {
                  curriculum.modules.find((m) => m.id === priority.moduleId)!
                    .name[locale]
                }
              </strong>
              <span className="badge">{priority.tier}</span>
              <Reasons reasons={priority.reasons} />
            </li>
          ))}
        </ol>
      </details>
    </>
  );
}
