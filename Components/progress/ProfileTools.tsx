"use client";
import { useState } from "react";
import { useApp } from "@/Components/app/Providers";
import { Modal } from "@/Components/app/Modal";
import { curriculum } from "@/lib/data/loaders";
import { parseEnvelope } from "@/lib/domain/schemas";
import { downloadFile } from "@/lib/download";
import type { ExportEnvelope } from "@/lib/domain/types";
export function ProfileTools() {
  const { profile, update, reset, t, mt } = useApp(),
    [pending, setPending] = useState<ExportEnvelope | null>(null),
    [error, setError] = useState(false),
    [clearing, setClearing] = useState(false);
  return (
    <section className="panel profile-tools">
      <h2>{t("profile.tools")}</h2>
      <div className="button-row">
        <button
          className="button"
          onClick={() =>
            downloadFile(
              JSON.stringify(
                {
                  format: "schedulehaw-profile",
                  schemaVersion: 1,
                  exportedAt: new Date().toISOString(),
                  profile,
                },
                null,
                2,
              ),
              "schedulehaw-profile.json",
            )
          }
        >
          {t("profile.export")}
        </button>
        <label className="button file-button">
          {t("profile.import")}
          <input
            aria-label={t("profile.import")}
            type="file"
            accept="application/json,.json"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                if (f.size > 5 * 1024 * 1024) throw new Error("large");
                setPending(parseEnvelope(await f.text(), curriculum));
                setError(false);
              } catch {
                setError(true);
              }
              e.target.value = "";
            }}
          />
        </label>
        <button className="button danger" onClick={() => setClearing(true)}>
          {t("profile.clear")}
        </button>
      </div>
      {error && <p role="alert">{t("profile.invalid")}</p>}
      {pending && (
        <Modal title={t("profile.review")} onClose={() => setPending(null)}>
          <p>{t("profile.diff")}</p>
          <dl className="stats">
            <div>
              <dt>{t("common.modules")}</dt>
              <dd>
                {
                  new Set(
                    pending.profile.progress.map(
                      (p) => p.componentId.split(".")[0],
                    ),
                  ).size
                }
              </dd>
            </div>
            <div>
              <dt>{t("common.semester")}</dt>
              <dd>
                {profile.subjectSemester} → {pending.profile.subjectSemester}
              </dd>
            </div>
          </dl>
          <ul className="diff-list">
            {pending.profile.progress.map((r) => (
              <li key={r.componentId}>
                <strong>{r.componentId}</strong>
                <span>
                  {profile.progress.find((x) => x.componentId === r.componentId)
                    ? mt(
                        "status." +
                          profile.progress.find(
                            (x) => x.componentId === r.componentId,
                          )!.status,
                      )
                    : t("common.unknown")}{" "}
                  → {mt("status." + r.status)}
                </span>
              </li>
            ))}
          </ul>
          <button
            className="button primary"
            onClick={async () => {
              try {
                await update((p) => ({
                  ...pending.profile,
                  revision: p.revision,
                }));
                setPending(null);
              } catch {
                setError(true);
              }
            }}
          >
            {t("profile.replace")}
          </button>
        </Modal>
      )}
      {clearing && (
        <Modal title={t("profile.clear")} onClose={() => setClearing(false)}>
          <p>{t("profile.clearConfirm")}</p>
          <button
            className="button danger"
            onClick={async () => {
              await reset();
              setClearing(false);
            }}
          >
            {t("common.confirm")}
          </button>
        </Modal>
      )}
    </section>
  );
}
