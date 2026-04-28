"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateNameAction } from "./profile-actions";

interface ProfileUser {
  id: string;
  name: string;
  image: string | null;
}

export function ProfileButton({ user }: { user: ProfileUser }) {
  const [open, setOpen] = useState(false);
  const initial = (user.name || "?")[0].toUpperCase();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn btn-ghost"
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px" }}
        aria-label="Edit profile"
      >
        {user.image ? (
          <img
            src={user.image}
            alt=""
            style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
        ) : (
          <span
            className="avatar"
            style={{ width: 28, height: 28, fontSize: 12, flexShrink: 0 }}
          >
            {initial}
          </span>
        )}
        <span style={{ fontSize: 13 }}>Profile</span>
      </button>

      {open && (
        <ProfileDrawer user={user} onClose={() => setOpen(false)} />
      )}
    </>
  );
}

function ProfileDrawer({ user, onClose }: { user: ProfileUser; onClose: () => void }) {
  const [name, setName] = useState(user.name);
  const [imageUrl, setImageUrl] = useState<string | null>(user.image);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const initial = (name || user.name || "?")[0].toUpperCase();

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload/profile-image", { method: "POST", body: fd });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setError(json.error ?? "Upload failed");
        return;
      }
      setImageUrl(json.url ?? null);
      router.refresh();
    } catch {
      setError("Upload failed — check your connection");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    const result = await updateNameAction(name);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }
    setSuccess(true);
    router.refresh();
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 700);
    setSaving(false);
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "oklch(0 0 0 / 0.55)",
          zIndex: 200,
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Edit profile"
        style={{
          position: "fixed",
          right: 0,
          top: 0,
          bottom: 0,
          width: 360,
          background: "var(--paper-2)",
          borderLeft: "1px solid var(--hair)",
          zIndex: 201,
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--hair)",
          }}
        >
          <div>
            <div
              className="mono-label"
              style={{ marginBottom: 2 }}
            >
              — Edit profile
            </div>
            <div style={{ fontSize: 18, fontFamily: "var(--serif)", fontWeight: 600, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              Your details
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn"
            style={{ padding: 6, borderRadius: "50%", lineHeight: 0, color: "var(--ink-2)" }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "32px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          {/* Avatar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => !uploading && fileRef.current?.click()}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              disabled={uploading}
              style={{
                position: "relative",
                width: 100,
                height: 100,
                borderRadius: "50%",
                border: avatarHover && !uploading ? "2px solid var(--pink)" : "2px dashed var(--hair-2)",
                background: "var(--paper-3)",
                cursor: uploading ? "wait" : "pointer",
                padding: 0,
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}
              aria-label="Change profile picture"
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: "100%",
                    height: "100%",
                    fontFamily: "var(--serif)",
                    fontSize: 38,
                    fontWeight: 700,
                    background: "var(--brand-grad)",
                    color: "oklch(1 0 0)",
                  }}
                >
                  {initial}
                </span>
              )}

              {/* Upload overlay on hover / while uploading */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "oklch(0 0 0 / 0.5)",
                  display: "grid",
                  placeItems: "center",
                  color: "oklch(1 0 0)",
                  opacity: uploading || avatarHover ? 1 : 0,
                  transition: "opacity 0.15s",
                  pointerEvents: "none",
                }}
              >
                {uploading ? (
                  <svg className="spinner" width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="10" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15V5M12 5L8.5 8.5M12 5L15.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 17.5V19C4 19.5523 4.44772 20 5 20H19C19.5523 20 20 19.5523 20 19V17.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </button>

            <p style={{ fontSize: 12, color: "var(--ink-3)", margin: 0, textAlign: "center", lineHeight: 1.5 }}>
              Click to upload · JPG, PNG, WebP, GIF · max 5 MB
            </p>
          </div>

          {/* Name field */}
          <div className="field" style={{ margin: 0 }}>
            <label htmlFor="profile-name">Display name</label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !saving && !uploading) handleSave();
              }}
              placeholder="Your name"
              maxLength={100}
              autoComplete="name"
            />
          </div>

          {/* Feedback */}
          {error && (
            <p style={{ color: "var(--danger)", fontSize: 13, margin: 0, padding: "10px 12px", background: "oklch(0.68 0.25 20 / 0.1)", borderRadius: "var(--radius-sm)", border: "1px solid oklch(0.68 0.25 20 / 0.25)" }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ color: "var(--success)", fontSize: 13, margin: 0, padding: "10px 12px", background: "oklch(0.7 0.2 160 / 0.1)", borderRadius: "var(--radius-sm)", border: "1px solid oklch(0.7 0.2 160 / 0.25)" }}>
              Saved successfully!
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--hair)",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="btn btn-primary"
            style={{ flex: 2 }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={handleImageChange}
        tabIndex={-1}
      />
    </>
  );
}
