import "server-only";
import { cacheTag, cacheLife } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pages, type Page } from "@/lib/db/schema";
import { newId, slugify } from "@/lib/ids";

export const PAGES_TAG = "pages";
export const pageTag = (id: string) => `page-${id}`;
export const pageSlugTag = (slug: string) => `page-slug-${slug}`;

export async function listPages(): Promise<Page[]> {
  "use cache";
  cacheTag(PAGES_TAG);
  cacheLife("max");
  return db.select().from(pages).orderBy(asc(pages.slug));
}

export async function getPage(id: string): Promise<Page | null> {
  "use cache";
  cacheTag(pageTag(id));
  cacheLife("max");
  const rows = await db.select().from(pages).where(eq(pages.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getPublishedPageBySlug(
  slug: string,
): Promise<Page | null> {
  "use cache";
  cacheTag(pageSlugTag(slug));
  cacheLife("max");
  const rows = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, slug))
    .limit(1);
  const row = rows[0];
  if (!row || !row.published) return null;
  return row;
}

async function ensureUniquePageSlug(base: string, ignoreId?: string) {
  const clean = slugify(base) || "page";
  let candidate = clean;
  let n = 1;
  while (true) {
    const existing = await db
      .select({ id: pages.id })
      .from(pages)
      .where(eq(pages.slug, candidate))
      .limit(1);
    const row = existing[0];
    if (!row || row.id === ignoreId) return candidate;
    n += 1;
    candidate = `${clean}-${n}`;
  }
}

export async function createPage(input: {
  title: string;
  slug?: string;
}): Promise<Page> {
  const slug = await ensureUniquePageSlug(input.slug ?? input.title);
  const [row] = await db
    .insert(pages)
    .values({
      id: newId("pg"),
      slug,
      title: input.title,
      puckData: { content: [], root: {} },
      published: false,
    })
    .returning();
  return row;
}

export async function updatePage(
  id: string,
  patch: {
    title?: string | null;
    slug?: string;
    puckData?: unknown;
    published?: boolean;
  },
): Promise<Page> {
  const values: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.title !== undefined) values.title = patch.title;
  if (patch.slug !== undefined) {
    values.slug = await ensureUniquePageSlug(patch.slug, id);
  }
  if (patch.puckData !== undefined) values.puckData = patch.puckData;
  if (patch.published !== undefined) values.published = patch.published;
  const [row] = await db
    .update(pages)
    .set(values)
    .where(eq(pages.id, id))
    .returning();
  if (!row) throw new Error("Page not found");
  return row;
}

export async function deletePage(id: string): Promise<void> {
  await db.delete(pages).where(eq(pages.id, id));
}
