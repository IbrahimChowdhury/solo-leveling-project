-- Create workout completions table to store user logs
create table if not exists public.workout_completions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  body_part text not null, -- 'chest', 'back', 'legs', 'core', 'shoulders', 'arms'
  workout_type text not null, -- 'home', 'gym', 'calisthenics', 'band'
  exercise_name text not null,
  xp_gained integer not null,
  completed_at timestamp with time zone default now() not null
);

-- Enable Row Level Security
alter table public.workout_completions enable row level security;

-- Drop policy if it already exists to avoid duplication errors
drop policy if exists "Users can manage own workout completions" on public.workout_completions;

-- Add RLS Policy allowing users to see and add their own entries
create policy "Users can manage own workout completions" on public.workout_completions
  for all using (auth.uid() = user_id or public.is_admin(auth.uid()));
