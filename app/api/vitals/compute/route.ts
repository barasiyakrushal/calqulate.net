import { NextResponse } from "next/server";
import { buildVitalsReport } from "@/lib/clinical";
import { generateProtocol } from "@/lib/protocol";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";
import type { MeasurementInput } from "@/types/vitals";

/**
 * Stateless compute endpoint — runs all clinical engines on the posted inputs
 * and returns a full report + protocol. Works anonymously (the free snapshot).
 * No data is persisted. Rate-limited to deter scraping/abuse.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = await rateLimit(`compute:${ip}`, 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please slow down." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const input = (await req.json()) as MeasurementInput;
  if (!input?.age || !input?.sex || !input?.heightCm || !input?.weightKg) {
    return NextResponse.json(
      { error: "age, sex, heightCm and weightKg are required." },
      { status: 400 },
    );
  }

  const report = buildVitalsReport(input);
  const protocol = generateProtocol(report);
  return NextResponse.json({ report, protocol });
}
