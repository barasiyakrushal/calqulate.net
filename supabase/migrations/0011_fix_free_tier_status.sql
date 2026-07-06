-- Change the free‑tier subscription status from 'active' to 'free'
-- so it doesn't misleadingly look like a paid subscription.

-- 1. Update existing rows that were created with the old default.
update public.subscriptions
set status = 'free'
where tier = 'free' and status = 'active';

-- 2. Change the table default so new sign-ups get 'free' too.
alter table public.subscriptions
  alter column status set default 'free';
