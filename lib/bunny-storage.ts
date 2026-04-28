import "server-only";
import { getCredentials } from "@/lib/credentials";

export interface BunnyStorageConfig {
  storageZone: string;
  apiKey: string;
}

export async function getBunnyStorageConfig(): Promise<BunnyStorageConfig | null> {
  const creds = await getCredentials([
    "bunny_storage_zone",
    "bunny_storage_key",
  ] as const);
  if (!creds.bunny_storage_zone || !creds.bunny_storage_key) return null;
  return { storageZone: creds.bunny_storage_zone, apiKey: creds.bunny_storage_key };
}

export async function uploadToBunnyStorage(
  cfg: BunnyStorageConfig,
  path: string,
  data: ArrayBuffer,
  contentType: string,
): Promise<string> {
  const res = await fetch(
    `https://storage.bunnycdn.com/${cfg.storageZone}/${path}`,
    {
      method: "PUT",
      headers: {
        AccessKey: cfg.apiKey,
        "Content-Type": contentType,
      },
      body: new Uint8Array(data),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bunny Storage upload failed: ${res.status} ${text}`);
  }
  return `https://${cfg.storageZone}.b-cdn.net/${path}`;
}
