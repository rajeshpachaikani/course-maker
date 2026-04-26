import { connection } from "next/server";
import { TiptapRender } from "@/components/tiptap-render";
import { loadLegalPage } from "@/lib/legal";
import { loadSiteSettings } from "@/lib/theme";
import { LegalShell } from "../legal-shell";

export const metadata = { title: "Contact Us" };

const ROW_STYLE: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "140px 1fr",
  gap: 16,
  padding: "10px 0",
  borderBottom: "1px dotted var(--hair-2)",
  fontSize: 14,
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--mono, ui-monospace, monospace)",
  fontSize: 11,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "var(--ink-3)",
};

export default async function ContactPage() {
  await connection();
  const [page, site] = await Promise.all([
    loadLegalPage("contact"),
    loadSiteSettings(),
  ]);

  const company = site.companyName ?? site.name;
  const hasDetails =
    !!site.companyName ||
    !!site.companyAddress ||
    !!site.contactPhone ||
    !!site.supportEmail;

  return (
    <LegalShell title={page.title} kicker="Support" updatedAt={page.updatedAt}>
      {hasDetails ? (
        <section
          style={{
            margin: "0 0 28px",
            padding: "8px 18px",
            border: "1px solid var(--hair)",
            borderRadius: "var(--radius-lg)",
            background: "var(--paper-2)",
          }}
        >
          {site.companyName ? (
            <div style={ROW_STYLE}>
              <span style={LABEL_STYLE}>Company</span>
              <span>{company}</span>
            </div>
          ) : null}
          {site.companyAddress ? (
            <div style={ROW_STYLE}>
              <span style={LABEL_STYLE}>Address</span>
              <span style={{ whiteSpace: "pre-line" }}>
                {site.companyAddress}
              </span>
            </div>
          ) : null}
          {site.contactPhone ? (
            <div style={ROW_STYLE}>
              <span style={LABEL_STYLE}>Phone</span>
              <a
                href={`tel:${site.contactPhone.replace(/[^+\d]/g, "")}`}
                style={{ color: "inherit" }}
              >
                {site.contactPhone}
              </a>
            </div>
          ) : null}
          {site.supportEmail ? (
            <div style={{ ...ROW_STYLE, borderBottom: "none" }}>
              <span style={LABEL_STYLE}>Email</span>
              <a
                href={`mailto:${site.supportEmail}`}
                style={{ color: "inherit" }}
              >
                {site.supportEmail}
              </a>
            </div>
          ) : null}
        </section>
      ) : (
        <p
          className="mono-label"
          style={{
            padding: "12px 14px",
            border: "1px dashed var(--hair-2)",
            borderRadius: "var(--radius)",
            color: "var(--ink-3)",
            marginBottom: 24,
          }}
        >
          — Set the registered company details on /admin/settings to populate
          this section.
        </p>
      )}
      <TiptapRender doc={page.bodyTiptap as never} />
    </LegalShell>
  );
}
