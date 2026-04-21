import { Suspense } from "react";
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

export default function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  return (
    <Suspense fallback={<LessonSkeleton />}>
      <LessonContent params={params} />
    </Suspense>
  );
}

async function LessonContent({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  const session = await requireStudent();
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
    <>
      <div className="video-shell">
        {embedUrl ? (
          <VideoPlayer
            lessonId={lesson.id}
            embedUrl={embedUrl}
            initialPositionSec={progress?.lastPositionSec ?? 0}
            completed={progress?.completedAt != null}
          />
        ) : (
          <div
            style={{
              display: "grid",
              placeItems: "center",
              color: "var(--ink-3)",
              padding: 40,
              textAlign: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 22,
                  color: "var(--ink-2)",
                  marginBottom: 8,
                }}
              >
                Video not available yet.
              </div>
              <div className="mono-label">
                Check back once the instructor uploads it.
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          padding: "24px 32px 32px",
          borderTop: "1px solid var(--hair)",
          background: "oklch(0.1 0.025 300)",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div>
          <div className="mono-label">— {mod.title}</div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: 30,
              margin: "6px 0 0",
              fontWeight: 700,
              letterSpacing: "-0.015em",
              color: "var(--ink)",
            }}
          >
            {lesson.title}
          </h1>
        </div>

        {lesson.descriptionTiptap ? (
          <article
            className="prose max-w-none"
            style={{ color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.6 }}
          >
            <TiptapRender doc={lesson.descriptionTiptap as never} />
          </article>
        ) : null}

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 16,
            borderTop: "1px dotted var(--hair-2)",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {prev ? (
            <Link
              href={`/learn/${course.slug}/${prev.lesson.slug}` as Route}
              className="btn btn-ghost"
            >
              ← {prev.lesson.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/learn/${course.slug}/${next.lesson.slug}` as Route}
              className="btn btn-primary"
            >
              Next: {next.lesson.title} →
            </Link>
          ) : (
            <span className="mono-label">Course complete</span>
          )}
        </nav>
      </div>
    </>
  );
}

function LessonSkeleton() {
  return (
    <>
      <div
        className="video-shell"
        style={{
          display: "grid",
          placeItems: "center",
          opacity: 0.5,
        }}
        aria-hidden
      >
        <div className="mono-label">Loading lesson…</div>
      </div>
      <div
        style={{
          padding: "24px 32px 32px",
          borderTop: "1px solid var(--hair)",
          background: "oklch(0.1 0.025 300)",
          opacity: 0.5,
        }}
        aria-hidden
      >
        <div className="mono-label">Loading…</div>
      </div>
    </>
  );
}
