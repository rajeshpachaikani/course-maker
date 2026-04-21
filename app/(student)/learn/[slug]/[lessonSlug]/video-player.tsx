"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  lessonId: string;
  embedUrl: string;
  initialPositionSec: number;
  completed: boolean;
}

export function VideoPlayer({
  lessonId,
  embedUrl,
  initialPositionSec,
  completed,
}: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const lastSavedRef = useRef<number>(initialPositionSec);
  const lastSentAtRef = useRef<number>(0);
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(completed);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function send(value: string) {
      const iframe = iframeRef.current;
      if (!iframe?.contentWindow) return;
      iframe.contentWindow.postMessage(
        JSON.stringify({
          context: "player.js",
          version: "0.0.12",
          method: "addEventListener",
          value,
        }),
        "*",
      );
    }

    function onReady() {
      send("timeupdate");
      send("ended");
    }

    function onMessage(e: MessageEvent) {
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) {
        return;
      }
      let data: unknown = e.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || typeof data !== "object") return;
      const d = data as {
        context?: string;
        event?: string;
        value?: unknown;
      };
      if (d.context !== "player.js") return;
      if (d.event === "ready") {
        onReady();
        return;
      }
      if (d.event === "timeupdate") {
        const v = d.value as { seconds?: number } | undefined;
        const seconds = typeof v?.seconds === "number" ? v.seconds : NaN;
        if (!Number.isFinite(seconds)) return;
        const now = Date.now();
        if (
          seconds - lastSavedRef.current >= 10 ||
          now - lastSentAtRef.current >= 15_000
        ) {
          lastSavedRef.current = seconds;
          lastSentAtRef.current = now;
          void fetch(`/api/lessons/${lessonId}/progress`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ lastPositionSec: Math.floor(seconds) }),
          }).catch(() => {});
        }
      } else if (d.event === "ended") {
        void fetch(`/api/lessons/${lessonId}/progress`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ completed: true }),
        })
          .then(() => {
            setIsCompleted(true);
            router.refresh();
          })
          .catch(() => {});
      }
    }

    window.addEventListener("message", onMessage);
    // best-effort: some embeds don't emit "ready"; subscribe shortly after mount
    const t = setTimeout(onReady, 1000);
    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(t);
    };
  }, [lessonId, router]);

  async function markComplete() {
    setSaving(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/progress`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ completed: true }),
      });
      if (res.ok) {
        setIsCompleted(true);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
      />
      <div
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          zIndex: 2,
        }}
      >
        {isCompleted ? (
          <span
            className="chip chip-olive"
            style={{ background: "oklch(0.3 0.1 160 / 0.7)" }}
          >
            ✓ Completed
          </span>
        ) : (
          <button
            type="button"
            onClick={markComplete}
            disabled={saving}
            className="btn btn-ghost"
            style={{
              background: "oklch(0.08 0.02 300 / 0.6)",
              backdropFilter: "blur(8px)",
              fontSize: 12,
              padding: "6px 12px",
            }}
          >
            {saving ? "Saving…" : "Mark as complete"}
          </button>
        )}
      </div>
    </>
  );
}
