import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://calqulate.net";

/** OAuth / email-confirmation callback: exchanges the code for a session. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  // Use the configured site URL, not the request origin, to avoid localhost
  // redirects when Supabase Auth falls back to its internal SITE_URL.
  const base = SITE.replace(/\/+$/, "");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Register this session as active for single-device enforcement
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      if (user && session?.id) {
        const admin = createAdminClient();
        await admin
          .from("user_sessions")
          .update({ revoked_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .is("revoked_at", null);
        await admin
          .from("user_sessions")
          .insert({ user_id: user.id, session_id: session.id })
          .maybeSingle();
      }
      return NextResponse.redirect(`${base}${next}`);
    }
  }
  return NextResponse.redirect(`${base}/login?error=auth`);
}
