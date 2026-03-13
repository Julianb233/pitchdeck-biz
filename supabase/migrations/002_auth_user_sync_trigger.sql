-- Trigger to sync auth.users -> public.users on signup
-- This ensures that every Supabase Auth user has a corresponding row in public.users,
-- which is required for foreign key constraints on decks, subscriptions, orders, assets.

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.users (id, email, name, created_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    now()
  )
  on conflict (id) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.users.name);
  return new;
end;
$$;

-- Trigger on auth.users insert
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Also allow users to insert their own profile row (for application-level sync fallback)
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = id);
