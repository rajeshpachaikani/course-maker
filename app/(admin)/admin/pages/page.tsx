import Link from "next/link";
import { listPages } from "@/lib/pages";
import { createPageAction, deletePageAction } from "./actions";

export const metadata = { title: "Pages" };

export default async function AdminPagesPage() {
  const pages = await listPages();
  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold">Pages</h1>
        <p className="text-sm text-[var(--cf-muted-fg)]">
          Build marketing pages with drag-and-drop blocks.
        </p>
      </header>

      <section className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <h2 className="text-base font-semibold">Create page</h2>
        <form
          action={createPageAction}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Title</span>
            <input
              type="text"
              name="title"
              required
              placeholder="About us"
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm">
            <span className="font-medium">Slug (optional)</span>
            <input
              type="text"
              name="slug"
              placeholder="about"
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm font-mono"
            />
          </label>
          <button type="submit" className="cf-btn-primary">
            Create
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">All pages</h2>
        {pages.length === 0 ? (
          <div className="rounded-[var(--cf-radius)] border border-dashed border-[var(--cf-border)] p-8 text-center text-sm text-[var(--cf-muted-fg)]">
            No pages yet. Create one above.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {pages.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-4 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/pages/${p.id}` as `/admin/pages/${string}`}
                      className="text-sm font-semibold hover:underline"
                    >
                      {p.title ?? p.slug}
                    </Link>
                    <span
                      className={`rounded px-2 py-0.5 text-xs ${
                        p.published
                          ? "bg-[var(--cf-accent)] text-[var(--cf-accent-fg)]"
                          : "border border-[var(--cf-border)] text-[var(--cf-muted-fg)]"
                      }`}
                    >
                      {p.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-[var(--cf-muted-fg)]">
                    /{p.slug}
                  </div>
                </div>
                <form action={deletePageAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="slug" value={p.slug} />
                  <button
                    type="submit"
                    className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] px-3 py-1.5 text-xs text-[var(--cf-muted-fg)] hover:text-[var(--cf-fg)]"
                  >
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
