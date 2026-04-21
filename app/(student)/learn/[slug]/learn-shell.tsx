"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

interface LessonNode {
  id: string;
  slug: string;
  title: string;
  done: boolean;
}

interface ModuleNode {
  id: string;
  title: string;
  lessons: LessonNode[];
}

interface Props {
  courseSlug: string;
  courseTitle: string;
  modules: ModuleNode[];
  totalLessons: number;
  completedCount: number;
  children: React.ReactNode;
}

type Tab = "lessons" | "notes" | "resources";

export function LearnShell({
  courseSlug,
  courseTitle,
  modules,
  totalLessons,
  completedCount,
  children,
}: Props) {
  const [tab, setTab] = useState<Tab>("lessons");
  const pathname = usePathname();
  const progressPct = totalLessons
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  return (
    <div className="player-root">
      <div className="player-bar">
        <div className="player-bar-left">
          <Link
            href={`/courses/${courseSlug}` as Route}
            className="btn btn-ghost"
            style={{ padding: "6px 10px" }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Course
          </Link>
          <div>
            <div className="mono-label">— {courseTitle}</div>
            <div className="course-title">
              {completedCount} / {totalLessons} lessons complete
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div className="player-progress-bar">
            <span>{progressPct}% complete</span>
            <div className="player-progress-bar-track">
              <div
                className="player-progress-bar-fill"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span>
              {completedCount}/{totalLessons}
            </span>
          </div>
          <Link href="/dashboard" className="btn btn-ghost">
            Dashboard
          </Link>
        </div>
      </div>

      <div className="player-main">
        <div className="player-left">{children}</div>

        <div className="player-right">
          <div className="player-tabs" role="tablist">
            <button
              className={`player-tab ${tab === "lessons" ? "active" : ""}`}
              onClick={() => setTab("lessons")}
            >
              All Lessons
            </button>
            <button
              className={`player-tab ${tab === "notes" ? "active" : ""}`}
              onClick={() => setTab("notes")}
            >
              My Notes
            </button>
            <button
              className={`player-tab ${tab === "resources" ? "active" : ""}`}
              onClick={() => setTab("resources")}
            >
              Resources
            </button>
          </div>

          <div className="player-panel">
            {tab === "lessons" && (
              <div className="lessons-list-player">
                {modules.map((m, mi) => (
                  <div key={m.id}>
                    <div className="module-section-header" style={{ padding: "18px 0 6px" }}>
                      <span
                        style={{
                          fontFamily: "var(--serif)",
                          fontStyle: "italic",
                          fontSize: 22,
                          color: "var(--ink-3)",
                          fontWeight: 600,
                        }}
                      >
                        {String(mi + 1).padStart(2, "0")}
                      </span>
                      <h4 style={{ fontStyle: "normal" }}>{m.title}</h4>
                    </div>
                    {m.lessons.map((l, li) => {
                      const href = `/learn/${courseSlug}/${l.slug}` as Route;
                      const isCurrent = pathname === href;
                      return (
                        <Link
                          key={l.id}
                          href={href}
                          className={`lesson ${isCurrent ? "current" : ""} ${l.done ? "done" : ""}`}
                        >
                          <div className="lesson-check">
                            {l.done ? (
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            ) : null}
                          </div>
                          <div>
                            <div className="lesson-title">{l.title}</div>
                            <div className="lesson-sub">
                              {mi + 1}.{li + 1}
                            </div>
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: 11,
                              color: "var(--ink-3)",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {isCurrent ? "NOW" : l.done ? "DONE" : ""}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {tab === "notes" && (
              <div>
                <div className="mono-label" style={{ marginBottom: 14 }}>
                  — Your notes · stays on device
                </div>
                <textarea
                  defaultValue=""
                  placeholder="Type notes here…"
                  style={{
                    width: "100%",
                    minHeight: 260,
                    padding: 16,
                    border: "1px solid var(--hair)",
                    borderRadius: "var(--radius)",
                    background: "var(--paper-2)",
                    color: "var(--ink)",
                    fontFamily: "var(--sans)",
                    fontSize: 14,
                    resize: "vertical",
                  }}
                />
                <div className="mono-label" style={{ marginTop: 8 }}>
                  Notes are local. Persistent notes coming soon.
                </div>
              </div>
            )}

            {tab === "resources" && (
              <div>
                <div className="mono-label" style={{ marginBottom: 14 }}>
                  — Downloadable resources
                </div>
                <div
                  className="card"
                  style={{
                    padding: 24,
                    textAlign: "center",
                    color: "var(--ink-3)",
                  }}
                >
                  No resources attached to this lesson yet.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
