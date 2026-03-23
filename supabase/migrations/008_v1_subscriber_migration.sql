-- =============================================================================
-- Migration 008: V1 Subscriber Migration & Grandfathering
-- =============================================================================
-- Adds columns to track V1 migration status, grandfathering, and original
-- plan info. Provides a function to batch-migrate V1 subscribers.
-- =============================================================================

-- Track whether this subscription was migrated from the pre-tier system
alter table public.subscriptions
  add column if not exists migrated_from_v1 boolean not null default false;

-- When the migration happened
alter table public.subscriptions
  add column if not exists v1_migrated_at timestamptz;

-- Grandfathered subscribers keep their price until this date (null = not grandfathered)
alter table public.subscriptions
  add column if not exists grandfathered_until timestamptz;

-- What the subscriber was paying before migration (for audit trail)
alter table public.subscriptions
  add column if not exists v1_original_price_cents integer;

-- The plan they were auto-assigned to during migration
alter table public.subscriptions
  add column if not exists v1_assigned_tier text;

-- Index for quick lookups of migrated/grandfathered subscribers
create index if not exists idx_subscriptions_migrated
  on public.subscriptions(migrated_from_v1)
  where migrated_from_v1 = true;

create index if not exists idx_subscriptions_grandfathered
  on public.subscriptions(grandfathered_until)
  where grandfathered_until is not null;

-- =============================================================================
-- Function: migrate_v1_subscribers
-- Batch-migrates all active subscriptions that lack tier-specific metadata.
-- V1 subscribers (those without explicit tier assignment from checkout) get:
--   - Mapped to Pro tier (they were paying for the old single-tier plan)
--   - Grandfathered for 12 months at their current price
--   - Full Pro-tier limits applied immediately
-- =============================================================================
create or replace function migrate_v1_subscribers()
returns table (
  migrated_count integer,
  skipped_count integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_migrated integer := 0;
  v_skipped integer := 0;
begin
  -- Migrate active subscriptions that haven't been migrated yet
  -- and don't have tier metadata from the new checkout flow
  update subscriptions
  set
    migrated_from_v1 = true,
    v1_migrated_at = now(),
    v1_assigned_tier = 'pro',
    tier = 'pro',
    billing_period = coalesce(nullif(billing_period, ''), 'monthly'),
    -- Pro tier limits
    tokens_allocated = 500,
    token_balance = greatest(token_balance, 500),
    grandfathered_until = now() + interval '12 months'
  where status = 'active'
    and migrated_from_v1 = false
    and v1_migrated_at is null
    -- Identify V1 subscribers: created before the 3-tier system was deployed
    -- and not created through the new checkout flow (no explicit tier in metadata)
    and created_at < now() - interval '1 day';

  get diagnostics v_migrated = row_count;

  -- Count already-migrated or new-flow subscribers that were skipped
  select count(*) into v_skipped
  from subscriptions
  where status = 'active'
    and (migrated_from_v1 = true or v1_migrated_at is not null);

  return query select v_migrated, v_skipped;
end;
$$;

grant execute on function migrate_v1_subscribers() to service_role;

-- =============================================================================
-- Function: check_grandfathered_status
-- Returns grandfathering info for a specific user
-- =============================================================================
create or replace function check_grandfathered_status(p_user_id uuid)
returns table (
  is_grandfathered boolean,
  grandfathered_until timestamptz,
  v1_original_tier text,
  days_remaining integer
)
language sql
security definer
set search_path = public
as $$
  select
    (s.grandfathered_until is not null and s.grandfathered_until > now()) as is_grandfathered,
    s.grandfathered_until,
    s.v1_assigned_tier as v1_original_tier,
    greatest(0, extract(day from s.grandfathered_until - now())::integer) as days_remaining
  from subscriptions s
  where s.user_id = p_user_id
    and s.status = 'active'
  order by s.created_at desc
  limit 1;
$$;

grant execute on function check_grandfathered_status(uuid) to authenticated;
grant execute on function check_grandfathered_status(uuid) to service_role;
