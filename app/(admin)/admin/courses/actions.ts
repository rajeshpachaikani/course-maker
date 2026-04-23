"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireStaff } from "@/lib/dal";
import {
  createCourse,
  deleteCourse,
  updateCourse,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  COURSES_TAG,
  courseTag,
  publishedCoursesTag,
  getCourseById,
} from "@/lib/courses";

function requireString(v: FormDataEntryValue | null, field: string): string {
  if (typeof v !== "string" || v.trim().length === 0) {
    throw new Error(`${field} is required`);
  }
  return v.trim();
}

function optionalString(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function asBool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

export async function createCourseAction(formData: FormData) {
  await requireStaff();
  const title = requireString(formData.get("title"), "Title");
  const course = await createCourse({
    title,
    subtitle: optionalString(formData.get("subtitle")),
  });
  updateTag(COURSES_TAG);
  redirect(`/admin/courses/${course.id}` as `/admin/courses/${string}`);
}

export async function deleteCourseAction(formData: FormData) {
  await requireStaff();
  const id = requireString(formData.get("id"), "Course id");
  await deleteCourse(id);
  updateTag(COURSES_TAG);
  updateTag(courseTag(id));
  updateTag(publishedCoursesTag);
  redirect("/admin/courses");
}

export async function updateCourseAction(formData: FormData) {
  const { caps } = await requireStaff();
  const id = requireString(formData.get("id"), "Course id");

  const patch: Parameters<typeof updateCourse>[1] = {
    title: requireString(formData.get("title"), "Title"),
    slug: requireString(formData.get("slug"), "Slug"),
    subtitle: optionalString(formData.get("subtitle")),
    coverImageUrl: optionalString(formData.get("coverImageUrl")),
  };

  if (caps.canSetPricing) {
    const priceRaw = formData.get("priceCents");
    if (typeof priceRaw === "string" && priceRaw.length) {
      patch.priceCents = Math.max(0, Math.round(Number(priceRaw)));
    }
    patch.currency = requireString(
      formData.get("currency"),
      "Currency",
    ).toUpperCase();
    patch.isFree = asBool(formData.get("isFree"));
  }

  if (caps.canPublishCourse) {
    patch.published = asBool(formData.get("published"));
  }

  await updateCourse(id, patch);
  updateTag(COURSES_TAG);
  updateTag(courseTag(id));
  updateTag(publishedCoursesTag);
}

export async function updateCourseDescriptionAction(
  courseId: string,
  doc: unknown,
) {
  await requireStaff();
  // descriptionTiptap column is not in the plain UpdateCourseInput branch that
  // only touches metadata, so go through updateCourse directly.
  const existing = await getCourseById(courseId);
  if (!existing) throw new Error("Course not found");
  await updateCourse(courseId, { descriptionTiptap: doc });
  updateTag(courseTag(courseId));
}

export async function createModuleAction(formData: FormData) {
  await requireStaff();
  const courseId = requireString(formData.get("courseId"), "Course id");
  const title = requireString(formData.get("title"), "Module title");
  await createModule(courseId, title);
  updateTag(courseTag(courseId));
  updateTag(COURSES_TAG);
}

export async function updateModuleAction(formData: FormData) {
  await requireStaff();
  const courseId = requireString(formData.get("courseId"), "Course id");
  const id = requireString(formData.get("id"), "Module id");
  await updateModule(id, {
    title: requireString(formData.get("title"), "Module title"),
  });
  updateTag(courseTag(courseId));
}

export async function deleteModuleAction(formData: FormData) {
  await requireStaff();
  const courseId = requireString(formData.get("courseId"), "Course id");
  const id = requireString(formData.get("id"), "Module id");
  await deleteModule(id);
  updateTag(courseTag(courseId));
  updateTag(COURSES_TAG);
}

export async function reorderModulesAction(
  courseId: string,
  orderedIds: string[],
) {
  await requireStaff();
  await reorderModules(courseId, orderedIds);
  updateTag(courseTag(courseId));
}

export async function createLessonAction(formData: FormData) {
  await requireStaff();
  const courseId = requireString(formData.get("courseId"), "Course id");
  const moduleId = requireString(formData.get("moduleId"), "Module id");
  const title = requireString(formData.get("title"), "Lesson title");
  await createLesson({ moduleId, title });
  updateTag(courseTag(courseId));
  updateTag(COURSES_TAG);
}

export async function reorderLessonsAction(
  courseId: string,
  moduleId: string,
  orderedIds: string[],
) {
  await requireStaff();
  await reorderLessons(moduleId, orderedIds);
  updateTag(courseTag(courseId));
}

export async function updateLessonAction(formData: FormData) {
  await requireStaff();
  const courseId = requireString(formData.get("courseId"), "Course id");
  const id = requireString(formData.get("id"), "Lesson id");
  await updateLesson(id, {
    title: requireString(formData.get("title"), "Title"),
    slug: requireString(formData.get("slug"), "Slug"),
    isFreePreview: asBool(formData.get("isFreePreview")),
  });
  updateTag(courseTag(courseId));
}

export async function updateLessonDescriptionAction(
  courseId: string,
  lessonId: string,
  doc: unknown,
) {
  await requireStaff();
  await updateLesson(lessonId, { descriptionTiptap: doc });
  updateTag(courseTag(courseId));
}

export async function updateLessonVideoAction(
  courseId: string,
  lessonId: string,
  bunnyVideoId: string | null,
  durationSec: number | null,
) {
  await requireStaff();
  await updateLesson(lessonId, {
    bunnyVideoId,
    durationSec,
  });
  updateTag(courseTag(courseId));
}

export async function deleteLessonAction(formData: FormData) {
  await requireStaff();
  const courseId = requireString(formData.get("courseId"), "Course id");
  const id = requireString(formData.get("id"), "Lesson id");
  await deleteLesson(id);
  updateTag(courseTag(courseId));
  updateTag(COURSES_TAG);
}
