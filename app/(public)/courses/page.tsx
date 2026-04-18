import Link from "next/link";
import type { Route } from "next";
import { listPublishedCourses } from "@/lib/courses";

export const metadata = { title: "Courses" };

export default async function CoursesIndexPage() {
  const courses = await listPublishedCourses();
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-16">
      <header>
        <h1 className="text-3xl font-semibold">Courses</h1>
        <p className="mt-2 text-sm text-[var(--cf-muted-fg)]">
          {courses.length === 0
            ? "New courses coming soon."
            : `${courses.length} course${courses.length === 1 ? "" : "s"} available.`}
        </p>
      </header>
      {courses.length === 0 ? null : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const priceLabel = c.isFree
              ? "Free"
              : new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: c.currency,
                }).format(c.priceCents / 100);
            return (
              <li key={c.id}>
                <Link
                  href={`/courses/${c.slug}` as Route}
                  className="block rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4 transition hover:border-[var(--cf-primary)]"
                >
                  {c.coverImageUrl ? (
                    <img
                      src={c.coverImageUrl}
                      alt=""
                      className="aspect-video w-full rounded-[var(--cf-radius)] object-cover"
                    />
                  ) : (
                    <div className="aspect-video w-full rounded-[var(--cf-radius)] bg-[var(--cf-border)]" />
                  )}
                  <div className="mt-3 font-semibold">{c.title}</div>
                  {c.subtitle ? (
                    <div className="mt-1 text-sm text-[var(--cf-muted-fg)]">
                      {c.subtitle}
                    </div>
                  ) : null}
                  <div className="mt-2 text-sm font-medium">{priceLabel}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
