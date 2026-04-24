"use client";

import { useActionState } from "react";
import { testSmtpAction } from "./actions";

export function SmtpTestPanel() {
  const [result, action, isPending] = useActionState(testSmtpAction, null);

  return (
    <div
      style={{
        borderTop: "1px dotted var(--hair-2)",
        paddingTop: 16,
        marginTop: 4,
      }}
    >
      <div className="mono-label" style={{ fontSize: 10, marginBottom: 10 }}>
        — TEST CONFIGURATION
      </div>
      <form action={action} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          type="email"
          name="to"
          required
          placeholder="recipient@example.com"
          style={{
            flex: "1 1 200px",
            padding: "8px 12px",
            border: "1px solid var(--hair)",
            borderRadius: "var(--radius-sm)",
            background: "var(--paper-3)",
            fontSize: 13,
            color: "var(--ink)",
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-ghost"
          style={{ whiteSpace: "nowrap" }}
        >
          {isPending ? "Sending…" : "Send test email"}
        </button>
        {result && (
          <span
            role="status"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: result.ok ? "var(--success)" : "var(--danger)",
            }}
          >
            {result.message}
          </span>
        )}
      </form>
    </div>
  );
}
