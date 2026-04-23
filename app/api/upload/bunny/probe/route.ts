import { NextResponse } from "next/server";
import { currentUserIsStaff } from "@/lib/dal";
import { getBunnyStreamConfig, getBunnyVideoMeta } from "@/lib/bunny";

export async function GET(request: Request) {
  if (!(await currentUserIsStaff())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get("videoId");
  if (!videoId) {
    return NextResponse.json({ error: "videoId required" }, { status: 400 });
  }
  const cfg = await getBunnyStreamConfig();
  if (!cfg) {
    return NextResponse.json({ error: "Bunny not configured" }, { status: 400 });
  }
  const meta = await getBunnyVideoMeta(cfg, videoId);
  return NextResponse.json(meta ?? { length: null });
}
