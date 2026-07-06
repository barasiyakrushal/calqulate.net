import { NextResponse } from "next/server";
import { search } from "@/lib/search/engine";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

export async function GET(req: Request) {
  const rl = await rateLimit(`search:${clientIp(req)}`, 60, 60_000);
  if (!rl.ok) return NextResponse.json({ results: [] }, { status: 429 });

  const q = new URL(req.url).searchParams.get("q") ?? "";
  return NextResponse.json({ results: search(q) });
}
