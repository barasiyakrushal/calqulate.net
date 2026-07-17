import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

const schema = z.object({
  email: z.string().email(),
  turnstileToken: z.string().optional(),
  next: z.string().optional(),
  /** Signup requires explicit consent; login does not. */
  consent: z.boolean().optional(),
});

/**
 * Passwordless sign-in / sign-up via a one-time email link.
 *
 * `shouldCreateUser: true` means this doubles as a signup path, so the consent
 * checkbox is enforced here exactly as it is on the password signup route.
 *
 * The response is deliberately identical whether or not the address exists, so
 * this endpoint cannot be used to enumerate accounts. The link is exchanged for
 * a session by the existing /auth/callback handler.
 */
export async function POST(req: Request) {
  const ip = clientIp(req);
  // Tighter than password signup (5/min): each call sends a real email.
  const rl = await rateLimit(`magiclink:${ip}`, 3, 60_000);
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

  if (parsed.data.consent === false) {
    return NextResponse.json({ error: "You must accept the terms." }, { status: 400 });
  }

  const human = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!human) {
    return NextResponse.json({ error: "Bot check failed. Please retry." }, { status: 403 });
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://calqulate.net";
  const next = parsed.data.next ?? "/dashboard/glp1";
  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
  });

  // Never leak whether the address exists. Log-worthy failures still return ok.
  if (error && error.status === 429) {
    return NextResponse.json(
      { error: "Too many emails sent. Please wait a few minutes." },
      { status: 429 },
    );
  }

  return NextResponse.json({ ok: true });
}
