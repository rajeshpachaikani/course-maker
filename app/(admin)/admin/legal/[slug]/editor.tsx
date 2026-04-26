"use client";

import { useState, useTransition } from "react";
import { TiptapEditor, type JSONContent } from "@/components/tiptap-editor";
import { saveLegalPageAction } from "../actions";

export function LegalPageEditor({
  slug,
  defaultTitle,
  defaultBody,
  publicRoute,
}: {
  slug: string;
  defaultTitle: string;
  defaultBody: unknown;
  publicRoute: string;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [body, setBody] = useState<JSONContent | null>(
    (defaultBody as JSONContent) ?? null,
  );
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onSave() {
    setMessage(null);
    start(async () => {
      try {
        await saveLegalPageAction(slug, { title, bodyTiptap: body });
        setMessage("Saved.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <section
      className="card"
      style={{
        background: "var(--paper-2)",
        border: "1px solid var(--hair)",
        borderRadius: "var(--radius-lg)",
        padding: 22,
      }}
    >
      <div className="field">
        <label>PAGE TITLE</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="field" style={{ marginTop: 4 }}>
        <label>BODY</label>
        <TiptapEditor
          value={body}
          onChange={setBody}
          placeholder="Write the policy text…"
        />
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="btn btn-primary"
        >
          {pending ? "Saving…" : "Save page"}
        </button>
        <a
          href={publicRoute}
          target="_blank"
          rel="noreferrer"
          className="btn btn-ghost"
        >
          Open public page ↗
        </a>
        {message ? (
          <span className="mono-label" style={{ fontSize: 11 }}>
            {message}
          </span>
        ) : null}
      </div>
    </section>
  );
}
