"use client";

import { useTransition, useState } from "react";
import { updateModuleAction } from "../../../actions";

export function ModuleForm({
  courseId,
  module: mod,
}: {
  courseId: string;
  module: { id: string; title: string };
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      setMessage(null);
      try {
        await updateModuleAction(fd);
        setMessage("Saved.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="card"
      style={{
        background: "var(--paper-2)",
        border: "1px solid var(--hair)",
        borderRadius: "var(--radius-lg)",
        padding: 22,
      }}
    >
      <div className="mono-label" style={{ marginBottom: 12 }}>
        — Module details
      </div>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="id" value={mod.id} />
      <div className="field">
        <label>TITLE</label>
        <input type="text" name="title" defaultValue={mod.title} required />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? "Saving…" : "Save module"}
        </button>
        {message ? (
          <span className="mono-label" style={{ fontSize: 11 }}>
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
