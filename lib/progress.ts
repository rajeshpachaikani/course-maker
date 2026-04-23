import "server-only";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { lessonProgress, type LessonProgress } from "@/lib/db/schema";

export async function getLessonProgress(
  userId: string,
  lessonId: string,
): Promise<LessonProgress | null> {
  const rows = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function listUserProgressForLessons(
  userId: string,
  lessonIds: string[],
): Promise<Map<string, LessonProgress>> {
  if (lessonIds.length === 0) return new Map();
  const rows = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, userId),
        inArray(lessonProgress.lessonId, lessonIds),
      ),
    );
  const map = new Map<string, LessonProgress>();
  for (const r of rows) map.set(r.lessonId, r);
  return map;
}

export async function upsertLessonProgress(input: {
  userId: string;
  lessonId: string;
  lastPositionSec?: number;
  completed?: boolean;
}): Promise<{ progress: LessonProgress; justCompleted: boolean }> {
  const existing = await getLessonProgress(input.userId, input.lessonId);
  const now = new Date();
  if (!existing) {
    const [row] = await db
      .insert(lessonProgress)
      .values({
        userId: input.userId,
        lessonId: input.lessonId,
        lastPositionSec: input.lastPositionSec ?? 0,
        completedAt: input.completed ? now : null,
        updatedAt: now,
      })
      .returning();
    return { progress: row, justCompleted: Boolean(input.completed) };
  }
  const values: Record<string, unknown> = { updatedAt: now };
  if (input.lastPositionSec !== undefined) {
    values.lastPositionSec = Math.max(
      existing.lastPositionSec,
      input.lastPositionSec,
    );
  }
  const willComplete = Boolean(input.completed) && !existing.completedAt;
  if (willComplete) {
    values.completedAt = now;
  }
  const [row] = await db
    .update(lessonProgress)
    .set(values)
    .where(
      and(
        eq(lessonProgress.userId, input.userId),
        eq(lessonProgress.lessonId, input.lessonId),
      ),
    )
    .returning();
  return { progress: row, justCompleted: willComplete };
}

export async function isCourseFullyCompleted(
  userId: string,
  courseId: string,
): Promise<boolean> {
  const result = await db.execute<{ total: number; done: number }>(sql`
    select
      count(l.id)::int as total,
      count(lp.completed_at)::int as done
    from lessons l
    inner join modules m on m.id = l.module_id
    left join lesson_progress lp
      on lp.lesson_id = l.id and lp.user_id = ${userId}
    where m.course_id = ${courseId}
  `);
  const first = result.rows[0];
  if (!first) return false;
  return first.total > 0 && first.total === first.done;
}
