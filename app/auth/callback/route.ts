import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/** OAuth / email-confirmation callback: exchanges the code for a session. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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
      return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
