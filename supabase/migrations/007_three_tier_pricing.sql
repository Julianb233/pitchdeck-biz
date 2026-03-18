-- =============================================================================
-- Migration 007: 3-Tier Pricing Schema Updates
-- =============================================================================
-- Adds tier, billing_period, and usage tracking columns to subscriptions table.
-- Backwards compatible: existing rows default to 'pro' tier.
-- =============================================================================

-- Add tier column (starter / pro / founder_suite)
-- Existing subscribers default to 'pro' for backwards compatibility
alter table public.subscriptions
  add column if not exists tier text not null default 'pro';

-- Add billing period (monthly / annual)
alter table public.subscriptions
  add column if not exists billing_period text not null default 'monthly';

-- Track AI image credit usage per billing period
alter table public.subscriptions
  add column if not exists image_credits_used integer not null default 0;

-- Track deck creation count per billing period (for Starter tier limit)
alter table public.subscriptions
  add column if not exists deck_count_this_period integer not null default 0;

-- Add check constraint for valid tiers
alter table public.subscriptions
  add constraint chk_subscriptions_tier
  check (tier in ('starter', 'pro', 'founder_suite'));

-- Add check constraint for valid billing periods
alter table public.subscriptions
  add constraint chk_subscriptions_billing_period
  check (billing_period in ('monthly', 'annual'));

-- Index on tier for filtered queries
create index if not exists idx_subscriptions_tier on public.subscriptions(tier);

-- =============================================================================
-- Update the deduct_tokens function to be tier-aware
-- =============================================================================
create or replace function deduct_tokens(p_user_id uuid, p_cost integer)
returns table (
  subscription_id uuid,
  new_balance integer,
  tokens_allocated integer
)
language sql
security definer
set search_path = public
as $$
  update subscriptions
  set token_balance = token_balance - p_cost
  where user_id = p_user_id
    and status = 'active'
    and token_balance >= p_cost
  returning id as subscription_id, token_balance as new_balance, tokens_allocated;
$$;

-- =============================================================================
-- Function to increment deck count (called during deck creation)
-- Returns false if over limit for Starter tier
-- =============================================================================
create or replace function increment_deck_count(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tier text;
  v_count integer;
begin
  select tier, deck_count_this_period
  into v_tier, v_count
  from subscriptions
  where user_id = p_user_id
    and status = 'active'
  order by created_at desc
  limit 1;

  -- No active subscription
  if v_tier is null then
    return false;
  end if;

  -- Starter tier: max 1 deck per period
  if v_tier = 'starter' and v_count >= 1 then
    return false;
  end if;

  -- Increment count
  update subscriptions
  set deck_count_this_period = deck_count_this_period + 1
  where user_id = p_user_id
    and status = 'active';

  return true;
end;
$$;

grant execute on function increment_deck_count(uuid) to authenticated;
grant execute on function increment_deck_count(uuid) to service_role;

-- =============================================================================
-- Function to use image credits
-- Returns false if over limit (unless unlimited = -1 for founder_suite)
-- =============================================================================
create or replace function use_image_credit(p_user_id uuid, p_count integer default 1)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tier text;
  v_used integer;
  v_limit integer;
begin
  select tier, image_credits_used
  into v_tier, v_used
  from subscriptions
  where user_id = p_user_id
    and status = 'active'
  order by created_at desc
  limit 1;

  if v_tier is null then
    return false;
  end if;

  -- Founder Suite has unlimited credits
  if v_tier = 'founder_suite' then
    update subscriptions
    set image_credits_used = image_credits_used + p_count
    where user_id = p_user_id and status = 'active';
    return true;
  end if;

  -- Determine limit based on tier
  if v_tier = 'starter' then
    v_limit := 3;
  elsif v_tier = 'pro' then
    v_limit := 50;
  else
    v_limit := 0;
  end if;

  if v_used + p_count > v_limit then
    return false;
  end if;

  update subscriptions
  set image_credits_used = image_credits_used + p_count
  where user_id = p_user_id and status = 'active';

  return true;
end;
$$;

grant execute on function use_image_credit(uuid, integer) to authenticated;
grant execute on function use_image_credit(uuid, integer) to service_role;
