-- ==============================================================================
-- VRINDA TOURS & PARTNER HUB — SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/fciwjgxijlarmetgvbmk/sql)
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. PARTNERS TABLE (Drivers, Restaurants, Hotels & Staff)
create table if not exists public.partners (
    id text primary key,
    name text not null,
    phone text not null,
    category text not null check (category in ('driver', 'restaurant', 'hotel', 'staff')),
    role_details text,
    rating numeric(2,1) default 4.9,
    status text default 'available',
    verified boolean default true,
    photo_url text,
    location jsonb default '{"lat": 27.6461, "lng": 77.3777}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — Public Read & Anon Operations for App
-- ==============================================================================

alter table public.partners enable row level security;
alter table public.ride_requests enable row level security;
alter table public.table_reservations enable row level security;
alter table public.room_bookings enable row level security;

-- Policies for public / anonymous app client
create policy "Allow anon select on partners" on public.partners for select using (true);
create policy "Allow anon insert on partners" on public.partners for insert with check (true);
create policy "Allow anon update on partners" on public.partners for update using (true);
create policy "Allow anon delete on partners" on public.partners for delete using (true);

create policy "Allow anon all on ride_requests" on public.ride_requests for all using (true);
create policy "Allow anon all on table_reservations" on public.table_reservations for all using (true);
create policy "Allow anon all on room_bookings" on public.room_bookings for all using (true);

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
