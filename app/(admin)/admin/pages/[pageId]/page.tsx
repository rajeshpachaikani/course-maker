import { notFound } from "next/navigation";
import Link from "next/link";
import { getPage } from "@/lib/pages";
import { loadSiteSettings } from "@/lib/theme";
import { PageEditor } from "./page-editor";
import { deletePageAction } from "../actions";

export const metadata = { title: "Edit page" };

export default async function PageEditPage({
  params,
}: {
  params: Promise<{ pageId: string }>;
}) {
  const { pageId } = await params;
  const [page, site] = await Promise.all([getPage(pageId), loadSiteSettings()]);
  if (!page) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-[none]">
      <header className="flex items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/pages"
            className="text-xs text-[var(--cf-muted-fg)] hover:underline"
          >
            ← Pages
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">
            {page.title ?? page.slug}
          </h1>
          <p className="text-sm text-[var(--cf-muted-fg)]">
            /{page.slug} · {page.published ? "Published" : "Draft"}
          </p>
        </div>
        <form action={deletePageAction}>
          <input type="hidden" name="id" value={page.id} />
          <input type="hidden" name="slug" value={page.slug} />
          <button
            type="submit"
            className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] px-3 py-1.5 text-xs text-[var(--cf-muted-fg)] hover:text-[var(--cf-fg)]"
          >
            Delete page
          </button>
        </form>
      </header>
      <PageEditor
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          published: page.published,
          puckData: page.puckData,
        }}
        rawHtmlEnabled={site.rawHtmlBlockEnabled}
      />
    </div>
  );
}
