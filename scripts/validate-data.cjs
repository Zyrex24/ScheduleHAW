const c = require("../data/curriculum/haw-ie-bsc/portal-20192-v1/curriculum.json"),
  term = require("../data/terms/2025-ws/term.json"),
  sessions = require("../data/terms/2025-ws/sessions.json"),
  offerings = require("../data/terms/2025-ws/offerings.json"),
  manifest = require("../data/migration/legacy-code-map.json"),
  legacy = require("../data/migration/legacy-blocks.json");
const check = (condition, message) => {
    if (!condition) throw new Error(message);
  },
  unique = (rows, key = "id") =>
    check(
      new Set(rows.map((x) => x[key])).size === rows.length,
      "Duplicate " + key,
    ),
  date = (s) =>
    /^\d{4}-\d\d-\d\d$/.test(s) &&
    new Date(s + "T00:00:00Z").toISOString().slice(0, 10) === s;
unique(c.modules);
unique(c.components);
unique(sessions);
unique(offerings);
unique(sessions.flatMap((s) => s.occurrences));
const modules = new Set(c.modules.map((m) => m.id)),
  components = new Set(c.components.map((m) => m.id)),
  sessionIds = new Set(sessions.map((s) => s.id)),
  offeringIds = new Set(offerings.map((s) => s.id));
const requirement = (r) => {
  if (r.kind === "module") check(modules.has(r.moduleId), "Unknown module");
  else if (r.kind === "component")
    check(components.has(r.componentId), "Unknown component");
  else if ("items" in r) {
    check(r.items.length > 0, "Empty requirement");
    r.items.forEach(requirement);
    if (r.kind === "at_least")
      check(r.count > 0 && r.count <= r.items.length, "Invalid threshold");
  }
};
for (const m of c.modules) {
  m.componentIds.forEach((id) =>
    check(
      c.components.some((x) => x.id === id && x.moduleId === m.id),
      "Bad component owner",
    ),
  );
  requirement(m.completion);
  check(m.credits === null || m.credits > 0, "Bad credits");
}
for (const r of c.rules) {
  requirement(r.requirement);
  check(r.curriculumVersion === c.version, "Rule version mismatch");
  if (r.strength === "hard")
    check(
      r.evidence.length > 0 && r.evidence.every((e) => e.state === "verified"),
      "Unverified hard rule",
    );
}
c.milestones.forEach((m) => requirement(m.requirement));
for (const s of sessions) {
  check(
    s.termId === term.id && offeringIds.has(s.offeringId),
    "Bad session reference",
  );
  s.componentIds.forEach((id) =>
    check(components.has(id), "Bad session component"),
  );
  for (const o of s.occurrences)
    check(
      date(o.date) &&
        o.date >= term.start &&
        o.date < term.endExclusive &&
        o.startMinute >= 0 &&
        o.endMinute <= 1440 &&
        o.endMinute > o.startMinute,
      "Bad occurrence " + o.id,
    );
}
for (const o of offerings) {
  check(modules.has(o.moduleId), "Unknown offering module");
  o.sharedSessionIds.forEach((id) =>
    check(sessionIds.has(id), "Bad shared session"),
  );
  for (const choice of o.groupChoices) {
    unique(choice.options);
    for (const g of choice.options) {
      check(g.sessionIds.length > 0, "Empty bundle");
      g.sessionIds.forEach((id) =>
        check(
          sessions.some((s) => s.id === id && s.offeringId === o.id),
          "Bad bundle",
        ),
      );
    }
  }
}
check(
  legacy.length === 212 &&
    manifest.length === legacy.length &&
    new Set(manifest.map((x) => x.row)).size === legacy.length,
  "Missing historical rows",
);
check(new Set(legacy.map((x) => x.code)).size === 123, "Missing legacy codes");
for (const row of manifest) {
  const source = legacy[row.row],
    s = sessions.find((s) => s.id === row.sessionId);
  check(
    s &&
      source.code === row.code &&
      s.occurrences.length === source.weeks_array.length,
    "Lossy source migration",
  );
}
check(
  c.firstYearModuleIds.every((id) => modules.has(id)),
  "Bad first-year roster",
);
const edges = new Map(c.modules.map((m) => [m.id, []]));
for (const r of c.rules)
  if (r.strength === "hard" && r.target.kind === "module") {
    const visit = (q) => {
      if (q.kind === "module") edges.get(r.target.id)?.push(q.moduleId);
      if ("items" in q) q.items.forEach(visit);
    };
    visit(r.requirement);
  }
const done = new Set(),
  active = new Set();
const visit = (id) => {
  if (active.has(id)) throw new Error("Prerequisite cycle");
  if (done.has(id)) return;
  active.add(id);
  (edges.get(id) || []).forEach(visit);
  active.delete(id);
  done.add(id);
};
for (const id of modules) visit(id);
console.log(
  `Validated ${c.modules.length} modules, ${c.components.length} components, ${sessions.length} series, ${sessions.flatMap((s) => s.occurrences).length} dated occurrences and all 212 migration rows.`,
);
