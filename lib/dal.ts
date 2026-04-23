import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, type TrainerGrants } from "@/lib/db/schema";

export type Role = "admin" | "trainer" | "student";

export interface Capabilities {
  role: Role;
  isAdmin: boolean;
  isTrainer: boolean;
  isStaff: boolean;
  canManageCourses: boolean;
  canPublishCourse: boolean;
  canSetPricing: boolean;
  canManageSettings: boolean;
  canManageAppearance: boolean;
  canManageUsers: boolean;
}

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

export const getUserRecord = cache(async (userId: string) => {
  const rows = await db
    .select({ role: users.role, trainerGrants: users.trainerGrants })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return rows[0] ?? null;
});

function normalizeRole(raw: unknown): Role {
  return raw === "admin" || raw === "trainer" ? (raw as Role) : "student";
}

function normalizeGrants(raw: unknown): TrainerGrants {
  if (!raw || typeof raw !== "object") return {};
  const g = raw as TrainerGrants;
  return { publish: !!g.publish, pricing: !!g.pricing };
}

export const getCapabilities = cache(async (): Promise<Capabilities | null> => {
  const session = await getSession();
  if (!session?.user) return null;
  const rec = await getUserRecord(session.user.id);
  const role = normalizeRole(rec?.role);
  const grants = normalizeGrants(rec?.trainerGrants);
  const isAdmin = role === "admin";
  const isTrainer = role === "trainer";
  const isStaff = isAdmin || isTrainer;
  return {
    role,
    isAdmin,
    isTrainer,
    isStaff,
    canManageCourses: isStaff,
    canPublishCourse: isAdmin || (isTrainer && !!grants.publish),
    canSetPricing: isAdmin || (isTrainer && !!grants.pricing),
    canManageSettings: isAdmin,
    canManageAppearance: isAdmin,
    canManageUsers: isAdmin,
  };
});

export async function currentUserIsAdmin(): Promise<boolean> {
  const caps = await getCapabilities();
  return !!caps?.isAdmin;
}

export async function currentUserIsStaff(): Promise<boolean> {
  const caps = await getCapabilities();
  return !!caps?.isStaff;
}

export async function requireAdmin() {
  const session = await requireSession();
  const caps = await getCapabilities();
  if (!caps?.isAdmin) redirect("/dashboard");
  return { session, caps };
}

export async function requireStaff() {
  const session = await requireSession();
  const caps = await getCapabilities();
  if (!caps?.isStaff) redirect("/dashboard");
  return { session, caps };
}

export async function requireStudent() {
  return requireSession();
}

export async function requireCapability(
  check: (caps: Capabilities) => boolean,
) {
  const session = await requireSession();
  const caps = await getCapabilities();
  if (!caps || !check(caps)) redirect("/dashboard");
  return { session, caps };
}
