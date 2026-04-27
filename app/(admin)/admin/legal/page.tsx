import Link from "next/link";
import type { Route } from "next";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { loadLegalPages, LEGAL_META } from "@/lib/legal";

export const metadata = { title: "Legal pages" };

const CARD_STYLE: React.CSSProperties = {
  background: "var(--paper-2)",
  border: "1px solid var(--hair)",
  borderRadius: "var(--radius-lg)",
  padding: 20,
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

export default async function AdminLegalIndexPage() {
  await connection();
  await requireAdmin();
  const pages = await loadLegalPages();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Legal pages</h1>
          <div className="admin-header-sub">
            — Compliance content shown on public footer · privacy · terms ·
            refund · contact
          </div>
        </div>
      </div>

      <div className="admin-section">
        <p
          style={{
            fontSize: 13,
            color: "var(--ink-3)",
            margin: "0 0 18px",
            maxWidth: 720,
          }}
        >
          Edit each document below. The Contact page additionally shows your
          registered company name, address, phone, and support email — set those
          on the <Link href="/admin/settings">Settings</Link> page.
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
          }}
        >
          {pages.map((p) => {
            const meta = LEGAL_META[p.slug];
            return (
              <div key={p.slug} style={CARD_STYLE}>
                <div className="mono-label">— {p.slug.toUpperCase()}</div>
                <h3
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: 18,
                    margin: 0,
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  {p.title}
                </h3>
                <p
                  style={{
                    fontSize: 12.5,
                    color: "var(--ink-3)",
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {meta.blurb}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    marginTop: 4,
                  }}
                >
                  <span
                    className="mono-label"
                    style={{ fontSize: 10 }}
                  >
                    {p.updatedAt
                      ? `Edited · ${p.updatedAt.toLocaleDateString()}`
                      : "Default content"}
                  </span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Link
                      href={meta.route as Route}
                      target="_blank"
                      className="btn btn-ghost"
                      style={{ fontSize: 11, padding: "5px 10px" }}
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/legal/${p.slug}` as Route}
                      className="btn btn-primary"
                      style={{ fontSize: 11, padding: "5px 10px" }}
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
