"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

export function BuyButton({
  courseId,
  isFree,
}: {
  courseId: string;
  isFree: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function buy() {
    setError(null);
    start(async () => {
      const res = await fetch("/api/checkout/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      if (res.status === 401) {
        router.push(
          `/login?next=${encodeURIComponent(`/courses/${courseId}`)}` as Route,
        );
        return;
      }
      const data = (await res.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
      };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      if (data.url.startsWith("/")) {
        router.push(data.url as Route);
      } else {
        window.location.href = data.url;
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        type="button"
        onClick={buy}
        disabled={pending}
        className="btn btn-primary"
        style={{ width: "100%", justifyContent: "center", padding: "14px 20px", fontSize: 15 }}
      >
        {pending ? "Working…" : isFree ? "Enroll for free →" : "Enroll now →"}
      </button>
      {error ? (
        <div
          role="alert"
          className="mono-label"
          style={{ color: "var(--danger)", textTransform: "none", letterSpacing: 0 }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
