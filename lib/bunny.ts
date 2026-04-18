import "server-only";
import crypto from "crypto";
import { getCredentials } from "@/lib/credentials";

export interface BunnyStreamConfig {
  apiKey: string;
  libraryId: string;
  cdnHostname: string;
}

export async function getBunnyStreamConfig(): Promise<BunnyStreamConfig | null> {
  const creds = await getCredentials([
    "bunny_api_key",
    "bunny_stream_library_id",
    "bunny_stream_cdn_hostname",
  ] as const);
  if (
    !creds.bunny_api_key ||
    !creds.bunny_stream_library_id ||
    !creds.bunny_stream_cdn_hostname
  ) {
    return null;
  }
  return {
    apiKey: creds.bunny_api_key,
    libraryId: creds.bunny_stream_library_id,
    cdnHostname: creds.bunny_stream_cdn_hostname,
  };
}

export interface BunnyVideoCreated {
  guid: string;
  title: string;
}

export async function createBunnyVideo(
  cfg: BunnyStreamConfig,
  title: string,
): Promise<BunnyVideoCreated> {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${cfg.libraryId}/videos`,
    {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        AccessKey: cfg.apiKey,
      },
      body: JSON.stringify({ title }),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Bunny create video failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { guid: string; title: string };
  return { guid: json.guid, title: json.title };
}

export interface BunnyTusAuth {
  videoId: string;
  libraryId: string;
  authSignature: string;
  expireTime: number;
  uploadEndpoint: string;
}

export function signBunnyTusUpload(
  cfg: BunnyStreamConfig,
  videoId: string,
  ttlSeconds = 60 * 60 * 12,
): BunnyTusAuth {
  const expireTime = Math.floor(Date.now() / 1000) + ttlSeconds;
  const authSignature = crypto
    .createHash("sha256")
    .update(`${cfg.libraryId}${cfg.apiKey}${expireTime}${videoId}`)
    .digest("hex");
  return {
    videoId,
    libraryId: cfg.libraryId,
    authSignature,
    expireTime,
    uploadEndpoint: "https://video.bunnycdn.com/tusupload",
  };
}

export async function getBunnyVideoMeta(
  cfg: BunnyStreamConfig,
  videoId: string,
): Promise<{ length: number | null } | null> {
  const res = await fetch(
    `https://video.bunnycdn.com/library/${cfg.libraryId}/videos/${videoId}`,
    {
      headers: {
        accept: "application/json",
        AccessKey: cfg.apiKey,
      },
    },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as { length?: number };
  return { length: typeof json.length === "number" ? json.length : null };
}

export function signBunnyEmbedToken(
  cfg: BunnyStreamConfig,
  videoId: string,
  ttlSeconds = 60 * 60 * 6,
): { token: string; expires: number } {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = crypto
    .createHash("sha256")
    .update(`${cfg.apiKey}${videoId}${expires}`)
    .digest("hex");
  return { token, expires };
}

export function bunnyEmbedUrl(
  cfg: BunnyStreamConfig,
  videoId: string,
  token: string,
  expires: number,
): string {
  return `https://iframe.mediadelivery.net/embed/${cfg.libraryId}/${videoId}?token=${token}&expires=${expires}&autoplay=false`;
}
