import { notFound } from "next/navigation";
import Link from "next/link";
import { getCourseTree } from "@/lib/courses";
import { CourseMetaForm } from "./course-meta-form";
import { ModuleList } from "./module-list";
import {
  createModuleAction,
  deleteCourseAction,
} from "../actions";

export const metadata = { title: "Edit course" };

export default async function CourseEditPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const tree = await getCourseTree(courseId);
  if (!tree) notFound();

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/courses"
            className="text-xs text-[var(--cf-muted-fg)] hover:underline"
          >
            ← Courses
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{tree.course.title}</h1>
          <p className="text-sm text-[var(--cf-muted-fg)]">
            Slug: <code>{tree.course.slug}</code>
          </p>
        </div>
        <form action={deleteCourseAction}>
          <input type="hidden" name="id" value={tree.course.id} />
          <button
            type="submit"
            className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] px-3 py-1.5 text-xs text-[var(--cf-muted-fg)] hover:text-[var(--cf-fg)]"
          >
            Delete course
          </button>
        </form>
      </header>

      <CourseMetaForm course={tree.course} />

      <section className="flex flex-col gap-4 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <div>
          <h2 className="text-lg font-semibold">Modules</h2>
          <p className="text-sm text-[var(--cf-muted-fg)]">
            Drag to reorder. Click a module to manage lessons.
          </p>
        </div>
        <form
          action={createModuleAction}
          className="flex flex-col gap-2 sm:flex-row sm:items-end"
        >
          <input type="hidden" name="courseId" value={tree.course.id} />
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">New module title</span>
            <input
              type="text"
              name="title"
              required
              placeholder="Module name"
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
            />
          </label>
          <button type="submit" className="cf-btn-primary">
            Add module
          </button>
        </form>
        <ModuleList courseId={tree.course.id} modules={tree.modules} />
      </section>
    </div>
  );
}
