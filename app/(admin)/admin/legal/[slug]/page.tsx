import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { LEGAL_SLUGS, LEGAL_META, loadLegalPage } from "@/lib/legal";
import type { LegalPageSlug } from "@/lib/db/schema";
import { LegalPageEditor } from "./editor";

export const metadata = { title: "Edit legal page" };

function isLegalSlug(v: string): v is LegalPageSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(v);
}

export default async function EditLegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  await requireAdmin();
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  const page = await loadLegalPage(slug);
  const meta = LEGAL_META[slug];

  return (
    <>
      <div className="admin-header">
        <div>
          <div className="mono-label" style={{ marginBottom: 6 }}>
            — Legal · {slug}
          </div>
          <h1>{page.title}</h1>
          <div className="admin-header-sub">
            Public route <code>{meta.route}</code>
          </div>
        </div>
        <Link href={"/admin/legal" as Route} className="btn btn-ghost">
          ← Back
        </Link>
      </div>

      <div className="admin-section">
        <LegalPageEditor
          slug={slug}
          defaultTitle={page.title}
          defaultBody={page.bodyTiptap}
          publicRoute={meta.route}
        />
      </div>
    </>
  );
}
