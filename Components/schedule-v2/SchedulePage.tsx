"use client";
import { useMemo, useState, useEffect, useRef } from "react";
import { useApp } from "@/Components/app/Providers";
import { curriculum } from "@/lib/data/loaders";
import { manualSelection, resolveSelection } from "@/lib/schedule/selection";
import { detectConflicts } from "@/lib/schedule/overlap";
import { generateCalendar } from "@/lib/icsGenerator";
import { downloadFile } from "@/lib/download";
import { validateProfile } from "@/lib/domain/schemas";
import type { SessionSeries, Occurrence } from "@/lib/domain/types";
const time = (n: number) =>
  String(Math.floor(n / 60)).padStart(2, "0") +
  ":" +
  String(n % 60).padStart(2, "0");
function dateAdd(date: string, days: number) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function positioned(items: { series: SessionSeries; o: Occurrence }[]) {
  const sorted = [...items].sort(
      (a, b) =>
        a.o.startMinute - b.o.startMinute || a.o.id.localeCompare(b.o.id),
    ),
    out: ((typeof sorted)[number] & { lane: number; lanes: number })[] = [];
  let group: typeof sorted = [],
    end = -1;
  const flush = () => {
    const ends: number[] = [],
      chunk: (typeof out)[number][] = [];
    for (const item of group) {
      let lane = ends.findIndex((value) => value <= item.o.startMinute);
      if (lane < 0) lane = ends.length;
      ends[lane] = item.o.endMinute;
      chunk.push({ ...item, lane, lanes: 0 });
    }
    chunk.forEach((x) => (x.lanes = ends.length));
    out.push(...chunk);
    group = [];
  };
  for (const item of sorted) {
    if (item.o.startMinute >= end && group.length) flush();
    group.push(item);
    end = Math.max(group.length === 1 ? -1 : end, item.o.endMinute);
  }
  flush();
  return out;
}
export function SchedulePage() {
  const { profile, update, dataset, locale, t, mt } = useApp(),
    [week, setWeek] = useState(0),
    [search, setSearch] = useState(""),
    [kind, setKind] = useState("all"),
    [instructor, setInstructor] = useState("all"),
    [course, setCourse] = useState("all"),
    [scope, setScope] = useState("selected"),
    [view, setView] = useState("auto"),
    [conflictsShown, setConflictsShown] = useState(30),
    [undo, setUndo] = useState(false);
  useEffect(() => {
    try {
      setUndo(!!sessionStorage.getItem("schedulehaw-undo"));
    } catch {}
  }, []);
  const selection = dataset
    ? profile.selections.find(
        (s) =>
          s.termId === dataset.term.id &&
          s.termVersion === dataset.term.version,
      )
    : undefined;
  const selected = useMemo(() => {
    if (!selection || !dataset) return [];
    try {
      return resolveSelection(selection, dataset);
    } catch {
      return [];
    }
  }, [selection, dataset]);
  const conflicts = useMemo(() => detectConflicts(selected), [selected]);
  const opened = useRef("");
  useEffect(() => {
    const key = dataset?.term.id + ":" + (selection?.planId || "manual");
    if (opened.current === key || !dataset || !selected.length) return;
    opened.current = key;
    const first = selected
      .flatMap((s) => s.occurrences)
      .map((o) => o.date)
      .sort()[0];
    const index = dataset.term.teachingWeekStarts.findIndex(
      (w) => first >= w && first < dateAdd(w, 7),
    );
    if (index >= 0) setWeek(index);
  }, [dataset, selection?.planId, selected]);
  if (!dataset)
    return (
      <>
        <div className="page-title">
          <span className="eyebrow">03 / {t("nav.schedule")}</span>
          <h1>{t("schedule.title")}</h1>
          <p>{t("schedule.subtitle")}</p>
        </div>
        <p className="notice">{t("common.unavailable")}</p>
      </>
    );
  const moduleIds = selection?.actions.map((a) => a.moduleId) || [],
    weekIndex = Math.min(week, dataset.term.teachingWeekStarts.length - 1),
    monday = dataset.term.teachingWeekStarts[weekIndex],
    next = dateAdd(monday, 7),
    groupIds = selection?.groupIds || [];
  const lectures =
    selection?.actions.some((a) => a.includeOptionalLectures) ?? true;
  const save = (ids: string[], groups = groupIds, include = lectures) =>
    void update((p) => {
      try {
        sessionStorage.setItem(
          "schedulehaw-undo",
          JSON.stringify(p.selections),
        );
        setUndo(true);
      } catch {}
      const s = manualSelection(ids, groups, include, dataset, p.revision + 1);
      return {
        ...p,
        selections: [
          ...p.selections.filter((x) => x.termId !== dataset.term.id),
          s,
        ],
      };
    }).catch(() => {});
  const filtered = selected.filter(
    (s) =>
      (kind === "all" || s.kind === kind) &&
      (instructor === "all" || s.instructors.includes(instructor)) &&
      (course === "all" ||
        dataset.offerings.find((o) => o.id === s.offeringId)?.moduleId ===
          course),
  );
  const weekSessions = filtered
    .map((s) => ({
      ...s,
      occurrences: s.occurrences.filter(
        (o) => o.date >= monday && o.date < next,
      ),
    }))
    .filter((s) => s.occurrences.length > 0);
  const items = weekSessions.flatMap((series) =>
      series.occurrences.map((o) => ({ series, o })),
    ),
    dates = [0, 1, 2, 3, 4, 5, 6]
      .map((n) => dateAdd(monday, n))
      .filter(
        (date, index) => index < 5 || items.some((x) => x.o.date === date),
      );
  const name = (s: SessionSeries) =>
    curriculum.modules.find(
      (m) =>
        dataset.offerings.find((o) => o.id === s.offeringId)?.moduleId === m.id,
    )?.name[locale] || s.id;
  const code = (s: SessionSeries) =>
    (s as SessionSeries & { sourceCode?: string }).sourceCode ||
    dataset.offerings
      .find((o) => o.id === s.offeringId)
      ?.moduleId.toUpperCase();
  const conflictIds = new Set(
    conflicts.flatMap((c) => [c.occurrenceA, c.occurrenceB]),
  );
  const undoLast = async () => {
    try {
      const prior = JSON.parse(
        sessionStorage.getItem("schedulehaw-undo") || "null",
      );
      if (!Array.isArray(prior)) return;
      validateProfile({ ...profile, selections: prior }, curriculum);
      await update((p) => ({ ...p, selections: prior }));
      sessionStorage.removeItem("schedulehaw-undo");
      setUndo(false);
    } catch {}
  };
  return (
    <>
      <div className="page-title">
        <span className="eyebrow">03 / {t("nav.schedule")}</span>
        <h1>{t("schedule.title")}</h1>
        <p>{t("schedule.subtitle")}</p>
      </div>
      <p className="notice">
        {t("common.historical")} · {dataset.term.label[locale]}
      </p>
      <div className="schedule-layout">
        <aside className="panel course-picker">
          <h2>{t("schedule.courses")}</h2>
          <label>
            {t("common.search")}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="inline">
            <input
              type="checkbox"
              checked={lectures}
              onChange={(e) => save(moduleIds, groupIds, e.target.checked)}
            />
            {t("schedule.lectures")}
          </label>
          <div className="course-options">
            {dataset.offerings
              .filter((o) =>
                [
                  o.moduleId,
                  curriculum.modules.find((m) => m.id === o.moduleId)?.name[
                    locale
                  ],
                ]
                  .join(" ")
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((o) => {
                const m = curriculum.modules.find((m) => m.id === o.moduleId)!;
                const checked = moduleIds.includes(m.id);
                return (
                  <div
                    className={"course-option " + (checked ? "checked" : "")}
                    key={o.id}
                  >
                    <label className="inline">
                      <input
                        type="checkbox"
                        aria-label={m.id.toUpperCase() + " " + m.name[locale]}
                        checked={checked}
                        onChange={(e) =>
                          save(
                            e.target.checked
                              ? [...moduleIds, m.id]
                              : moduleIds.filter((id) => id !== m.id),
                          )
                        }
                      />
                      <span>
                        <strong>{m.id.toUpperCase()}</strong> {m.name[locale]}
                      </span>
                    </label>
                    {checked &&
                      o.groupChoices.map((c) => (
                        <label className="group-choice" key={c.id}>
                          {t("common.group")} ·{" "}
                          {c.componentIds.length
                            ? c.componentIds
                                .map(
                                  (id) =>
                                    curriculum.components.find(
                                      (x) => x.id === id,
                                    )?.kind || id,
                                )
                                .map((key) => mt("common." + key))
                                .join(", ")
                            : t("kind.lecture")}
                          <select
                            aria-label={
                              m.id.toUpperCase() +
                              " " +
                              t("common.group") +
                              " " +
                              c.id
                            }
                            value={
                              c.options.find((g) => groupIds.includes(g.id))
                                ?.id || ""
                            }
                            onChange={(e) =>
                              save(moduleIds, [
                                ...groupIds.filter(
                                  (id) => !c.options.some((g) => g.id === id),
                                ),
                                e.target.value,
                              ])
                            }
                          >
                            <option value="" disabled>
                              {t("common.none")}
                            </option>
                            {c.options.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.label} · {g.sourceCodes.join(", ")}
                                {g.sessionIds.some(
                                  (id) =>
                                    (
                                      dataset.sessions.find(
                                        (s) => s.id === id,
                                      ) as { quarantinedDates?: string[] }
                                    )?.quarantinedDates?.length,
                                )
                                  ? " ⚠"
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </label>
                      ))}
                  </div>
                );
              })}
          </div>
        </aside>
        <section className="timetable-area">
          <div className="panel week-controls">
            <div className="week-nav">
              <button
                className="button"
                disabled={weekIndex === 0}
                aria-label={t("schedule.prev")}
                onClick={() => setWeek(weekIndex - 1)}
              >
                ←
              </button>
              <label>
                {t("schedule.week")}
                <select
                  value={weekIndex}
                  onChange={(e) => setWeek(Number(e.target.value))}
                >
                  {dataset.term.teachingWeekStarts.map((w, index) => (
                    <option key={w} value={index}>
                      {w} — {dateAdd(w, 6)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="button"
                disabled={
                  weekIndex === dataset.term.teachingWeekStarts.length - 1
                }
                aria-label={t("schedule.next")}
                onClick={() => setWeek(weekIndex + 1)}
              >
                →
              </button>
            </div>
            <div className="form-grid filters">
              <label>
                {t("schedule.kind")}
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="all">{t("common.all")}</option>
                  {[
                    "lecture",
                    "lab",
                    "exercise",
                    "project",
                    "exam",
                    "other",
                  ].map((k) => (
                    <option key={k} value={k}>
                      {mt("kind." + k)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("common.modules")}
                <select
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                >
                  <option value="all">{t("common.all")}</option>
                  {moduleIds.map((id) => (
                    <option key={id} value={id}>
                      {id.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("schedule.instructor")}
                <select
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                >
                  <option value="all">{t("common.all")}</option>
                  {[...new Set(selected.flatMap((s) => s.instructors))]
                    .sort()
                    .map((i) => (
                      <option key={i} value={i}>
                        {i}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <p className="micro">{t("schedule.filterNotice")}</p>
            <div className="button-row">
              <button
                className={"button " + (view === "grid" ? "active" : "")}
                onClick={() => setView(view === "grid" ? "auto" : "grid")}
              >
                {t("schedule.grid")}
              </button>
              <button
                className={"button " + (view === "agenda" ? "active" : "")}
                onClick={() => setView(view === "agenda" ? "auto" : "agenda")}
              >
                {t("schedule.agenda")}
              </button>
              {undo && (
                <button className="quiet" onClick={() => void undoLast()}>
                  {t("profile.undo")}
                </button>
              )}
            </div>
          </div>
          {!items.length && (
            <p className="empty-state">{t("schedule.empty")}</p>
          )}
          {items.length > 0 && (
            <>
              <div
                className={"week-grid view-" + view}
                style={{
                  gridTemplateColumns:
                    "48px repeat(" + dates.length + ", minmax(95px, 1fr))",
                }}
              >
                <div className="time-column">
                  <div className="day-heading" />
                  {Array.from({ length: 14 }, (_, i) => (
                    <span key={i} style={{ top: 44 + i * 60 * 0.9 }}>
                      {time(480 + i * 60)}
                    </span>
                  ))}
                </div>
                {dates.map((date, index) => (
                  <div className="grid-day" key={date}>
                    <div className="day-heading">
                      <strong>
                        {mt(
                          "day." +
                            (((new Date(date + "T12:00:00Z").getUTCDay() + 6) %
                              7) +
                              1),
                        )}
                      </strong>
                      <small>{date.slice(5)}</small>
                    </div>
                    <div className="day-body">
                      {positioned(items.filter((x) => x.o.date === date)).map(
                        ({ series, o, lane, lanes }) => (
                          <div
                            key={o.id}
                            className={
                              "session " +
                              series.kind +
                              (conflictIds.has(o.id) ? " conflict" : "")
                            }
                            style={{
                              top: (o.startMinute - 480) * 0.9,
                              height: Math.max(
                                38,
                                (o.endMinute - o.startMinute) * 0.9,
                              ),
                              left: "calc(" + (lane / lanes) * 100 + "% + 2px)",
                              width: "calc(" + 100 / lanes + "% - 4px)",
                            }}
                            title={[
                              name(series),
                              time(o.startMinute) + "–" + time(o.endMinute),
                              series.location,
                              series.instructors.join(", "),
                            ].join("\n")}
                          >
                            <strong>{code(series)}</strong>
                            <small>
                              {time(o.startMinute)}–{time(o.endMinute)}
                            </small>
                            <span>{series.location}</span>
                            <span className="session-name">{name(series)}</span>
                            <span className="session-instructor">
                              {series.instructors.join(", ")}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className={"agenda view-" + view}>
                {dates.map((date) => {
                  const day = items
                    .filter((x) => x.o.date === date)
                    .sort((a, b) => a.o.startMinute - b.o.startMinute);
                  return (
                    day.length > 0 && (
                      <section key={date}>
                        <h3>
                          {mt(
                            "day." +
                              (((new Date(date + "T12:00:00Z").getUTCDay() +
                                6) %
                                7) +
                                1),
                          )}{" "}
                          <small>{date}</small>
                        </h3>
                        {day.map(({ series, o }) => (
                          <article
                            className={
                              "agenda-session " +
                              series.kind +
                              (conflictIds.has(o.id) ? " conflict" : "")
                            }
                            key={o.id}
                          >
                            <time>
                              {time(o.startMinute)}–{time(o.endMinute)}
                            </time>
                            <div>
                              <strong>
                                {code(series)} · {name(series)}
                              </strong>
                              <p>
                                {series.location} ·{" "}
                                {series.instructors.join(", ")}
                              </p>
                            </div>
                          </article>
                        ))}
                      </section>
                    )
                  );
                })}
              </div>
            </>
          )}
          <section className="panel">
            <h2>{t("schedule.conflicts")}</h2>
            <div className="badge-row">
              <span className="badge failed">
                {t("metric.hard")}:{" "}
                {conflicts.filter((c) => c.severity === "hard").length}
              </span>
              <span className="badge needs_review">
                {t("metric.soft")}:{" "}
                {conflicts.filter((c) => c.severity === "soft").length}
              </span>
            </div>
            <details>
              <summary>{t("common.details")}</summary>
              <ul className="conflict-list">
                {conflicts.slice(0, conflictsShown).map((c, index) => {
                  const a = selected.find((s) =>
                      s.occurrences.some((o) => o.id === c.occurrenceA),
                    )!,
                    b = selected.find((s) =>
                      s.occurrences.some((o) => o.id === c.occurrenceB),
                    )!;
                  return (
                    <li key={index}>
                      <strong>
                        {c.date} · {c.overlapMinutes} min
                      </strong>{" "}
                      {code(a)} ↔ {code(b)}{" "}
                      <span className="badge">
                        {c.severity === "hard"
                          ? t("metric.hard")
                          : t("metric.soft")}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {conflictsShown < conflicts.length && (
                <button
                  className="button"
                  onClick={() => setConflictsShown(conflicts.length)}
                >
                  {t("common.all")} ({conflicts.length})
                </button>
              )}
            </details>
            {selected.some(
              (s) =>
                (s as { quarantinedDates?: string[] }).quarantinedDates?.length,
            ) && <p className="warning">{t("schedule.quarantine")}</p>}
          </section>
          <section className="panel export-panel">
            <label>
              {t("schedule.scope")}
              <select value={scope} onChange={(e) => setScope(e.target.value)}>
                <option value="selected">{t("schedule.selected")}</option>
                <option value="visible">{t("schedule.visible")}</option>
              </select>
            </label>
            <button
              className="button primary"
              disabled={!selected.length}
              onClick={() =>
                downloadFile(
                  generateCalendar(
                    scope === "visible" ? weekSessions : selected,
                    dataset,
                    curriculum,
                    locale,
                    new Date().toISOString(),
                  ),
                  "ScheduleHAW-" + dataset.term.id + ".ics",
                  "text/calendar;charset=utf-8",
                )
              }
            >
              {t("schedule.export")} ↓
            </button>
            <p className="micro">{t("schedule.undated")}</p>
          </section>
        </section>
      </div>
    </>
  );
}
