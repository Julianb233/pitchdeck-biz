-- =============================================================================
-- Phase 20: AI Discovery Sessions — Database Schema
-- =============================================================================
-- Stores the 6-step AI-guided discovery session data with responses,
-- file references, AI follow-ups, and final summary.
-- =============================================================================

create table if not exists public.discovery_sessions (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references auth.users(id) on delete cascade,
  status           text not null default 'in_progress'
                   check (status in ('in_progress', 'summarizing', 'confirmed', 'generating', 'completed', 'abandoned')),
  current_step     integer not null default 1 check (current_step >= 1 and current_step <= 7),
  responses        jsonb not null default '{}'::jsonb,
  -- responses shape: { "1": { text, transcript, files[], aiFollowUp }, "2": {...}, ... }
  file_references  jsonb not null default '[]'::jsonb,
  -- file_references: [{ stepId, fileName, mimeType, geminiFileUri?, extractedText }]
  ai_context       jsonb not null default '[]'::jsonb,
  -- ai_context: conversation history for Gemini multi-turn [{role, parts}]
  summary          jsonb,
  -- summary: BusinessDiscoverySummary once generated
  analysis_id      uuid references public.analyses(id) on delete set null,
  deck_id          uuid references public.decks(id) on delete set null,
  investor_type    text,
  completed_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_discovery_sessions_user_id on public.discovery_sessions(user_id);
create index if not exists idx_discovery_sessions_status on public.discovery_sessions(status);
create index if not exists idx_discovery_sessions_created_at on public.discovery_sessions(created_at desc);

alter table public.discovery_sessions enable row level security;

-- RLS policies: users can only access their own sessions
create policy "Users can view own discovery sessions"
  on public.discovery_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own discovery sessions"
  on public.discovery_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own discovery sessions"
  on public.discovery_sessions for update
  using (auth.uid() = user_id);

create policy "Users can delete own discovery sessions"
  on public.discovery_sessions for delete
  using (auth.uid() = user_id);

-- Anonymous sessions (user_id is null) are allowed for unauthenticated users.
-- They can be claimed when the user signs up/logs in.
create policy "Anonymous discovery sessions are accessible by service role"
  on public.discovery_sessions for all
  using (user_id is null)
  with check (user_id is null);

-- Auto-update updated_at timestamp
create or replace function update_discovery_session_timestamp()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_discovery_sessions_updated_at
  before update on public.discovery_sessions
  for each row
  execute function update_discovery_session_timestamp();
