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
    <div className="flex flex-col gap-8 max-w-4xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link
            href={
              `/admin/courses/${courseId}` as `/admin/courses/${string}`
            }
            className="text-xs text-[var(--cf-muted-fg)] hover:underline"
          >
            ← {tree.course.title}
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{mod.title}</h1>
        </div>
        <form action={deleteModuleAction}>
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="id" value={mod.id} />
          <button
            type="submit"
            className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] px-3 py-1.5 text-xs text-[var(--cf-muted-fg)] hover:text-[var(--cf-fg)]"
          >
            Delete module
          </button>
        </form>
      </header>

      <ModuleForm courseId={courseId} module={mod} />

      <section className="flex flex-col gap-4 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <div>
          <h2 className="text-lg font-semibold">Lessons</h2>
          <p className="text-sm text-[var(--cf-muted-fg)]">
            Drag to reorder. Click a lesson to edit content.
          </p>
        </div>
        <form
          action={createLessonAction}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="courseId" value={courseId} />
          <input type="hidden" name="moduleId" value={mod.id} />
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">New lesson title</span>
            <input
              type="text"
              name="title"
              required
              placeholder="Lesson name"
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
            />
          </label>
          <button type="submit" className="cf-btn-primary">
            Add lesson
          </button>
        </form>
        <LessonList courseId={courseId} moduleId={mod.id} lessons={mod.lessons} />
      </section>
    </div>
  );
}
