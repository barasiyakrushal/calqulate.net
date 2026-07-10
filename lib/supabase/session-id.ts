/**
 * Supabase's `Session` object exposes no public `id`. The durable per-session
 * identifier lives inside the access-token JWT as the `session_id` claim, so we
 * decode that. This is what single-device enforcement keys off, stored in the
 * `user_sessions.session_id` column.
 *
 * Uses `atob` (not `Buffer`) so it works in the Edge runtime too, where the
 * Supabase middleware runs.
 */

interface SessionLike {
  access_token?: string | null
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split(".")[1]
  if (!part) return null
  try {
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/")
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : ""
    return JSON.parse(atob(b64 + pad)) as Record<string, unknown>
  } catch {
    return null
  }
}

/**
 * Stable session id for the given Supabase session, or null when there is no
 * session. Falls back to a token prefix for tokens without a `session_id` claim.
 */
export function getSupabaseSessionId(session: SessionLike | null | undefined): string | null {
  const token = session?.access_token
  if (!token) return null
  const payload = decodeJwtPayload(token)
  const sid = payload?.session_id
  if (typeof sid === "string" && sid) return sid
  return token.slice(0, 32)
}
