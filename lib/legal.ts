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

const DEFAULT_BODIES: Record<LegalPageSlug, unknown> = {
  privacy: paragraph(
    "Replace this placeholder with your privacy policy. Describe the personal information you collect (name, email, payment data, usage analytics), how you use it, the third parties you share it with (payment processor, hosting, analytics), and the security measures protecting it. Indian operators should reference compliance with the Digital Personal Data Protection Act, 2023.",
  ),
  terms: paragraph(
    "Replace this placeholder with your terms of service. Cover account use, acceptable use, intellectual property, payment terms, account termination, disclaimers, limitation of liability, and governing law. Include explicit references to your refund and cancellation policy if you do not maintain a separate page.",
  ),
  refund: paragraph(
    "Replace this placeholder with your cancellation and refund policy. State the refund window, eligible products or services, the procedure to request a refund, the timeline for processing, and any non-refundable items. Keep terms aligned with applicable Indian consumer law.",
  ),
  contact: paragraph(
    "We are happy to help. Reach out using the details above. Our support team responds within 1 business day.",
  ),
};

function paragraph(text: string) {
  return {
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text }] },
    ],
  };
}

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
      bodyTiptap: row?.bodyTiptap ?? DEFAULT_BODIES[slug],
      updatedAt: row?.updatedAt ?? null,
      isCustom: !!row,
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
    bodyTiptap: row?.bodyTiptap ?? DEFAULT_BODIES[slug],
    updatedAt: row?.updatedAt ?? null,
    isCustom: !!row,
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
