import { notFound } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { requireStaff } from "@/lib/dal";
import { getCourseTree } from "@/lib/courses";
import { CourseMetaForm } from "./course-meta-form";
import { ModuleList } from "./module-list";
import { createModuleAction } from "../actions";
import { DeleteCourseButton } from "../delete-course-button";

export const metadata = { title: "Edit course" };

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  await connection();
  const { courseId } = await params;
  const { caps } = await requireStaff();
  const tree = await getCourseTree(courseId);
  if (!tree) notFound();

  const lessonCount = tree.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0,
  );

  return (
    <>
      <div className="admin-header">
        <div>
          <Link
            href="/admin/courses"
            className="mono-label"
            style={{ textDecoration: "none" }}
          >
            ← Courses
          </Link>
          <h1 style={{ marginTop: 4 }}>{tree.course.title}</h1>
          <div className="admin-header-sub">
            — /{tree.course.slug} · {tree.modules.length}{" "}
            {tree.modules.length === 1 ? "module" : "modules"} · {lessonCount}{" "}
            {lessonCount === 1 ? "lesson" : "lessons"} ·{" "}
            {tree.course.published ? "Published" : "Draft"}
          </div>
        </div>
        <div className="admin-header-actions">
          <Link
            href={`/courses/${tree.course.slug}` as `/courses/${string}`}
            className="btn btn-ghost"
            target="_blank"
          >
            View ↗
          </Link>
          <DeleteCourseButton id={tree.course.id} title={tree.course.title} />
        </div>
      </div>

      <div className="admin-section">
        <div className="editor-grid">
          <div>
            <CourseMetaForm
              course={tree.course}
              canSetPricing={caps.canSetPricing}
              canPublishCourse={caps.canPublishCourse}
            />
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "end",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div>
                <div className="mono-label">— Curriculum</div>
                <h2
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 26,
                    margin: "6px 0 0",
                    fontWeight: 600,
                    letterSpacing: "-0.015em",
                    color: "var(--ink)",
                  }}
                >
                  Modules{" "}
                  <span
                    style={{
                      fontStyle: "italic",
                      color: "var(--ink-3)",
                      fontSize: 20,
                      fontWeight: 500,
                    }}
                  >
                    — reorder with arrows
                  </span>
                </h2>
              </div>
            </div>

            <form
              action={createModuleAction}
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                alignItems: "end",
              }}
            >
              <input type="hidden" name="courseId" value={tree.course.id} />
              <div className="field" style={{ flex: 1, margin: 0 }}>
                <label>NEW MODULE TITLE</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Module name"
                />
              </div>
              <button type="submit" className="btn btn-ink">
                + Add module
              </button>
            </form>

            <ModuleList courseId={tree.course.id} modules={tree.modules} />
          </div>
        </div>
      </div>
    </>
  );
}
