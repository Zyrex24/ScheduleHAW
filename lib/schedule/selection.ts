import type { ScheduleSelection, TermDataset } from "@/lib/domain/types";
export function resolveSelection(
  selection: ScheduleSelection,
  dataset: TermDataset,
) {
  if (
    selection.termId !== dataset.term.id ||
    selection.termVersion !== dataset.term.version
  )
    throw new Error("TERM_VERSION_MISMATCH");
  const known = new Map(dataset.sessions.map((s) => [s.id, s]));
  if (selection.sessionIds.some((id) => !known.has(id)))
    throw new Error("UNKNOWN_SESSION");
  return [...new Set(selection.sessionIds)].map((id) => known.get(id)!);
}
export function manualSelection(
  moduleIds: string[],
  preferredGroups: string[],
  lectures: boolean,
  dataset: TermDataset,
  revision: number,
): ScheduleSelection {
  const groupIds: string[] = [],
    sessionIds: string[] = [];
  for (const id of [...new Set(moduleIds)]) {
    const offering = dataset.offerings.find((o) => o.moduleId === id);
    if (!offering) continue;
    sessionIds.push(
      ...offering.sharedSessionIds.filter(
        (id) =>
          lectures ||
          dataset.sessions.find((s) => s.id === id)?.kind !== "lecture",
      ),
    );
    for (const choice of offering.groupChoices) {
      const choices = choice.options.filter(
        (g) =>
          lectures ||
          g.sessionIds.some(
            (id) =>
              dataset.sessions.find((s) => s.id === id)?.kind !== "lecture",
          ),
      );
      const group =
        choices.find((g) => preferredGroups.includes(g.id)) ||
        choices.find(
          (g) =>
            !g.sessionIds.some(
              (id) =>
                (
                  dataset.sessions.find((s) => s.id === id) as {
                    quarantinedDates?: string[];
                  }
                )?.quarantinedDates?.length,
            ),
        ) ||
        choices[0];
      if (group) {
        groupIds.push(group.id);
        sessionIds.push(...group.sessionIds);
      }
    }
  }
  return {
    termId: dataset.term.id,
    termVersion: dataset.term.version,
    revision,
    planId: null,
    actions: moduleIds.map((moduleId) => ({
      moduleId,
      componentIds: [],
      mode: "complete_remaining",
      includeOptionalLectures: lectures,
    })),
    groupIds,
    sessionIds: [...new Set(sessionIds)],
  };
}
