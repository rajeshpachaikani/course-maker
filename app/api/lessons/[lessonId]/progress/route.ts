import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { lessons, modules } from "@/lib/db/schema";
import { isEnrolled } from "@/lib/enrollments";
import { upsertLessonProgress, isCourseFullyCompleted } from "@/lib/progress";
import { getCourseById } from "@/lib/courses";
import { sendEmail } from "@/lib/mailer";
import { loadSiteSettings } from "@/lib/theme";
import { appUrl, completionEmail } from "@/lib/email-templates";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { lessonId } = await params;

  const rows = await db
    .select({
      lesson: lessons,
      courseId: modules.courseId,
    })
    .from(lessons)
    .innerJoin(modules, eq(modules.id, lessons.moduleId))
    .where(eq(lessons.id, lessonId))
    .limit(1);
  const row = rows[0];
  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!row.lesson.isFreePreview) {
    const enrolled = await isEnrolled(user.id, row.courseId);
    if (!enrolled) {
      return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
    }
  }

  let body: { lastPositionSec?: number; completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const lastPositionSec =
    typeof body.lastPositionSec === "number" &&
    Number.isFinite(body.lastPositionSec) &&
    body.lastPositionSec >= 0
      ? Math.floor(body.lastPositionSec)
      : undefined;
  const completed = body.completed === true;

  const { progress, justCompleted } = await upsertLessonProgress({
    userId: user.id,
    lessonId,
    lastPositionSec,
    completed,
  });

  if (justCompleted) {
    try {
      const allDone = await isCourseFullyCompleted(user.id, row.courseId);
      if (allDone) {
        const [course, site] = await Promise.all([
          getCourseById(row.courseId),
          loadSiteSettings(),
        ]);
        if (course) {
          const tpl = completionEmail({
            siteName: site.name,
            userName: user.name,
            courseTitle: course.title,
            appUrl: appUrl(),
          });
          await sendEmail({
            to: user.email,
            subject: tpl.subject,
            html: tpl.html,
            text: tpl.text,
          });
        }
      }
    } catch (err) {
      console.error("[progress] completion email failed", err);
    }
  }

  return NextResponse.json({
    lastPositionSec: progress.lastPositionSec,
    completedAt: progress.completedAt,
  });
}
