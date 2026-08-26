-- ==============================================================================
-- VRINDA VIHAR & PARTNER HUB — SUPABASE DATABASE SCHEMA (100% IDEMPOTENT)
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fciwjgxijlarmetgvbmk/sql
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. PARTNERS TABLE (Drivers, Restaurants, Hotels, Agencies & Staff)
create table if not exists public.partners (
    id text primary key,
    name text not null,
    phone text not null,
    email text,
    category text not null check (category in ('driver', 'restaurant', 'hotel', 'agency', 'staff')),
    role_details text,
    rating numeric(2,1) default 4.9,
    status text default 'Pending Admin Verification',
    verified boolean default false,
    category_locked boolean default false,
    photo_url text,
    location jsonb default '{"lat": 27.6461, "lng": 77.3777}'::jsonb,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure additional columns exist on existing table instances
alter table public.partners add column if not exists email text;
alter table public.partners add column if not exists category_locked boolean default false;
alter table public.partners add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.partners add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());
alter table public.partners alter column verified set default false;

-- Ensure category constraint is updated to include 'agency'
alter table public.partners drop constraint if exists partners_category_check;
alter table public.partners add constraint partners_category_check check (category in ('driver', 'restaurant', 'hotel', 'agency', 'staff'));

-- Function & Trigger: Once verified = true by Admin, category CANNOT be changed
create or replace function public.enforce_partner_category_lock()
returns trigger as $$
begin
  if old.verified = true and new.category <> old.category then
    raise exception 'Category is locked once verified by Admin.';
  end if;
  if new.verified = true then
    new.category_locked := true;
  end if;
  new.updated_at := timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_partner_category_lock on public.partners;
create trigger tr_partner_category_lock
before update on public.partners
for each row execute function public.enforce_partner_category_lock();

