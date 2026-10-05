/* One-time, allowlisted public-data migration. Never imports student statuses. */
const fs = require("node:fs"),
  ts = require("typescript"),
  vm = require("node:vm"),
  crypto = require("node:crypto");
const write = (p, value) => {
  fs.mkdirSync(require("node:path").dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(value, null, 2) + "\n");
};
const existing = "data/migration/legacy-blocks.json";
let blocks;
if (fs.existsSync(existing)) blocks = JSON.parse(fs.readFileSync(existing));
else {
  const source = fs.readFileSync("Entities/ScheduleBlock.ts", "utf8");
  const scope = { exports: {} };
  vm.runInNewContext(
    ts.transpile(source + "\nexport const audit = realSchedule;", {
      module: ts.ModuleKind.CommonJS,
    }),
    scope,
  );
  blocks = JSON.parse(JSON.stringify(scope.exports.audit));
  write(existing, blocks);
}
const ev = [
  {
    sourceId: "repo-4cae649",
    locator: "Entities/ScheduleBlock.ts / public timetable rows",
    checkedOn: "2026-10-05",
    state: "provisional",
  },
];
const label = (s) => ({ en: s, de: s });
// The portal 20192 variant is kept separate from the differently structured 2024 handbook.
const seeds = [
  ["ma1", "MA1", "Mathematics 1", 8, 1, "exercise", "MAE1", "M-01-P"],
  ["ma2", "MA2", "Mathematics 2", 8, 2, "exercise", "MAE2", "M-02-P"],
  ["ee1", "EE1", "Electrical Engineering 1", 6, 1, "lab", "EEL1", "M-03-P"],
  ["ee2", "EE2", "Electrical Engineering 2", 6, 2, "lab", "EEL2", "M-04-P"],
  ["el1", "EL1", "Electronics 1", 6, 2, "lab", "ELL1", "M-05-P"],
  ["so1", "SO1", "Software Construction 1", 7, 1, "lab", "SOL1", "M-06"],
  ["so2", "SO2", "Software Construction 2", 6, 2, "lab", "SOL2", "M-07"],
  ["ge", "GE", "German", 4, 1, null, null, "M-08-P"],
  ["ic", "IC", "Intercultural Competence", 3, 2, null, null, "M-09-P"],
  ["ls", "LSE", "Learning and Study Methods", 6, 1, null, null, "M-10-P"],
  ["ss1", "SS1", "Signals and Systems 1", 6, 3, "lab", "SSL1", "M-11-P"],
  ["ss2", "SS2", "Signals and Systems 2", 6, 4, "lab", "SSL2", "M-12-P"],
  ["el2", "EL2", "Electronics 2", 7, 3, "lab", "ELL2", "M-13-P"],
  ["di", "DI", "Digital Circuits", 6, 3, "lab", "DIL", "M-14-P"],
  ["ds", "DS", "Digital Systems", 6, 4, "lab", "DSL", "M-15-P"],
  ["mc", "MC", "Microcontrollers", 7, 4, "lab", "MCL", "M-16-P"],
  ["ad", "AD", "Algorithms and Data Structures", 6, 3, "lab", "ADL", "M-17-P"],
  ["se", "SE", "Software Engineering", 6, 4, "lab", "SEL", "M-18-P"],
  ["db", "DB", "Databases", 6, 4, "lab", "DBL", "M-19-P"],
  ["em", "EM", "Economics and Management", 6, 3, "exercise", "EME", "M-20-P"],
  ["sp", "SP", "Scientific and Project Work", 4, 5, null, null, "M-21-P"],
  ["ip", "IP", "Internship", 25, 5, null, null, "M-22-P"],
  ["bu", "BU", "Bus Systems and Sensors", 6, 6, "lab", "BUL", "M-23-P"],
  ["os", "OS", "Operating Systems", 6, 6, "lab", "OSL", "M-24-P"],
  ["dp", "DP", "Digital Signal Processing", 6, 6, "lab", "DPL", "M-25-P"],
  ["dc", "DC", "Digital Communication Systems", 6, 6, "lab", "DCL", "M-26-P"],
  ["cj1", "CJ1", "Elective Project 1", 5, 6, null, null, "CJ1"],
  ["cj2", "CJ2", "Elective Project 2", 5, 7, null, null, "CJ2"],
  ["thesis", "AB", "Bachelor Thesis and Colloquium", 15, 7, null, null, "AB"],
];
const components = [],
  modules = [],
  map = {};
