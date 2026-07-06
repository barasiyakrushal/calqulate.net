-- Single-device login enforcement.
-- Tracks the "active" session per user so we can force-logout older sessions.

create table if not exists public.user_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  -- The Supabase auth session ID (from auth.sessions)
  session_id text not null,
  -- Each user may have multiple session rows, but only the most recently
  -- created one is considered "active".  Older sessions get soft-revoked.
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

create unique index if not exists user_sessions_active_idx
  on public.user_sessions (user_id)
  where revoked_at is null;

-- Allow the owning user to insert / upsert; the service role handles admin.
alter table public.user_sessions enable row level security;

create policy "own_insert" on public.user_sessions
  for insert with check (user_id = auth.uid());

create policy "own_select" on public.user_sessions
  for select using (user_id = auth.uid());
