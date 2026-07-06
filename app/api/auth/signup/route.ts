import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Use at least 8 characters."),
  turnstileToken: z.string().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "You must accept the terms." }) }),
  next: z.string().optional(),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = await rateLimit(`signup:${ip}`, 5, 60_000);
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

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calqulate.net";
  const next = parsed.data.next ?? "/dashboard";
  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: redirectTo },
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // session present => no email confirmation required.
  return NextResponse.json({ ok: true, needsConfirmation: !data.session, next });
}
