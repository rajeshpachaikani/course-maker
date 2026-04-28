import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { getBunnyStorageConfig, uploadToBunnyStorage } from "@/lib/bunny-storage";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_BYTES = 5 * 1024 * 1024;
const EXT_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Use JPG, PNG, WebP, or GIF." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 400 });
  }

  const cfg = await getBunnyStorageConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "Storage not configured. Ask your admin to add Bunny Storage credentials." },
      { status: 503 },
    );
  }

  const ext = EXT_MAP[file.type] ?? "bin";
  const path = `avatars/${user.id}-${Date.now()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  let url: string;
  try {
    url = await uploadToBunnyStorage(cfg, path, arrayBuffer, file.type);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  await db
    .update(users)
    .set({ image: url, updatedAt: new Date() })
    .where(eq(users.id, user.id));

  return NextResponse.json({ url });
}
