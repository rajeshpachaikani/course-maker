import "server-only";
import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { legalPages, type LegalPageSlug } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const LEGAL_TAG = "legal-pages";

export const LEGAL_SLUGS: readonly LegalPageSlug[] = [
  "privacy",
  "terms",
  "refund",
  "contact",
] as const;

export const LEGAL_META: Record<
  LegalPageSlug,
  { title: string; route: `/${string}`; blurb: string }
> = {
  privacy: {
    title: "Privacy Policy",
    route: "/privacy",
    blurb:
      "Information collected, how it's used, third parties it's shared with, and security practices.",
  },
  terms: {
    title: "Terms of Service",
    route: "/terms",
    blurb:
      "Rules of use, user obligations, intellectual property, liability, and governing law.",
  },
  refund: {
    title: "Cancellation & Refund Policy",
    route: "/refund",
    blurb: "Refund eligibility, cancellation windows, and the request process.",
  },
  contact: {
    title: "Contact Us",
    route: "/contact",
    blurb:
      "Customer support details. Company name, registered address, phone, and email render automatically above the body.",
  },
};

export async function loadLegalPages() {
  "use cache";
  cacheTag(LEGAL_TAG);
  cacheLife("max");
  const rows = await db.select().from(legalPages);
  const map = new Map<LegalPageSlug, (typeof rows)[number]>();
  for (const r of rows) map.set(r.slug, r);
  return LEGAL_SLUGS.map((slug) => {
    const row = map.get(slug);
    return {
      slug,
      title: row?.title ?? LEGAL_META[slug].title,
      bodyTiptap: row?.bodyTiptap ?? null,
      updatedAt: row?.updatedAt ?? null,
    };
  });
}

export async function loadLegalPage(slug: LegalPageSlug) {
  "use cache";
  cacheTag(LEGAL_TAG);
  cacheLife("max");
  const rows = await db
    .select()
    .from(legalPages)
    .where(eq(legalPages.slug, slug))
    .limit(1);
  const row = rows[0];
  return {
    slug,
    title: row?.title ?? LEGAL_META[slug].title,
    bodyTiptap: row?.bodyTiptap ?? null,
    updatedAt: row?.updatedAt ?? null,
  };
}

export async function upsertLegalPage(
  slug: LegalPageSlug,
  patch: { title: string; bodyTiptap: unknown },
) {
  const existing = await db
    .select({ slug: legalPages.slug })
    .from(legalPages)
    .where(eq(legalPages.slug, slug))
    .limit(1);
  if (existing[0]) {
    await db
      .update(legalPages)
      .set({
        title: patch.title,
        bodyTiptap: patch.bodyTiptap as never,
        updatedAt: new Date(),
      })
      .where(eq(legalPages.slug, slug));
  } else {
    await db.insert(legalPages).values({
      slug,
      title: patch.title,
      bodyTiptap: patch.bodyTiptap as never,
    });
  }
}
