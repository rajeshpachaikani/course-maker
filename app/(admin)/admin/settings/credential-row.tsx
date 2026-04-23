"use client";

import { useState } from "react";
import {
  saveCredentialAction,
  deleteCredentialAction,
} from "./actions";
import type { CredentialKey } from "@/lib/credentials";
import { CREDENTIAL_GUIDES } from "./credential-guides";
import { CredentialHelpModal } from "./credential-help-modal";

export function CredentialRow({
  credKey,
  label,
  hint,
  isSet,
  updatedAt,
  isFirst,
  status,
}: {
  credKey: CredentialKey;
  label: string;
  hint?: string;
  isSet: boolean;
  updatedAt: string | null;
  isFirst: boolean;
  status?: { ok: boolean; message: string } | null;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const guide = CREDENTIAL_GUIDES[credKey];

  return (
    <div
      id={`cred-${credKey}`}
      style={{
        borderTop: isFirst ? "none" : "1px dotted var(--hair-2)",
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            {label}
            {guide ? (
              <button
                type="button"
                onClick={() => setHelpOpen(true)}
                title={`Where to find ${label}`}
                aria-label={`Where to find ${label}`}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  border: "1px solid var(--hair-2)",
                  background: "transparent",
                  color: "var(--ink-3)",
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ?
              </button>
            ) : null}
          </div>
          {hint ? (
            <div
              className="mono-label"
              style={{ fontSize: 10, marginTop: 3, textTransform: "none" }}
            >
              {hint}
            </div>
          ) : null}
          {guide?.shortHint ? (
            <div
              style={{
                fontSize: 11.5,
                color: "var(--ink-3)",
                marginTop: 3,
                lineHeight: 1.45,
              }}
            >
              {guide.shortHint}
            </div>
          ) : null}
        </div>
        <span
          className={`status ${isSet ? "status-published" : "status-draft"}`}
        >
          {isSet
            ? `Set${updatedAt ? ` · ${new Date(updatedAt).toLocaleDateString()}` : ""}`
            : "Not set"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <form
          action={saveCredentialAction}
          style={{ display: "flex", flex: 1, gap: 8 }}
        >
          <input type="hidden" name="key" value={credKey} />
          <input
            type="password"
            name="value"
            required
            autoComplete="off"
            placeholder={
              isSet ? "•••••• enter new value to rotate" : "Enter value"
            }
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid var(--hair)",
              borderRadius: "var(--radius-sm)",
              background: "var(--paper-3)",
              fontFamily: "var(--mono)",
              fontSize: 13,
              color: "var(--ink)",
            }}
          />
          <button type="submit" className="btn btn-ink">
            {isSet ? "Rotate" : "Save"}
          </button>
        </form>
        {isSet ? (
          <form action={deleteCredentialAction}>
            <input type="hidden" name="key" value={credKey} />
            <button
              type="submit"
              className="btn btn-ghost"
              style={{ fontSize: 12 }}
            >
              Remove
            </button>
          </form>
        ) : null}
      </div>
      {status ? (
        <div
          role="status"
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: status.ok ? "var(--success)" : "var(--danger)",
          }}
        >
          {status.message}
        </div>
      ) : null}
      {guide ? (
        <CredentialHelpModal
          open={helpOpen}
          onClose={() => setHelpOpen(false)}
          guide={guide}
          label={label}
        />
      ) : null}
    </div>
  );
}
