import { notFound } from "next/navigation";
import Link from "next/link";
import { connection } from "next/server";
import { getCourseTree } from "@/lib/courses";
import { LessonEditor } from "./lesson-editor";
import { deleteLessonAction } from "../../../../../actions";

export const metadata = { title: "Edit lesson" };

export default async function LessonEditPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}) {
  await connection();
  const { courseId, moduleId, lessonId } = await params;
  const tree = await getCourseTree(courseId);
  if (!tree) notFound();
  const mod = tree.modules.find((m) => m.id === moduleId);
  if (!mod) notFound();
  const lesson = mod.lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  return (
    <>
      <div className="admin-header">
        <div>
          <Link
            href={
              `/admin/courses/${courseId}/modules/${moduleId}` as `/admin/courses/${string}/modules/${string}`
            }
            className="mono-label"
            style={{ textDecoration: "none" }}
          >
            ← {mod.title}
          </Link>
          <h1 style={{ marginTop: 4 }}>{lesson.title}</h1>
          <div className="admin-header-sub">
            — /{lesson.slug} ·{" "}
            {lesson.bunnyVideoId ? "VIDEO READY" : "NO VIDEO"}
            {lesson.isFreePreview ? " · FREE PREVIEW" : ""}
          </div>
        </div>
        <div className="admin-header-actions">
          <form action={deleteLessonAction}>
            <input type="hidden" name="courseId" value={courseId} />
            <input type="hidden" name="id" value={lesson.id} />
            <button
              type="submit"
              className="btn btn-ghost"
              style={{ fontSize: 12, color: "var(--ink-3)" }}
            >
              Delete lesson
            </button>
          </form>
        </div>
      </div>

      <div className="admin-section">
        <LessonEditor
          courseId={courseId}
          moduleId={moduleId}
          lesson={{
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            isFreePreview: lesson.isFreePreview,
            bunnyVideoId: lesson.bunnyVideoId,
            durationSec: lesson.durationSec,
            descriptionTiptap: lesson.descriptionTiptap,
          }}
        />
      </div>
    </>
  );
}
