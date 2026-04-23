import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/dal";
import { getCourseBySlug, getCourseTree } from "@/lib/courses";
import { isEnrolled } from "@/lib/enrollments";
import { listUserProgressForLessons } from "@/lib/progress";
import { LearnShell } from "./learn-shell";

export default function LearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<LearnShellSkeleton />}>
      <LearnShellData params={params}>{children}</LearnShellData>
    </Suspense>
  );
}

async function LearnShellData({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}) {
  const { slug } = await params;
  const session = await requireStudent();
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
  const completedCount = Array.from(progress.values()).filter(
    (p) => p.completedAt != null,
  ).length;

  const modules = tree.modules.map((m) => ({
    id: m.id,
    title: m.title,
    lessons: m.lessons.map((l) => ({
      id: l.id,
      slug: l.slug,
      title: l.title,
      done: progress.get(l.id)?.completedAt != null,
    })),
  }));

  return (
    <LearnShell
      courseSlug={course.slug}
      courseTitle={course.title}
      modules={modules}
      totalLessons={allLessonIds.length}
      completedCount={completedCount}
    >
      {children}
    </LearnShell>
  );
}

function LearnShellSkeleton() {
  return (
    <div className="player-root">
      <div className="player-bar">
        <div className="player-bar-left">
          <div
            className="mono-label"
            style={{ opacity: 0.5 }}
            aria-label="Loading course"
          >
            — Loading course…
          </div>
        </div>
      </div>
      <div className="player-main">
        <div
          className="player-left"
          style={{ opacity: 0.5 }}
          aria-hidden
        />
        <div className="player-right" style={{ opacity: 0.35 }} aria-hidden />
      </div>
    </div>
  );
}
