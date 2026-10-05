import type { Occurrence, SessionSeries, Conflict } from "@/lib/domain/types";
export const overlapMinutes = (a: Occurrence, b: Occurrence) =>
  a.date === b.date &&
  a.startMinute < b.endMinute &&
  b.startMinute < a.endMinute
    ? Math.min(a.endMinute, b.endMinute) -
      Math.max(a.startMinute, b.startMinute)
    : 0;
export function detectConflicts(sessions: SessionSeries[]): Conflict[] {
  const conflicts: Conflict[] = [],
    seen = new Set<string>(),
    days = new Map<string, { s: SessionSeries; o: Occurrence }[]>();
  for (const s of sessions)
    for (const o of s.occurrences) {
      if (seen.has(o.id)) continue;
      seen.add(o.id);
      const day = days.get(o.date) || [];
      day.push({ s, o });
      days.set(o.date, day);
    }
  for (const day of days.values()) {
    day.sort((a, b) => a.o.startMinute - b.o.startMinute);
    for (let i = 0; i < day.length; i++)
      for (
        let j = i + 1;
        j < day.length && day[j].o.startMinute < day[i].o.endMinute;
        j++
      ) {
        const a = day[i],
          b = day[j],
          minutes = overlapMinutes(a.o, b.o);
        if (minutes)
          conflicts.push({
            occurrenceA: a.o.id,
            occurrenceB: b.o.id,
            date: a.o.date,
            overlapMinutes: minutes,
            severity:
              a.s.attendance === "unknown" || b.s.attendance === "unknown"
                ? "uncertain"
                : a.s.attendance === "mandatory" &&
                    b.s.attendance === "mandatory"
                  ? "hard"
                  : "soft",
          });
      }
  }
  return conflicts;
}
export function isoMonday(date: string) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
export function unionIntervals(
  intervals: [number, number][],
): [number, number][] {
  const out: [number, number][] = [];
  for (const [start, end] of [...intervals].sort((a, b) => a[0] - b[0])) {
    const last = out[out.length - 1];
    if (last && start <= last[1]) last[1] = Math.max(last[1], end);
    else out.push([start, end]);
  }
  return out;
}
