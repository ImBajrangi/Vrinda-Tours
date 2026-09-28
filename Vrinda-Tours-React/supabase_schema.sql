-- ==============================================================================
-- VRINDA TOURS — PRODUCTION ENTERPRISE SUPABASE DATABASE SCHEMA (100% IDEMPOTENT & MIGRATION-SAFE)
-- Project: fciwjgxijlarmetgvbmk
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fciwjgxijlarmetgvbmk/sql
-- ==============================================================================

-- 1. Enable Required Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ==============================================================================
-- 2. PLACES & SACRED SITES TABLE (With Full-Text GIN Index & Geospatial Support)
-- ==============================================================================
create table if not exists public.places (
    id text primary key,
    name text not null,
    hindi_name text,
    town text default 'Vrindavan',
    category text default 'PLACE',
    latitude double precision not null default 27.5818,
    longitude double precision not null default 77.7010,
    description text,
    image_url text,
    rating numeric(2,1) default 4.8,
    price_range text,
    phone text,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration safety for pre-existing places table:
alter table public.places add column if not exists hindi_name text;
alter table public.places add column if not exists town text default 'Vrindavan';
alter table public.places add column if not exists category text default 'PLACE';
alter table public.places add column if not exists image_url text;
alter table public.places add column if not exists rating numeric(2,1) default 4.8;
alter table public.places add column if not exists price_range text;
alter table public.places add column if not exists phone text;
alter table public.places add column if not exists metadata jsonb default '{}'::jsonb;

-- Add search_vector column if missing
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_schema = 'public' and table_name = 'places' and column_name = 'search_vector'
  ) then
    alter table public.places add column search_vector tsvector generated always as (
      to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(hindi_name, '') || ' ' || coalesce(town, '') || ' ' || coalesce(category, '') || ' ' || coalesce(description, ''))
    ) stored;
  end if;
end $$;

create index if not exists idx_places_town on public.places(town);
create index if not exists idx_places_category on public.places(category);
create index if not exists idx_places_coords on public.places(latitude, longitude);
create index if not exists idx_places_search_gin on public.places using gin(search_vector);
create index if not exists idx_places_name_trgm on public.places using gin(name gin_trgm_ops);

