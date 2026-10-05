"use client";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useApp } from "@/Components/app/Providers";
import { curriculum } from "@/lib/data/loaders";
import {
  deriveModuleState,
  evaluateEligibility,
  requirementModules,
  evaluateRequirement,
  planningAvailability,
} from "@/lib/domain/requirements";
import { manualSelection } from "@/lib/schedule/selection";
import { CommunityPulse } from "@/Components/pulse/CommunityPulse";
const Graph = dynamic(() => import("./Graph"), { ssr: false });
export function DegreeMapPage() {
  const { profile, update, locale, dataset, t, mt } = useApp(),
    [selected, setSelected] = useState("ma2"),
    [search, setSearch] = useState(""),
    router = useRouter();
  const m = curriculum.modules.find((m) => m.id === selected)!,
    state = deriveModuleState(m.id, curriculum, profile),
    rules = curriculum.rules.filter(
      (r) => r.target.id === m.id || m.componentIds.includes(r.target.id),
    ),
    future = curriculum.rules.filter((r) =>
      requirementModules(r.requirement, curriculum).includes(m.id),
    ),
    offering = dataset?.offerings.find((o) => o.moduleId === m.id),
    eligibility = evaluateEligibility(
      {
        moduleId: m.id,
        componentIds: state.remainingComponentIds,
        mode: "complete_remaining",
        includeOptionalLectures: true,
      },
      curriculum,
      profile,
    );
  const compare = async () => {
    if (!dataset || !offering) return;
    await update((p) => {
      const prior = p.selections.find((s) => s.termId === dataset.term.id),
        ids = [
          ...new Set([...(prior?.actions.map((a) => a.moduleId) || []), m.id]),
        ],
        s = manualSelection(
          ids,
          prior?.groupIds || [],
          true,
          dataset,
          p.revision + 1,
        );
      return {
        ...p,
        selections: [
          ...p.selections.filter((x) => x.termId !== dataset.term.id),
          s,
        ],
      };
    });
    router.push("/schedule");
  };
  return (
    <>
      <div className="page-title">
        <span className="eyebrow">04 / {t("nav.map")}</span>
        <h1>{t("map.title")}</h1>
        <p>{t("map.subtitle")}</p>
      </div>
      <p className="notice">
        {t("app.version")} {t("progress.milestoneNote")}
      </p>
      <div className="map-layout">
        <section>
          <details className="panel">
            <summary>{t("map.graph")}</summary>
            <p className="micro">{t("map.legend")}</p>
            <Graph select={setSelected} />
          </details>
          <section className="panel">
            <h2>{t("map.list")}</h2>
            <label>
              {t("common.search")}
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <ul className="map-list">
              {curriculum.modules
                .filter((m) =>
                  (m.name[locale] + " " + m.id)
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((module) => {
                  const s = deriveModuleState(module.id, curriculum, profile);
                  return (
                    <li key={module.id}>
                      <button
                        onClick={() => setSelected(module.id)}
                        aria-pressed={selected === module.id}
                      >
                        <strong>{module.id.toUpperCase()}</strong> ·{" "}
                        {module.name[locale]}
                        <br />
                        {module.credits ?? "?"} ECTS · {t("common.semester")}{" "}
                        {module.recommendedSemester ?? "?"}
                        <span className={"badge " + s.primaryBadge}>
                          {mt("badge." + s.primaryBadge)}
                        </span>
                        <span className="badge">
                          {(() => {
                            const a = planningAvailability(
                              module.id,
                              curriculum,
                              profile,
                              dataset,
                            );
                            return a === "unknown"
                              ? t("common.unknown")
                              : a === "completed"
                                ? t("badge.completed")
                                : mt("map." + a);
                          })()}
                        </span>
                      </button>
                    </li>
                  );
                })}
            </ul>
          </section>
        </section>
        <aside className="panel module-detail" aria-label={t("common.details")}>
          <span className="eyebrow">{m.id.toUpperCase()}</span>
          <h2>{m.name[locale]}</h2>
          <p>
            {m.credits ?? "?"} ECTS · {t("common.semester")}{" "}
            {m.recommendedSemester ?? "?"}
          </p>
          <div className="badge-row">
            <span className={"badge " + state.primaryBadge}>
              {mt("badge." + state.primaryBadge)}
            </span>
            <span className="badge">
              {eligibility.status === "blocked"
                ? t("map.blocked")
                : offering
                  ? t("map.available")
                  : t("common.unknown")}
            </span>
          </div>
          <ul>
            {m.componentIds.map((id) => (
              <li key={id}>
                {mt(
                  "common." +
                    curriculum.components.find((c) => c.id === id)!.kind,
                )}
                :{" "}
                {profile.progress.find((r) => r.componentId === id)
                  ? mt(
                      "status." +
                        profile.progress.find((r) => r.componentId === id)!
                          .status,
                    )
                  : t("common.unknown")}
              </li>
            ))}
          </ul>
          <div className="button-row">
            <button
              className="button primary"
              onClick={async () => {
                await update((p) => ({
                  ...p,
                  preferences: {
                    ...p.preferences,
                    goal: "custom",
                    customModulePriority: {
                      ...p.preferences.customModulePriority,
                      [m.id]: 5,
                    },
                  },
                }));
                router.push("/advisor");
              }}
            >
              {t("map.add")}
            </button>
            <Link href={"/progress#module-" + m.id} className="button">
              {t("map.update")}
            </Link>
            {offering && (
              <button className="button" onClick={() => void compare()}>
                {t("map.compare")}
              </button>
            )}
          </div>
          {(["hard", "recommended"] as const).map((strength) => (
            <section key={strength}>
              <h3>
                {strength === "hard"
                  ? t("map.prerequisites")
                  : t("map.recommended")}
              </h3>
              {rules.filter((r) => r.strength === strength).length ? (
                <ul>
                  {rules
                    .filter((r) => r.strength === strength)
                    .map((r) => (
                      <li key={r.id}>
                        {requirementModules(r.requirement, curriculum)
                          .map(
                            (id) =>
                              curriculum.modules.find((m) => m.id === id)?.name[
                                locale
                              ],
                          )
                          .join(", ")}{" "}
                        ·{" "}
                        {mt(
                          "truth." +
                            evaluateRequirement(
                              r.requirement,
                              curriculum,
                              profile,
                            ),
                        )}
                        <br />
                        <small>
                          {r.evidence.map((e) => e.locator).join(" · ")}
                        </small>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="micro">
                  {t("common.none")} · {t("app.version")}
                </p>
              )}
            </section>
          ))}
          <h3>{t("map.offering")}</h3>
          {!dataset ? (
            <p className="micro">{t("common.unavailable")}</p>
          ) : offering ? (
            <>
              <p className="micro">{dataset.term.label[locale]}</p>
              <ul>
                {offering.componentAvailability.map((a) => (
                  <li key={a.componentId}>
                    {a.componentId}:{" "}
                    {a.state === "offered"
                      ? t("map.available")
                      : t("common.unknown")}
                  </li>
                ))}
              </ul>
              <details>
                <summary>{t("common.groups")}</summary>
                <ul>
                  {offering.groupChoices.flatMap((c) =>
                    c.options.map((g) => (
                      <li key={g.id}>
                        {g.sourceCodes.join(", ")} ·{" "}
                        {g.sessionIds
                          .map(
                            (id) =>
                              dataset.sessions.find((s) => s.id === id)
                                ?.location,
                          )
                          .filter((v, i, a) => a.indexOf(v) === i)
                          .join(", ")}
                      </li>
                    )),
                  )}
                </ul>
              </details>
            </>
          ) : (
            <p>{t("reason.notOffered")}</p>
          )}
          <h3>{t("map.future")}</h3>
          <ul>
            {future.map((r) => (
              <li key={r.id}>
                {
                  curriculum.modules.find((m) => m.id === r.target.id)?.name[
                    locale
                  ]
                }{" "}
                ·{" "}
                {r.strength === "hard"
                  ? t("map.prerequisites")
                  : t("map.recommended")}
              </li>
            ))}
          </ul>
          <details>
            <summary>{t("map.source")}</summary>
            <ul>
              {curriculum.sources.map((s) => (
                <li key={s.id}>
                  <a href={s.uri} target="_blank" rel="noreferrer">
                    {s.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </details>
          <CommunityPulse courseId={m.id} />
        </aside>
      </div>
    </>
  );
}
