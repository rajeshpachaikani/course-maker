import Link from "next/link";
import { connection } from "next/server";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  courses,
  enrollments,
  lessons,
  lessonProgress,
  modules,
  users,
} from "@/lib/db/schema";

export const metadata = { title: "Admin overview" };

const THUMB_GRADS = [
  "bg-clay",
  "bg-plum",
  "bg-ochre",
  "bg-teal",
  "bg-moss",
  "bg-pink-grad",
];

function fmtUSD(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function fmtRel(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const s = Math.floor(diffMs / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function AdminOverviewPage() {
  // `connection()` opts this page into dynamic rendering so that
  // Date.now() is evaluated at request time, not at build/prerender time.
  await connection();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    revenueRow,
    enrollCountRow,
    courseCountRow,
    completionRow,
    topCourses,
    recentEnroll,
    recentCompletions,
  ] = await Promise.all([
    db
      .select({
        total: sql<number>`coalesce(sum(${enrollments.amountPaidCents}), 0)::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(enrollments)
      .where(sql`${enrollments.enrolledAt} >= ${thirtyDaysAgo}`),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(enrollments),
    db
      .select({
        count: sql<number>`count(*)::int`,
        published: sql<number>`count(*) filter (where ${courses.published})::int`,
      })
      .from(courses),
    db
      .select({
        total: sql<number>`count(*)::int`,
        done: sql<number>`count(*) filter (where ${lessonProgress.completedAt} is not null)::int`,
      })
      .from(lessonProgress),
    db
      .select({
        course: courses,
        students: sql<number>`count(${enrollments.id})::int`,
        revenue: sql<number>`coalesce(sum(${enrollments.amountPaidCents}), 0)::int`,
      })
      .from(courses)
      .leftJoin(enrollments, eq(enrollments.courseId, courses.id))
      .where(eq(courses.published, true))
      .groupBy(courses.id)
      .orderBy(sql`coalesce(sum(${enrollments.amountPaidCents}), 0) desc`)
      .limit(5),
    db
      .select({
        enrolledAt: enrollments.enrolledAt,
        amountPaidCents: enrollments.amountPaidCents,
        userName: users.name,
        courseTitle: courses.title,
      })
      .from(enrollments)
      .innerJoin(users, eq(users.id, enrollments.userId))
      .innerJoin(courses, eq(courses.id, enrollments.courseId))
      .orderBy(desc(enrollments.enrolledAt))
      .limit(6),
    db
      .select({
        completedAt: lessonProgress.completedAt,
        userName: users.name,
        lessonTitle: lessons.title,
        courseTitle: courses.title,
      })
      .from(lessonProgress)
      .innerJoin(users, eq(users.id, lessonProgress.userId))
      .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
      .innerJoin(modules, eq(modules.id, lessons.moduleId))
      .innerJoin(courses, eq(courses.id, modules.courseId))
      .where(sql`${lessonProgress.completedAt} is not null`)
      .orderBy(desc(lessonProgress.completedAt))
      .limit(6),
  ]);

  const revenue30d = revenueRow[0]?.total ?? 0;
  const enrollments30d = revenueRow[0]?.count ?? 0;
  const totalEnroll = enrollCountRow[0]?.count ?? 0;
  const totalCourses = courseCountRow[0]?.count ?? 0;
  const publishedCourses = courseCountRow[0]?.published ?? 0;
  const progressTotal = completionRow[0]?.total ?? 0;
  const progressDone = completionRow[0]?.done ?? 0;
  const completionRate =
    progressTotal > 0 ? (progressDone / progressTotal) * 100 : 0;

  type Activity = {
    type: "sale" | "complete";
    who: string;
    action: string;
    obj: string;
    amt?: number;
    at: Date;
  };
  const activity: Activity[] = [];
  for (const r of recentEnroll) {
    activity.push({
      type: "sale",
      who: r.userName,
      action: "enrolled in",
      obj: r.courseTitle,
      amt: r.amountPaidCents,
      at: r.enrolledAt,
    });
  }
  for (const r of recentCompletions) {
    if (!r.completedAt) continue;
    activity.push({
      type: "complete",
      who: r.userName,
      action: "completed",
      obj: `${r.lessonTitle} · ${r.courseTitle}`,
      at: r.completedAt,
    });
  }
  activity.sort((a, b) => b.at.getTime() - a.at.getTime());
  const recentActivity = activity.slice(0, 8);

  const kpis = [
    {
      label: "Revenue · 30d",
      val: fmtUSD(revenue30d),
      delta: `${enrollments30d} sales`,
    },
    {
      label: "Enrollments · total",
      val: totalEnroll.toLocaleString("en-US"),
      delta: `+${enrollments30d} · 30d`,
    },
    {
      label: "Courses",
      val: String(totalCourses),
      delta: `${publishedCourses} published`,
    },
    {
      label: "Completion rate",
      val: `${completionRate.toFixed(1)}%`,
      delta: `${progressDone} / ${progressTotal} lessons`,
    },
  ];

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Dashboard</h1>
          <div className="admin-header-sub">— Workspace overview</div>
        </div>
        <div className="admin-header-actions">
          <Link href="/" className="btn btn-ghost">
            Preview as student
          </Link>
          <Link href="/admin/courses" className="btn btn-primary">
            + New course
          </Link>
        </div>
      </div>

      <div className="admin-section">
        <div className="kpi-grid">
          {kpis.map((k) => (
            <div key={k.label} className="kpi">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val">{k.val}</div>
              <div className="kpi-delta">▲ {k.delta}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div
            className="card"
            style={{
              background: "var(--paper-2)",
              border: "1px solid var(--hair)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <div className="card-head">
              <div>
                <h3>Top courses</h3>
                <div className="mono-label">— By revenue, all time</div>
              </div>
            </div>
            <div style={{ padding: "0 24px 24px" }}>
              {topCourses.length === 0 ? (
                <div
                  className="mono-label"
                  style={{ padding: "28px 0", textAlign: "center" }}
                >
                  No published courses yet.
                </div>
              ) : (
                topCourses.map((row, i) => (
                  <div
                    key={row.course.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "12px 0",
                      borderTop:
                        i === 0 ? "none" : "1px dotted var(--hair-2)",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--serif)",
                        fontStyle: "italic",
                        fontSize: 22,
                        color: "var(--ink-3)",
                        minWidth: 28,
                        fontWeight: 500,
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div
                      className={`admin-row-thumb ${THUMB_GRADS[i % THUMB_GRADS.length]}`}
                      style={{ width: 36, height: 36, fontSize: 15 }}
                    >
                      {row.course.title.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          color: "var(--ink)",
                        }}
                      >
                        {row.course.title}
                      </div>
                      <div
                        className="mono-label"
                        style={{ fontSize: 10.5, marginTop: 2 }}
                      >
                        {row.students} {row.students === 1 ? "student" : "students"}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: 17,
                        fontWeight: 500,
                        color: "var(--ink)",
                      }}
                    >
                      {row.revenue > 0
                        ? `$${(row.revenue / 100000).toFixed(1)}k`
                        : "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div
            className="card"
            style={{
              background: "var(--paper-2)",
              border: "1px solid var(--hair)",
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            <div className="card-head">
              <div>
                <h3>Quick links</h3>
                <div className="mono-label">— Jump right in</div>
              </div>
            </div>
            <div
              style={{
                padding: "4px 24px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <Link
                href="/admin/courses"
                className="btn btn-ghost"
                style={{
                  justifyContent: "flex-start",
                  width: "100%",
                  padding: "12px 14px",
                }}
              >
                Manage courses →
              </Link>
              <Link
                href="/admin/appearance"
                className="btn btn-ghost"
                style={{
                  justifyContent: "flex-start",
                  width: "100%",
                  padding: "12px 14px",
                }}
              >
                Theme & brand →
              </Link>
              <Link
                href="/admin/settings"
                className="btn btn-ghost"
                style={{
                  justifyContent: "flex-start",
                  width: "100%",
                  padding: "12px 14px",
                }}
              >
                Integrations & settings →
              </Link>
              <Link
                href="/"
                className="btn btn-ghost"
                style={{
                  justifyContent: "flex-start",
                  width: "100%",
                  padding: "12px 14px",
                }}
              >
                View storefront ↗
              </Link>
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            background: "var(--paper-2)",
            border: "1px solid var(--hair)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        >
          <div className="card-head">
            <div>
              <h3>Recent activity</h3>
              <div className="mono-label">— Latest enrollments & completions</div>
            </div>
          </div>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div
                className="mono-label"
                style={{ padding: "24px", textAlign: "center" }}
              >
                No activity yet.
              </div>
            ) : (
              recentActivity.map((a, i) => (
                <div key={i} className="activity">
                  <div
                    className="activity-icon"
                    style={{
                      background:
                        a.type === "sale"
                          ? "oklch(0.58 0.3 340 / 0.25)"
                          : "oklch(0.3 0.1 160 / 0.35)",
                      color:
                        a.type === "sale"
                          ? "oklch(0.85 0.18 340)"
                          : "oklch(0.85 0.18 160)",
                    }}
                  >
                    {a.type === "sale" ? "$" : "✓"}
                  </div>
                  <div className="activity-text">
                    <b>{a.who}</b> {a.action} <b>{a.obj}</b>
                    {a.amt !== undefined && a.amt > 0
                      ? ` · ${fmtUSD(a.amt)}`
                      : ""}
                  </div>
                  <div className="activity-time">{fmtRel(a.at)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
