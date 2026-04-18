import "server-only";
import { cacheTag, cacheLife } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  courses,
  modules,
  lessons,
  type Course,
  type Module,
  type Lesson,
} from "@/lib/db/schema";
import { newId, slugify } from "@/lib/ids";

export const COURSES_TAG = "courses";
export const courseTag = (id: string) => `course-${id}`;
export const publishedCoursesTag = "published-courses";

type Json = unknown;

export interface CourseWithCounts extends Course {
  moduleCount: number;
  lessonCount: number;
}

export async function listCoursesAdmin(): Promise<CourseWithCounts[]> {
  "use cache";
  cacheTag(COURSES_TAG);
  cacheLife("max");
  const rows = await db
    .select({
      course: courses,
      moduleCount: sql<number>`count(distinct ${modules.id})::int`,
      lessonCount: sql<number>`count(distinct ${lessons.id})::int`,
    })
    .from(courses)
    .leftJoin(modules, eq(modules.courseId, courses.id))
    .leftJoin(lessons, eq(lessons.moduleId, modules.id))
    .groupBy(courses.id)
    .orderBy(asc(courses.title));
  return rows.map((r) => ({
    ...r.course,
    moduleCount: r.moduleCount ?? 0,
    lessonCount: r.lessonCount ?? 0,
  }));
}

export async function listPublishedCourses(): Promise<Course[]> {
  "use cache";
  cacheTag(publishedCoursesTag);
  cacheLife("max");
  return db
    .select()
    .from(courses)
    .where(eq(courses.published, true))
    .orderBy(asc(courses.title));
}

export async function getCourseById(id: string): Promise<Course | null> {
  "use cache";
  cacheTag(courseTag(id));
  cacheLife("max");
  const rows = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  "use cache";
  cacheTag(publishedCoursesTag);
  cacheLife("max");
  const rows = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export interface CourseTree {
  course: Course;
  modules: Array<Module & { lessons: Lesson[] }>;
}

export async function getCourseTree(id: string): Promise<CourseTree | null> {
  "use cache";
  cacheTag(courseTag(id));
  cacheLife("max");
  const courseRows = await db
    .select()
    .from(courses)
    .where(eq(courses.id, id))
    .limit(1);
  const course = courseRows[0];
  if (!course) return null;
  const mods = await db
    .select()
    .from(modules)
    .where(eq(modules.courseId, id))
    .orderBy(asc(modules.position), asc(modules.createdAt));
  const modIds = mods.map((m) => m.id);
  const lessonRows = modIds.length
    ? await db
        .select()
        .from(lessons)
        .where(inModuleList(modIds))
        .orderBy(asc(lessons.position), asc(lessons.createdAt))
    : [];
  const byModule = new Map<string, Lesson[]>();
  for (const l of lessonRows) {
    const arr = byModule.get(l.moduleId) ?? [];
    arr.push(l);
    byModule.set(l.moduleId, arr);
  }
  return {
    course,
    modules: mods.map((m) => ({ ...m, lessons: byModule.get(m.id) ?? [] })),
  };
}

function inModuleList(ids: string[]) {
  return sql`${lessons.moduleId} in (${sql.join(
    ids.map((id) => sql`${id}`),
    sql.raw(", "),
  )})`;
}

async function ensureUniqueCourseSlug(base: string, ignoreId?: string) {
  const clean = slugify(base) || "course";
  let candidate = clean;
  let n = 1;
  while (true) {
    const existing = await db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, candidate))
      .limit(1);
    const row = existing[0];
    if (!row || row.id === ignoreId) return candidate;
    n += 1;
    candidate = `${clean}-${n}`;
  }
}

async function ensureUniqueLessonSlug(
  moduleId: string,
  base: string,
  ignoreId?: string,
) {
  const clean = slugify(base) || "lesson";
  let candidate = clean;
  let n = 1;
  while (true) {
    const existing = await db
      .select({ id: lessons.id })
      .from(lessons)
      .where(and(eq(lessons.moduleId, moduleId), eq(lessons.slug, candidate)))
      .limit(1);
    const row = existing[0];
    if (!row || row.id === ignoreId) return candidate;
    n += 1;
    candidate = `${clean}-${n}`;
  }
}

export interface CreateCourseInput {
  title: string;
  subtitle?: string | null;
  instructorUserId?: string | null;
}

export async function createCourse(
  input: CreateCourseInput,
): Promise<Course> {
  const id = newId("crs");
  const slug = await ensureUniqueCourseSlug(input.title);
  const [row] = await db
    .insert(courses)
    .values({
      id,
      slug,
      title: input.title,
      subtitle: input.subtitle ?? null,
      instructorUserId: input.instructorUserId ?? null,
      priceCents: 0,
      currency: "USD",
      isFree: false,
      published: false,
    })
    .returning();
  return row;
}

export interface UpdateCourseInput {
  title?: string;
  slug?: string;
  subtitle?: string | null;
  descriptionTiptap?: Json | null;
  coverImageUrl?: string | null;
  priceCents?: number;
  currency?: string;
  isFree?: boolean;
  published?: boolean;
  instructorUserId?: string | null;
}

