import { Suspense } from "react";
import Link from "next/link";
import { loadSiteSettings } from "@/lib/theme";
import { TopbarAuth, TopbarAuthSkeleton } from "./topbar-auth";

export async function PublicTopbar({
  active,
}: {
  active?: "courses" | null;
}) {
  const site = await loadSiteSettings();
  const firstChar = (site.name || "C").trim().charAt(0).toUpperCase() || "C";
  return (
    <header className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 48 }}>
        <Link href="/" className="brand" aria-label={site.name}>
          {site.logoUrl ? (
            <img
              src={site.logoUrl}
              alt=""
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <span className="brand-mark">{firstChar}</span>
          )}
          <span>{site.name}</span>
        </Link>
        <nav className="topbar-nav">
          <Link
            href="/courses"
            className={active === "courses" ? "active" : ""}
          >
            Courses
          </Link>
        </nav>
      </div>
      <Suspense fallback={<TopbarAuthSkeleton />}>
        <TopbarAuth />
      </Suspense>
    </header>
  );
}
