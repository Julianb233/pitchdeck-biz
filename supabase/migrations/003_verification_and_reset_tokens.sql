-- Add email verification and password reset tokens
-- v1.1: Email verification + password reset flows

-- Verification tokens table (used for both email verification and password reset)
create table public.verification_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  token text unique not null,
  type text not null check (type in ('email_verification', 'password_reset')),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_verification_tokens_token on public.verification_tokens(token);
create index idx_verification_tokens_user_id on public.verification_tokens(user_id);

-- Add email_verified column to users
alter table public.users add column if not exists email_verified boolean not null default false;

-- RLS
alter table public.verification_tokens enable row level security;

-- Service role only — no direct user access to tokens table
-- Tokens are validated server-side via admin client
