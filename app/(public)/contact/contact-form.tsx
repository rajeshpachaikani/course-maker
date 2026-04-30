"use client";

import { useActionState, useRef } from "react";
import { submitContactAction } from "./actions";

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid var(--hair)",
  borderRadius: "var(--radius-sm)",
  background: "var(--paper-3)",
  color: "var(--ink)",
  fontSize: 14,
  boxSizing: "border-box",
};

const TEXTAREA_STYLE: React.CSSProperties = {
  ...INPUT_STYLE,
  minHeight: 140,
  resize: "vertical",
  fontFamily: "inherit",
};

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, action, isPending] = useActionState(
    async (prev: { ok: boolean; message: string } | null, formData: FormData) => {
      const res = await submitContactAction(prev, formData);
      if (res.ok) formRef.current?.reset();
      return res;
    },
    null,
  );

  return (
    <section
      style={{
        marginTop: 40,
        paddingTop: 32,
        borderTop: "1px solid var(--hair)",
      }}
    >
      <div className="mono-label" style={{ marginBottom: 20 }}>
        — SEND US A MESSAGE
      </div>

      {result?.ok ? (
        <div
          style={{
            padding: "18px 20px",
            border: "1px solid var(--hair)",
            borderRadius: "var(--radius-lg)",
            background: "var(--paper-2)",
            fontSize: 14,
            color: "var(--ink)",
          }}
        >
          <span style={{ marginRight: 8 }}>✓</span>
          {result.message}
        </div>
      ) : (
        <form ref={formRef} action={action} noValidate>
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="field">
                <label htmlFor="cm-name">NAME</label>
                <input
                  id="cm-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your name"
                  style={INPUT_STYLE}
                />
              </div>
              <div className="field">
                <label htmlFor="cm-email">EMAIL</label>
                <input
                  id="cm-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  style={INPUT_STYLE}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="cm-subject">SUBJECT</label>
              <input
                id="cm-subject"
                name="subject"
                type="text"
                placeholder="What is this about? (optional)"
                style={INPUT_STYLE}
              />
            </div>

            <div className="field">
              <label htmlFor="cm-message">MESSAGE</label>
              <textarea
                id="cm-message"
                name="message"
                required
                placeholder="Write your message here…"
                style={TEXTAREA_STYLE}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary"
              >
                {isPending ? "Sending…" : "Send message"}
              </button>
              {result && !result.ok && (
                <span
                  role="alert"
                  style={{ fontSize: 13, color: "var(--danger)" }}
                >
                  {result.message}
                </span>
              )}
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
