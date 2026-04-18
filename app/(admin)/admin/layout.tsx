import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/dal";

const NAV: Array<{ href: "/admin" | "/admin/courses" | "/admin/pages" | "/admin/appearance" | "/admin/settings"; label: string }> = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/appearance", label: "Appearance" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="flex flex-1 min-h-full">
      <aside className="w-56 shrink-0 border-r border-[var(--cf-border)] bg-[var(--cf-surface)]">
        <div className="p-4 text-sm font-semibold">Admin</div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="cf-admin-nav-item rounded-[var(--cf-radius)] px-3 py-2 text-sm text-[var(--cf-muted-fg)] hover:bg-[var(--cf-bg)] hover:text-[var(--cf-fg)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
