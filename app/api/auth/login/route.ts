import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  // Stricter on login to blunt credential-stuffing.
  const rl = await rateLimit(`login:${ip}`, 8, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const human = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!human) {
    return NextResponse.json({ error: "Bot check failed. Please retry." }, { status: 403 });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  return NextResponse.json({ ok: true });
}
