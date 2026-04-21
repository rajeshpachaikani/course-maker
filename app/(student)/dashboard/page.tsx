import { Suspense } from "react";
import Link from "next/link";
import type { Route } from "next";
import { requireStudent } from "@/lib/dal";
import { listUserEnrollments } from "@/lib/enrollments";
import { getCourseTree } from "@/lib/courses";
import { listUserProgressForLessons } from "@/lib/progress";
import { PublicTopbar } from "@/components/public-topbar";

export const metadata = { title: "Dashboard" };

const THUMB_BG = [
  "bg-pink-grad",
  "bg-plum",
  "bg-clay",
  "bg-ochre",
  "bg-teal",
  "bg-moss",
  "bg-rust",
  "bg-sage",
];

export default function DashboardPage() {
  return (
    <div className="student-root">
      <PublicTopbar />
      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          width: "100%",
          padding: "48px 48px 80px",
        }}
      >
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </main>
    </div>
  );
}

async function DashboardContent() {
  const session = await requireStudent();
  const userName = (session.user as { name?: string }).name ?? "there";
  const enrollments = await listUserEnrollments(session.user.id);

  const cards = await Promise.all(
    enrollments.map(async ({ enrollment, course }) => {
      const tree = await getCourseTree(course.id);
      const lessons = tree?.modules.flatMap((m) => m.lessons) ?? [];
      const lessonIds = lessons.map((l) => l.id);
      const progress = await listUserProgressForLessons(
        session.user.id,
        lessonIds,
      );
      const totalLessons = lessons.length;
      let totalSec = 0;
      let completedSec = 0;
      let completedLessons = 0;
      for (const l of lessons) {
        const dur = l.durationSec ?? 0;
        totalSec += dur;
        const p = progress.get(l.id);
        if (p?.completedAt) {
          completedSec += dur;
          completedLessons += 1;
        }
      }
      const pct =
        totalSec > 0
          ? Math.round((completedSec / totalSec) * 100)
          : totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;
      return {
        enrollmentId: enrollment.id,
        course,
        totalLessons,
        completedLessons,
        totalSec,
        completedSec,
        remainingSec: Math.max(totalSec - completedSec, 0),
        pct,
      };
    }),
  );

  return (
    <>
      <header style={{ marginBottom: 40 }}>
        <div className="mono-label" style={{ marginBottom: 8 }}>
          — Your workspace
        </div>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: 56,
            margin: 0,
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Hi{" "}
          <em style={{ fontStyle: "italic", color: "var(--pink)" }}>
            {userName}
          </em>
          .
        </h1>
        <p style={{ color: "var(--ink-2)", fontSize: 16, margin: "12px 0 0" }}>
          {cards.length === 0
            ? "Your enrolled courses will appear here."
            : `${cards.length} course${cards.length === 1 ? "" : "s"} in progress.`}
        </p>
      </header>

      {cards.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: 24,
              fontWeight: 600,
              color: "var(--ink)",
              marginBottom: 8,
            }}
          >
            No enrollments yet.
          </div>
          <p style={{ color: "var(--ink-2)", margin: "0 0 20px" }}>
            Browse the catalogue to pick your first course.
          </p>
          <Link href="/courses" className="btn btn-primary">
            Browse courses →
          </Link>
        </div>
      ) : (
        <div className="course-grid" style={{ padding: 0 }}>
          {cards.map((card, i) => {
            const bg = THUMB_BG[i % THUMB_BG.length];
            const { course: c } = card;
            return (
              <Link
                key={card.enrollmentId}
                href={`/learn/${c.slug}` as Route}
                className="course-card"
              >
                <div
                  className={`course-thumb ${c.coverImageUrl ? "bg-image" : bg}`}
                >
                  {c.coverImageUrl ? (
                    <img src={c.coverImageUrl} alt="" />
                  ) : (
                    <>
                      <span className="course-thumb-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="course-thumb-cat">
                        {card.pct === 100 ? "Complete" : "Enrolled"}
                      </span>
                    </>
                  )}
                </div>
                <div className="course-body">
                  <h4>{c.title}</h4>
                  {c.subtitle ? (
                    <p>{c.subtitle}</p>
                  ) : (
                    <p style={{ opacity: 0.6 }}>Continue →</p>
                  )}
                  <ProgressBlock card={card} />
                  <div className="course-meta" style={{ marginTop: 14 }}>
                    <span>
                      {card.completedLessons}/{card.totalLessons} lessons
                    </span>
                    <span
                      className="course-price"
                      style={{
                        fontSize: 13,
                        fontFamily: "var(--mono)",
                        letterSpacing: "0.04em",
                        color: "var(--pink)",
                        textTransform: "uppercase",
                      }}
                    >
                      {card.pct === 100 ? "REVIEW →" : "CONTINUE →"}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

function ProgressBlock({
  card,
}: {
  card: {
    totalSec: number;
    completedSec: number;
    remainingSec: number;
    pct: number;
  };
}) {
  const done = formatHours(card.completedSec);
  const left = formatHours(card.remainingSec);
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
          fontSize: 12,
          color: "var(--ink-2)",
        }}
      >
        <span>
          <strong
            style={{
              color: "var(--ink)",
              fontFamily: "var(--mono)",
              fontSize: 12,
              letterSpacing: "0.04em",
            }}
          >
            {card.pct}%
          </strong>{" "}
          <span style={{ color: "var(--ink-3)" }}>complete</span>
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            color: "var(--ink-3)",
            letterSpacing: "0.04em",
          }}
        >
          {done} done · {left} left
        </span>
      </div>
      <div
        style={{
          height: 6,
          borderRadius: 999,
          background: "var(--hair-2, rgba(255,255,255,0.08))",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${card.pct}%`,
            height: "100%",
            background:
              card.pct === 100
                ? "oklch(0.7 0.2 160)"
                : "var(--brand-grad, var(--pink, #ec4899))",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <header style={{ marginBottom: 40 }}>
        <div className="mono-label" style={{ marginBottom: 8 }}>
          — Your workspace
        </div>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: 56,
            margin: 0,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            opacity: 0.5,
          }}
        >
          Loading…
        </h1>
      </header>
      <div
        className="course-grid"
        style={{ padding: 0, opacity: 0.35 }}
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <div key={i} className="course-card" style={{ minHeight: 280 }}>
            <div
              className="course-thumb bg-plum"
              style={{ opacity: 0.3 }}
            />
            <div className="course-body">
              <h4 style={{ opacity: 0.4 }}>Loading course…</h4>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function formatHours(sec: number): string {
  if (!sec || sec < 60) return "0h";
  const hours = sec / 3600;
  if (hours >= 10) return `${Math.round(hours)}h`;
  if (hours >= 1) return `${hours.toFixed(1)}h`;
  const mins = Math.round(sec / 60);
  return `${mins}m`;
}