for (const [
  id,
  code,
  name,
  credits,
  semester,
  kind,
  practical,
  official,
] of seeds) {
  const assessment = ["ic", "sp"].includes(id)
    ? "presentation"
    : ["ls", "cj1", "cj2", "ip", "thesis"].includes(id)
      ? "project"
      : "exam";
  const ids = [id + "." + assessment];
  components.push({
    id: ids[0],
    moduleId: id,
    name: label(assessment),
    kind: assessment,
    isPVL: false,
    estimatedRemainingHours: null,
    estimateSource: "product_default",
    evidence: ev,
  });
  if (kind) {
    ids.push(id + "." + kind);
    components.push({
      id: ids[1],
      moduleId: id,
      name: label(kind),
      kind,
      isPVL: true,
      estimatedRemainingHours: null,
      estimateSource: "product_default",
      evidence: ev,
    });
    map[practical] = { id, componentId: ids[1], kind };
  }
  map[code] = { id, componentId: ids[0], kind: "lecture" };
  modules.push({
    id,
    officialCodes: [official, code],
    aliases: [name, code, official, "module" + official],
    name: label(name),
    credits,
    recommendedSemester: semester,
    type:
      id === "ip"
        ? "internship"
        : id === "thesis"
          ? "thesis"
          : ["cj1", "cj2"].includes(id)
            ? "project"
            : "required",
    theme: "general",
    componentIds: ids,
    completion: {
      kind: "all",
      items: ids.map((componentId) => ({ kind: "component", componentId })),
    },
    evidence: ev,
  });
}
// Study-method assessment reconciliation is unresolved across regulations. Keep observed
// outcomes separate and reviewable, without claiming a certified completion conjunction.
components.splice(
  components.findIndex((c) => c.id === "ls.project"),
  1,
);
const ls = modules.find((m) => m.id === "ls");
ls.componentIds = [];
ls.completion = { kind: "unknown", issueId: "study-methods-review" };
for (const [code, suffix, kind] of [
  ["LSE", "study", "other_pvl"],
  ["LSL", "presentation1", "presentation"],
  ["LSL2", "presentation2", "presentation"],
]) {
  const id = "ls." + suffix;
  ls.componentIds.push(id);
  components.push({
    id,
    moduleId: "ls",
    name: label(code),
    kind,
    isPVL: false,
    estimatedRemainingHours: null,
    estimateSource: "unknown",
    evidence: ev,
  });
  map[code] = {
    id: "ls",
    componentId: id,
    kind: code === "LSE" ? "exercise" : "lab",
  };
}
map.LP = { id: "lab-practice", componentId: null, kind: "other" };
// Elective teaching opportunities retain their real source names and uncertain degree mapping.
for (const b of blocks) {
  const short = b.code.replace(/^(IE|E)\d+-/, "").split("/")[0];
  if (map[short]) continue;
  const lectureShort = short.replace(/^WPP/, "WP");
  const publicTitle = b.full_name
    .replace(/ Lab$/, "")
    .replace(/^(Elective:|Projekt:|Project:)\s*/i, "");
  const id =
    "elective-" +
    publicTitle
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  if (!modules.some((m) => m.id === id)) {
    const ids = [id + ".project"];
    components.push({
      id: ids[0],
      moduleId: id,
      name: label("project"),
      kind: "project",
      isPVL: false,
      estimatedRemainingHours: null,
      estimateSource: "unknown",
      evidence: ev,
    });
    modules.push({
      id,
      officialCodes: [lectureShort],
      aliases: [b.full_name],
      name: label(b.full_name.replace(/ Lab$/, "")),
      credits: null,
      recommendedSemester: Number(b.semester.slice(2)),
      type: "elective",
      theme: b.module_type,
      componentIds: ids,
      completion: { kind: "unknown", issueId: "elective-mapping" },
      evidence: ev,
    });
  }
  map[short] = {
    id,
    componentId: null,
    kind: short.startsWith("WPP")
      ? "lab"
      : short.startsWith("WPJ")
        ? "project"
        : "lecture",
  };
}
if (!modules.some((m) => m.id === "lab-practice"))
  modules.push({
    id: "lab-practice",
    officialCodes: ["LP"],
    aliases: [],
    name: label("Lab Practice Week"),
    credits: null,
    recommendedSemester: 2,
    type: "elective",
    theme: "general",
    componentIds: [],
    completion: { kind: "unknown", issueId: "practice-week" },
    evidence: ev,
  });
