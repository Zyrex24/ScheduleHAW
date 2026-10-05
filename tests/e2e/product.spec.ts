import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import ICAL from "ical.js";
import AxeBuilder from "@axe-core/playwright";
async function open(page: Page, path = "/progress", locale = "en") {
  await page.addInitScript((l) => {
    localStorage.setItem("schedulehaw-locale", l);
    localStorage.setItem("schedulehaw-onboarded", "1");
  }, locale);
  await page.goto(path);
  await expect(page.locator("h1")).toBeVisible();
}
async function status(page: Page, code: string, kind: string, value: string) {
  await page.getByRole("searchbox").fill(code);
  await page
    .getByRole("combobox", { name: code + " " + kind, exact: true })
    .selectOption(value);
  await expect(
    page.getByRole("combobox", { name: code + " " + kind, exact: true }),
  ).toHaveValue(value);
}
async function historical(page: Page) {
  await page
    .getByRole("combobox", { name: "Academic term", exact: true })
    .selectOption("2025-ws");
}
test("manual recovery → internship plans → exact schedule → ICS → local backup restoration", async ({
  page,
}) => {
  const mutations: string[] = [],
    errors: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") mutations.push(r.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await page
    .getByRole("button", {
      name: "Mark all unreviewed components as not started",
      exact: true,
    })
    .click();
  await status(page, "MA2", "Exercise", "passed");
  await status(page, "MA2", "Exam", "failed");
  await expect(page.locator("#module-ma2 .badge.exam_only")).toBeVisible();
  for (const code of ["EE1", "SS1", "DI", "AD", "OS"])
    await status(page, code, "Lab", "passed");
  await status(page, "EE1", "Exam", "failed");
  await status(page, "EL2", "Lab", "failed");
  await page
    .getByRole("spinbutton", { name: "Subject semester", exact: true })
    .fill("6");
  await historical(page);
  await page.getByRole("link", { name: "Advisor", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Maximum new labs", exact: true })
    .selectOption("5");
  await page
    .getByRole("combobox", { name: "Main goal", exact: true })
    .selectOption("internship");
  await page
    .getByRole("button", { name: "Generate semester plans", exact: false })
    .click();
  await expect(page.locator(".plan-card")).toHaveCount(3, { timeout: 60000 });
  await page
    .locator(".aggressive")
    .getByText("Explain this plan", { exact: true })
    .click();
  await expect(page.locator(".aggressive .reasons")).not.toHaveCount(0);
  await page.screenshot({
    path: "test-results/advisor-desktop.png",
    fullPage: true,
  });
  await page
    .locator(".aggressive")
    .getByRole("button", { name: "Use this plan", exact: false })
    .click();
  await expect(page).toHaveURL(/\/schedule$/);
  await expect(
    page.getByRole("button", { name: "Export calendar (.ics)", exact: false }),
  ).toBeEnabled();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export calendar (.ics)", exact: false })
    .click();
  const download = await downloadPromise,
    path = await download.path();
  const ics = readFileSync(path!, "utf8"),
    root = new ICAL.Component(ICAL.parse(ics)),
    events = root.getAllSubcomponents("vevent");
  expect(events.length).toBeGreaterThan(0);
  for (const event of events) {
    const date = new ICAL.Event(event).startDate.toString();
    expect(date >= "2025-10-06" && date < "2026-02-02").toBe(true);
  }
  await page.screenshot({
    path: "test-results/schedule-desktop.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "My progress", exact: true }).click();
  const backupPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export academic profile", exact: true })
    .click();
  const backup = await backupPromise;
  const backupPath = (await backup.path())!;
  await page
    .getByRole("button", { name: "Clear local academic data", exact: true })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Confirm", exact: true })
    .click();
  await page.getByRole("searchbox").fill("MA2");
  await expect(
    page.getByRole("combobox", { name: "MA2 Exercise", exact: true }),
  ).toHaveValue("");
  await page
    .getByLabel("Import academic profile", { exact: true })
    .setInputFiles(backupPath);
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Replace with reviewed backup", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "MA2 Exercise", exact: true }),
  ).toHaveValue("passed");
  await page.reload();
  await expect(page.getByRole("searchbox")).toBeVisible();
  await page.getByRole("searchbox").fill("MA2");
  await expect(
    page.getByRole("combobox", { name: "MA2 Exam", exact: true }),
  ).toHaveValue("failed");
  expect(mutations).toEqual([]);
  expect(errors).toEqual([]);
});
function syntheticPDF(lines: string[]) {
  const content =
      "BT /F1 12 Tf 50 750 Td " +
      lines
        .map(
          (line, index) =>
            (index ? "0 -22 Td " : "") +
            "(" +
            line.replace(/[()\\]/g, "\\$&") +
            ") Tj",
        )
        .join("\n") +
      " ET",
    objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      "<< /Length " +
        Buffer.byteLength(content) +
        " >>\nstream\n" +
        content +
        "\nendstream",
    ];
  let text = "%PDF-1.4\n",
    offsets = [0];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(text));
    text += i + 1 + " 0 obj\n" + o + "\nendobj\n";
  });
  const xref = Buffer.byteLength(text);
  text +=
    "xref\n0 6\n0000000000 65535 f \n" +
    offsets
      .slice(1)
      .map((n) => String(n).padStart(10, "0") + " 00000 n \n")
      .join("") +
    "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" +
    xref +
    "\n%%EOF";
  return Buffer.from(text);
}
test("local text PDF extraction → correction → confirmed save → Balanced plan", async ({
  page,
}) => {
  const mutations: string[] = [],
    errors: string[] = [];
  page.on("request", (r) => {
    if (r.method() !== "GET") mutations.push(r.url());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await open(page);
  await page
    .getByLabel("Choose transcript PDF", { exact: true })
    .setInputFiles({
      name: "synthetic-transcript.pdf",
      mimeType: "application/pdf",
      buffer: syntheticPDF([
        "1IE-MAE2.VL BE",
        "1IE-MA2.PL NB Note 5,0",
        "1IE-EEL1.VL BE",
      ]),
    });
  await expect(page.getByRole("dialog")).toBeVisible({ timeout: 30000 });
  await expect(page.locator(".import-row")).toHaveCount(3);
  const second = page.locator(".import-row").nth(1);
  await second
    .getByRole("combobox", { name: "Detected status", exact: true })
    .selectOption("registered");
  for (const row of await page.locator(".import-row").all())
    await row.getByRole("button", { name: "Accept row", exact: true }).click();
  await page
    .getByRole("button", { name: "Apply accepted outcomes", exact: false })
    .click();
  await status(page, "MA2", "Exercise", "passed");
  await expect(
    page.getByRole("combobox", { name: "MA2 Exam", exact: true }),
  ).toHaveValue("registered");
  await historical(page);
  await page.getByRole("link", { name: "Advisor", exact: true }).click();
  await page
    .getByRole("button", { name: "Generate semester plans", exact: false })
    .click();
  await expect(page.locator(".plan-card")).toHaveCount(3, { timeout: 60000 });
  await page
    .locator(".balanced")
    .getByRole("button", { name: "Use this plan", exact: false })
    .click();
  await expect(page).toHaveURL(/\/schedule$/);
  expect(mutations).toEqual([]);
  expect(errors).toEqual([]);
});
test("German mobile flow, direct routes, degree actions and accessibility", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await open(page, "/progress", "de");
  await expect(page.locator("html")).toHaveAttribute("lang", "de");
  await status(page, "MA2", "Übung", "passed");
  await status(page, "MA2", "Prüfung", "failed");
  await page
    .getByRole("combobox", { name: "Semester", exact: true })
    .selectOption("2025-ws");
  await page.getByRole("link", { name: "Studienplanung", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Plane deinen nächsten Schritt.",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Semesterpläne erstellen", exact: false })
    .click();
  await expect(page.locator(".plan-card")).toHaveCount(3, { timeout: 60000 });
  await page
    .locator(".safe")
    .getByRole("button", { name: "Diesen Plan verwenden", exact: false })
    .click();
  await expect(page).toHaveURL(/\/schedule$/);
  await expect(page.locator(".agenda")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/schedule-german-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: "Studienübersicht", exact: true })
    .click();
  await page
    .getByRole("button", { name: /EE2.*Electrical Engineering 2/ })
    .click();
  await expect(page.locator(".module-detail h2")).toHaveText(
    "Electrical Engineering 2",
  );
  await expect(
    page.getByText("Community Pulse ist offline.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Zu Planungsprioritäten hinzufügen",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/advisor$/);
  for (const route of ["/advisor", "/progress", "/schedule", "/degree-map"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      accessibility.violations.filter(
        (v) => v.impact === "critical" || v.impact === "serious",
      ),
    ).toEqual([]);
  }
  await page.goto("/Schedule");
  await expect(page).toHaveURL(/\/schedule$/);
});
test("offline full reload keeps local progress and coherent public assets without private caching", async ({
  page,
  context,
}) => {
  await open(page);
  await status(page, "MA2", "Exercise", "passed");
  const privateMarker = "LOCAL_ACADEMIC_NOTE_8273619";
  const academicRequests: string[] = [];
  page.on("request", (r) => {
    if (
      r.method() !== "GET" ||
      r.url().includes(privateMarker) ||
      new URL(r.url()).pathname.startsWith("/api/")
    )
      academicRequests.push(r.url());
  });
  await page
    .locator("#module-ma2")
    .getByRole("button", { name: "Details", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Notes", exact: false })
    .first()
    .fill(privateMarker);
  await page
    .getByRole("textbox", { name: "Notes", exact: false })
    .first()
    .blur();
  await historical(page);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await expect
    .poll(
      async () => page.evaluate(() => !!navigator.serviceWorker.controller),
      { timeout: 30000 },
    )
    .toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Know where you stand.", exact: true }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("MA2");
  await expect(
    page.getByRole("combobox", { name: "MA2 Exercise", exact: true }),
  ).toHaveValue("passed");
  await page.goto("/advisor");
  await expect(
    page.getByRole("heading", { name: "Make your next move.", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Generate semester plans", exact: false })
    .click();
  await expect(page.locator(".plan-card")).toHaveCount(3, { timeout: 60000 });
  await page
    .locator(".safe")
    .getByRole("button", { name: "Use this plan", exact: false })
    .click();
  await expect(page).toHaveURL(/\/schedule$/);
  const offlineDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export calendar (.ics)", exact: false })
    .click();
  const offlineCalendar = readFileSync(
    (await (await offlineDownload).path())!,
    "utf8",
  );
  expect(
    new ICAL.Component(ICAL.parse(offlineCalendar)).getAllSubcomponents(
      "vevent",
    ).length,
  ).toBeGreaterThan(0);
  const keys = await page.evaluate(async () => {
    const names = await caches.keys();
    const urls = [];
    for (const n of names)
      for (const r of await (await caches.open(n)).keys()) urls.push(r.url);
    return urls;
  });
  expect(
    keys.every(
      (u) =>
        /^\/_next\/static\//.test(new URL(u).pathname) ||
        [
          "/",
          "/advisor",
          "/progress",
          "/schedule",
          "/degree-map",
          "/manifest.webmanifest",
          "/icon.svg",
          "/pdf.worker.min.mjs",
        ].includes(new URL(u).pathname),
    ),
  ).toBe(true);
  expect(
    await page.evaluate(async (marker) => {
      for (const name of await caches.keys()) {
        const cache = await caches.open(name);
        for (const request of await cache.keys()) {
          if ((await (await cache.match(request))!.text()).includes(marker))
            return false;
        }
      }
      return true;
    }, privateMarker),
  ).toBe(true);
  expect(academicRequests).toEqual([]);
  await context.setOffline(false);
});
