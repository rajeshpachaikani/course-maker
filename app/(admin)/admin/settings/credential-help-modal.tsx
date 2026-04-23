"use client";

import { useEffect, useRef } from "react";
import type { CredentialGuide } from "./credential-guides";

export function CredentialHelpModal({
  open,
  onClose,
  guide,
  label,
}: {
  open: boolean;
  onClose: () => void;
  guide: CredentialGuide;
  label: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const handleClose = () => onClose();
    dlg.addEventListener("close", handleClose);
    return () => dlg.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      style={{
        padding: 0,
        border: "1px solid var(--hair)",
        borderRadius: "var(--radius-lg)",
        background: "var(--paper-2)",
        color: "var(--ink)",
        maxWidth: 560,
        width: "92vw",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
            <div className="mono-label" style={{ fontSize: 10 }}>
              — How to generate
            </div>
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: 20,
                margin: "4px 0 0",
                fontWeight: 600,
                color: "var(--ink)",
              }}
            >
              {label}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="btn btn-ghost"
            style={{ fontSize: 16, padding: "4px 10px", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        <ol
          style={{
            margin: 0,
            paddingLeft: 20,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontSize: 13.5,
            lineHeight: 1.55,
            color: "var(--ink-2)",
          }}
        >
          {guide.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>

        {guide.warning ? (
          <div
            style={{
              marginTop: 16,
              padding: "10px 12px",
              borderRadius: "var(--radius-sm)",
              background: "color-mix(in oklab, var(--danger) 12%, transparent)",
              border: "1px solid color-mix(in oklab, var(--danger) 35%, transparent)",
              color: "var(--ink)",
              fontSize: 12.5,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "var(--danger)" }}>Security: </strong>
            {guide.warning}
          </div>
        ) : null}

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {guide.docUrl ? (
            <a
              href={guide.docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost"
              style={{ fontSize: 12 }}
            >
              Official docs ↗
            </a>
          ) : null}
          {guide.dashboardUrl ? (
            <a
              href={guide.dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ink"
              style={{ fontSize: 12 }}
            >
              Open dashboard ↗
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{ fontSize: 12 }}
          >
            Got it
          </button>
        </div>
      </div>
    </dialog>
  );
}
