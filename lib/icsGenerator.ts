import { Temporal } from "@js-temporal/polyfill";
import type {
  Curriculum,
  Locale,
  SessionSeries,
  TermDataset,
} from "@/lib/domain/types";
import { curriculum, historicalDataset } from "@/lib/data/loaders";
import type { ScheduleBlockType } from "@/Entities/ScheduleBlock";
import { downloadFile } from "@/lib/download";
import { translate, dynamicKey } from "@/lib/i18n";
const escape = (text: string) =>
  text
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function foldLine(line: string) {
  const out: string[] = [];
  let part = "",
    bytes = 0;
  for (const char of line) {
    const size = new TextEncoder().encode(char).length;
    if (bytes + size > 75) {
      out.push(part);
      part = " ";
      bytes = 1;
    }
    part += char;
    bytes += size;
  }
  out.push(part);
  return out.join("\r\n");
}
export function berlinUTC(date: string, minute: number) {
  const day = Temporal.PlainDate.from(date).add({
      days: Math.floor(minute / 1440),
    }),
    time = Temporal.PlainTime.from({
      hour: Math.floor((minute % 1440) / 60),
      minute: minute % 60,
    });
  return day
    .toZonedDateTime({ timeZone: "Europe/Berlin", plainTime: time })
    .toInstant()
    .toString({ smallestUnit: "second" })
    .replace(/[-:]/g, "");
}
export function generateCalendar(
  sessions: SessionSeries[],
  dataset: TermDataset,
  c: Curriculum,
  locale: Locale = "en",
  stamp = new Date().toISOString(),
) {
  const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//ScheduleHAW//Local Planner V2//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-TIMEZONE:Europe/Berlin",
      "X-WR-CALNAME:" + escape("ScheduleHAW · " + dataset.term.label[locale]),
    ],
    seen = new Set<string>();
  for (const series of [...sessions].sort((a, b) => a.id.localeCompare(b.id))) {
    const offering = dataset.offerings.find((o) => o.id === series.offeringId),
      academicModule = c.modules.find((m) => m.id === offering?.moduleId);
    for (const o of [...series.occurrences].sort((a, b) =>
      a.date.localeCompare(b.date),
    )) {
      if (seen.has(o.id)) continue;
      seen.add(o.id);
      if (o.date < dataset.term.start || o.date >= dataset.term.endExclusive)
        throw new Error("DATE_OUTSIDE_TERM");
      lines.push(
        "BEGIN:VEVENT",
        "UID:" +
          encodeURIComponent(dataset.term.id + "-" + o.id) +
          "@schedulehaw.ahulir.com",
        "DTSTAMP:" + stamp.replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z"),
        "DTSTART:" + berlinUTC(o.date, o.startMinute),
        "DTEND:" + berlinUTC(o.date, o.endMinute),
        "SUMMARY:" +
          escape(
            (academicModule?.name[locale] || series.id) +
              " · " +
              translate(locale, dynamicKey("kind." + series.kind)),
          ),
        "LOCATION:" + escape(series.location),
        "DESCRIPTION:" +
          escape(
            [
              series.instructors.join(", "),
              dataset.term.label[locale],
              series.id,
            ]
              .filter(Boolean)
              .join("\n"),
          ),
        "END:VEVENT",
      );
    }
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}
// Archived component compatibility. All dates come from the explicit historical package.
export function generateICS(blocks: ScheduleBlockType[]) {
  const codes = new Set(blocks.map((b) => b.code));
  return generateCalendar(
    historicalDataset.sessions.filter((s) =>
      codes.has((s as SessionSeries & { sourceCode: string }).sourceCode),
    ),
    historicalDataset,
    curriculum,
  );
}
export function downloadICS(
  blocks: ScheduleBlockType[],
  filename = "ScheduleHAW.ics",
) {
  downloadFile(generateICS(blocks), filename, "text/calendar;charset=utf-8");
}
