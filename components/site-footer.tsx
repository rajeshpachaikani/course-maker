import Link from "next/link";
import type { Route } from "next";
import { loadSiteSettings } from "@/lib/theme";
import { FooterYear } from "./footer-year";

export async function SiteFooter() {
  const site = await loadSiteSettings();
  const company = site.companyName ?? site.name;
  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "32px 48px 28px",
        borderTop: "1px solid var(--hair)",
        background: "var(--paper-2)",
        fontSize: 13,
        color: "var(--ink-3)",
        display: "flex",
        flexWrap: "wrap",
        gap: 24,
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontWeight: 600, color: "var(--ink)" }}>{company}</span>
        {site.companyAddress ? (
          <span style={{ whiteSpace: "pre-line", maxWidth: 320 }}>
            {site.companyAddress}
          </span>
        ) : null}
        {site.contactPhone ? <span>Phone · {site.contactPhone}</span> : null}
        {site.supportEmail ? (
          <a href={`mailto:${site.supportEmail}`} style={{ color: "inherit" }}>
            {site.supportEmail}
          </a>
        ) : null}
      </div>
      <nav
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px 18px",
          fontSize: 12.5,
        }}
        aria-label="Legal"
      >
        <Link href={"/contact" as Route}>Contact</Link>
        <Link href={"/privacy" as Route}>Privacy</Link>
        <Link href={"/terms" as Route}>Terms</Link>
        <Link href={"/refund" as Route}>Refund &amp; Cancellation</Link>
      </nav>
      <div className="mono-label" style={{ fontSize: 10.5 }}>
        © <FooterYear /> {company}
      </div>
    </footer>
  );
}
