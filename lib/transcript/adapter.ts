import type {
  AcademicAlias,
  Curriculum,
  TextItem,
  ImportProposal,
  ComponentStatus,
} from "@/lib/domain/types";
const normal = (text: string) =>
  text.normalize("NFKC").replace(/\s+/g, " ").trim();
export function textLines(items: TextItem[]) {
  const rows: { page: number; y: number; items: TextItem[] }[] = [];
  for (const item of [...items].sort(
    (a, b) => a.page - b.page || b.y - a.y || a.x - b.x,
  )) {
    let row = rows.find(
      (r) => r.page === item.page && Math.abs(r.y - item.y) < 3,
    );
    if (!row) {
      row = { page: item.page, y: item.y, items: [] };
      rows.push(row);
    }
    row.items.push(item);
  }
  return rows.map((r) => ({
    page: r.page,
    text: normal(
      r.items
        .sort((a, b) => a.x - b.x)
        .map((x) => x.text)
        .join(" "),
    ),
  }));
}
export function detectStatus(text: string): ComponentStatus | null {
  if (/\b(nicht bestanden|not passed|failed|NB|ENB)\b/i.test(text))
    return "failed";
  if (/\b(bestanden|passed|BE)\b/i.test(text)) return "passed";
  if (/\b(angemeldet|registered|AN)\b/i.test(text)) return "registered";
  if (/\b(in progress|in bearbeitung)\b/i.test(text)) return "in_progress";
  return null;
}
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
export function parseTranscript(
  items: TextItem[],
  c: Curriculum,
  aliases: AcademicAlias[],
): ImportProposal[] {
  const proposals: ImportProposal[] = [];
  for (const [index, line] of textLines(items).entries()) {
    const matches = aliases
      .filter(
        (a) =>
          a.curriculumVersion === c.version &&
          new RegExp(
            "(?<![A-Za-z0-9])" + escape(a.value) + "(?![A-Za-z0-9])",
            "i",
          ).test(line.text),
      )
      .sort((a, b) => b.value.length - a.value.length);
    const status = detectStatus(line.text);
    let componentId: string | null = null,
      moduleId: string | null = null,
      confidence = 0;
    const reasons: string[] = [];
    if (matches.length) {
      const longest = matches[0].value.length,
        targets = [
          ...new Set(
            matches
              .filter((a) => a.value.length === longest)
              .map((a) =>
                a.target.kind === "component"
                  ? a.target.componentId
                  : "module:" + a.target.moduleId,
              ),
          ),
        ];
      if (targets.length === 1 && matches[0].target.kind === "component") {
        componentId = matches[0].target.componentId;
        moduleId =
          c.components.find((x) => x.id === componentId)?.moduleId || null;
        confidence = matches[0].scope === "official_code" ? 95 : 85;
        reasons.push("exact_code");
      } else reasons.push("ambiguous_code");
    }
    if (!componentId) {
      const modules = c.modules.filter((m) =>
        [...m.officialCodes, ...m.aliases, m.name.en, m.name.de].some(
          (a) =>
            a.length > 3 &&
            new RegExp(
              "(?<![A-Za-z0-9])" + escape(a) + "(?![A-Za-z0-9])",
              "i",
            ).test(line.text),
        ),
      );
      if (modules.length === 1) {
        moduleId = modules[0].id;
        const kinds = [
          "lab",
          "exercise",
          "exam",
          "project",
          "presentation",
          "case_study",
          "other_pvl",
        ];
        const hints: { [key: string]: RegExp } = {
          lab: /\b(lab|labor)\b/i,
          exercise: /\b(exercise|übung|uebung)\b/i,
          exam: /\b(exam|prüfung|pruefung|klausur|written examination)\b/i,
          project: /\b(project|projekt)\b/i,
          presentation: /\b(presentation|präsentation)\b/i,
        };
        const candidates = modules[0].componentIds.filter((id) => {
          const comp = c.components.find((x) => x.id === id)!;
          return kinds.includes(comp.kind) && hints[comp.kind]?.test(line.text);
        });
        if (candidates.length === 1) {
          componentId = candidates[0];
          confidence = 65;
          reasons.push("name_and_kind");
        } else {
          confidence = 40;
          reasons.push("module_only_review_required");
        }
      }
    }
    if (!moduleId && !matches.length) continue;
    if (!status) {
      confidence = Math.min(confidence, 40);
      reasons.push("status_missing");
    }
    const grade = line.text.match(
      /(?:\b(?:grade|note)\s*[:=]?\s*|\s)([1-5][.,]\d)(?=\s|$)/i,
    )?.[1];
    proposals.push({
      rowId: "row-" + line.page + "-" + index,
      componentId,
      moduleId,
      proposedStatus: status,
      ...(grade ? { grade } : {}),
      confidence,
      reasonCodes: reasons,
      sourcePage: line.page,
      sourceLine: line.text,
      resolution: "review",
    });
  }
  const duplicate = new Set(
    proposals
      .map((x) => x.componentId)
      .filter((id, i, all) => id && all.indexOf(id) !== i),
  );
  for (const p of proposals)
    if (duplicate.has(p.componentId)) {
      p.confidence = Math.min(40, p.confidence);
      p.reasonCodes.push("duplicate_or_conflicting_rows");
    }
  return proposals;
}
