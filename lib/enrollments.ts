import "server-only";
import { asc, eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  enrollments,
  courses,
  webhookEvents,
  type Enrollment,
  type Course,
} from "@/lib/db/schema";
import { newId } from "@/lib/ids";

export async function isEnrolled(
  userId: string,
  courseId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
    )
    .limit(1);
  return rows.length > 0;
}

export async function createEnrollment(input: {
  userId: string;
  courseId: string;
  stripeSessionId?: string | null;
  amountPaidCents: number;
  currency: string;
}): Promise<Enrollment> {
  const existing = await db
    .select()
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, input.userId),
        eq(enrollments.courseId, input.courseId),
      ),
    )
    .limit(1);
  if (existing[0]) return existing[0];
  const [row] = await db
    .insert(enrollments)
    .values({
      id: newId("enr"),
      userId: input.userId,
      courseId: input.courseId,
      stripeSessionId: input.stripeSessionId ?? null,
      amountPaidCents: input.amountPaidCents,
      currency: input.currency,
    })
    .returning();
  return row;
}

export async function listUserEnrollments(
  userId: string,
): Promise<Array<{ enrollment: Enrollment; course: Course }>> {
  const rows = await db
    .select({ enrollment: enrollments, course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(eq(enrollments.userId, userId))
    .orderBy(asc(courses.title));
  return rows;
}

export async function recordWebhookEvent(
  provider: string,
  eventId: string,
  payload: unknown,
): Promise<boolean> {
  try {
    await db.insert(webhookEvents).values({
      provider,
      eventId,
      payload: payload as never,
    });
    return true;
  } catch {
    return false;
  }
}
