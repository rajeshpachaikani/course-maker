import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { getCourseBySlug, getCourseTree } from "@/lib/courses";
import { TiptapRender } from "@/components/tiptap-render";
import { PublicTopbar } from "@/components/public-topbar";
import { BuyButton } from "./buy-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Not found" };
  return { title: course.title };
}

function formatDuration(sec: number | null | undefined) {
  if (!sec || sec <= 0) return "—";
  const m = Math.round(sec / 60);
  return `${m}m`;
}

export default function CoursePublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="student-root">
      <PublicTopbar active="courses" />
      <Suspense fallback={<CourseDetailSkeleton />}>
        <CourseDetailContent params={params} />
      </Suspense>
    </div>
  );
}

function CourseDetailSkeleton() {
  return (
    <div className="detail-root" aria-hidden style={{ opacity: 0.4 }}>
      <div className="detail-breadcrumb">
        <span>Loading course…</span>
      </div>
    </div>
  );
}

async function CourseDetailContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();

  const tree = await getCourseTree(course.id);
  const modRows = tree?.modules ?? [];
  const lessonRows = modRows.flatMap((m) => m.lessons);

  const totalLessons = lessonRows.length;
  const totalSec = lessonRows.reduce((a, l) => a + (l.durationSec ?? 0), 0);
  const totalHours = totalSec > 0 ? (totalSec / 3600).toFixed(1) : null;

  const priceLabel = course.isFree
    ? "Free"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: course.currency,
        maximumFractionDigits: 0,
      }).format(course.priceCents / 100);
  const priceNumber = Math.round(course.priceCents / 100);

  return (
    <>
      <div className="detail-root">
        <div className="detail-breadcrumb">
          <Link href="/courses">Courses</Link> {" / "}
          <span style={{ color: "var(--ink)" }}>{course.title}</span>
        </div>

        <div className="detail-head">
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <span className="chip chip-terr">Course</span>
              {course.isFree ? <span className="chip chip-olive">Free</span> : null}
            </div>
            <h1>
              <em>{course.title.split(" ").slice(0, 2).join(" ")}</em>{" "}
              {course.title.split(" ").slice(2).join(" ")}
            </h1>
            {course.subtitle ? (
              <p className="detail-head-lede">{course.subtitle}</p>
            ) : null}
            <div className="instructor-row">
              <div className="avatar">{(course.title[0] ?? "C").toUpperCase()}</div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 17,
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  {course.title}
                </div>
                <div className="mono-label" style={{ marginTop: 2 }}>
                  {modRows.length} modules · {totalLessons} lessons
                  {totalHours ? ` · ${totalHours}h` : ""}
                </div>
              </div>
            </div>
          </div>

          <aside className="purchase-card">
            <div
              className={`purchase-preview ${course.coverImageUrl ? "bg-image" : "bg-pink-grad"}`}
            >
              {course.coverImageUrl ? (
                <img src={course.coverImageUrl} alt="" />
              ) : (
                <span className="play-btn-lg" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              )}
            </div>
            <div className="price-row">
              {course.isFree ? (
                <div className="price-big">Free</div>
              ) : (
                <div className="price-big">
                  <sup
                    style={{
                      fontSize: 20,
                      color: "var(--ink-3)",
                      fontFamily: "var(--mono)",
                      marginRight: 2,
                    }}
                  >
                    $
                  </sup>
                  {priceNumber}
                </div>
              )}
            </div>
            <BuyButton
              courseId={course.id}
              isFree={course.isFree || course.priceCents === 0}
            />
            <ul className="purchase-features">
              <li>
                <CheckIcon /> {modRows.length} modules · {totalLessons} lessons
              </li>
              {totalHours ? (
                <li>
                  <CheckIcon /> {totalHours} hours of video
                </li>
              ) : null}
              <li>
                <CheckIcon /> Lifetime access{course.isFree ? "" : ", including updates"}
              </li>
              <li>
                <CheckIcon /> Stream in HD via Bunny
              </li>
            </ul>
            <div className="mono-label" style={{ marginTop: 16, textAlign: "center" }}>
              Secure checkout · {priceLabel}
            </div>
          </aside>
        </div>

        {course.descriptionTiptap ? (
          <section style={{ padding: "40px 0 0", maxWidth: "64ch" }}>
            <div className="mono-label" style={{ marginBottom: 12 }}>— About this course</div>
            <div
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: "var(--ink-2)",
              }}
            >
              <TiptapRender doc={course.descriptionTiptap as never} />
            </div>
          </section>
        ) : null}

        <section className="curriculum">
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div className="mono-label" style={{ marginBottom: 6 }}>— What's inside</div>
              <h2>
                Curriculum{" "}
                <span
                  className="serif"
                  style={{
                    fontStyle: "italic",
                    color: "var(--ink-3)",
                    fontSize: 22,
                    fontWeight: 400,
                  }}
                >
                  — {modRows.length} modules · {totalLessons} lessons
                </span>
              </h2>
            </div>
          </div>

          {modRows.length === 0 ? (
            <div
              className="card"
              style={{ padding: 24, textAlign: "center", color: "var(--ink-3)" }}
            >
              <div className="mono-label">Curriculum coming soon.</div>
            </div>
          ) : (
            modRows.map((m, i) => {
              const items = m.lessons;
              return (
                <details
                  key={m.id}
                  className="module"
                  open={i === 0}
                >
                  <summary className="module-head">
                    <div className="module-idx">{String(i + 1).padStart(2, "0")}</div>
                    <div className="module-info">
                      <h3>{m.title}</h3>
                      <div className="meta">
                        {items.length} lessons
                      </div>
                    </div>
                    <div className="chev" aria-hidden>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </summary>
                  <div className="module-lessons">
                    {items.map((l) => (
                      <div key={l.id} className="lesson">
                        <div className="lesson-play">
                          {l.isFreePreview ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--pink)" }}>
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>{l.title}</div>
                        {l.isFreePreview ? (
                          <span className="lesson-free">Free</span>
                        ) : null}
                        <span className="lesson-dur">{formatDuration(l.durationSec)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              );
            })
          )}
        </section>
      </div>
    </>
  );
}

function CheckIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
