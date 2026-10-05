"use client";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/Components/app/Providers";
import { curriculum, academicAliases } from "@/lib/data/loaders";
import { parseTranscript } from "@/lib/transcript/adapter";
import type { ImportProposal, ComponentStatus } from "@/lib/domain/types";
import { Modal } from "@/Components/app/Modal";
export function TranscriptImport() {
  const { profile, update, t, mt, locale } = useApp(),
    [rows, setRows] = useState<ImportProposal[] | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<"empty" | "error" | null>(null),
    abort = useRef<AbortController | undefined>(undefined);
  useEffect(() => () => abort.current?.abort(), []);
  const change = (id: string, patch: Partial<ImportProposal>) =>
    setRows((rows) =>
      rows!.map((row) => (row.rowId === id ? { ...row, ...patch } : row)),
    );
  const accepted = rows?.filter((x) => x.resolution === "accepted") || [],
    duplicate = accepted.some(
      (x, index) =>
        accepted.findIndex((y) => y.componentId === x.componentId) !== index,
    ),
    valid =
      accepted.length > 0 &&
      !duplicate &&
      accepted.every((x) => x.componentId && x.proposedStatus);
  return (
    <section className="panel">
      <h2>{t("import.title")}</h2>
      <span className="badge needs_review">{t("import.preview")}</span>
      <p>{t("import.note")}</p>
      <label className="button file-button">
        {t("import.file")}
        <input
          type="file"
          aria-label={t("import.file")}
          accept="application/pdf,.pdf"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            abort.current?.abort();
            const controller = new AbortController();
            abort.current = controller;
            setBusy(true);
            setError(null);
            try {
              const { extractPDF } = await import("@/lib/transcript/pdf");
              const proposals = parseTranscript(
                await extractPDF(file, controller.signal),
                curriculum,
                academicAliases,
              );
              if (!controller.signal.aborted) {
                if (proposals.length) setRows(proposals);
                else setError("empty");
              }
            } catch {
              if (!controller.signal.aborted) setError("error");
            } finally {
              if (abort.current === controller) setBusy(false);
            }
          }}
        />
      </label>
      {busy && (
        <div role="status">
          <p>{t("import.reading")}</p>
          <button
            className="button"
            onClick={() => {
              abort.current?.abort();
              setBusy(false);
            }}
          >
            {t("common.cancel")}
          </button>
        </div>
      )}
      {error && <p role="alert">{mt("import." + error)}</p>}
      {rows && (
        <Modal title={t("import.review")} onClose={() => setRows(null)}>
          <p>{t("import.preview")}</p>
          {rows.map((row) => (
            <article className="import-row" key={row.rowId}>
              <p className="source-line">{row.sourceLine}</p>
              <span className="micro">
                {t("import.confidence")}: {row.confidence}% · p{row.sourcePage}
              </span>
              <label>
                {t("import.component")}
                <select
                  value={row.componentId || ""}
                  onChange={(e) =>
                    change(row.rowId, {
                      componentId: e.target.value,
                      moduleId: curriculum.components.find(
                        (c) => c.id === e.target.value,
                      )!.moduleId,
                      resolution: "review",
                    })
                  }
                >
                  <option value="">{t("import.unmatched")}</option>
                  {curriculum.components.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.moduleId.toUpperCase()} · {mt("common." + c.kind)}{" "}
                      {c.moduleId === "ls" ? c.name[locale] : ""}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("import.status")}
                <select
                  value={row.proposedStatus || ""}
                  onChange={(e) =>
                    change(row.rowId, {
                      proposedStatus: e.target.value as ComponentStatus,
                      resolution: "review",
                    })
                  }
                >
                  <option value="">{t("import.noStatus")}</option>
                  {[
                    "not_started",
                    "registered",
                    "in_progress",
                    "passed",
                    "failed",
                  ].map((status) => (
                    <option key={status} value={status}>
                      {mt("status." + status)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {t("progress.grade")}
                <input
                  maxLength={32}
                  value={row.grade || ""}
                  onChange={(e) =>
                    change(row.rowId, { grade: e.target.value || undefined })
                  }
                />
              </label>
              <p className="micro">
                {t("import.change")}:{" "}
                {row.componentId
                  ? mt(
                      "status." +
                        (profile.progress.find(
                          (x) => x.componentId === row.componentId,
                        )?.status || "not_started"),
                    )
                  : t("common.unknown")}{" "}
                →{" "}
                {row.proposedStatus
                  ? mt("status." + row.proposedStatus)
                  : t("common.unknown")}
              </p>
              <div className="button-row">
                <button
                  className={
                    "button " + (row.resolution === "accepted" ? "primary" : "")
                  }
                  onClick={() => change(row.rowId, { resolution: "accepted" })}
                  aria-pressed={row.resolution === "accepted"}
                >
                  {t("import.accept")}
                </button>
                <button
                  className={
                    "button " + (row.resolution === "ignored" ? "active" : "")
                  }
                  onClick={() => change(row.rowId, { resolution: "ignored" })}
                  aria-pressed={row.resolution === "ignored"}
                >
                  {t("import.ignore")}
                </button>
              </div>
            </article>
          ))}
          {duplicate && <p role="alert">{t("import.duplicate")}</p>}
          <button
            className="button primary"
            disabled={!valid}
            onClick={async () => {
              await update((p) => {
                const ids = new Set(accepted.map((x) => x.componentId));
                return {
                  ...p,
                  progress: [
                    ...p.progress.filter((r) => !ids.has(r.componentId)),
                    ...accepted.map((row) => ({
                      componentId: row.componentId!,
                      status: row.proposedStatus!,
                      ...(row.grade ? { grade: row.grade } : {}),
                      source: "confirmed_import" as const,
                      updatedAt: new Date().toISOString(),
                    })),
                  ],
                };
              });
              setRows(null);
            }}
          >
            {t("import.apply")} ({accepted.length})
          </button>
        </Modal>
      )}
    </section>
  );
}
