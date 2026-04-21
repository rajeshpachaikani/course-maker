import Link from "next/link";
import { listCoursesAdmin } from "@/lib/courses";
import { createCourseAction } from "./actions";
import { DeleteCourseButton } from "./delete-course-button";

export const metadata = { title: "Courses" };

const THUMB_GRADS = [
  "bg-clay",
  "bg-plum",
  "bg-ochre",
  "bg-teal",
  "bg-moss",
  "bg-rust",
  "bg-pink-grad",
  "bg-brick",
  "bg-sage",
];

function formatPrice(cents: number, currency: string, isFree: boolean) {
  if (isFree) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export default async function AdminCoursesPage() {
  const courses = await listCoursesAdmin();
  const published = courses.filter((c) => c.published).length;
  const draft = courses.length - published;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Courses</h1>
          <div className="admin-header-sub">
            — {courses.length} total · {published} published · {draft} draft
          </div>
        </div>
      </div>

      <div className="admin-section">
        <section
          className="card"
          style={{
            background: "var(--paper-2)",
            border: "1px solid var(--hair)",
            borderRadius: "var(--radius-lg)",
            padding: 22,
            marginBottom: 24,
          }}
        >
          <div className="mono-label" style={{ marginBottom: 12 }}>
            — Create a new course
          </div>
          <form
            action={createCourseAction}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div className="field" style={{ margin: 0 }}>
              <label>TITLE</label>
              <input
                type="text"
                name="title"
                required
                placeholder="Intro to Widgets"
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>SUBTITLE</label>
              <input
                type="text"
                name="subtitle"
                placeholder="A short summary"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              + Create course
            </button>
          </form>
        </section>

        {courses.length === 0 ? (
          <div
            className="card"
            style={{
              background: "var(--paper-2)",
              border: "1px dashed var(--hair-2)",
              borderRadius: "var(--radius-lg)",
              padding: 48,
              textAlign: "center",
              color: "var(--ink-3)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 22,
                color: "var(--ink-2)",
                marginBottom: 6,
              }}
            >
              No courses yet.
            </div>
            <div className="mono-label">
              Create your first course above to get started.
            </div>
          </div>
        ) : (
          <div className="admin-table">
            <div className="admin-table-head">
              <div></div>
              <div>Course</div>
              <div>Status</div>
              <div>Structure</div>
              <div>Price</div>
              <div></div>
            </div>
            {courses.map((c, i) => (
              <Link
                key={c.id}
                href={`/admin/courses/${c.id}` as `/admin/courses/${string}`}
                className="admin-row"
              >
                <div
                  className={`admin-row-thumb ${THUMB_GRADS[i % THUMB_GRADS.length]}`}
                >
                  {c.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.coverImageUrl} alt="" />
                  ) : (
                    c.title.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="admin-row-title">{c.title}</div>
                  <div className="admin-row-sub">
                    /{c.slug}
                    {c.subtitle ? ` · ${c.subtitle}` : ""}
                  </div>
                </div>
                <div>
                  <span
                    className={`status ${c.published ? "status-published" : "status-draft"}`}
                  >
                    {c.published ? "Published" : "Draft"}
                  </span>
                </div>
                <div>
                  <span className="admin-row-num">{c.lessonCount}</span>
                  <span
                    className="mono-label"
                    style={{ marginLeft: 6, fontSize: 10 }}
                  >
                    {c.lessonCount === 1 ? "LESSON" : "LESSONS"} ·{" "}
                    {c.moduleCount}{" "}
                    {c.moduleCount === 1 ? "MODULE" : "MODULES"}
                  </span>
                </div>
                <div className="admin-row-mono">
                  {formatPrice(c.priceCents, c.currency, c.isFree)}
                </div>
                <div style={{ display: "flex", gap: 4, justifyContent: "end" }}>
                  <DeleteCourseButton id={c.id} title={c.title} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
