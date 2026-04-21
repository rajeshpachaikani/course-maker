import Link from "next/link";
import type { Route } from "next";
import { listPublishedCourses } from "@/lib/courses";
import { PublicTopbar } from "@/components/public-topbar";

export const metadata = { title: "Courses" };

const THUMB_BG = [
  "bg-pink-grad",
  "bg-plum",
  "bg-clay",
  "bg-ochre",
  "bg-teal",
  "bg-moss",
  "bg-rust",
  "bg-sage",
  "bg-ink",
  "bg-brick",
];

export default async function CoursesIndexPage() {
  const courses = await listPublishedCourses();
  return (
    <div className="student-root">
      <PublicTopbar active="courses" />
      <div className="section-head" style={{ paddingTop: 56 }}>
        <div>
          <div className="mono-label" style={{ marginBottom: 8 }}>— The Catalogue</div>
          <h2>
            All courses <span className="count">({courses.length})</span>
          </h2>
        </div>
      </div>

      {courses.length === 0 ? (
        <div style={{ padding: "0 48px 80px" }}>
          <div
            className="card"
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--ink-3)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 28,
                color: "var(--ink)",
                fontWeight: 600,
                marginBottom: 8,
              }}
            >
              New courses coming soon.
            </div>
            <div className="mono-label">Check back shortly.</div>
          </div>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((c, i) => {
            const bg = THUMB_BG[i % THUMB_BG.length];
            return (
              <Link
                key={c.id}
                href={`/courses/${c.slug}` as Route}
                className="course-card"
              >
                <div className={`course-thumb ${c.coverImageUrl ? "bg-image" : bg}`}>
                  {c.coverImageUrl ? (
                    <img src={c.coverImageUrl} alt="" />
                  ) : (
                    <>
                      <span className="course-thumb-num">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {c.subtitle ? (
                        <span className="course-thumb-cat">{c.subtitle}</span>
                      ) : null}
                    </>
                  )}
                </div>
                <div className="course-body">
                  <h4>{c.title}</h4>
                  <p>{c.subtitle ?? "Get started →"}</p>
                  <div className="course-meta">
                    <span>{c.isFree ? "Free access" : "Lifetime access"}</span>
                    <span className="course-price">
                      {c.isFree ? (
                        "Free"
                      ) : (
                        <>
                          <sup>$</sup>
                          {Math.round(c.priceCents / 100)}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
