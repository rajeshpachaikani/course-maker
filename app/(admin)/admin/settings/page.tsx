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

const CREDENTIAL_LABELS: Record<CredentialKey, { label: string; hint?: string }> = {
  stripe_secret: { label: "Stripe secret key", hint: "sk_live_… or sk_test_…" },
  stripe_webhook_secret: {
    label: "Stripe webhook secret",
    hint: "whsec_…",
  },
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

const CREDENTIAL_GROUPS: Array<{ title: string; keys: CredentialKey[] }> = [
  {
    title: "Stripe",
    keys: ["stripe_secret", "stripe_webhook_secret", "stripe_publishable"],
  },
  {
    title: "Bunny",
    keys: [
      "bunny_api_key",
      "bunny_stream_library_id",
      "bunny_stream_cdn_hostname",
      "bunny_storage_zone",
      "bunny_storage_key",
    ],
  },
  { title: "Resend (email)", keys: ["resend_api_key", "resend_from_email"] },
  {
    title: "Google OAuth",
    keys: ["google_oauth_client_id", "google_oauth_client_secret"],
  },
];

export default async function AdminSettingsPage() {
  const [site, credMeta] = await Promise.all([
    loadSiteSettings(),
    listCredentialsMeta(),
  ]);
  const metaMap = new Map(credMeta.map((m) => [m.key, m]));

  return (
    <div className="flex flex-col gap-10 max-w-3xl">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-[var(--cf-muted-fg)]">
          Brand identity and provider credentials. Credentials are encrypted at
          rest with AES-256-GCM.
        </p>
      </header>

      <section className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <h2 className="text-lg font-semibold">Site identity</h2>
        <p className="mt-1 text-sm text-[var(--cf-muted-fg)]">
          Shown in the browser tab, SEO metadata, and public layout.
        </p>
        <form action={saveSiteSettingsAction} className="mt-6 flex flex-col gap-4">
          <Field label="Site name" name="name" defaultValue={site.name} required />
          <Field
            label="Tagline"
            name="tagline"
            defaultValue={site.tagline ?? ""}
          />
          <Field
            label="Logo URL"
            name="logoUrl"
            defaultValue={site.logoUrl ?? ""}
            placeholder="https://…/logo.svg"
          />
          <Field
            label="Favicon URL"
            name="faviconUrl"
            defaultValue={site.faviconUrl ?? ""}
            placeholder="https://…/favicon.ico"
          />
          <CheckboxField
            label="Enable raw HTML block in page builder"
            description="When on, admins can embed arbitrary HTML into pages. Disable on multi-tenant setups."
            name="rawHtmlBlockEnabled"
            defaultChecked={site.rawHtmlBlockEnabled}
          />
          <CheckboxField
            label="Enable Google OAuth sign-in"
            description="Requires Google OAuth credentials below."
            name="googleOauthEnabled"
            defaultChecked={site.googleOauthEnabled}
          />
          <div>
            <button type="submit" className="cf-btn-primary">
              Save site settings
            </button>
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-6">
        <header>
          <h2 className="text-lg font-semibold">Provider credentials</h2>
          <p className="mt-1 text-sm text-[var(--cf-muted-fg)]">
            Values are write-only. Existing secrets are masked; submit a new
            value to rotate.
          </p>
        </header>
        {CREDENTIAL_GROUPS.map((group) => (
          <div
            key={group.title}
            className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6"
          >
            <h3 className="text-base font-semibold">{group.title}</h3>
            <div className="mt-4 flex flex-col gap-4">
              {group.keys.map((key) => {
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
                  />
                );
              })}
            </div>
          </div>
        ))}
        <p className="text-xs text-[var(--cf-muted-fg)]">
          {CREDENTIAL_KEYS.length} credential slots total.
        </p>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
      />
    </label>
  );
}

function CheckboxField({
  label,
  description,
  name,
  defaultChecked,
}: {
  label: string;
  description?: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-1"
      />
      <span className="flex flex-col">
        <span className="font-medium">{label}</span>
        {description ? (
          <span className="text-xs text-[var(--cf-muted-fg)]">{description}</span>
        ) : null}
      </span>
    </label>
  );
}

function CredentialRow({
  credKey,
  label,
  hint,
  isSet,
  updatedAt,
}: {
  credKey: CredentialKey;
  label: string;
  hint?: string;
  isSet: boolean;
  updatedAt: Date | null;
}) {
  const statusLabel = isSet
    ? `Set${updatedAt ? ` · updated ${updatedAt.toLocaleDateString()}` : ""}`
    : "Not set";
  return (
    <div className="flex flex-col gap-2 border-t border-[var(--cf-border)] pt-4 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{label}</div>
          {hint ? (
            <div className="text-xs text-[var(--cf-muted-fg)]">{hint}</div>
          ) : null}
        </div>
        <span
          className={`text-xs ${
            isSet ? "text-[var(--cf-accent)]" : "text-[var(--cf-muted-fg)]"
          }`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <form action={saveCredentialAction} className="flex flex-1 gap-2">
          <input type="hidden" name="key" value={credKey} />
          <input
            type="password"
            name="value"
            required
            autoComplete="off"
            placeholder={isSet ? "•••••• enter new value to rotate" : "Enter value"}
            className="flex-1 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm font-mono"
          />
          <button type="submit" className="cf-btn-primary">
            {isSet ? "Rotate" : "Save"}
          </button>
        </form>
        {isSet ? (
          <form action={deleteCredentialAction}>
            <input type="hidden" name="key" value={credKey} />
            <button
              type="submit"
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] px-3 py-2 text-sm text-[var(--cf-muted-fg)] hover:text-[var(--cf-fg)]"
            >
              Remove
            </button>
          </form>
        ) : null}
      </div>
    </div>
  );
}
