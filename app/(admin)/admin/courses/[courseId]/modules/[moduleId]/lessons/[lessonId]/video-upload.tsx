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
    <div className="flex flex-col gap-3">
      {currentVideoId ? (
        <div className="flex flex-col gap-2 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] p-4 text-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Video attached</div>
              <div className="mt-0.5 font-mono text-xs text-[var(--cf-muted-fg)]">
                {currentVideoId}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveClick}
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] px-3 py-1.5 text-xs text-[var(--cf-muted-fg)] hover:text-[var(--cf-fg)]"
            >
              Remove
            </button>
          </div>
          {currentDurationSec ? (
            <div className="text-xs text-[var(--cf-muted-fg)]">
              Duration: {formatDuration(currentDurationSec)}
            </div>
          ) : null}
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">
          {currentVideoId ? "Replace video" : "Upload video"}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          className="text-sm"
        />
      </label>

      {progress !== null ? (
        <div className="flex flex-col gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--cf-border)]">
            <div
              className="h-full bg-[var(--cf-accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-[var(--cf-muted-fg)]">
            {status ?? `${progress}%`}
            {progress !== null && status ? ` · ${progress}%` : ""}
          </div>
        </div>
      ) : status ? (
        <div className="text-xs text-[var(--cf-muted-fg)]">{status}</div>
      ) : null}

      {error ? (
        <div className="text-sm text-red-600" role="alert">
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
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
