"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { upsertSiteSettings, SITE_TAG } from "@/lib/theme";
import {
  CREDENTIAL_KEYS,
  type CredentialKey,
  setCredential,
  deleteCredential,
} from "@/lib/credentials";

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

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  const name = asTrimmed(formData.get("name"));
  if (!name) throw new Error("Site name is required");
  await upsertSiteSettings({
    name,
    tagline: nullableText(formData.get("tagline")),
    logoUrl: nullableText(formData.get("logoUrl")),
    faviconUrl: nullableText(formData.get("faviconUrl")),
    googleOauthEnabled: asBool(formData.get("googleOauthEnabled")),
  });
  updateTag(SITE_TAG);
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

export async function saveCredentialAction(formData: FormData) {
  await requireAdmin();
  const key = assertCredentialKey(formData.get("key"));
  const value = asTrimmed(formData.get("value"));
  if (!value) throw new Error("Value is required");
  await setCredential(key, value);
}

export async function deleteCredentialAction(formData: FormData) {
  await requireAdmin();
  const key = assertCredentialKey(formData.get("key"));
  await deleteCredential(key);
}
