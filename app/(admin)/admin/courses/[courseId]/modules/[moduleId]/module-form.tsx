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
      className="flex flex-col gap-4 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6"
    >
      <h2 className="text-lg font-semibold">Module details</h2>
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="id" value={mod.id} />
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Title</span>
        <input
          type="text"
          name="title"
          defaultValue={mod.title}
          required
          className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
        />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="cf-btn-primary">
          {pending ? "Saving…" : "Save module"}
        </button>
        {message ? (
          <span className="text-sm text-[var(--cf-muted-fg)]">{message}</span>
        ) : null}
      </div>
    </form>
  );
}
