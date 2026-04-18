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
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={buy}
        disabled={pending}
        className="cf-btn-primary"
      >
        {pending ? "Working…" : isFree ? "Enroll for free" : "Buy now"}
      </button>
      {error ? (
        <div className="text-xs text-red-600" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
