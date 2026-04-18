import Link from "next/link";
import type { Route } from "next";
import { requireStudent } from "@/lib/dal";
import { listUserEnrollments } from "@/lib/enrollments";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await requireStudent();
  const userName = (session.user as { name?: string }).name ?? "there";
  const enrollments = await listUserEnrollments(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold">Hi {userName}</h1>
        <p className="text-sm text-[var(--cf-muted-fg)]">
          {enrollments.length === 0
            ? "Your enrolled courses will appear here."
            : `${enrollments.length} course${enrollments.length === 1 ? "" : "s"} enrolled.`}
        </p>
      </header>
      {enrollments.length === 0 ? (
        <section className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-8 text-center text-sm text-[var(--cf-muted-fg)]">
          No enrollments yet.{" "}
          <Link href="/courses" className="underline">
            Browse courses
          </Link>
          .
        </section>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map(({ enrollment: e, course: c }) => (
            <li
              key={e.id}
              className="flex flex-col gap-3 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-5"
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
              <div className="flex-1">
                <div className="font-semibold">{c.title}</div>
                {c.subtitle ? (
                  <div className="mt-1 text-sm text-[var(--cf-muted-fg)]">
                    {c.subtitle}
                  </div>
                ) : null}
              </div>
              <Link
                href={`/learn/${c.slug}` as Route}
                className="cf-btn-primary text-center"
              >
                Continue
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
