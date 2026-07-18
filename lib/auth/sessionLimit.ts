import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * How many devices a single account may be signed in on at once.
 *
 * This is an anti-sharing measure, not a security boundary. A GLP-1 tracker is
 * used on a phone but often signed up for on a laptop, so a limit of 1 (the
 * previous behaviour) logged real users out constantly. Three covers phone +
 * laptop + tablet; someone sharing an account widely still gets pushed out.
 *
 * Note these are *sessions*, not physical devices: clearing cookies, using a
 * second browser, or incognito each create a new one. Raise this before
 * lowering it.
 */
export const MAX_ACTIVE_SESSIONS = 3;

/**
 * Registers `sessionId` as active for the user, then soft-revokes anything
 * beyond the newest MAX_ACTIVE_SESSIONS.
 *
 * Idempotent: re-registering an existing session just refreshes it rather than
 * consuming another slot, so a user who logs in twice on the same browser does
 * not burn through their allowance.
 *
 * Requires a service-role client (RLS blocks updating other rows).
 */
export async function registerAndPruneSessions(
  admin: SupabaseClient,
  userId: string,
  sessionId: string,
): Promise<void> {
  // Upsert on session_id so a repeat login on the same session is a no-op
  // rather than a duplicate row.
  await admin
    .from("user_sessions")
    .upsert(
      { user_id: userId, session_id: sessionId, revoked_at: null },
      { onConflict: "session_id" },
    );

  // Newest first; anything past the cap gets revoked.
  const { data: active } = await admin
    .from("user_sessions")
    .select("id")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false });

  if (!active || active.length <= MAX_ACTIVE_SESSIONS) return;

  const staleIds = active.slice(MAX_ACTIVE_SESSIONS).map((row) => row.id);
  if (staleIds.length === 0) return;

  await admin
    .from("user_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .in("id", staleIds);
}
