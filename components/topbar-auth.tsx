import Link from "next/link";
import type { Route } from "next";
import { getCurrentUser, currentUserIsStaff } from "@/lib/dal";
import { SignOutButton } from "./sign-out-button";

export async function TopbarAuth() {
  const [user, isStaff] = await Promise.all([
    getCurrentUser(),
    currentUserIsStaff(),
  ]);

  if (!user) {
    return (
      <div className="topbar-actions">
        <Link href={"/login" as Route} className="btn btn-ghost">
          Sign in
        </Link>
        <Link href={"/signup" as Route} className="btn btn-ink">
          Get started
        </Link>
      </div>
    );
  }

  const email = (user as { email?: string }).email ?? "Signed in";

  return (
    <div className="topbar-actions">
      <span
        className="mono-label"
        style={{
          fontSize: 11,
          maxWidth: 180,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        title={email}
      >
        {email}
      </span>
      <Link href={"/dashboard" as Route} className="btn btn-ink">
        Dashboard
      </Link>
      {isStaff ? (
        <Link href={"/admin" as Route} className="btn btn-ghost">
          Admin
        </Link>
      ) : null}
      <SignOutButton />
    </div>
  );
}

export function TopbarAuthSkeleton() {
  return (
    <div
      className="topbar-actions"
      aria-hidden
      style={{ visibility: "hidden", minWidth: 280 }}
    >
      <span className="btn btn-ghost">Sign in</span>
      <span className="btn btn-ink">Get started</span>
    </div>
  );
}
