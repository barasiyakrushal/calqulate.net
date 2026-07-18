import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getSupabaseSessionId } from "@/lib/supabase/session-id";
import { registerAndPruneSessions } from "@/lib/auth/sessionLimit";

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
      // Register this session, pruning anything beyond the device cap.
      const { data: { user } } = await supabase.auth.getUser();
      const { data: { session } } = await supabase.auth.getSession();
      const sessionId = getSupabaseSessionId(session);
      if (user && sessionId) {
        try {
          await registerAndPruneSessions(createAdminClient(), user.id, sessionId);
        } catch {
          // Never block a successful login on session bookkeeping.
        }
      }
      return NextResponse.redirect(`${base}${next}`);
    }
  }
  return NextResponse.redirect(`${base}/login?error=auth`);
}
