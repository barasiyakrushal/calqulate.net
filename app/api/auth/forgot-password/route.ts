import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = await rateLimit(`forgot-pw:${ip}`, 3, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSeconds) } },
    );
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const human = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!human) {
    return NextResponse.json({ error: "Bot check failed. Please retry." }, { status: 403 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calqulate.net";
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
