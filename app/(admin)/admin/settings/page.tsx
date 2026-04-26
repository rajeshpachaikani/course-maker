import { connection } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { loadSiteSettings } from "@/lib/theme";
import {
  CREDENTIAL_KEYS,
  listCredentialsMeta,
  type CredentialKey,
} from "@/lib/credentials";
import { CredentialRow } from "./credential-row";
import { SiteSettingsForm } from "./site-form";
import { SmtpTestPanel } from "./smtp-test-panel";

export const metadata = { title: "Settings" };

const CARD_STYLE: React.CSSProperties = {
  background: "var(--paper-2)",
  border: "1px solid var(--hair)",
  borderRadius: "var(--radius-lg)",
  padding: 24,
};

const CREDENTIAL_LABELS: Record<CredentialKey, { label: string; hint?: string }> = {
  stripe_secret: { label: "Stripe secret key", hint: "sk_live_… or sk_test_…" },
  stripe_webhook_secret: { label: "Stripe webhook secret", hint: "whsec_…" },
  stripe_publishable: { label: "Stripe publishable key", hint: "pk_…" },
  bunny_api_key: { label: "Bunny account API key" },
  bunny_stream_library_id: { label: "Bunny Stream library ID" },
  bunny_stream_cdn_hostname: {
    label: "Bunny Stream CDN hostname",
    hint: "vz-xxxxxxxx.b-cdn.net",
  },
  bunny_storage_zone: { label: "Bunny storage zone name" },
  bunny_storage_key: { label: "Bunny storage access key" },
  smtp_host: { label: "SMTP host", hint: "smtp.email.eu-frankfurt-1.oci.oraclecloud.com" },
  smtp_port: { label: "SMTP port", hint: "587 (STARTTLS) or 465 (SSL)" },
  smtp_user: { label: "SMTP username", hint: "ocid1.user.oc1..… or approved sender" },
  smtp_password: { label: "SMTP password", hint: "Generated SMTP credential password" },
  smtp_from_email: {
    label: "From address",
    hint: "no-reply@yourdomain.com (must be approved sender)",
  },
  smtp_secure: {
    label: "SMTP secure",
    hint: "true for port 465 · false for 587/STARTTLS",
  },
  google_oauth_client_id: { label: "Google OAuth client ID" },
  google_oauth_client_secret: { label: "Google OAuth client secret" },
};

const CREDENTIAL_GROUPS: Array<{
  title: string;
  subtitle: string;
  keys: CredentialKey[];
}> = [
  {
    title: "Stripe",
    subtitle: "Payments · webhooks",
    keys: ["stripe_secret", "stripe_webhook_secret", "stripe_publishable"],
  },
  {
    title: "Bunny",
    subtitle: "Video storage + streaming",
    keys: [
      "bunny_api_key",
      "bunny_stream_library_id",
      "bunny_stream_cdn_hostname",
      "bunny_storage_zone",
      "bunny_storage_key",
    ],
  },
  {
    title: "SMTP",
    subtitle: "Transactional email · Oracle Cloud / any SMTP relay",
    keys: [
      "smtp_host",
      "smtp_port",
      "smtp_user",
      "smtp_password",
      "smtp_from_email",
      "smtp_secure",
    ],
  },
  {
    title: "Google OAuth",
    subtitle: "Social sign-in",
    keys: ["google_oauth_client_id", "google_oauth_client_secret"],
  },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string; s?: string; m?: string }>;
}) {
  await connection();
  await requireAdmin();
  const [site, credMeta, sp] = await Promise.all([
    loadSiteSettings(),
    listCredentialsMeta(),
    searchParams,
  ]);
  const metaMap = new Map(credMeta.map((m) => [m.key, m]));
  const setCount = credMeta.filter((m) => m.isSet).length;

  const statusKey = sp.k ?? null;
  const statusOk = sp.s === "ok";
  const statusMessage = sp.m ?? "";
  const siteStatus =
    statusKey === "site" && statusMessage
      ? { ok: statusOk, message: statusMessage }
      : null;
  const credStatusFor = (key: string) =>
    statusKey === key && statusMessage
      ? { ok: statusOk, message: statusMessage }
      : null;

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Settings</h1>
          <div className="admin-header-sub">
            — Site identity · provider credentials · {setCount}/
            {CREDENTIAL_KEYS.length} configured
          </div>
        </div>
      </div>

      <div className="admin-section">
        <section style={{ ...CARD_STYLE, marginBottom: 20 }}>
          <div className="mono-label" style={{ marginBottom: 4 }}>
            — Site identity
          </div>
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: 22,
              margin: "2px 0 6px",
              fontWeight: 600,
              color: "var(--ink)",
            }}
          >
            How your storefront introduces itself
          </h2>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-3)",
              margin: "0 0 18px",
            }}
          >
            Shown in browser tab, SEO metadata, and public layout.
          </p>
          <SiteSettingsForm
            defaults={{
              name: site.name,
              tagline: site.tagline ?? "",
              logoUrl: site.logoUrl ?? "",
              faviconUrl: site.faviconUrl ?? "",
              googleOauthEnabled: site.googleOauthEnabled,
              companyName: site.companyName ?? "",
              companyAddress: site.companyAddress ?? "",
              contactPhone: site.contactPhone ?? "",
              supportEmail: site.supportEmail ?? "",
            }}
            status={siteStatus}
          />
        </section>

        <section>
          <div
            style={{
              display: "flex",
              alignItems: "end",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div>
              <div className="mono-label">— Provider credentials</div>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: 22,
                  margin: "6px 0 0",
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                Keys & secrets{" "}
                <span
                  style={{
                    fontStyle: "italic",
                    color: "var(--ink-3)",
                    fontSize: 17,
                    fontWeight: 500,
                  }}
                >
                  — encrypted AES-256-GCM at rest
                </span>
              </h2>
              <p
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-3)",
                  margin: "6px 0 0",
                  maxWidth: 640,
                }}
              >
                Click the ? next to any field for a step-by-step guide on where to
                generate that key.
              </p>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {CREDENTIAL_GROUPS.map((group) => (
              <div key={group.title} style={CARD_STYLE}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: 18,
                        margin: 0,
                        fontWeight: 600,
                        color: "var(--ink)",
                      }}
                    >
                      {group.title}
                    </h3>
                    <div
                      className="mono-label"
                      style={{ fontSize: 10, marginTop: 3 }}
                    >
                      — {group.subtitle.toUpperCase()}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {group.keys.map((key, i) => {
                    const meta = metaMap.get(key);
                    const info = CREDENTIAL_LABELS[key];
                    return (
                      <CredentialRow
                        key={key}
                        credKey={key}
                        label={info.label}
                        hint={info.hint}
                        isSet={meta?.isSet ?? false}
                        updatedAt={
                          meta?.updatedAt ? meta.updatedAt.toISOString() : null
                        }
                        isFirst={i === 0}
                        status={credStatusFor(key)}
                      />
                    );
                  })}
                </div>
                {group.title === "SMTP" && <SmtpTestPanel />}
              </div>
            ))}
          </div>

          <p
            className="mono-label"
            style={{ fontSize: 10.5, marginTop: 16, textAlign: "right" }}
          >
            — {CREDENTIAL_KEYS.length} CREDENTIAL SLOTS TOTAL
          </p>
        </section>
      </div>
    </>
  );
}
