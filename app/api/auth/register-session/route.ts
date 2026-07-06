import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

/**
 * Registers the current Supabase auth session as the "active" session for
 * single-device login enforcement.  Any previously active session for this
 * user is revoked.
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
  const sessionId = session?.id ?? session?.access_token?.slice(0, 32);
  if (!sessionId) {
    return NextResponse.json({ error: "No active session found" }, { status: 400 });
  }

  const admin = createAdminClient();

  // Revoke any previously active session for this user
  await admin
    .from("user_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("revoked_at", null);

  // Register the new session as active
  const { error: insertErr } = await admin
    .from("user_sessions")
    .insert({ user_id: user.id, session_id: sessionId });

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