const firstYear = modules
  .filter((m) => m.type === "required" && m.recommendedSemester <= 2)
  .map((m) => m.id);
const rules = [];
for (const [target, requires] of [
  ["ma2", ["ma1"]],
  ["ee2", ["ee1"]],
  ["el1", ["ee1", "ma1"]],
  ["el2", ["ee1", "ee2", "el1"]],
])
  rules.push({
    id: "recommended-" + target,
    curriculumVersion: "portal-20192-v1",
    target: { kind: "module", id: target },
    appliesTo: "participation",
    timing: "before_term",
    strength: "recommended",
    requirement: {
      kind: "all",
      items: requires.map((moduleId) => ({ kind: "module", moduleId })),
    },
    evidence: [
      {
        sourceId: "haw-handbook-2024",
        locator:
          "module descriptions; advisory cross-version knowledge guidance",
        checkedOn: "2026-10-05",
        state: "provisional",
      },
    ],
  });
const milestones = [
  {
    id: "internship-eligibility",
    name: {
      en: "First-year completion / internship readiness",
      de: "Erstes Studienjahr / Praxissemester",
    },
    requirement: {
      kind: "all",
      items: firstYear.map((moduleId) => ({ kind: "module", moduleId })),
    },
    ruleIds: [],
    effect: "internship",
    exceptionNoteKey: "milestone.exception",
    evidence: ev,
  },
];
const sources = [
  {
    id: "repo-4cae649",
    title: "Historical portal curriculum 20192 and WS 2025/26 timetable",
    uri: "https://github.com/Zyrex24/ScheduleHAW/tree/4cae649bc821a9486623cea08aef5cbdbc42bb87",
    publishedOn: null,
    accessedOn: "2026-10-05",
  },
  {
    id: "haw-handbook-2024",
    title: "HAW module handbook 01.04.2024",
    uri: "https://www.haw-hamburg.de/fileadmin/International/PDF/PDFs_Ingrid/modulehandbook-IE_2024.pdf",
    publishedOn: "2024-04-01",
    accessedOn: "2026-10-05",
  },
];
const curriculum = {
  schemaVersion: 1,
  id: "haw-ie-bsc",
  version: "portal-20192-v1",
  regulationLabel:
    "Portal 20192 — historical/advisory; verify your examination regulations",
  sources,
  modules,
  components,
  rules,
  milestones,
  degreeSlots: [],
  firstYearModuleIds: firstYear,
  dataIssues: [
    {
      id: "version-review",
      entityIds: ["ls", "sp", "cj1", "cj2"],
      severity: "warning",
      code: "curriculum_version_review",
      evidence: ev,
      resolution: null,
    },
    {
      id: "study-methods-review",
      entityIds: ["ls"],
      severity: "warning",
      code: "completion_requires_regulation_review",
      evidence: ev,
      resolution: null,
    },
    {
      id: "elective-mapping",
      entityIds: modules.filter((m) => m.type === "elective").map((m) => m.id),
      severity: "warning",
      code: "elective_credit_and_slot_unknown",
      evidence: ev,
      resolution: null,
    },
    {
      id: "practice-week",
      entityIds: ["lab-practice"],
      severity: "warning",
      code: "completion_unknown",
      evidence: ev,
      resolution: null,
    },
  ],
};
write("data/curriculum/haw-ie-bsc/portal-20192-v1/curriculum.json", curriculum);
const aliases = [];
for (const [short, v] of Object.entries(map)) {
  if (v.componentId) {
    const study = { LSE: "LSE1", LSL: "LSL1", LSL2: "LSL2" }[short];
    const suffix = study
      ? "SL"
      : v.kind === "lecture"
        ? ["ic", "sp", "cj1", "cj2", "ip", "thesis"].includes(v.id)
          ? "SL"
          : "PL"
        : "VL";
    for (const value of [short, "1IE-" + (study || short) + "." + suffix])
      aliases.push({
        value,
        curriculumVersion: curriculum.version,
        target: { kind: "component", componentId: v.componentId },
        scope: value === short ? "legacy_schedule_code" : "official_code",
        evidence: ev,
      });
  }
}
write("data/curriculum/haw-ie-bsc/portal-20192-v1/aliases.json", aliases);
write("data/rules/haw-ie-bsc/portal-20192-v1/prerequisites.json", rules);
write("data/rules/haw-ie-bsc/portal-20192-v1/milestones.json", milestones);
const dateFor = (week, day) => {
  const year = week >= 41 ? 2025 : 2026,
    j = new Date(Date.UTC(year, 0, 4));
  j.setUTCDate(
    j.getUTCDate() -
      ((j.getUTCDay() + 6) % 7) +
      (week - 1) * 7 +
      [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].indexOf(day),
  );
  return j.toISOString().slice(0, 10);
};
const minute = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const sessions = [],
  offerings = [],
  crosswalk = [],
  reconciliation = [];
