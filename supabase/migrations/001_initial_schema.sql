-- Initial schema for pitchdeck.biz
-- Tables: users, decks, subscriptions, assets, orders

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Users table
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  created_at timestamptz not null default now(),
  stripe_customer_id text unique
);

-- Decks table
create table public.decks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  business_analysis jsonb,
  deck_content jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create index idx_decks_user_id on public.decks(user_id);

-- Subscriptions table
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_subscription_id text unique not null,
  status text not null default 'active',
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  token_balance integer not null default 0,
  tokens_used integer not null default 0
);

create index idx_subscriptions_user_id on public.subscriptions(user_id);

-- Assets table
create table public.assets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  type text not null,
  template text,
  prompt text,
  image_url text,
  tokens_cost integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_assets_user_id on public.assets(user_id);

-- Orders table
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  deck_id uuid not null references public.decks(id) on delete cascade,
  stripe_payment_intent_id text unique,
  amount integer not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_deck_id on public.orders(deck_id);

-- Row Level Security
alter table public.users enable row level security;
alter table public.decks enable row level security;
alter table public.subscriptions enable row level security;
alter table public.assets enable row level security;
alter table public.orders enable row level security;

-- RLS policies: users can only access their own data
create policy "Users can view own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

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

create policy "Users can view own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can view own assets"
  on public.assets for select
  using (auth.uid() = user_id);

create policy "Users can insert own assets"
  on public.assets for insert
  with check (auth.uid() = user_id);

create policy "Users can view own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);
