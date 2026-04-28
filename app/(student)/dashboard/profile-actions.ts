"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireStudent } from "@/lib/dal";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export async function updateNameAction(
  name: string,
): Promise<{ error?: string }> {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name cannot be empty" };
  if (trimmed.length > 100) return { error: "Name too long (max 100 chars)" };

  const session = await requireStudent();
  await db
    .update(users)
    .set({ name: trimmed, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  revalidatePath("/dashboard");
  return {};
}
