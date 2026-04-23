"use server";

import { appendFile } from "node:fs/promises";
import { updateTag } from "next/cache";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import { upsertSiteSettings, SITE_TAG } from "@/lib/theme";
import {
  CREDENTIAL_KEYS,
  type CredentialKey,
  setCredential,
  deleteCredential,
} from "@/lib/credentials";

const SETTINGS_PATH = "/admin/settings";

async function logAction(line: string) {
  try {
    await appendFile(
      "/tmp/course-maker-action.log",
      `[${new Date().toISOString()}] ${line}\n`,
    );
  } catch {
    // ignore
  }
}

function asBool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

function asTrimmed(v: FormDataEntryValue | null): string {
  return typeof v === "string" ? v.trim() : "";
}

function nullableText(v: FormDataEntryValue | null): string | null {
  const s = asTrimmed(v);
  return s.length ? s : null;
}

function assertCredentialKey(v: unknown): CredentialKey {
  if (
    typeof v === "string" &&
    (CREDENTIAL_KEYS as readonly string[]).includes(v)
  ) {
    return v as CredentialKey;
  }
  throw new Error("Invalid credential key");
}

function redirectWithStatus(
  key: CredentialKey | "site",
  status: "ok" | "err",
  message: string,
): never {
  const params = new URLSearchParams({
    k: key,
    s: status,
    m: message.slice(0, 200),
  });
  redirect(`${SETTINGS_PATH}?${params.toString()}#cred-${key}`);
}

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  try {
    const name = asTrimmed(formData.get("name"));
    if (!name) redirectWithStatus("site", "err", "Site name is required");
    await upsertSiteSettings({
      name,
      tagline: nullableText(formData.get("tagline")),
      logoUrl: nullableText(formData.get("logoUrl")),
      faviconUrl: nullableText(formData.get("faviconUrl")),
      googleOauthEnabled: asBool(formData.get("googleOauthEnabled")),
    });
    updateTag(SITE_TAG);
  } catch (e) {
    if (isRedirectError(e)) throw e;
    const msg = e instanceof Error ? e.message : "Unable to save";
    redirectWithStatus("site", "err", msg);
  }
  redirectWithStatus("site", "ok", "Saved.");
}

export async function saveCredentialAction(formData: FormData) {
  await requireAdmin();
  let key: CredentialKey | undefined;
  try {
    key = assertCredentialKey(formData.get("key"));
    const value = asTrimmed(formData.get("value"));
    if (!value) redirectWithStatus(key, "err", "Value is required");
    await setCredential(key, value);
    revalidatePath(SETTINGS_PATH);
    await logAction(`save ok key=${key}`);
  } catch (e) {
    if (isRedirectError(e)) throw e;
    const msg = e instanceof Error ? `${e.name}: ${e.message}` : String(e);
    await logAction(`save ERR key=${key ?? "?"} ${msg}`);
    redirectWithStatus(key ?? "site", "err", msg);
  }
  redirectWithStatus(key!, "ok", "Saved.");
}

export async function deleteCredentialAction(formData: FormData) {
  await requireAdmin();
  let key: CredentialKey | undefined;
  try {
    key = assertCredentialKey(formData.get("key"));
    await deleteCredential(key);
    revalidatePath(SETTINGS_PATH);
  } catch (e) {
    if (isRedirectError(e)) throw e;
    const msg = e instanceof Error ? e.message : "Unable to remove";
    redirectWithStatus(key ?? "site", "err", msg);
  }
  redirectWithStatus(key!, "ok", "Removed.");
}

function isRedirectError(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const digest = (e as { digest?: string }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}
