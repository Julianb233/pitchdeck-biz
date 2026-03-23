-- =============================================================================
-- Migration 009: Add-on Purchases Table & Subscription Status Updates
-- =============================================================================
-- Adds a table to track add-on purchases (one-time and recurring).
-- Updates the subscription status constraint to include 'past_due'.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Add-on Purchases
-- ---------------------------------------------------------------------------
create table if not exists public.addon_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  addon_id text not null,
  stripe_session_id text,
  stripe_subscription_id text,  -- Only set for recurring add-ons
  amount_cents integer not null default 0,
  status text not null default 'completed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS
alter table public.addon_purchases enable row level security;

-- Users can read their own addon purchases
create policy "Users can read own addon purchases"
  on public.addon_purchases for select
  using (auth.uid() = user_id);

-- Service role can do anything (webhooks use service role)
create policy "Service role full access on addon_purchases"
  on public.addon_purchases for all
  using (auth.role() = 'service_role');

-- Indices
create index if not exists idx_addon_purchases_user_id
  on public.addon_purchases(user_id);

create index if not exists idx_addon_purchases_stripe_subscription_id
  on public.addon_purchases(stripe_subscription_id)
  where stripe_subscription_id is not null;

-- ---------------------------------------------------------------------------
-- Update subscription status constraint to include 'past_due'
-- ---------------------------------------------------------------------------
-- Drop old constraint if it exists, then re-add with the expanded set.
do $$
begin
  alter table public.subscriptions
    drop constraint if exists chk_subscriptions_status;
exception when others then
  null;
end;
$$;

alter table public.subscriptions
  add constraint chk_subscriptions_status
  check (status in ('active', 'canceled', 'canceling', 'past_due', 'trialing', 'incomplete'));

-- Auto-update updated_at on addon_purchases
create or replace function update_addon_purchases_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trigger_addon_purchases_updated_at
  before update on public.addon_purchases
  for each row
  execute function update_addon_purchases_updated_at();
