-- Allow a small number of concurrent devices instead of exactly one.
--
-- Why: 0012 enforced a single active session per user via a partial UNIQUE
-- index. For a tracker used mainly on a phone but signed up for on a laptop,
-- that silently logged people out every time they switched device, which read
-- as "the app broke" rather than "you hit a limit". The cap now lives in
-- application code (lib/auth/sessionLimit.ts) so it can be tuned without a
-- migration; this migration just removes the hard database constraint.
--
-- Anti-sharing is preserved: the app keeps only the N most recent sessions
-- active and soft-revokes the rest, so a widely shared account still causes
-- constant re-logins for whoever is sharing it.

-- 1. Drop the one-active-session-per-user constraint.
drop index if exists public.user_sessions_active_idx;

-- 2. Keep lookups fast for the "active sessions for this user" query the
--    middleware runs on every gated page load.
create index if not exists user_sessions_active_lookup_idx
  on public.user_sessions (user_id, created_at desc)
  where revoked_at is null;

-- 3. A given Supabase session should only ever appear once.
create unique index if not exists user_sessions_session_id_idx
  on public.user_sessions (session_id);