-- ==============================================================================
-- 3. ROUTES & PARIKRAMA CORRIDORS TABLE (Explicit Route Model)
-- ==============================================================================
create table if not exists public.routes (
    id text primary key,
    name text not null,
    hindi_name text,
    origin_name text not null,
    origin_lat double precision not null,
    origin_lng double precision not null,
    dest_name text not null,
    dest_lat double precision not null,
    dest_lng double precision not null,
    distance_km numeric(5,2) not null,
    typical_duration_mins integer not null,
    category text not null default 'CORRIDOR',
    waypoints jsonb default '[]'::jsonb,
    description text,
    is_active boolean default true,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration safety for routes table:
alter table public.routes add column if not exists hindi_name text;
alter table public.routes add column if not exists category text default 'CORRIDOR';
alter table public.routes add column if not exists waypoints jsonb default '[]'::jsonb;
alter table public.routes add column if not exists is_active boolean default true;
alter table public.routes add column if not exists metadata jsonb default '{}'::jsonb;

create index if not exists idx_routes_category on public.routes(category);
create index if not exists idx_routes_active on public.routes(is_active);

-- ==============================================================================
-- 4. DRIVERS TABLE (Operational Business State & Identity)
-- ==============================================================================
create table if not exists public.drivers (
    id text primary key,
    name text not null,
    phone text not null,
    photo_url text,
    vehicle_type text default 'Pilgrim E-Rickshaw',
    vehicle_category text default 'erickshaw',
    vehicle_no text default 'UP-85',
    rating numeric(3,2) default 4.95,
    rides_completed integer default 0,
    verification_status text default 'VERIFIED',
    is_verified boolean default true,
    availability text default 'OFFLINE',
    current_ride_id text default null,
    last_active_at timestamp with time zone default timezone('utc'::text, now()),
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration safety for pre-existing drivers table:
alter table public.drivers add column if not exists photo_url text;
alter table public.drivers add column if not exists vehicle_type text default 'Pilgrim E-Rickshaw';
alter table public.drivers add column if not exists vehicle_category text default 'erickshaw';
alter table public.drivers add column if not exists vehicle_no text default 'UP-85';
alter table public.drivers add column if not exists rating numeric(3,2) default 4.95;
alter table public.drivers add column if not exists rides_completed integer default 0;
alter table public.drivers add column if not exists verification_status text default 'VERIFIED';
alter table public.drivers add column if not exists is_verified boolean default true;
alter table public.drivers add column if not exists availability text default 'OFFLINE';
alter table public.drivers add column if not exists current_ride_id text default null;
alter table public.drivers add column if not exists last_active_at timestamp with time zone default timezone('utc'::text, now());
alter table public.drivers add column if not exists metadata jsonb default '{}'::jsonb;

create index if not exists idx_drivers_availability on public.drivers(availability);
create index if not exists idx_drivers_verification on public.drivers(verification_status, is_verified);

-- ==============================================================================
-- 5. DRIVER LOCATIONS STREAM TABLE (High-Frequency Telemetry & GPS Stream)
-- ==============================================================================
create table if not exists public.driver_locations (
    driver_id text primary key references public.drivers(id) on delete cascade,
    latitude double precision not null,
    longitude double precision not null,
    heading double precision default 0,
    speed double precision default 0,
    accuracy double precision default 10.0,
    battery_level integer default 100,
    is_mocked boolean default false,
    recorded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration safety for driver_locations table:
alter table public.driver_locations add column if not exists heading double precision default 0;
alter table public.driver_locations add column if not exists speed double precision default 0;
alter table public.driver_locations add column if not exists accuracy double precision default 10.0;
alter table public.driver_locations add column if not exists battery_level integer default 100;
alter table public.driver_locations add column if not exists is_mocked boolean default false;
alter table public.driver_locations add column if not exists recorded_at timestamp with time zone default timezone('utc'::text, now());

create index if not exists idx_driver_locations_coords on public.driver_locations(latitude, longitude);
create index if not exists idx_driver_locations_time on public.driver_locations(recorded_at desc);

-- ==============================================================================
-- 6. DISCOVERABLE NEARBY DRIVERS VIEW (Sanitized & Freshness Filtered)
-- ==============================================================================
create or replace view public.nearby_drivers_public as
select 
    d.id,
    d.name,
    d.vehicle_type,
    d.vehicle_category,
    d.vehicle_no,
    d.rating,
    d.rides_completed,
    d.photo_url,
    d.availability,
    dl.latitude,
    dl.longitude,
    dl.heading,
    dl.accuracy,
    dl.recorded_at as last_location_update,
    (extract(epoch from (now() - dl.recorded_at)) < 60) as is_location_fresh
from public.drivers d
join public.driver_locations dl on d.id = dl.driver_id
where d.availability = 'ONLINE'
  and coalesce(d.is_verified, true) = true
  and d.current_ride_id is null
  and dl.accuracy <= 65.0
  and extract(epoch from (now() - dl.recorded_at)) < 90;

-- ==============================================================================
-- 7. BOOKING REQUESTS TABLE (DISCOVER -> SELECT -> REQUEST -> CONFIRM)
-- ==============================================================================
create table if not exists public.booking_requests (
    id text primary key,
    customer_name text not null,
    customer_phone text not null,
    customer_whatsapp text,
    service_type text default 'HOTEL',
    venue_name text default '',
    location_name text,
    latitude double precision,
    longitude double precision,
    check_in_date text not null,
    check_out_date text,
    time_slot text,
    guests_count integer default 2,
    rooms_count integer default 1,
    room_type text default 'Standard Room',
    notes text,
    internal_notes text,
    assigned_operator text,
    estimated_amount numeric(10,2),
    status text default 'REQUESTED',
    status_label text default 'Request Received • Team Reaching Out Soon',
    audit_log jsonb default '[]'::jsonb,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration safety for pre-existing booking_requests table:
alter table public.booking_requests add column if not exists customer_whatsapp text;
alter table public.booking_requests add column if not exists service_type text default 'HOTEL';
alter table public.booking_requests add column if not exists venue_name text default '';
alter table public.booking_requests add column if not exists location_name text;
alter table public.booking_requests add column if not exists latitude double precision;
alter table public.booking_requests add column if not exists longitude double precision;
alter table public.booking_requests add column if not exists check_in_date text;
alter table public.booking_requests add column if not exists check_out_date text;
alter table public.booking_requests add column if not exists time_slot text;
alter table public.booking_requests add column if not exists guests_count integer default 2;
alter table public.booking_requests add column if not exists rooms_count integer default 1;
alter table public.booking_requests add column if not exists room_type text default 'Standard Room';
alter table public.booking_requests add column if not exists notes text;
alter table public.booking_requests add column if not exists internal_notes text;
alter table public.booking_requests add column if not exists assigned_operator text;
alter table public.booking_requests add column if not exists estimated_amount numeric(10,2);
alter table public.booking_requests add column if not exists status text default 'REQUESTED';
alter table public.booking_requests add column if not exists status_label text default 'Request Received • Team Reaching Out Soon';
alter table public.booking_requests add column if not exists audit_log jsonb default '[]'::jsonb;
alter table public.booking_requests add column if not exists metadata jsonb default '{}'::jsonb;

create index if not exists idx_booking_requests_status on public.booking_requests(status);
create index if not exists idx_booking_requests_created on public.booking_requests(created_at desc);
create index if not exists idx_booking_requests_phone on public.booking_requests(customer_phone);

-- ==============================================================================
-- 8. RIDE REQUESTS TABLE (Mobility Orders & Safety PIN Lifecycle)
-- ==============================================================================
create table if not exists public.ride_requests (
    id text primary key,
    passenger_name text not null,
    passenger_phone text default '',
    pickup_location text not null,
    pickup_lat double precision not null default 27.5818,
    pickup_lng double precision not null default 77.7010,
    drop_location text not null,
    drop_lat double precision not null default 27.5804,
    drop_lng double precision not null default 77.7011,
    distance_km numeric(5,2) default 1.2,
    fare numeric(10,2) default 50,
    tier text default 'erickshaw',
    payment_method text default 'cash_upi',
    driver_id text references public.drivers(id) on delete set null,
    safety_pin text default '1234',
    pin_status text default 'PIN_GENERATED',
    status text default 'REQUESTED',
    landmark_note text,
    audit_log jsonb default '[]'::jsonb,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration safety for pre-existing ride_requests table:
alter table public.ride_requests add column if not exists passenger_phone text default '';
alter table public.ride_requests add column if not exists pickup_lat double precision default 27.5818;
alter table public.ride_requests add column if not exists pickup_lng double precision default 77.7010;
alter table public.ride_requests add column if not exists drop_lat double precision default 27.5804;
alter table public.ride_requests add column if not exists drop_lng double precision default 77.7011;
alter table public.ride_requests add column if not exists distance_km numeric(5,2) default 1.2;
alter table public.ride_requests add column if not exists fare numeric(10,2) default 50;
alter table public.ride_requests add column if not exists tier text default 'erickshaw';
alter table public.ride_requests add column if not exists payment_method text default 'cash_upi';
alter table public.ride_requests add column if not exists driver_id text;
alter table public.ride_requests add column if not exists safety_pin text default '1234';
alter table public.ride_requests add column if not exists pin_status text default 'PIN_GENERATED';
alter table public.ride_requests add column if not exists landmark_note text;
alter table public.ride_requests add column if not exists audit_log jsonb default '[]'::jsonb;
alter table public.ride_requests add column if not exists metadata jsonb default '{}'::jsonb;

create index if not exists idx_ride_requests_status on public.ride_requests(status);
create index if not exists idx_ride_requests_driver on public.ride_requests(driver_id);

-- ==============================================================================
-- 9. PARTNERS TABLE (For Host & Operator Workspaces)
-- ==============================================================================
create table if not exists public.partners (
    id text primary key,
    name text not null,
    phone text not null,
    email text,
    category text default 'driver',
    role_details text,
    rating numeric(2,1) default 4.9,
    status text default 'Active',
    verified boolean default true,
    photo_url text,
    location jsonb default '{"lat": 27.5818, "lng": 77.7010}'::jsonb,
    metadata jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migration safety for pre-existing partners table:
alter table public.partners add column if not exists email text;
alter table public.partners add column if not exists category text default 'driver';
alter table public.partners add column if not exists role_details text;
alter table public.partners add column if not exists rating numeric(2,1) default 4.9;
alter table public.partners add column if not exists status text default 'Active';
alter table public.partners add column if not exists verified boolean default true;
alter table public.partners add column if not exists photo_url text;
alter table public.partners add column if not exists location jsonb default '{"lat": 27.5818, "lng": 77.7010}'::jsonb;
alter table public.partners add column if not exists metadata jsonb default '{}'::jsonb;

-- ==============================================================================
-- 10. ATOMIC CONCURRENCY RPC: CLAIM DRIVER FOR RIDE (Zero Race Conditions)
-- ==============================================================================
create or replace function public.claim_driver_for_ride(
    p_ride_id text,
    p_driver_id text,
    p_passenger_name text,
    p_passenger_phone text,
    p_pickup_loc text,
    p_pickup_lat double precision,
    p_pickup_lng double precision,
    p_drop_loc text,
    p_drop_lat double precision,
    p_drop_lng double precision,
    p_distance_km numeric,
    p_fare numeric,
    p_tier text,
    p_safety_pin text
) returns jsonb as $$
declare
    v_driver public.drivers%rowtype;
    v_now timestamp with time zone := timezone('utc'::text, now());
begin
    -- 1. Lock driver row exclusively to prevent race condition
    select * into v_driver 
    from public.drivers 
    where id = p_driver_id 
    for update;

    -- 2. Verify availability
    if not found then
        return jsonb_build_object('success', false, 'error', 'DRIVER_NOT_FOUND');
    end if;

    if coalesce(v_driver.availability, 'OFFLINE') <> 'ONLINE' or v_driver.current_ride_id is not null then
        return jsonb_build_object('success', false, 'error', 'DRIVER_ALREADY_BUSY');
    end if;

    -- 3. Create or update the ride request
    insert into public.ride_requests (
        id,
        passenger_name,
        passenger_phone,
        pickup_location,
        pickup_lat,
        pickup_lng,
        drop_location,
        drop_lat,
        drop_lng,
        distance_km,
        fare,
        tier,
        driver_id,
        safety_pin,
        status,
        audit_log,
        created_at,
        updated_at
    ) values (
        p_ride_id,
        p_passenger_name,
        p_passenger_phone,
        p_pickup_loc,
        p_pickup_lat,
        p_pickup_lng,
        p_drop_loc,
        p_drop_lat,
        p_drop_lng,
        p_distance_km,
        p_fare,
        p_tier,
        p_driver_id,
        p_safety_pin,
        'ACCEPTED',
        jsonb_build_array(jsonb_build_object('action', 'CLAIMED_AND_ASSIGNED', 'time', v_now, 'driver_id', p_driver_id)),
        v_now,
        v_now
    )
    on conflict (id) do update set
        driver_id = p_driver_id,
        status = 'ACCEPTED',
        updated_at = v_now;

    -- 4. Mark driver as BUSY
    update public.drivers
    set availability = 'BUSY',
        current_ride_id = p_ride_id,
        updated_at = v_now
    where id = p_driver_id;

    return jsonb_build_object(
        'success', true, 
        'ride_id', p_ride_id, 
        'driver_id', p_driver_id,
        'driver_name', v_driver.name,
        'driver_phone', v_driver.phone,
        'vehicle_no', coalesce(v_driver.vehicle_no, 'UP-85'),
        'vehicle_type', coalesce(v_driver.vehicle_type, 'E-Rickshaw')
    );
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 11. RPC: DRIVER VERIFIES SAFETY PIN ON RIDER PICKUP
-- ==============================================================================
create or replace function public.verify_ride_safety_pin(
    p_ride_id text,
    p_driver_id text,
    p_entered_pin text
) returns jsonb as $$
declare
    v_ride public.ride_requests%rowtype;
    v_now timestamp with time zone := timezone('utc'::text, now());
begin
    select * into v_ride from public.ride_requests where id = p_ride_id and driver_id = p_driver_id for update;

    if not found then
        return jsonb_build_object('success', false, 'error', 'RIDE_NOT_FOUND');
    end if;

    if v_ride.safety_pin <> p_entered_pin then
        return jsonb_build_object('success', false, 'error', 'INVALID_SAFETY_PIN');
    end if;

    update public.ride_requests
    set status = 'IN_PROGRESS',
        pin_status = 'PIN_VERIFIED',
        updated_at = v_now,
        audit_log = coalesce(audit_log, '[]'::jsonb) || jsonb_build_object('action', 'PIN_VERIFIED_TRIP_STARTED', 'time', v_now)
    where id = p_ride_id;

    return jsonb_build_object('success', true, 'status', 'IN_PROGRESS');
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.places enable row level security;
alter table public.routes enable row level security;
alter table public.drivers enable row level security;
alter table public.driver_locations enable row level security;
alter table public.booking_requests enable row level security;
alter table public.ride_requests enable row level security;
alter table public.partners enable row level security;

-- Public Read Permissions
drop policy if exists "Allow public read places" on public.places;
create policy "Allow public read places" on public.places for select using (true);

drop policy if exists "Allow public read routes" on public.routes;
create policy "Allow public read routes" on public.routes for select using (is_active = true);

drop policy if exists "Allow public read discoverable driver locations" on public.driver_locations;
create policy "Allow public read discoverable driver locations" on public.driver_locations for select using (true);

drop policy if exists "Allow public read discoverable drivers" on public.drivers;
create policy "Allow public read discoverable drivers" on public.drivers for select using (true);

-- Booking Requests Policies (Insert for anyone, Select/Update with token or admin)
drop policy if exists "Allow customer create booking" on public.booking_requests;
create policy "Allow customer create booking" on public.booking_requests for insert with check (true);

drop policy if exists "Allow all on booking_requests" on public.booking_requests;
create policy "Allow all on booking_requests" on public.booking_requests for all using (true) with check (true);

drop policy if exists "Allow all on ride_requests" on public.ride_requests;
create policy "Allow all on ride_requests" on public.ride_requests for all using (true) with check (true);

drop policy if exists "Allow all on driver_locations" on public.driver_locations;
create policy "Allow all on driver_locations" on public.driver_locations for all using (true) with check (true);

drop policy if exists "Allow all on partners" on public.partners;
create policy "Allow all on partners" on public.partners for all using (true) with check (true);

grant select on public.places to anon, authenticated;
grant select on public.routes to anon, authenticated;
grant select on public.nearby_drivers_public to anon, authenticated;
grant all on public.drivers to anon, authenticated;
grant all on public.driver_locations to anon, authenticated;
grant all on public.booking_requests to anon, authenticated;
grant all on public.ride_requests to anon, authenticated;
grant all on public.partners to anon, authenticated;

-- ==============================================================================
-- 13. REALTIME REPLICATION CONFIGURATION
-- ==============================================================================
alter table public.places replica identity full;
alter table public.routes replica identity full;
alter table public.drivers replica identity full;
alter table public.driver_locations replica identity full;
alter table public.booking_requests replica identity full;
alter table public.ride_requests replica identity full;
alter table public.partners replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'places') then
    alter publication supabase_realtime add table public.places;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'routes') then
    alter publication supabase_realtime add table public.routes;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'drivers') then
    alter publication supabase_realtime add table public.drivers;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'driver_locations') then
    alter publication supabase_realtime add table public.driver_locations;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'booking_requests') then
    alter publication supabase_realtime add table public.booking_requests;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'ride_requests') then
    alter publication supabase_realtime add table public.ride_requests;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'partners') then
    alter publication supabase_realtime add table public.partners;
  end if;
exception when others then
  null;
end $$;
