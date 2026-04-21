"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { reorderModulesAction } from "../actions";

interface ModuleItem {
  id: string;
  title: string;
  position: number;
  lessons: Array<{ id: string }>;
}

export function ModuleList({
  courseId,
  modules,
}: {
  courseId: string;
  modules: ModuleItem[];
}) {
  const [items, setItems] = useOptimistic<ModuleItem[], ModuleItem[]>(
    modules,
    (_, next) => next,
  );
  const [pending, start] = useTransition();

  function move(index: number, delta: number) {
    const next = items.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    start(async () => {
      setItems(next);
      await reorderModulesAction(
        courseId,
        next.map((m) => m.id),
      );
    });
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          background: "var(--paper-2)",
          border: "1px dashed var(--hair-2)",
          borderRadius: "var(--radius-lg)",
          padding: 36,
          textAlign: "center",
          color: "var(--ink-3)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: 18,
            color: "var(--ink-2)",
            marginBottom: 4,
          }}
        >
          No modules yet.
        </div>
        <div className="mono-label" style={{ fontSize: 10 }}>
          Add one above to start structuring your course.
        </div>
      </div>
    );
  }

  return (
    <ul
      aria-busy={pending}
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      {items.map((m, i) => (
        <li key={m.id}>
          <div className="module-section-header">
            <span
              style={{
                fontFamily: "var(--serif)",
                fontStyle: "italic",
                fontSize: 28,
                color: "var(--ink-3)",
                fontWeight: 500,
                minWidth: 38,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h4>{m.title}</h4>
            <span className="mono-label">
              {m.lessons.length} {m.lessons.length === 1 ? "LESSON" : "LESSONS"}
            </span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0 || pending}
                aria-label="Move up"
                className="btn btn-ghost"
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  opacity: i === 0 ? 0.3 : 1,
                }}
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1 || pending}
                aria-label="Move down"
                className="btn btn-ghost"
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  opacity: i === items.length - 1 ? 0.3 : 1,
                }}
              >
                ↓
              </button>
              <Link
                href={
                  `/admin/courses/${courseId}/modules/${m.id}` as `/admin/courses/${string}/modules/${string}`
                }
                className="btn btn-ghost"
                style={{ padding: "4px 12px", fontSize: 12 }}
              >
                Edit →
              </Link>
            </div>
          </div>
          <Link
            href={
              `/admin/courses/${courseId}/modules/${m.id}` as `/admin/courses/${string}/modules/${string}`
            }
            className="lesson-row"
            style={{
              textDecoration: "none",
              gridTemplateColumns: "40px 1fr auto",
            }}
          >
            <div className="lesson-thumb-sm bg-plum">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div>
              <div className="lesson-row-title">{m.title}</div>
              <div className="lesson-row-meta">
                {m.lessons.length}{" "}
                {m.lessons.length === 1 ? "LESSON" : "LESSONS"} · CLICK TO
                MANAGE
              </div>
            </div>
            <span className="mono-label" style={{ fontSize: 10 }}>
              EDIT →
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
