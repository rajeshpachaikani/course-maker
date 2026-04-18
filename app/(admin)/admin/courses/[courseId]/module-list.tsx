"use client";

import { useState, useTransition } from "react";
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
  modules: initial,
}: {
  courseId: string;
  modules: ModuleItem[];
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
      await reorderModulesAction(
        courseId,
        next.map((m) => m.id),
      );
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[var(--cf-radius)] border border-dashed border-[var(--cf-border)] p-6 text-center text-sm text-[var(--cf-muted-fg)]">
        No modules yet. Add one above.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2" aria-busy={pending}>
      {items.map((m, i) => (
        <li
          key={m.id}
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
                `/admin/courses/${courseId}/modules/${m.id}` as `/admin/courses/${string}/modules/${string}`
              }
              className="text-sm font-medium hover:underline"
            >
              {m.title}
            </Link>
            <div className="mt-0.5 text-xs text-[var(--cf-muted-fg)]">
              {m.lessons.length} lesson{m.lessons.length === 1 ? "" : "s"}
            </div>
          </div>
          <Link
            href={
              `/admin/courses/${courseId}/modules/${m.id}` as `/admin/courses/${string}/modules/${string}`
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
