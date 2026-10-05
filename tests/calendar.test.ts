import { it, expect } from "vitest";
import ICAL from "ical.js";
import { recoveryInput, session } from "./fixture";
import { generateCalendar, berlinUTC, foldLine } from "@/lib/icsGenerator";
it("exports actual future dates, stable UIDs and Berlin DST independently of host timezone", () => {
  const i = recoveryInput(),
    s = session("utf8", "2026-10-19", 490, 685);
  s.location = "Hörsaal, BT7; Gebäude\nRaum";
  const calendar = generateCalendar(
      [s, s],
      i.dataset,
      i.curriculum,
      "de",
      "2026-10-05T12:34:56.123Z",
    ),
    root = new ICAL.Component(ICAL.parse(calendar)),
    events = root.getAllSubcomponents("vevent");
  expect(events).toHaveLength(1);
  const event = new ICAL.Event(events[0]);
  expect(event.startDate.toString()).toBe("2026-10-19T06:10:00Z");
  expect(event.endDate.toString()).toBe("2026-10-19T09:25:00Z");
  expect(event.location).toBe(s.location);
  expect(events[0].getFirstPropertyValue("dtstamp")!.toString()).toBe(
    "2026-10-05T12:34:56Z",
  );
  expect(calendar.replace(/\r\n/g, "")).not.toContain("\n");
  expect(berlinUTC("2026-10-26", 490)).toBe("20261026T071000Z");
  expect(generateCalendar([s], i.dataset, i.curriculum)).toContain(
    events[0].getFirstPropertyValue("uid"),
  );
});
it("folds long unicode at 75 octets, preserves text and rejects dates outside term", () => {
  const text = "DESCRIPTION:" + "ÄÖü → ".repeat(30),
    folded = foldLine(text);
  for (const line of folded.split("\r\n"))
    expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
  expect(folded.replace(/\r\n /g, "")).toBe(text);
  const i = recoveryInput();
  expect(() =>
    generateCalendar(
      [session("bad", "2027-10-05", 490, 600)],
      i.dataset,
      i.curriculum,
    ),
  ).toThrow("DATE_OUTSIDE_TERM");
});
