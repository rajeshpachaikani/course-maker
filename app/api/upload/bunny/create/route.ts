import { NextResponse } from "next/server";
import { currentUserIsAdmin } from "@/lib/dal";
import {
  getBunnyStreamConfig,
  createBunnyVideo,
  signBunnyTusUpload,
} from "@/lib/bunny";

export async function POST(request: Request) {
  if (!(await currentUserIsAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { title?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const cfg = await getBunnyStreamConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "Bunny Stream credentials are not configured." },
      { status: 400 },
    );
  }

  const video = await createBunnyVideo(cfg, title);
  const auth = signBunnyTusUpload(cfg, video.guid);
  return NextResponse.json(auth);
}
