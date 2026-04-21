import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const getSession = cache(async () => {
  const h = await headers();
  return auth.api.getSession({ headers: h });
});

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  return session?.user ?? null;
});

export async function requireSession() {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return session;
}

export const getUserRole = cache(async (userId: string): Promise<string> => {
  const rows = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0]?.role ?? "student";
});

export async function currentUserIsAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session?.user) return false;
  const sessionRole = (session.user as { role?: string }).role;
  const role = sessionRole ?? (await getUserRole(session.user.id));
  return role === "admin";
}

export async function requireAdmin() {
  const session = await requireSession();
  const sessionRole = (session.user as { role?: string }).role;
  const role = sessionRole ?? (await getUserRole(session.user.id));
  if (role !== "admin") redirect("/dashboard");
  return session;
}

export async function requireStudent() {
  return requireSession();
}
