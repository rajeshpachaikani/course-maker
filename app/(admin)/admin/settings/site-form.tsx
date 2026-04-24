"use client";

import { useRef, useState } from "react";
import { saveSiteSettingsAction } from "./actions";

function AssetUploadField({
  label,
  inputName,
  currentUrl,
  accept,
}: {
  label: string;
  inputName: string;
  currentUrl: string;
  accept: string;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  return (
    <div className="field">
      <label>{label}</label>
      <input type="hidden" name={inputName.replace("File", "Url")} value={currentUrl} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {preview && (
          <img
            src={preview}
            alt={label}
            style={{
              width: 40,
              height: 40,
              objectFit: "contain",
              border: "1px solid var(--hair)",
              borderRadius: "var(--radius)",
              background: "var(--paper-3)",
              padding: 4,
              flexShrink: 0,
            }}
          />
        )}
        <input
          ref={inputRef}
          type="file"
          name={inputName}
          accept={accept}
          onChange={handleChange}
          style={{ fontSize: 13 }}
        />
      </div>
    </div>
  );
}

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
      encType="multipart/form-data"
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
        <AssetUploadField
          label="LOGO"
          inputName="logoFile"
          currentUrl={defaults.logoUrl}
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        />
        <AssetUploadField
          label="FAVICON"
          inputName="faviconFile"
          currentUrl={defaults.faviconUrl}
          accept="image/png,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
        />
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