const byCode = new Map();
blocks.forEach((b, index) => {
  const k = b.code;
  if (!byCode.has(k)) byCode.set(k, []);
  byCode.get(k).push({ b, index });
});
for (const [code, rows] of byCode) {
  const short = code.replace(/^(IE|E)\d+-/, "").split("/")[0],
    v = map[short],
    offeringId = "2025-ws:" + v.id;
  let o = offerings.find((x) => x.id === offeringId);
  if (!o) {
    o = {
      id: offeringId,
      termId: "2025-ws",
      moduleId: v.id,
      availability: "offered",
      componentAvailability: [],
      sharedSessionIds: [],
      groupChoices: [],
      compatibility: [],
      registration: null,
      evidence: ev,
    };
    offerings.push(o);
  }
  const group = rows[0].b.group || code.split("/")[1];
  const choiceId = offeringId + ":" + (v.componentId || v.kind);
  const groupId = group ? choiceId + ":" + group : null;
  let choice;
  if (group) {
    choice = o.groupChoices.find((c) => c.id === choiceId);
    if (!choice) {
      choice = {
        id: choiceId,
        componentIds:
          v.componentId && v.kind !== "lecture" ? [v.componentId] : [],
        min: 1,
        max: 1,
        options: [],
      };
      o.groupChoices.push(choice);
    }
    choice.options.push({
      id: groupId,
      label: group,
      sourceCodes: [code],
      sessionIds: [],
    });
  }
  if (
    v.componentId &&
    !o.componentAvailability.some((c) => c.componentId === v.componentId) &&
    v.kind !== "lecture"
  )
    o.componentAvailability.push({
      componentId: v.componentId,
      state: "offered",
    });
  for (const { b, index } of rows) {
    const id = "2025-ws:row-" + index;
    const s = {
      id,
      termId: "2025-ws",
      offeringId,
      componentIds:
        v.kind === "lecture" ? [] : v.componentId ? [v.componentId] : [],
      kind: v.kind,
      attendance: v.kind === "lecture" ? "optional" : "mandatory",
      location: b.location,
      campusId: /BT[57]/.test(b.location) ? "berliner-tor" : null,
      delivery: "campus",
      instructors: b.instructors.split(",").map((x) => x.trim()),
      occurrences: b.weeks_array.map((w) => ({
        id: id + ":" + dateFor(w, b.day),
        date: dateFor(w, b.day),
        startMinute: minute(b.start_time),
        endMinute: minute(b.end_time),
      })),
      evidence: ev,
    };
    const previous = sessions.filter(
      (x) => x.offeringId === offeringId && x.sourceCode === code,
    );
    s.sourceCode = code;
    // Conflicting rows of the same group are preserved as visible quarantine, not silently repaired.
    s.quarantinedDates = [];
    for (const p of previous)
      for (const a of s.occurrences)
        for (const q of p.occurrences)
          if (
            a.date === q.date &&
            a.startMinute < q.endMinute &&
            q.startMinute < a.endMinute
          ) {
            s.quarantinedDates.push(a.date);
            p.quarantinedDates.push(a.date);
            reconciliation.push({
              code,
              date: a.date,
              rowA: p.id,
              rowB: id,
              resolution:
                "quarantined from advisor; retained for historical display",
            });
          }
    sessions.push(s);
    crosswalk.push({
      row: index,
      code,
      moduleId: v.id,
      componentId: v.componentId,
      groupId,
      sessionId: id,
    });
    if (group) choice.options.find((g) => g.id === groupId).sessionIds.push(id);
    else o.sharedSessionIds.push(id);
  }
}
// Undated assessments remain unknown; a supporting lecture is not evidence of an exam offering.
for (const o of offerings) {
  for (const c of components.filter((c) => c.moduleId === o.moduleId))
    if (!o.componentAvailability.some((x) => x.componentId === c.id))
      o.componentAvailability.push({ componentId: c.id, state: "unknown" });
}
const weeks = [];
for (
  let d = new Date("2025-10-06T00:00:00Z");
  d < new Date("2026-02-02T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 7)
)
  weeks.push(d.toISOString().slice(0, 10));
const term = {
  id: "2025-ws",
  version: "legacy-public-v1",
  label: {
    en: "WS 2025/26 · Historical timetable",
    de: "WS 2025/26 · Historischer Stundenplan",
  },
  timezone: "Europe/Berlin",
  start: "2025-10-06",
  endExclusive: "2026-02-02",
  teachingWeekStarts: weeks,
  breaks: [],
  publication: "historical",
  evidence: ev,
};
write("data/terms/2025-ws/term.json", term);
write("data/terms/2025-ws/offerings.json", offerings);
write("data/terms/2025-ws/sessions.json", sessions);
write("data/migration/legacy-code-map.json", crosswalk);
write("data/migration/reconciliation.json", reconciliation);
const packageData = {
  term,
  curriculumVersion: curriculum.version,
  offerings,
  sessions,
  issues: [],
};
write("public/data/2025-ws.json", packageData);
write("data/terms/index.json", [
  {
    id: "2026-ws",
    label: {
      en: "WS 2026/27 · Timetable unavailable",
      de: "WS 2026/27 · Stundenplan nicht verfügbar",
    },
    status: "unavailable",
  },
  {
    id: "2025-ws",
    label: term.label,
    status: "published",
    version: term.version,
    packageUrl: "/data/2025-ws.json",
    sha256: crypto
      .createHash("sha256")
      .update(fs.readFileSync("public/data/2025-ws.json"))
      .digest("hex"),
  },
]);
console.log(
  `Migrated ${blocks.length} public rows, ${byCode.size} codes, ${modules.length} modules; ${reconciliation.length} dated overlap review cases.`,
);
