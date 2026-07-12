import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getSupabaseSessionId } from "@/lib/supabase/session-id";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://calqulate.net";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const sessionId = getSupabaseSessionId(session);

  // Revoke this session in the user_sessions table
  if (sessionId) {
    const admin = createAdminClient();
    await admin
      .from("user_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("session_id", sessionId)
      .is("revoked_at", null);
  }

  await supabase.auth.signOut();
  return NextResponse.redirect(`${SITE}/`, { status: 303 });
}
