import "server-only";
import { db } from "@/lib/db";
import { encryptedCredentials } from "@/lib/db/schema";
import { encryptSecret, decryptSecret } from "@/lib/crypto";
import { eq, inArray } from "drizzle-orm";

export const CREDENTIAL_KEYS = [
  "stripe_secret",
  "stripe_webhook_secret",
  "stripe_publishable",
  "bunny_api_key",
  "bunny_stream_library_id",
  "bunny_stream_cdn_hostname",
  "bunny_storage_zone",
  "bunny_storage_key",
  "resend_api_key",
  "resend_from_email",
  "google_oauth_client_id",
  "google_oauth_client_secret",
] as const;

export type CredentialKey = (typeof CREDENTIAL_KEYS)[number];

export interface CredentialMeta {
  key: CredentialKey;
  isSet: boolean;
  updatedAt: Date | null;
}

export async function getCredential(
  key: CredentialKey,
): Promise<string | null> {
  const rows = await db
    .select()
    .from(encryptedCredentials)
    .where(eq(encryptedCredentials.key, key))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return decryptSecret({
    ciphertext: row.ciphertext,
    iv: row.iv,
    tag: row.tag,
  });
}

export async function getCredentials<K extends CredentialKey>(
  keys: readonly K[],
): Promise<Partial<Record<K, string>>> {
  if (keys.length === 0) return {};
  const rows = await db
    .select()
    .from(encryptedCredentials)
    .where(inArray(encryptedCredentials.key, keys as readonly CredentialKey[]));
  const out: Partial<Record<K, string>> = {};
  for (const row of rows) {
    out[row.key as K] = decryptSecret({
      ciphertext: row.ciphertext,
      iv: row.iv,
      tag: row.tag,
    });
  }
  return out;
}

export async function setCredential(
  key: CredentialKey,
  value: string,
): Promise<void> {
  const sealed = encryptSecret(value);
  await db
    .insert(encryptedCredentials)
    .values({
      key,
      ciphertext: sealed.ciphertext,
      iv: sealed.iv,
      tag: sealed.tag,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: encryptedCredentials.key,
      set: {
        ciphertext: sealed.ciphertext,
        iv: sealed.iv,
        tag: sealed.tag,
        updatedAt: new Date(),
      },
    });
}

export async function deleteCredential(key: CredentialKey): Promise<void> {
  await db
    .delete(encryptedCredentials)
    .where(eq(encryptedCredentials.key, key));
}

export async function listCredentialsMeta(): Promise<CredentialMeta[]> {
  const rows = await db
    .select({
      key: encryptedCredentials.key,
      updatedAt: encryptedCredentials.updatedAt,
    })
    .from(encryptedCredentials);
  const map = new Map<CredentialKey, Date>();
  for (const r of rows) map.set(r.key as CredentialKey, r.updatedAt);
  return CREDENTIAL_KEYS.map((k) => ({
    key: k,
    isSet: map.has(k),
    updatedAt: map.get(k) ?? null,
  }));
}
