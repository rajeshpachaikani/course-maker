"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { signIn } from "@/lib/auth-client";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    setError(null);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    startTransition(async () => {
      const { error } = await signIn.email({ email, password });
      if (error) {
        setError(error.message ?? "Sign-in failed");
        return;
      }
      const dest =
        next && next.startsWith("/") ? (next as Route) : ("/dashboard" as Route);
      router.replace(dest);
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm">
        <span>Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="cm-input rounded-[var(--cm-radius)] border border-[var(--cm-border)] bg-[var(--cm-bg)] px-3 py-2 text-[var(--cm-fg)] outline-none focus:border-[var(--cm-primary)]"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span>Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete="current-password"
          className="cm-input rounded-[var(--cm-radius)] border border-[var(--cm-border)] bg-[var(--cm-bg)] px-3 py-2 text-[var(--cm-fg)] outline-none focus:border-[var(--cm-primary)]"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="cm-btn cm-btn-primary rounded-[var(--cm-radius)] bg-[var(--cm-primary)] px-4 py-2 text-sm font-medium text-[var(--cm-primary-fg)] disabled:opacity-50"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-[var(--cm-muted-fg)]">
        No account?{" "}
        <Link href="/signup" className="underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