export async function updateCourse(
  id: string,
  patch: UpdateCourseInput,
): Promise<Course> {
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.title !== undefined) values.title = patch.title;
  if (patch.slug !== undefined) {
    values.slug = await ensureUniqueCourseSlug(patch.slug, id);
  }
  if (patch.subtitle !== undefined) values.subtitle = patch.subtitle;
  if (patch.descriptionTiptap !== undefined)
    values.descriptionTiptap = patch.descriptionTiptap;
  if (patch.coverImageUrl !== undefined)
    values.coverImageUrl = patch.coverImageUrl;
  if (patch.priceCents !== undefined) values.priceCents = patch.priceCents;
  if (patch.currency !== undefined) values.currency = patch.currency;
  if (patch.isFree !== undefined) values.isFree = patch.isFree;
  if (patch.published !== undefined) values.published = patch.published;
  if (patch.instructorUserId !== undefined)
    values.instructorUserId = patch.instructorUserId;
  const [row] = await db
    .update(courses)
    .set(values)
    .where(eq(courses.id, id))
    .returning();
  if (!row) throw new Error("Course not found");
  return row;
}

export async function deleteCourse(id: string): Promise<void> {
  await db.delete(courses).where(eq(courses.id, id));
}

export async function createModule(
  courseId: string,
  title: string,
): Promise<Module> {
  const countRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(modules)
    .where(eq(modules.courseId, courseId));
  const position = (countRows[0]?.count ?? 0) + 1;
  const [row] = await db
    .insert(modules)
    .values({ id: newId("mod"), courseId, title, position })
    .returning();
  return row;
}

export async function updateModule(
  id: string,
  patch: { title?: string; position?: number },
): Promise<Module> {
  const values: Record<string, unknown> = {};
  if (patch.title !== undefined) values.title = patch.title;
  if (patch.position !== undefined) values.position = patch.position;
  const [row] = await db
    .update(modules)
    .set(values)
    .where(eq(modules.id, id))
    .returning();
  if (!row) throw new Error("Module not found");
  return row;
}

export async function deleteModule(id: string): Promise<void> {
  await db.delete(modules).where(eq(modules.id, id));
}

export async function reorderModules(
  courseId: string,
  orderedIds: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(modules)
        .set({ position: i + 1 })
        .where(and(eq(modules.id, orderedIds[i]), eq(modules.courseId, courseId)));
    }
  });
}

export interface CreateLessonInput {
  moduleId: string;
  title: string;
}

export async function createLesson(
  input: CreateLessonInput,
): Promise<Lesson> {
  const slug = await ensureUniqueLessonSlug(input.moduleId, input.title);
  const countRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lessons)
    .where(eq(lessons.moduleId, input.moduleId));
  const position = (countRows[0]?.count ?? 0) + 1;
  const [row] = await db
    .insert(lessons)
    .values({
      id: newId("les"),
      moduleId: input.moduleId,
      slug,
      title: input.title,
      position,
      isFreePreview: false,
    })
    .returning();
  return row;
}

export async function updateLesson(
  id: string,
  patch: {
    title?: string;
    slug?: string;
    descriptionTiptap?: Json | null;
    bunnyVideoId?: string | null;
    durationSec?: number | null;
    position?: number;
    isFreePreview?: boolean;
  },
): Promise<Lesson> {
  const existing = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id))
    .limit(1);
  const current = existing[0];
  if (!current) throw new Error("Lesson not found");
  const values: Record<string, unknown> = {};
  if (patch.title !== undefined) values.title = patch.title;
  if (patch.slug !== undefined) {
    values.slug = await ensureUniqueLessonSlug(
      current.moduleId,
      patch.slug,
      id,
    );
  }
  if (patch.descriptionTiptap !== undefined)
    values.descriptionTiptap = patch.descriptionTiptap;
  if (patch.bunnyVideoId !== undefined) values.bunnyVideoId = patch.bunnyVideoId;
  if (patch.durationSec !== undefined) values.durationSec = patch.durationSec;
  if (patch.position !== undefined) values.position = patch.position;
  if (patch.isFreePreview !== undefined)
    values.isFreePreview = patch.isFreePreview;
  const [row] = await db
    .update(lessons)
    .set(values)
    .where(eq(lessons.id, id))
    .returning();
  if (!row) throw new Error("Lesson not found");
  return row;
}

export async function deleteLesson(id: string): Promise<void> {
  await db.delete(lessons).where(eq(lessons.id, id));
}

export async function reorderLessons(
  moduleId: string,
  orderedIds: string[],
): Promise<void> {
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(lessons)
        .set({ position: i + 1 })
        .where(and(eq(lessons.id, orderedIds[i]), eq(lessons.moduleId, moduleId)));
    }
  });
}

export async function getModule(id: string): Promise<Module | null> {
  const rows = await db
    .select()
    .from(modules)
    .where(eq(modules.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLesson(id: string): Promise<Lesson | null> {
  const rows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, id))
    .limit(1);
  return rows[0] ?? null;
}
