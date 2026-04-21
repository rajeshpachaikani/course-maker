import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseTree } from "@/lib/courses";
import { ModuleForm } from "./module-form";
import { LessonList } from "./lesson-list";
import {
  createLessonAction,
  deleteModuleAction,
} from "../../../actions";

export const metadata = { title: "Edit module" };

export default async function ModuleEditPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { courseId, moduleId } = await params;
  const tree = await getCourseTree(courseId);
  if (!tree) notFound();
  const mod = tree.modules.find((m) => m.id === moduleId);
  if (!mod) notFound();

  return (
    <>
      <div className="admin-header">
        <div>
          <Link
            href={`/admin/courses/${courseId}` as `/admin/courses/${string}`}
            className="mono-label"
            style={{ textDecoration: "none" }}
          >
            ← {tree.course.title}
          </Link>
          <h1 style={{ marginTop: 4 }}>{mod.title}</h1>
          <div className="admin-header-sub">
            — {mod.lessons.length}{" "}
            {mod.lessons.length === 1 ? "lesson" : "lessons"} in this module
          </div>
        </div>
        <div className="admin-header-actions">
          <form action={deleteModuleAction}>
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="id" value={mod.id} />
            <button
              type="submit"
              className="btn btn-ghost"
              style={{ fontSize: 12, color: "var(--ink-3)" }}
            >
              Delete module
            </button>
          </form>
        </div>
      </div>

      <div className="admin-section">
        <div className="editor-grid">
          <div>
            <ModuleForm courseId={courseId} module={mod} />
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
                <div className="mono-label">— Lessons</div>
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
                  Lessons{" "}
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
              action={createLessonAction}
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 16,
                alignItems: "end",
              }}
            >
              <input type="hidden" name="courseId" value={courseId} />
              <input type="hidden" name="moduleId" value={mod.id} />
              <div className="field" style={{ flex: 1, margin: 0 }}>
                <label>NEW LESSON TITLE</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="Lesson name"
                />
              </div>
              <button type="submit" className="btn btn-ink">
                + Add lesson
              </button>
            </form>

            <LessonList
              courseId={courseId}
              moduleId={mod.id}
              lessons={mod.lessons}
            />
          </div>
        </div>
      </div>
    </>
  );
}
