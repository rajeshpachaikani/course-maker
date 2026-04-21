"use client";

import { deleteCourseAction } from "./actions";

export function DeleteCourseButton({ id, title }: { id: string; title: string }) {
  return (
    <form
      action={deleteCourseAction}
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="btn btn-ghost"
        style={{
          padding: "5px 10px",
          fontSize: 11,
          color: "var(--ink-3)",
        }}
      >
        Delete
      </button>
    </form>
  );
}
