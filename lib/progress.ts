import "server-only";
import { and, eq, inArray } from "drizzle-orm";
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
}): Promise<LessonProgress> {
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
    return row;
  }
  const values: Record<string, unknown> = { updatedAt: now };
  if (input.lastPositionSec !== undefined) {
    values.lastPositionSec = Math.max(
      existing.lastPositionSec,
      input.lastPositionSec,
    );
  }
  if (input.completed && !existing.completedAt) {
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
  return row;
}
