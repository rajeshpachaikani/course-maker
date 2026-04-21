import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";
import { loadSiteSettings } from "@/lib/theme";
import { listCoursesAdmin } from "@/lib/courses";
import { AdminNavItem } from "./nav-item";
import { SignOutButton } from "@/components/sign-out-button";

const GROUPS: Array<{
  title: string;
  items: Array<{
    href: "/admin" | "/admin/courses" | "/admin/appearance" | "/admin/settings";
    label: string;
    icon: "grid" | "book" | "palette" | "settings";
    badgeKey?: "courses";
  }>;
}> = [
  {
    title: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "grid" }],
  },
  {
    title: "Catalogue",
    items: [
      {
        href: "/admin/courses",
        label: "Courses",
        icon: "book",
        badgeKey: "courses",
      },
    ],
  },
  {
    title: "Storefront",
    items: [
      { href: "/admin/appearance", label: "Theme & Brand", icon: "palette" },
      { href: "/admin/settings", label: "Settings", icon: "settings" },
    ],
  },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const [site, courseList] = await Promise.all([
    loadSiteSettings(),
    listCoursesAdmin(),
  ]);
  const badges = { courses: courseList.length };
  const userName = (session.user as { name?: string }).name ?? "Admin";
  const firstBrand = (site.name || "C").trim().charAt(0).toUpperCase() || "C";

  return (
    <div className="admin-root">
      <aside className="admin-nav">
        <Link href="/" className="brand" style={{ textDecoration: "none" }}>
          <span className="brand-mark">{firstBrand}</span>
          <span style={{ fontSize: 19 }}>{site.name}</span>
        </Link>

        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="admin-nav-section">— {g.title}</div>
            {g.items.map((it) => (
              <AdminNavItem
                key={it.href}
                href={it.href}
                icon={it.icon}
                label={it.label}
                badge={it.badgeKey ? badges[it.badgeKey] : undefined}
              />
            ))}
          </div>
        ))}

        <div
          style={{
            marginTop: "auto",
            paddingTop: 20,
            borderTop: "1px dotted var(--hair-2)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              className="avatar"
              style={{ width: 32, height: 32, fontSize: 13 }}
            >
              {(userName[0] ?? "A").toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "var(--ink)",
                }}
              >
                {userName}
              </div>
              <div className="mono-label" style={{ fontSize: 10 }}>
                Admin · workspace
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Link
              href="/dashboard"
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: "6px 10px", flex: 1 }}
            >
              My courses
            </Link>
            <SignOutButton
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: "6px 10px", flex: 1 }}
            />
          </div>
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}

function AdminShellSkeleton() {
  return (
    <div className="admin-root">
      <aside className="admin-nav" aria-hidden style={{ opacity: 0.35 }}>
        <div className="brand">
          <span className="brand-mark">·</span>
          <span style={{ fontSize: 19 }}>Loading…</span>
        </div>
      </aside>
      <main className="admin-main" />
    </div>
  );
}
