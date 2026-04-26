"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { LEGAL_SLUGS, LEGAL_TAG, upsertLegalPage } from "@/lib/legal";
import type { LegalPageSlug } from "@/lib/db/schema";

function isLegalSlug(v: string): v is LegalPageSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(v);
}

export async function saveLegalPageAction(
  slug: string,
  payload: { title: string; bodyTiptap: unknown },
) {
  await requireAdmin();
  if (!isLegalSlug(slug)) throw new Error("Invalid legal page slug");
  const title = payload.title.trim();
  if (!title) throw new Error("Title is required");
  await upsertLegalPage(slug, { title, bodyTiptap: payload.bodyTiptap });
  updateTag(LEGAL_TAG);
}
