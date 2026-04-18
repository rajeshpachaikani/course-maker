import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/dal";
import { getCourseBySlug, getCourseTree } from "@/lib/courses";
import { isEnrolled } from "@/lib/enrollments";
import { listUserProgressForLessons } from "@/lib/progress";

export default async function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const session = await requireStudent();
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const enrolled = await isEnrolled(session.user.id, course.id);
  if (!enrolled) notFound();

  const tree = await getCourseTree(course.id);
  if (!tree) notFound();

  const allLessonIds = tree.modules.flatMap((m) => m.lessons.map((l) => l.id));
  const progress = await listUserProgressForLessons(
    session.user.id,
    allLessonIds,
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 gap-6 px-4 py-6 lg:px-6">
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-6 flex flex-col gap-4">
          <div>
            <Link
              href={`/courses/${course.slug}` as Route}
              className="text-xs text-[var(--cf-muted-fg)] hover:underline"
            >
              ← {course.title}
            </Link>
            <div className="mt-1 text-sm font-semibold">Curriculum</div>
          </div>
          <nav className="flex flex-col gap-4">
            {tree.modules.map((m, mi) => (
              <div key={m.id}>
                <div className="text-xs font-medium uppercase tracking-wide text-[var(--cf-muted-fg)]">
                  {mi + 1}. {m.title}
                </div>
                <ul className="mt-2 flex flex-col gap-1">
                  {m.lessons.map((l) => {
                    const done = progress.get(l.id)?.completedAt != null;
                    return (
                      <li key={l.id}>
                        <Link
                          href={`/learn/${course.slug}/${l.slug}` as Route}
                          className="flex items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-[var(--cf-surface)]"
                        >
                          <span
                            className={
                              done
                                ? "mt-0.5 inline-block h-4 w-4 rounded-full border border-[var(--cf-accent)] bg-[var(--cf-accent)]"
                                : "mt-0.5 inline-block h-4 w-4 rounded-full border border-[var(--cf-border)]"
                            }
                            aria-hidden
                          />
                          <span className="flex-1">{l.title}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
