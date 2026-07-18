import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getSupabaseSessionId } from "@/lib/supabase/session-id";
import { registerAndPruneSessions } from "@/lib/auth/sessionLimit";

/**
 * Registers the current Supabase auth session as active, keeping only the most
 * recent MAX_ACTIVE_SESSIONS devices signed in. Older sessions beyond the cap
 * are soft-revoked.
 *
 * Called by the client after a successful login / signup / OAuth callback.
 */
export async function POST(_req: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get the current Supabase session ID
  const { data: { session } } = await supabase.auth.getSession();
  const sessionId = getSupabaseSessionId(session);
  if (!sessionId) {
    return NextResponse.json({ error: "No active session found" }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    await registerAndPruneSessions(admin, user.id, sessionId);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not register session" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
