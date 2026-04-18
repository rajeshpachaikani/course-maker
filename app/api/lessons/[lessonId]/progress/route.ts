import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/dal";
import { db } from "@/lib/db";
import { lessons, modules } from "@/lib/db/schema";
import { isEnrolled } from "@/lib/enrollments";
import { upsertLessonProgress } from "@/lib/progress";

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

  const progress = await upsertLessonProgress({
    userId: user.id,
    lessonId,
    lastPositionSec,
    completed,
  });

  return NextResponse.json({
    lastPositionSec: progress.lastPositionSec,
    completedAt: progress.completedAt,
  });
}
