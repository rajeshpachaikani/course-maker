"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { reorderLessonsAction } from "../../../actions";

interface LessonItem {
  id: string;
  title: string;
  slug: string;
  bunnyVideoId: string | null;
  isFreePreview: boolean;
}

export function LessonList({
  courseId,
  moduleId,
  lessons,
}: {
  courseId: string;
  moduleId: string;
  lessons: LessonItem[];
}) {
  const [items, setItems] = useOptimistic<LessonItem[], LessonItem[]>(
    lessons,
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
      await reorderLessonsAction(
        courseId,
        moduleId,
        next.map((l) => l.id),
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
          No lessons yet.
        </div>
        <div className="mono-label" style={{ fontSize: 10 }}>
          Add one above to start filling this module.
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
      }}
    >
      {items.map((l, i) => (
        <li key={l.id} className="lesson-row">
          <div className="lesson-thumb-sm bg-plum">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div style={{ minWidth: 0 }}>
            <div className="lesson-row-title">
              <Link
                href={
                  `/admin/courses/${courseId}/modules/${moduleId}/lessons/${l.id}` as `/admin/courses/${string}/modules/${string}/lessons/${string}`
                }
                style={{ color: "inherit", textDecoration: "none" }}
              >
                {l.title}
              </Link>
            </div>
            <div className="lesson-row-meta">
              /{l.slug} · {l.bunnyVideoId ? "VIDEO READY" : "NO VIDEO"}
              {l.isFreePreview ? " · FREE PREVIEW" : ""}
            </div>
          </div>
          <span
            className={`status ${l.isFreePreview ? "status-published" : "status-draft"}`}
          >
            {l.isFreePreview ? "Preview" : "Paid"}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0 || pending}
              aria-label="Move up"
              className="btn btn-ghost"
              style={{
                padding: "4px 8px",
                fontSize: 11,
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
                padding: "4px 8px",
                fontSize: 11,
                opacity: i === items.length - 1 ? 0.3 : 1,
              }}
            >
              ↓
            </button>
            <Link
              href={
                `/admin/courses/${courseId}/modules/${moduleId}/lessons/${l.id}` as `/admin/courses/${string}/modules/${string}/lessons/${string}`
              }
              className="btn btn-ghost"
              style={{ padding: "4px 10px", fontSize: 11 }}
            >
              Edit →
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
