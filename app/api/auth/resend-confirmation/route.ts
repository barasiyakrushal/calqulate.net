import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

const schema = z.object({
  email: z.string().email(),
  next: z.string().optional(),
});

/**
 * Re-sends the sign-up confirmation email.
 *
 * Without this, a user who never receives the first email has no way forward:
 * the sign-up form told them to check their inbox and nothing else. They cannot
 * sign in (unconfirmed) and cannot sign up again (address already taken).
 *
 * Responds identically whether or not the address exists / is already
 * confirmed, so it cannot be used to enumerate accounts.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  // Tight: every call sends a real email.
  const rl = await rateLimit(`resendconfirm:${ip}`, 3, 60_000);
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

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calqulate.net";
  const next = parsed.data.next ?? "/dashboard/glp1";

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}` },
  });

  // Surface only the rate-limit case; everything else returns ok so the
  // response cannot reveal whether the address is registered.
  if (error && error.status === 429) {
    return NextResponse.json(
      { error: "Too many emails sent. Please wait a few minutes." },
      { status: 429 },
    );
  }

  return NextResponse.json({ ok: true });
}