-- 3. RIDE REQUESTS TABLE (Driver Dispatches)
create table if not exists public.ride_requests (
    id text primary key,
    passenger_name text not null,
    passenger_phone text not null,
    pickup_location text not null,
    drop_location text not null,
    distance text,
    fare text,
    status text default 'pending' check (status in ('pending', 'accepted', 'completed', 'cancelled')),
    driver_id text references public.partners(id) on delete set null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TABLE RESERVATIONS TABLE (Restaurant / Dining)
create table if not exists public.table_reservations (
    id text primary key,
    restaurant_id text references public.partners(id) on delete cascade,
    guest_name text not null,
    guest_phone text not null,
    time_slot text not null,
    guests_count text not null,
    special_notes text,
    status text default 'pending' check (status in ('pending', 'confirmed', 'seated', 'cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ROOM BOOKINGS TABLE (Hotels & Ashrams)
create table if not exists public.room_bookings (
    id text primary key,
    hotel_id text references public.partners(id) on delete cascade,
    guest_name text not null,
    guest_phone text not null,
    dates text not null,
    room_type text not null,
    guests_count text not null,
    special_notes text,
    status text default 'pending' check (status in ('pending', 'confirmed', 'checked_in', 'checked_out')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. DRIVER STEPPED REGISTRATIONS TABLE (Real-time Step Syncing)
create table if not exists public.driver_registrations (
    id text primary key,
    step integer default 1,
    name text,
    phone text,
    experience text,
    vehicle_type text,
    vehicle_no text,
    zone text,
    status text default 'in_progress',
    completed boolean default false,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. HOTEL / STAY STEPPED REGISTRATIONS TABLE
create table if not exists public.hotel_registrations (
    id text primary key,
    step integer default 1,
    property_name text,
    owner_name text,
    phone text,
    email text,
    property_type text,
    room_count text,
    price_range text,
    amenities jsonb default '[]'::jsonb,
    zone text,
    status text default 'in_progress',
    completed boolean default false,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. RESTAURANT / DINING STEPPED REGISTRATIONS TABLE
create table if not exists public.restaurant_registrations (
    id text primary key,
    step integer default 1,
    outlet_name text,
    owner_name text,
    phone text,
    email text,
    cuisine_type text,
    seating_capacity text,
    specialities jsonb default '[]'::jsonb,
    zone text,
    status text default 'in_progress',
    completed boolean default false,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. TRAVEL AGENCY / YATRA OPERATOR STEPPED REGISTRATIONS TABLE
create table if not exists public.agency_registrations (
    id text primary key,
    step integer default 1,
    agency_name text,
    contact_person text,
    phone text,
    email text,
    agency_type text,
    fleet_size text,
    tour_packages jsonb default '[]'::jsonb,
    zone text,
    status text default 'in_progress',
    completed boolean default false,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — Safely Re-creatable (Drop then Create)
-- ==============================================================================

alter table public.partners enable row level security;
alter table public.ride_requests enable row level security;
alter table public.table_reservations enable row level security;
alter table public.room_bookings enable row level security;
alter table public.driver_registrations enable row level security;
alter table public.hotel_registrations enable row level security;
alter table public.restaurant_registrations enable row level security;
alter table public.agency_registrations enable row level security;

-- Drop existing policies first to prevent 42710 "policy already exists" errors
drop policy if exists "Allow anon select on partners" on public.partners;
drop policy if exists "Allow anon insert on partners" on public.partners;
drop policy if exists "Allow anon update on partners" on public.partners;
drop policy if exists "Allow anon delete on partners" on public.partners;
drop policy if exists "Allow anon all on partners" on public.partners;

drop policy if exists "Allow anon all on ride_requests" on public.ride_requests;
drop policy if exists "Allow anon all on table_reservations" on public.table_reservations;
drop policy if exists "Allow anon all on room_bookings" on public.room_bookings;
drop policy if exists "Allow anon all on driver_registrations" on public.driver_registrations;
drop policy if exists "Allow anon all on hotel_registrations" on public.hotel_registrations;
drop policy if exists "Allow anon all on restaurant_registrations" on public.restaurant_registrations;
drop policy if exists "Allow anon all on agency_registrations" on public.agency_registrations;

-- Re-create clean policies for public / anonymous app client
create policy "Allow anon select on partners" on public.partners for select using (true);
create policy "Allow anon insert on partners" on public.partners for insert with check (true);
create policy "Allow anon update on partners" on public.partners for update using (true) with check (true);
create policy "Allow anon delete on partners" on public.partners for delete using (true);

create policy "Allow anon all on ride_requests" on public.ride_requests for all using (true) with check (true);
create policy "Allow anon all on table_reservations" on public.table_reservations for all using (true) with check (true);
create policy "Allow anon all on room_bookings" on public.room_bookings for all using (true) with check (true);
create policy "Allow anon all on driver_registrations" on public.driver_registrations for all using (true) with check (true);
create policy "Allow anon all on hotel_registrations" on public.hotel_registrations for all using (true) with check (true);
create policy "Allow anon all on restaurant_registrations" on public.restaurant_registrations for all using (true) with check (true);
create policy "Allow anon all on agency_registrations" on public.agency_registrations for all using (true) with check (true);

-- Grant schema permissions to anonymous and authenticated users
grant all on public.partners to anon, authenticated;
grant all on public.ride_requests to anon, authenticated;
grant all on public.table_reservations to anon, authenticated;
grant all on public.room_bookings to anon, authenticated;
grant all on public.driver_registrations to anon, authenticated;
grant all on public.hotel_registrations to anon, authenticated;
grant all on public.restaurant_registrations to anon, authenticated;
grant all on public.agency_registrations to anon, authenticated;

-- ==============================================================================
-- SEED DATA (Initial Verified Brij Partners)
-- ==============================================================================

insert into public.partners (id, name, phone, category, role_details, rating, status, verified, photo_url)
values 
('d_1', 'Shri Daasi', '+919876543201', 'driver', '🛺 E-Rickshaw • UP-85 VT 2026', 4.9, 'Available', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=ShriDaasi&backgroundColor=f1f5f9'),
('d_2', 'Radhe', '+919876543202', 'driver', '🛺 E-Rickshaw • UP-85', 4.9, 'Available', true, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Radhe&backgroundColor=f1f5f9'),
('r_1', 'Brijwasin Dining', '+919876543230', 'restaurant', '🍽️ Sattvic Bhojanalaya', 4.8, 'Open', true, 'https://images.unsplash.com/photo-1517248135467-4c7ed9d8c47c?w=400'),
('r_2', 'Govinda''s Kitchen', '+919876543220', 'restaurant', '🍽️ Pure Sattvic Thali', 4.7, 'Open', true, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400'),
('h_1', 'Radha Krishna Dham', '+919876543210', 'hotel', '🏨 Temple Guesthouse', 4.9, '4 Rooms', true, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'),
('h_2', 'Vrinda Heritage Stay', '+919876543213', 'hotel', '🏨 Heritage Haveli', 4.8, '2 Suites', true, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400')
on conflict (id) do nothing;

-- ==============================================================================
-- 10. REALTIME REPLICATION CONFIGURATION
-- ==============================================================================
alter table public.partners replica identity full;
alter table public.ride_requests replica identity full;
alter table public.table_reservations replica identity full;
alter table public.room_bookings replica identity full;
alter table public.driver_registrations replica identity full;
alter table public.hotel_registrations replica identity full;
alter table public.restaurant_registrations replica identity full;
alter table public.agency_registrations replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'partners') then
    alter publication supabase_realtime add table public.partners;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'ride_requests') then
    alter publication supabase_realtime add table public.ride_requests;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'table_reservations') then
    alter publication supabase_realtime add table public.table_reservations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'room_bookings') then
    alter publication supabase_realtime add table public.room_bookings;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'driver_registrations') then
    alter publication supabase_realtime add table public.driver_registrations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'hotel_registrations') then
    alter publication supabase_realtime add table public.hotel_registrations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'restaurant_registrations') then
    alter publication supabase_realtime add table public.restaurant_registrations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'agency_registrations') then
    alter publication supabase_realtime add table public.agency_registrations;
  end if;
exception when others then
  null;
end $$;

