-- Supabase SQL Schema for Solo Leveling Gamified Life App

-- 1. Create is_admin helper function to prevent recursive policies
create or replace function public.is_admin(user_id uuid)
returns boolean security definer as $$
begin
  return exists (
    select 1 from public.profiles where id = user_id and is_admin = true
  );
end;
$$ language plpgsql;

-- 2. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  avatar_url text,
  level integer default 1 not null,
  total_xp integer default 0 not null,
  rank text default 'E-Rank' not null,
  attack_power integer default 10 not null,
  intelligence integer default 10 not null,
  endurance integer default 10 not null,
  stamina integer default 10 not null,
  exercise integer default 10 not null,
  skills integer default 10 not null,
  streak_days integer default 0 not null,
  is_pro boolean default false not null,
  pro_expires_at timestamp with time zone,
  penalty_shield_used_this_week boolean default false not null,
  is_admin boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id or public.is_admin(auth.uid()));

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id or public.is_admin(auth.uid()));

-- Trigger to create profile when auth.users is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url, level, total_xp, rank, attack_power, intelligence, endurance, stamina, exercise, skills, streak_days, is_pro, is_admin)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Hunter_' || substring(new.id::text from 1 for 6)),
    new.raw_user_meta_data->>'avatar_url',
    1,
    0,
    'E-Rank',
    10,
    10,
    10,
    10,
    10,
    10,
    0,
    false,
    false
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 3. Daily Quests Table
create table if not exists public.daily_quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date default current_date not null,
  title text not null,
  description text not null,
  stat_category text not null,
  xp_reward integer not null,
  completed boolean default false not null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

alter table public.daily_quests enable row level security;

create policy "Users can manage own daily quests" on public.daily_quests
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 4. Custom Quests Table
create table if not exists public.custom_quests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  stat_category text not null,
  xp_reward integer not null,
  repeat_type text not null, -- 'one-time', 'daily', 'weekly', 'monthly', 'yearly'
  proof_required boolean default false not null,
  active boolean default true not null,
  last_completed_at timestamp with time zone,
  next_reset_at timestamp with time zone,
  created_at timestamp with time zone default now() not null
);

alter table public.custom_quests enable row level security;

create policy "Users can manage own custom quests" on public.custom_quests
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 5. Quest Completions Table
create table if not exists public.quest_completions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quest_id uuid not null,
  quest_type text not null, -- 'system', 'custom'
  xp_gained integer not null,
  stat_gained text not null,
  proof_image_url text,
  completed_at timestamp with time zone default now() not null
);

alter table public.quest_completions enable row level security;

create policy "Users can read/create own quest completions" on public.quest_completions
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 6. Stat History Table
create table if not exists public.stat_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  date date default current_date not null,
  attack_power integer not null,
  intelligence integer not null,
  endurance integer not null,
  stamina integer not null,
  exercise integer not null,
  skills integer not null,
  created_at timestamp with time zone default now() not null
);

alter table public.stat_history enable row level security;

create policy "Users can manage own stat history" on public.stat_history
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 7. Penalties Table
create table if not exists public.penalties (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  quest_type text not null,
  quest_id uuid not null,
  xp_lost integer not null,
  stat_decreased text not null,
  decrease_amount integer not null,
  applied_at timestamp with time zone default now() not null
);

alter table public.penalties enable row level security;

create policy "Users can manage own penalties" on public.penalties
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 8. Subscriptions Table
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_customer_id text not null,
  stripe_subscription_id text not null,
  plan text not null, -- 'monthly', 'yearly'
  status text not null, -- 'active', 'canceled', 'past_due'
  current_period_end timestamp with time zone not null,
  created_at timestamp with time zone default now() not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscriptions" on public.subscriptions
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()));


-- 9. Admin Notifications Table
create table if not exists public.admin_notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade, -- null means global
  message text not null,
  read boolean default false not null,
  created_at timestamp with time zone default now() not null
);

alter table public.admin_notifications enable row level security;

create policy "Users can view relevant admin notifications" on public.admin_notifications
  for select using (user_id is null or auth.uid() = user_id or public.is_admin(auth.uid()));

create policy "Admins can manage notifications" on public.admin_notifications
  for all using (public.is_admin(auth.uid()));


-- Storage Setup (Supabase Storage avatars bucket)
-- Note: SQL cannot always create storage buckets directly without the extensions/schemas loaded,
-- but standard insert commands or manual steps can define policies on storage.objects.
-- Here are policies to run on storage.objects if bucket 'avatars' is created:
-- create policy "Avatar upload policy" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
-- create policy "Avatar read policy" on storage.objects for select using (bucket_id = 'avatars');

-- 10. Performance Optimization Indexes
create index if not exists daily_quests_user_id_date_idx on public.daily_quests(user_id, date);
create index if not exists stat_history_user_id_date_idx on public.stat_history(user_id, date);
create index if not exists custom_quests_user_id_idx on public.custom_quests(user_id);
create index if not exists workout_completions_user_id_completed_at_idx on public.workout_completions(user_id, completed_at);
create index if not exists penalties_user_id_idx on public.penalties(user_id);

