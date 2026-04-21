import { loadSiteSettings } from "@/lib/theme";
import {
  CREDENTIAL_KEYS,
  listCredentialsMeta,
  type CredentialKey,
} from "@/lib/credentials";
import {
  saveSiteSettingsAction,
  saveCredentialAction,
  deleteCredentialAction,
} from "./actions";

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
  resend_api_key: { label: "Resend API key", hint: "re_…" },
  resend_from_email: {
    label: "Resend from address",
    hint: "no-reply@yourdomain.com",
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
    title: "Resend",
    subtitle: "Transactional email",
    keys: ["resend_api_key", "resend_from_email"],
  },
  {
    title: "Google OAuth",
    subtitle: "Social sign-in",
    keys: ["google_oauth_client_id", "google_oauth_client_secret"],
  },
];

export default async function AdminSettingsPage() {
  const [site, credMeta] = await Promise.all([
    loadSiteSettings(),
    listCredentialsMeta(),
  ]);
  const metaMap = new Map(credMeta.map((m) => [m.key, m]));
  const setCount = credMeta.filter((m) => m.isSet).length;

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
          <form
            action={saveSiteSettingsAction}
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            <div className="field-row">
              <div className="field">
                <label>SITE NAME</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={site.name}
                  required
                />
              </div>
              <div className="field">
                <label>TAGLINE</label>
                <input
                  type="text"
                  name="tagline"
                  defaultValue={site.tagline ?? ""}
                  placeholder="Marketing, taught well."
                />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>LOGO URL</label>
                <input
                  type="url"
                  name="logoUrl"
                  defaultValue={site.logoUrl ?? ""}
                  placeholder="https://…/logo.svg"
                />
              </div>
              <div className="field">
                <label>FAVICON URL</label>
                <input
                  type="url"
                  name="faviconUrl"
                  defaultValue={site.faviconUrl ?? ""}
                  placeholder="https://…/favicon.ico"
                />
              </div>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "12px 0",
                borderTop: "1px dotted var(--hair-2)",
                marginBottom: 14,
              }}
            >
              <input
                type="checkbox"
                name="googleOauthEnabled"
                defaultChecked={site.googleOauthEnabled}
                style={{ marginTop: 3 }}
              />
              <span>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--ink)",
                  }}
                >
                  Enable Google OAuth sign-in
                </span>
                <div
                  className="mono-label"
                  style={{ fontSize: 10, marginTop: 3 }}
                >
                  — REQUIRES GOOGLE OAUTH CREDENTIALS BELOW
                </div>
              </span>
            </label>
            <div>
              <button type="submit" className="btn btn-primary">
                Save site settings
              </button>
            </div>
          </form>
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
                        updatedAt={meta?.updatedAt ?? null}
                        isFirst={i === 0}
                      />
                    );
                  })}
                </div>
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

function CredentialRow({
  credKey,
  label,
  hint,
  isSet,
  updatedAt,
  isFirst,
}: {
  credKey: CredentialKey;
  label: string;
  hint?: string;
  isSet: boolean;
  updatedAt: Date | null;
  isFirst: boolean;
}) {
  return (
    <div
      style={{
        borderTop: isFirst ? "none" : "1px dotted var(--hair-2)",
        padding: "16px 0",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>
            {label}
          </div>
          {hint ? (
            <div
              className="mono-label"
              style={{ fontSize: 10, marginTop: 3, textTransform: "none" }}
            >
              {hint}
            </div>
          ) : null}
        </div>
        <span
          className={`status ${isSet ? "status-published" : "status-draft"}`}
        >
          {isSet
            ? `Set${updatedAt ? ` · ${updatedAt.toLocaleDateString()}` : ""}`
            : "Not set"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <form
          action={saveCredentialAction}
          style={{ display: "flex", flex: 1, gap: 8 }}
        >
          <input type="hidden" name="key" value={credKey} />
          <input
            type="password"
            name="value"
            required
            autoComplete="off"
            placeholder={
              isSet ? "•••••• enter new value to rotate" : "Enter value"
            }
            style={{
              flex: 1,
              padding: "10px 12px",
              border: "1px solid var(--hair)",
              borderRadius: "var(--radius-sm)",
              background: "var(--paper-3)",
              fontFamily: "var(--mono)",
              fontSize: 13,
              color: "var(--ink)",
            }}
          />
          <button type="submit" className="btn btn-ink">
            {isSet ? "Rotate" : "Save"}
          </button>
        </form>
        {isSet ? (
          <form action={deleteCredentialAction}>
            <input type="hidden" name="key" value={credKey} />
            <button
              type="submit"
              className="btn btn-ghost"
              style={{ fontSize: 12 }}
            >
              Remove
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
