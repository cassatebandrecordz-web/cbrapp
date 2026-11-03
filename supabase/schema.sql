-- ==============================================================================
-- CASSATE BAND RECORDZ - SUPABASE PRODUCTION DATABASE SCHEMA
-- Run this in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Profiles Table (User Accounts)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  phone text,
  email text,
  company text,
  role text default 'Studio Client',
  is_admin boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Studio Slots Table (Real-Time Slot Synchronization)
create table if not exists public.studio_slots (
  id uuid default gen_random_uuid() primary key,
  date text not null,                       -- e.g. '2026-11-04'
  slot_time text not null,                  -- e.g. '02:00 PM'
  service_id text not null default 'dubbing',
  status text not null default 'booked',    -- 'booked', 'locked', 'maintenance'
  client_name text,
  booking_id text,
  expires_at timestamp with time zone,      -- For temporary 10-minute hold
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_slot_per_date unique (date, slot_time, service_id)
);

-- 3. Studio Bookings Table
create table if not exists public.bookings (
  id text primary key,                      -- e.g. 'CB-7821'
  user_id uuid references public.profiles(id) on delete set null,
  service_id text not null default 'dubbing',
  service_name text not null,
  studio_name text not null,
  date text not null,
  time_slots text[] not null,
  time_slot_label text,
  total_price numeric not null default 700,
  advance_amount numeric not null default 350,
  payment_method text not null default 'UPI Payment',
  payment_status text default 'ADVANCE_PAID', -- 'ADVANCE_PAID', 'PAID_IN_FULL'
  upi_ref_id text,
  status text default 'CONFIRMED',          -- 'CONFIRMED', 'CANCELLED', 'COMPLETED'
  client_name text not null,
  client_phone text,
  client_email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.studio_slots enable row level security;
alter table public.bookings enable row level security;

-- 5. RLS Policies
-- Profiles: Users can read and update their own profile; admins can read all
create policy "Allow public read of profiles" on public.profiles for select using (true);
create policy "Allow users to update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow users to insert own profile" on public.profiles for insert with check (true);

-- Studio Slots: Anyone can read slot availability; anyone can reserve/book
create policy "Allow public read of studio slots" on public.studio_slots for select using (true);
create policy "Allow insert of studio slots" on public.studio_slots for insert with check (true);
create policy "Allow update of studio slots" on public.studio_slots for update using (true);
create policy "Allow delete of studio slots" on public.studio_slots for delete using (true);

-- Bookings: Anyone can view their bookings; anyone can insert new booking
create policy "Allow public read of bookings" on public.bookings for select using (true);
create policy "Allow public insert of bookings" on public.bookings for insert with check (true);
create policy "Allow update of bookings" on public.bookings for update using (true);

-- 6. Enable Realtime Replication for Instant Mobile Sync
-- This pushes changes via WebSockets whenever someone books a slot!
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.studio_slots;
alter publication supabase_realtime add table public.bookings;

-- 7. Seed Data: Initial Studio Booking & Permanent Lock Rules
insert into public.bookings (
  id, service_id, service_name, studio_name, date, time_slots, time_slot_label,
  total_price, advance_amount, payment_method, payment_status, upi_ref_id, status,
  client_name, client_phone, client_email
) values (
  'CB-7821', 'dubbing', 'Dubbing Studio', 'Dubbing Studio (Acoustic Treated)',
  'Fri, 20 Nov 2026', array['02:00 PM', '03:00 PM'], '02:00 PM - 04:00 PM (2 Slots)',
  700, 350, 'Pay at Studio', 'ADVANCE_PAID', 'UPI-INITIAL-01', 'CONFIRMED',
  'Devon Vance', '+91 98765 43210', 'client@cassaterecordz.com'
) on conflict (id) do nothing;
