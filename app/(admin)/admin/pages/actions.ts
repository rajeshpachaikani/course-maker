"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import {
  createPage,
  updatePage,
  deletePage,
  PAGES_TAG,
  pageTag,
  pageSlugTag,
} from "@/lib/pages";

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

export async function createPageAction(formData: FormData) {
  await requireAdmin();
  const title = requireString(formData.get("title"), "Title");
  const slug = optionalString(formData.get("slug"));
  const page = await createPage({ title, slug: slug ?? undefined });
  updateTag(PAGES_TAG);
  redirect(`/admin/pages/${page.id}` as `/admin/pages/${string}`);
}

export async function deletePageAction(formData: FormData) {
  await requireAdmin();
  const id = requireString(formData.get("id"), "Page id");
  const slug = optionalString(formData.get("slug"));
  await deletePage(id);
  updateTag(PAGES_TAG);
  updateTag(pageTag(id));
  if (slug) updateTag(pageSlugTag(slug));
  redirect("/admin/pages");
}

export async function savePageAction(
  id: string,
  patch: {
    title?: string;
    slug?: string;
    puckData?: unknown;
    published?: boolean;
  },
) {
  await requireAdmin();
  const prev = await updatePage(id, patch);
  updateTag(PAGES_TAG);
  updateTag(pageTag(id));
  updateTag(pageSlugTag(prev.slug));
}
