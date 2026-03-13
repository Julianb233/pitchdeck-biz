-- =============================================================================
-- PitchDeck.biz — Supabase Database Schema
-- =============================================================================
-- Run this in the Supabase SQL Editor to create all tables.
-- Requires: auth.users (provided by Supabase Auth)
-- =============================================================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 1. analyses — stores business analysis results from the AI pipeline
-- =============================================================================
create table if not exists public.analyses (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  business_name  text not null,
  analysis_data  jsonb not null default '{}'::jsonb,
  files_uploaded jsonb not null default '[]'::jsonb,
  created_at     timestamptz not null default now()
);

create index if not exists idx_analyses_user_id on public.analyses(user_id);

alter table public.analyses enable row level security;

create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own analyses"
  on public.analyses for update
  using (auth.uid() = user_id);

create policy "Users can delete own analyses"
  on public.analyses for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- 2. decks — pitch deck content and related documents
-- =============================================================================
create table if not exists public.decks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete set null,
  title       text not null,
  slides      jsonb not null default '[]'::jsonb,
  sell_sheet   jsonb,
  one_pager    jsonb,
  brand_kit    jsonb,
  status      text not null default 'draft',
  created_at  timestamptz not null default now()
);

create index if not exists idx_decks_user_id on public.decks(user_id);
create index if not exists idx_decks_analysis_id on public.decks(analysis_id);

alter table public.decks enable row level security;

create policy "Users can view own decks"
  on public.decks for select
  using (auth.uid() = user_id);

create policy "Users can insert own decks"
  on public.decks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own decks"
  on public.decks for update
  using (auth.uid() = user_id);

create policy "Users can delete own decks"
  on public.decks for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- 3. orders — one-time deck purchase payments
-- =============================================================================
create table if not exists public.orders (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  deck_id            uuid not null references public.decks(id) on delete cascade,
  stripe_session_id  text,
  amount_cents       integer not null default 0,
  status             text not null default 'pending',
  created_at         timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_deck_id on public.orders(deck_id);

alter table public.orders enable row level security;

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Users can update own orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- =============================================================================
-- 4. subscriptions — Stripe subscription + token balance tracking
-- =============================================================================
create table if not exists public.subscriptions (
  id                       uuid primary key default uuid_generate_v4(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  stripe_subscription_id   text not null,
  stripe_customer_id       text not null,
  status                   text not null default 'active',
  token_balance            integer not null default 500,
  tokens_allocated         integer not null default 500,
  current_period_start     timestamptz not null default now(),
  current_period_end       timestamptz not null default (now() + interval '30 days'),
  created_at               timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_stripe_customer_id on public.subscriptions(stripe_customer_id);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Subscriptions are managed by webhooks (service role), but users can read their own

-- =============================================================================
-- 5. assets — generated branding assets
-- =============================================================================
create table if not exists public.assets (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  asset_type      text not null,
  template_name   text,
  prompt          text,
  image_data      text,
  tokens_used     integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists idx_assets_user_id on public.assets(user_id);
create index if not exists idx_assets_subscription_id on public.assets(subscription_id);

alter table public.assets enable row level security;

create policy "Users can view own assets"
  on public.assets for select
  using (auth.uid() = user_id);

create policy "Users can insert own assets"
  on public.assets for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own assets"
  on public.assets for delete
  using (auth.uid() = user_id);

-- =============================================================================
-- 6. token_usage — audit log for token consumption
-- =============================================================================
create table if not exists public.token_usage (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  asset_id        uuid references public.assets(id) on delete set null,
  tokens_used     integer not null,
  action          text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_token_usage_user_id on public.token_usage(user_id);
create index if not exists idx_token_usage_subscription_id on public.token_usage(subscription_id);

alter table public.token_usage enable row level security;

create policy "Users can view own token usage"
  on public.token_usage for select
  using (auth.uid() = user_id);

create policy "Users can insert own token usage"
  on public.token_usage for insert
  with check (auth.uid() = user_id);
