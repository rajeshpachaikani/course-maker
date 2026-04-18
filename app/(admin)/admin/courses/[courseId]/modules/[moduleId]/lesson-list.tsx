"use client";

import { useState, useTransition } from "react";
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
  lessons: initial,
}: {
  courseId: string;
  moduleId: string;
  lessons: LessonItem[];
}) {
  const [items, setItems] = useState(initial);
  const [pending, start] = useTransition();

  function move(index: number, delta: number) {
    const next = items.slice();
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setItems(next);
    start(async () => {
      await reorderLessonsAction(
        courseId,
        moduleId,
        next.map((l) => l.id),
      );
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--cf-radius)] border border-dashed border-[var(--cf-border)] p-6 text-center text-sm text-[var(--cf-muted-fg)]">
        No lessons yet. Add one above.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2" aria-busy={pending}>
      {items.map((l, i) => (
        <li
          key={l.id}
          className="flex items-center gap-3 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] p-3"
        >
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0 || pending}
              aria-label="Move up"
              className="rounded border border-[var(--cf-border)] px-2 py-0.5 text-xs disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1 || pending}
              aria-label="Move down"
              className="rounded border border-[var(--cf-border)] px-2 py-0.5 text-xs disabled:opacity-30"
            >
              ↓
            </button>
          </div>
          <div className="flex-1">
            <Link
              href={
                `/admin/courses/${courseId}/modules/${moduleId}/lessons/${l.id}` as `/admin/courses/${string}/modules/${string}/lessons/${string}`
              }
              className="text-sm font-medium hover:underline"
            >
              {l.title}
            </Link>
            <div className="mt-0.5 text-xs text-[var(--cf-muted-fg)]">
              /{l.slug}
              {l.bunnyVideoId ? " · video" : " · no video"}
              {l.isFreePreview ? " · preview" : ""}
            </div>
          </div>
          <Link
            href={
              `/admin/courses/${courseId}/modules/${moduleId}/lessons/${l.id}` as `/admin/courses/${string}/modules/${string}/lessons/${string}`
            }
            className="text-xs text-[var(--cf-muted-fg)] hover:text-[var(--cf-fg)]"
          >
            Edit →
          </Link>
        </li>
      ))}
    </ul>
  );
}
