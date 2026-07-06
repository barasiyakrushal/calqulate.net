import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://calqulate.net";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Revoke this session in the user_sessions table
  if (session?.id) {
    const admin = createAdminClient();
    await admin
      .from("user_sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("session_id", session.id)
      .is("revoked_at", null);
  }

  await supabase.auth.signOut();
  return NextResponse.redirect(`${SITE}/login`, { status: 303 });
}
