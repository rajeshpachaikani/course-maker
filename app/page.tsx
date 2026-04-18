import Link from "next/link";
import { loadSiteSettings } from "@/lib/theme";

export const unstable_instant = { prefetch: "static" } as const;

export default async function HomePage() {
  const site = await loadSiteSettings();
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <section className="cf-hero flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          {site.name}
        </h1>
        <p className="text-lg text-[var(--cf-muted-fg)]">
          {site.tagline ?? "Courses, streamed. Sell your own library."}
        </p>
        <div className="flex gap-3">
          <Link
            href="/courses"
            className="cf-btn cf-btn-primary rounded-[var(--cf-radius)] bg-[var(--cf-primary)] px-5 py-2.5 text-sm font-medium text-[var(--cf-primary-fg)]"
          >
            Browse courses
          </Link>
          <Link
            href="/signup"
            className="cf-btn cf-btn-secondary rounded-[var(--cf-radius)] border border-[var(--cf-border)] px-5 py-2.5 text-sm font-medium"
          >
            Sign up
          </Link>
        </div>
      </section>
    </main>
  );
}
