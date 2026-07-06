-- ---------------------------------------------------------------------------
-- 0011_weight_goal.sql
-- Adds a per-user goal weight for the Weight Tracker. Stored in kg (the app's
-- canonical unit); the UI converts to lb/kg for display.
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists goal_weight_kg numeric;
