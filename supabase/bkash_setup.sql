-- bKash Manual Payment & Pro Request Setup

-- 1. Add show_pro_welcome_popup column to profiles table if it doesn't exist
alter table public.profiles 
add column if not exists show_pro_welcome_popup boolean default false not null;

-- 2. Create bkash_config table (stores payment number and package prices in BDT)
create table if not exists public.bkash_config (
  id integer primary key default 1 check (id = 1), -- ensures only one config row exists
  number text not null default '+8801700000000',
  price_1_month numeric not null default 200,
  price_3_months numeric not null default 500,
  price_6_months numeric not null default 900,
  price_1_year numeric not null default 1500,
  updated_at timestamp with time zone default now() not null
);

-- Enable Row Level Security (RLS) for bkash_config
alter table public.bkash_config enable row level security;

-- Drop existing policies if they exist to avoid duplication errors
drop policy if exists "Anyone can select bkash_config" on public.bkash_config;
drop policy if exists "Only admin can manage bkash_config" on public.bkash_config;

-- Create policies
create policy "Anyone can select bkash_config" on public.bkash_config
  for select using (true);

create policy "Only admin can manage bkash_config" on public.bkash_config
  for all using (public.is_admin(auth.uid()));

-- Insert default configurations (if not already existing)
insert into public.bkash_config (id, number, price_1_month, price_3_months, price_6_months, price_1_year)
values (1, '+8801700000000', 200, 500, 900, 1500)
on conflict (id) do nothing;


-- 3. Create bkash_requests table (tracks user submitted TxnIDs and request status)
create table if not exists public.bkash_requests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sender_number text not null,
  transaction_id text not null unique,
  package_type text not null, -- '3_months', '6_months', '1_year'
  amount numeric not null,
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Enable RLS for bkash_requests
alter table public.bkash_requests enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own bkash_requests" on public.bkash_requests;
drop policy if exists "Users can insert own bkash_requests" on public.bkash_requests;
drop policy if exists "Admins can manage all bkash_requests" on public.bkash_requests;

-- Create policies
create policy "Users can view own bkash_requests" on public.bkash_requests
  for select using (auth.uid() = user_id);

create policy "Users can insert own bkash_requests" on public.bkash_requests
  for insert with check (auth.uid() = user_id);

create policy "Admins can manage all bkash_requests" on public.bkash_requests
  for all using (public.is_admin(auth.uid()));
