import { notFound, redirect } from "next/navigation";
import type { Route } from "next";
import { getCourseBySlug, getCourseTree } from "@/lib/courses";

export const metadata = { title: "Course" };

export default async function LearnLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const tree = await getCourseTree(course.id);
  const firstLesson = tree?.modules
    .flatMap((m) => m.lessons)
    .find(Boolean);
  if (!firstLesson) {
    return (
      <main className="flex flex-col gap-4 py-6">
        <h1 className="text-2xl font-semibold">{course.title}</h1>
        <p className="text-sm text-[var(--cf-muted-fg)]">
          No lessons yet. Check back soon.
        </p>
      </main>
    );
  }
  redirect(`/learn/${course.slug}/${firstLesson.slug}` as Route);
}
