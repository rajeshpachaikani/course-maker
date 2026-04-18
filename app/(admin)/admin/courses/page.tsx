import Link from "next/link";
import { listCoursesAdmin } from "@/lib/courses";
import { createCourseAction, deleteCourseAction } from "./actions";

export const metadata = { title: "Courses" };

function formatPrice(cents: number, currency: string, isFree: boolean) {
  if (isFree) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export default async function AdminCoursesPage() {
  const courses = await listCoursesAdmin();

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Courses</h1>
          <p className="text-sm text-[var(--cf-muted-fg)]">
            Author courses, modules, and lessons.
          </p>
        </div>
      </header>

      <section className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <h2 className="text-base font-semibold">Create course</h2>
        <form
          action={createCourseAction}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Title</span>
            <input
              type="text"
              name="title"
              required
              placeholder="Intro to Widgets"
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Subtitle (optional)</span>
            <input
              type="text"
              name="subtitle"
              placeholder="A short summary"
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
            />
          </label>
          <button type="submit" className="cf-btn-primary">
            Create
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">All courses</h2>
        {courses.length === 0 ? (
          <div className="rounded-[var(--cf-radius)] border border-dashed border-[var(--cf-border)] p-8 text-center text-sm text-[var(--cf-muted-fg)]">
            No courses yet. Create one above.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {courses.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-4 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/courses/${c.id}` as `/admin/courses/${string}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {c.title}
                    </Link>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        c.published
                          ? "bg-[var(--cf-accent)] text-[var(--cf-accent-fg)]"
                          : "border border-[var(--cf-border)] text-[var(--cf-muted-fg)]"
                      }`}
                    >
                      {c.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--cf-muted-fg)]">
                    /{c.slug} · {c.moduleCount} modules · {c.lessonCount} lessons
                    · {formatPrice(c.priceCents, c.currency, c.isFree)}
                  </div>
                </div>
                <form action={deleteCourseAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] px-3 py-1.5 text-xs text-[var(--cf-muted-fg)] hover:text-[var(--cf-fg)]"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
