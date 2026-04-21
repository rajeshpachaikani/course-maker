"use client";

import { useRef, useState } from "react";
import * as tus from "tus-js-client";

interface TusSession {
  videoId: string;
  libraryId: string;
  authSignature: string;
  expireTime: number;
  uploadEndpoint: string;
}

export function VideoUpload({
  lessonId,
  currentVideoId,
  currentDurationSec,
  onComplete,
  onRemove,
}: {
  lessonId: string;
  currentVideoId: string | null;
  currentDurationSec: number | null;
  onComplete: (videoId: string, durationSec: number | null) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function startSession(title: string): Promise<TusSession> {
    const res = await fetch("/api/upload/bunny/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? `HTTP ${res.status}`);
    }
    return (await res.json()) as TusSession;
  }

  async function probeDuration(videoId: string): Promise<number | null> {
    const res = await fetch(
      `/api/upload/bunny/probe?videoId=${encodeURIComponent(videoId)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { length?: number | null };
    return typeof data.length === "number" ? data.length : null;
  }

  async function handleFile(file: File) {
    setError(null);
    setStatus("Creating video on Bunny…");
    setUploading(true);
    setProgress(0);
    try {
      const session = await startSession(`lesson-${lessonId}-${file.name}`);
      setStatus("Uploading…");
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(file, {
          endpoint: session.uploadEndpoint,
          retryDelays: [0, 1000, 3000, 5000, 10000],
          chunkSize: 1024 * 1024 * 8,
          metadata: {
            filetype: file.type || "video/mp4",
            filename: file.name,
          },
          headers: {
            AuthorizationSignature: session.authSignature,
            AuthorizationExpire: String(session.expireTime),
            VideoId: session.videoId,
            LibraryId: session.libraryId,
          },
          onError: (err) => reject(err),
          onProgress: (uploaded, total) => {
            setProgress(Math.round((uploaded / total) * 100));
          },
          onSuccess: () => resolve(),
        });
        upload.start();
      });
      setStatus("Processing…");
      let duration: number | null = null;
      for (let i = 0; i < 6 && duration === null; i++) {
        await new Promise((r) => setTimeout(r, 2000));
        duration = await probeDuration(session.videoId);
      }
      await onComplete(session.videoId, duration);
      setStatus("Uploaded.");
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setStatus(null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onRemoveClick() {
    if (!confirm("Remove video from this lesson? (Bunny copy is not deleted.)"))
      return;
    await onRemove();
    setStatus(null);
    setProgress(null);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {currentVideoId ? (
        <div className="upload-item">
          <div className="upload-item-row">
            <div
              style={{
                width: 32,
                height: 32,
                background: "var(--paper-2)",
                borderRadius: 6,
                display: "grid",
                placeItems: "center",
                fontSize: 14,
              }}
            >
              🎬
            </div>
            <div className="upload-item-name">
              <div style={{ fontWeight: 600, color: "var(--ink)" }}>
                Video attached
              </div>
              <div
                className="mono-label"
                style={{ fontSize: 10.5, marginTop: 2 }}
              >
                {currentVideoId}
                {currentDurationSec
                  ? ` · ${formatDuration(currentDurationSec)}`
                  : ""}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveClick}
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: "5px 10px" }}
            >
              Remove
            </button>
          </div>
        </div>
      ) : null}

      <label className="upload-zone" style={{ cursor: "pointer", margin: 0 }}>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          style={{ display: "none" }}
        />
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <b>{currentVideoId ? "Drop to replace video" : "Drop video file here"}</b>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: 11,
            letterSpacing: "0.04em",
            marginTop: 4,
          }}
        >
          MP4 / MOV · auto-transcoded to HLS
        </div>
      </label>

      {progress !== null ? (
        <div className="upload-item">
          <div className="upload-item-row">
            <div className="upload-item-name">
              <div style={{ fontWeight: 600, color: "var(--ink)" }}>
                {status ?? "Uploading"}
              </div>
            </div>
            <div className="upload-item-pct">{progress}%</div>
          </div>
          <div className="upload-bar">
            <div
              className="upload-bar-fill"
              style={{
                width: `${progress}%`,
                background:
                  progress === 100
                    ? "oklch(0.7 0.2 160)"
                    : "var(--brand-grad)",
              }}
            />
          </div>
        </div>
      ) : status ? (
        <div className="mono-label" style={{ fontSize: 11 }}>
          {status}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          style={{
            color: "oklch(0.75 0.2 25)",
            fontSize: 13,
            fontFamily: "var(--mono)",
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
