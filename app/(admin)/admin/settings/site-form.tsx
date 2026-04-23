import { saveSiteSettingsAction } from "./actions";

export function SiteSettingsForm({
  defaults,
  status,
}: {
  defaults: {
    name: string;
    tagline: string;
    logoUrl: string;
    faviconUrl: string;
    googleOauthEnabled: boolean;
  };
  status?: { ok: boolean; message: string } | null;
}) {
  return (
    <form
      action={saveSiteSettingsAction}
      style={{ display: "flex", flexDirection: "column", gap: 0 }}
    >
      <div className="field-row">
        <div className="field">
          <label>SITE NAME</label>
          <input type="text" name="name" defaultValue={defaults.name} required />
        </div>
        <div className="field">
          <label>TAGLINE</label>
          <input
            type="text"
            name="tagline"
            defaultValue={defaults.tagline}
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
            defaultValue={defaults.logoUrl}
            placeholder="https://…/logo.svg"
          />
        </div>
        <div className="field">
          <label>FAVICON URL</label>
          <input
            type="url"
            name="faviconUrl"
            defaultValue={defaults.faviconUrl}
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
          defaultChecked={defaults.googleOauthEnabled}
          style={{ marginTop: 3 }}
        />
        <span>
          <span
            style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}
          >
            Enable Google OAuth sign-in
          </span>
          <div className="mono-label" style={{ fontSize: 10, marginTop: 3 }}>
            — REQUIRES GOOGLE OAUTH CREDENTIALS BELOW
          </div>
        </span>
      </label>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}
      >
        <button type="submit" className="btn btn-primary">
          Save site settings
        </button>
        {status ? (
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: status.ok ? "var(--success)" : "var(--danger)",
            }}
          >
            {status.message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
