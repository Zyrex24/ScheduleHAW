import type {
  Preferences,
  SessionSeries,
  Term,
  ScheduleMetrics,
} from "@/lib/domain/types";
import { detectConflicts, isoMonday, unionIntervals } from "./overlap";
export function scheduleMetrics(
  sessions: SessionSeries[],
  term: Term,
): ScheduleMetrics {
  const conflicts = detectConflicts(sessions),
    byDate = new Map<
      string,
      { intervals: [number, number][]; campus: [number, number][] }
    >();
  const seen = new Set<string>();
  for (const s of sessions)
    for (const o of s.occurrences) {
      if (seen.has(o.id)) continue;
      seen.add(o.id);
      const d = byDate.get(o.date) || { intervals: [], campus: [] };
      d.intervals.push([o.startMinute, o.endMinute]);
      if (s.delivery === "campus") d.campus.push([o.startMinute, o.endMinute]);
      byDate.set(o.date, d);
    }
  const weeklyContactMinutes: Record<string, number> = Object.fromEntries(
    term.teachingWeekStarts
      .filter(
        (w) => !term.breaks.some((b) => w >= b.start && w < b.endExclusive),
      )
      .map((w) => [w, 0]),
  );
  let longest = 0,
    idle = 0,
    fragmentation = 0,
    total = 0;
  const campusDates: string[] = [],
    heavyDates: string[] = [];
  for (const [date, raw] of byDate) {
    const intervals = unionIntervals(raw.intervals),
      campus = unionIntervals(raw.campus),
      contact = intervals.reduce((n, [a, b]) => n + b - a, 0);
    total += contact;
    const week = isoMonday(date);
    weeklyContactMinutes[week] = (weeklyContactMinutes[week] || 0) + contact;
    let span = 0;
    if (campus.length) {
      campusDates.push(date);
      span = campus[campus.length - 1][1] - campus[0][0];
      longest = Math.max(longest, span);
      idle += span - campus.reduce((n, [a, b]) => n + b - a, 0);
      for (let i = 1; i < campus.length; i++)
        if (campus[i][0] - campus[i - 1][1] >= 90) fragmentation++;
    }
    if (contact > 360 || span > 600) heavyDates.push(date);
  }
  return {
    hardConflicts: conflicts.filter((x) => x.severity === "hard").length,
    softConflicts: conflicts.filter((x) => x.severity === "soft").length,
    overlappingPairs: conflicts.length,
    campusDates: campusDates.sort(),
    heavyDates: heavyDates.sort(),
    heavyWeekStarts: Object.keys(weeklyContactMinutes)
      .filter((w) => weeklyContactMinutes[w] > 1200)
      .sort(),
    longestCampusDayMinutes: longest,
    idleMinutes: idle,
    fragmentation,
    weeklyContactMinutes,
    activeWeeks: Object.values(weeklyContactMinutes).filter((n) => n > 0)
      .length,
    contactMinutes: total,
  };
}
export function scheduleCost(
  m: ScheduleMetrics,
  p: Preferences,
  sessions: SessionSeries[] = [],
) {
  const values = Object.values(m.weeklyContactMinutes),
    mean = values.reduce((n, x) => n + x, 0) / (values.length || 1),
    variance =
      values.reduce((n, x) => n + (x - mean) ** 2, 0) / (values.length || 1);
  let cost =
    p.scheduleStyle === "even"
      ? Math.round(variance / 3600)
      : 100 * m.activeWeeks + 20 * m.campusDates.length;
  cost +=
    50 * m.heavyWeekStarts.length +
    5 * m.heavyDates.length +
    Math.ceil(m.idleMinutes / 30) +
    5 * m.fragmentation;
  if (p.campus === "fewer_days") cost += 20 * m.campusDates.length;
  for (const s of sessions)
    for (const o of s.occurrences) {
      const weekday =
        ((new Date(o.date + "T12:00:00Z").getUTCDay() + 6) % 7) + 1;
      if (p.avoidBeforeMinute !== null && o.startMinute < p.avoidBeforeMinute)
        cost += 10;
      if (p.avoidAfterMinute !== null && o.endMinute > p.avoidAfterMinute)
        cost += 10;
      if (p.avoidWeekdays.includes(weekday)) cost += 10;
    }
  cost += detectConflicts(sessions)
    .filter((c) => c.severity === "soft")
    .reduce(
      (n, c) =>
        n + c.overlapMinutes * { high: 10, medium: 4, low: 1 }[p.lectures],
      0,
    );
  return Math.min(100000, cost);
}
