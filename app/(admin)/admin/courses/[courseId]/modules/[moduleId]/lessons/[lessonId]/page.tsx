import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseTree } from "@/lib/courses";
import { LessonEditor } from "./lesson-editor";
import { deleteLessonAction } from "../../../../../actions";

export const metadata = { title: "Edit lesson" };

export default async function LessonEditPage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string; lessonId: string }>;
}) {
  const { courseId, moduleId, lessonId } = await params;
  const tree = await getCourseTree(courseId);
  if (!tree) notFound();
  const mod = tree.modules.find((m) => m.id === moduleId);
  if (!mod) notFound();
  const lesson = mod.lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={
              `/admin/courses/${courseId}/modules/${moduleId}` as `/admin/courses/${string}/modules/${string}`
            }
            className="text-xs text-[var(--cf-muted-fg)] hover:underline"
          >
            ← {mod.title}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{lesson.title}</h1>
        </div>
        <form action={deleteLessonAction}>
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="id" value={lesson.id} />
          <button
            type="submit"
            className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] px-3 py-1.5 text-xs text-[var(--cf-muted-fg)] hover:text-[var(--cf-fg)]"
          >
            Delete lesson
          </button>
        </form>
      </header>

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
  );
}
