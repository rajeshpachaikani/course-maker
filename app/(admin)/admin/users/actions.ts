"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { db } from "@/lib/db";
import { users, type TrainerGrants } from "@/lib/db/schema";

const VALID_ROLES = ["admin", "trainer", "student"] as const;
type Role = (typeof VALID_ROLES)[number];

function requireRole(v: FormDataEntryValue | null): Role {
  if (typeof v === "string" && (VALID_ROLES as readonly string[]).includes(v)) {
    return v as Role;
  }
  throw new Error("Invalid role");
}

function requireId(v: FormDataEntryValue | null): string {
  if (typeof v !== "string" || !v.trim()) throw new Error("User id required");
  return v.trim();
}

function asBool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

export async function setUserRoleAction(formData: FormData) {
  const { session } = await requireAdmin();
  const id = requireId(formData.get("id"));
  const role = requireRole(formData.get("role"));

  if (id === session.user.id && role !== "admin") {
    redirect("/admin/users?err=self-demote");
  }

  const update: { role: Role; trainerGrants?: TrainerGrants } = { role };
  if (role !== "trainer") {
    update.trainerGrants = {};
  }
  await db.update(users).set(update).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function setTrainerGrantsAction(formData: FormData) {
  await requireAdmin();
  const id = requireId(formData.get("id"));
  const grants: TrainerGrants = {
    publish: asBool(formData.get("publish")),
    pricing: asBool(formData.get("pricing")),
  };
  await db
    .update(users)
    .set({ trainerGrants: grants })
    .where(eq(users.id, id));
  revalidatePath("/admin/users");
}
