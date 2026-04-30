"use server";

import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";
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
import { sendEmail, getSmtpConfig } from "@/lib/mailer";

const SETTINGS_PATH = "/admin/settings";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const UPLOADS_DIR = join(process.cwd(), "public", "uploads");

async function saveAsset(file: File, slot: "logo" | "favicon"): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File exceeds 5 MB limit");
  }
  await mkdir(UPLOADS_DIR, { recursive: true });
  const ext = extname(file.name) || (file.type === "image/svg+xml" ? ".svg" : ".png");
  const filename = `${slot}${ext}`;
  await writeFile(join(UPLOADS_DIR, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

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

    let logoUrl = nullableText(formData.get("logoUrl"));
    let faviconUrl = nullableText(formData.get("faviconUrl"));

    const logoFile = formData.get("logoFile");
    if (logoFile instanceof File && logoFile.size > 0) {
      logoUrl = await saveAsset(logoFile, "logo");
    }

    const faviconFile = formData.get("faviconFile");
    if (faviconFile instanceof File && faviconFile.size > 0) {
      faviconUrl = await saveAsset(faviconFile, "favicon");
    }

    await upsertSiteSettings({
      name,
      tagline: nullableText(formData.get("tagline")),
      logoUrl,
      faviconUrl,
      googleOauthEnabled: asBool(formData.get("googleOauthEnabled")),
      companyName: nullableText(formData.get("companyName")),
      companyAddress: nullableText(formData.get("companyAddress")),
      contactPhone: nullableText(formData.get("contactPhone")),
      supportEmail: nullableText(formData.get("supportEmail")),
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

export async function testSmtpAction(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const to = (formData.get("to") as string | null)?.trim() ?? "";
  if (!to || !to.includes("@")) {
    return { ok: false, message: "Valid recipient email required" };
  }
  try {
    const cfg = await getSmtpConfig();
    if (!cfg) {
      return { ok: false, message: "SMTP not fully configured — set all five SMTP fields first" };
    }
    await sendEmail({
      to,
      subject: "CourseMaker SMTP test",
      html: "<p>Your CourseMaker SMTP configuration is working correctly.</p>",
      text: "Your CourseMaker SMTP configuration is working correctly.",
    });
    return { ok: true, message: `Test email sent to ${to}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, message: msg };
  }
}
