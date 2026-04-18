import { notFound } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { requireStudent } from "@/lib/dal";
import { getCourseBySlug, getCourseTree } from "@/lib/courses";
import { isEnrolled } from "@/lib/enrollments";
import {
  bunnyEmbedUrl,
  getBunnyStreamConfig,
  signBunnyEmbedToken,
} from "@/lib/bunny";
import { getLessonProgress } from "@/lib/progress";
import { TiptapRender } from "@/components/tiptap-render";
import { VideoPlayer } from "./video-player";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Lesson" };
  const tree = await getCourseTree(course.id);
  const lesson = tree?.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.slug === lessonSlug);
  return { title: lesson ? `${lesson.title} · ${course.title}` : course.title };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const session = await requireStudent();
  const { slug, lessonSlug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();
  const enrolled = await isEnrolled(session.user.id, course.id);
  if (!enrolled) notFound();

  const tree = await getCourseTree(course.id);
  if (!tree) notFound();

  const flat = tree.modules.flatMap((m) =>
    m.lessons.map((l) => ({ lesson: l, module: m })),
  );
  const idx = flat.findIndex(({ lesson: l }) => l.slug === lessonSlug);
  if (idx === -1) notFound();
  const { lesson, module: mod } = flat[idx];
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;

  const progress = await getLessonProgress(session.user.id, lesson.id);

  let embedUrl: string | null = null;
  if (lesson.bunnyVideoId) {
    const cfg = await getBunnyStreamConfig();
    if (cfg) {
      const { token, expires } = signBunnyEmbedToken(cfg, lesson.bunnyVideoId);
      embedUrl = bunnyEmbedUrl(cfg, lesson.bunnyVideoId, token, expires);
    }
  }

  return (
    <main className="flex flex-col gap-6 py-6">
      <header>
        <div className="text-xs uppercase tracking-wide text-[var(--cf-muted-fg)]">
          {mod.title}
        </div>
        <h1 className="mt-1 text-2xl font-semibold">{lesson.title}</h1>
      </header>

      {embedUrl ? (
        <VideoPlayer
          lessonId={lesson.id}
          embedUrl={embedUrl}
          initialPositionSec={progress?.lastPositionSec ?? 0}
          completed={progress?.completedAt != null}
        />
      ) : (
        <div className="rounded-[var(--cf-radius)] border border-dashed border-[var(--cf-border)] bg-[var(--cf-surface)] p-8 text-center text-sm text-[var(--cf-muted-fg)]">
          Video not available yet.
        </div>
      )}

      {lesson.descriptionTiptap ? (
        <article className="prose max-w-none">
          <TiptapRender doc={lesson.descriptionTiptap as never} />
        </article>
      ) : null}

      <nav className="mt-2 flex items-center justify-between border-t border-[var(--cf-border)] pt-4 text-sm">
        {prev ? (
          <Link
            href={`/learn/${course.slug}/${prev.lesson.slug}` as Route}
            className="text-[var(--cf-muted-fg)] hover:underline"
          >
            ← {prev.lesson.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/learn/${course.slug}/${next.lesson.slug}` as Route}
            className="cf-btn-primary"
          >
            Next: {next.lesson.title} →
          </Link>
        ) : (
          <span className="text-[var(--cf-muted-fg)]">Course complete</span>
        )}
      </nav>
    </main>
  );
}
