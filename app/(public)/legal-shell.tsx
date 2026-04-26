import type { ReactNode } from "react";

export function LegalArticle({
  title,
  kicker,
  updatedAt,
  children,
}: {
  title: string;
  kicker: string;
  updatedAt?: Date | null;
  children: ReactNode;
}) {
  return (
    <article
      style={{
        maxWidth: 760,
        margin: "0 auto",
        padding: "56px 24px 80px",
      }}
    >
      <div className="mono-label" style={{ marginBottom: 8 }}>
        — {kicker}
      </div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: 44,
          margin: "0 0 8px",
          fontWeight: 600,
          color: "var(--ink)",
          lineHeight: 1.1,
        }}
      >
        {title}
      </h1>
      {updatedAt ? (
        <div className="mono-label" style={{ fontSize: 11, marginBottom: 32 }}>
          Last updated {updatedAt.toLocaleDateString()}
        </div>
      ) : (
        <div style={{ marginBottom: 32 }} />
      )}
      <div className="prose-legal">{children}</div>
    </article>
  );
}

export function LegalSkeleton({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <LegalArticle title={title} kicker={kicker}>
      <p className="mono-label">— Loading…</p>
    </LegalArticle>
  );
}
