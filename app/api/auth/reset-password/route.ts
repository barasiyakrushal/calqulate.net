import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { rateLimit, clientIp } from "@/lib/security/rateLimit";

const schema = z.object({
  password: z.string()
    .min(8, "Use at least 8 characters.")
    .regex(/[A-Z]/, "Must include at least one uppercase letter.")
    .regex(/[a-z]/, "Must include at least one lowercase letter.")
    .regex(/\d/, "Must include at least one number."),
});

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = await rateLimit(`reset-pw:${ip}`, 5, 60_000);
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
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    return NextResponse.json({ error: "Session expired. Please request a new reset link." }, { status: 401 });
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.message?.includes("same as the old password")) {
      return NextResponse.json({ error: "New password must be different from your current password." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
