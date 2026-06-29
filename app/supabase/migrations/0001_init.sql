-- AutoCheck — Phase 1 schema
-- The shared booking database that both the PWA and the WhatsApp bot read/write.
--
-- Design notes
-- ------------
-- * Multi-tenant: every garage belongs to a `tenant` (the white-label customer).
--   A driver is tenant-agnostic; owners/staff are scoped to one tenant.
-- * Roles live on `profiles.role`; tenant scoping lives on `profiles.tenant_id`.
-- * The content here mirrors the demo's hardcoded arrays in app/lib/data.ts so the
--   seed (seed.sql) reproduces the same screens, now backed by Postgres.
-- * Row-level security is defined separately in 0002_rls.sql.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('driver', 'owner', 'staff', 'admin');
create type tenant_plan as enum ('standard', 'branded', 'pro');
create type garage_mode as enum ('circle', 'verified');
create type booking_status as enum ('new', 'confirmed', 'in_bay', 'ready', 'collected', 'cancelled');
create type fulfilment as enum ('wait', 'drop');

-- ---------------------------------------------------------------------------
-- Tenants (white-label customers — the "garage business" on a plan)
-- ---------------------------------------------------------------------------
create table tenants (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,             -- url key, e.g. 'juma-auto'
  name        text not null,
  short_name  text not null,
  mark        text not null,                    -- single-letter avatar mark
  accent      text not null,                    -- brand colours (hex)
  accent_dark text not null,
  accent_soft text not null,
  domain      text not null,
  plan        tenant_plan not null default 'standard',
  price       text,                             -- display price, e.g. 'KSh 2,500/mo'
  features    text[] not null default '{}',
  is_verified boolean not null default false,   -- platform-admin trust flag
  created_at  timestamptz not null default now()
);

-- Extra url slugs that resolve to a tenant (e.g. 'juma' and 'juma-auto').
create table tenant_slugs (
  slug      text primary key,
  tenant_id uuid not null references tenants (id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Profiles (one row per auth user; created by a trigger on signup)
-- ---------------------------------------------------------------------------
create table profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  role       user_role not null default 'driver',
  tenant_id  uuid references tenants (id) on delete set null,  -- null for drivers/admins
  full_name  text,
  phone      text,
  email      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- owners and staff must be attached to a tenant; drivers/admins must not be.
  constraint tenant_scope_matches_role check (
    (role in ('owner', 'staff') and tenant_id is not null)
    or (role in ('driver', 'admin') and tenant_id is null)
  )
);

-- ---------------------------------------------------------------------------
-- Garages (physical workshops belonging to a tenant)
-- ---------------------------------------------------------------------------
create table garages (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null references tenants (id) on delete cascade,
  name         text not null,
  area         text not null,
  bays_total   int not null default 4 check (bays_total between 1 and 12),
  mode         garage_mode not null default 'circle',
  is_verified  boolean not null default false,
  rating       numeric(2,1),
  is_accepting boolean not null default true,    -- "Open for bookings" toggle
  quote        text,                             -- social-proof testimonial
  quote_by     text,
  created_at   timestamptz not null default now()
);

-- Staff/owner ↔ garage assignment (an owner may run several garages; a fundi one).
create table garage_members (
  garage_id  uuid not null references garages (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  primary key (garage_id, profile_id)
);

-- ---------------------------------------------------------------------------
-- Issue catalog + service durations (per tenant, seeded from defaults)
-- ---------------------------------------------------------------------------
create table issues (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  label     text not null,
  est_mins  int not null default 60,
  sort      int not null default 0,
  unique (tenant_id, label)
);

create table services (
  id        uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references tenants (id) on delete cascade,
  key       text not null,
  label     text not null,
  est_mins  int not null default 60,
  sort      int not null default 0,
  unique (tenant_id, key)
);

-- ---------------------------------------------------------------------------
-- Working hours / availability (per garage, per weekday)
-- ---------------------------------------------------------------------------
create table working_hours (
  id         uuid primary key default gen_random_uuid(),
  garage_id  uuid not null references garages (id) on delete cascade,
  weekday    int not null check (weekday between 0 and 6),  -- 0 = Sunday
  opens_at   time not null default '08:00',
  closes_at  time not null default '18:00',
  is_open    boolean not null default true,
  unique (garage_id, weekday)
);

-- ---------------------------------------------------------------------------
-- Bookings (the heart of the app — written by driver app + WhatsApp bot)
-- ---------------------------------------------------------------------------
create table bookings (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants (id) on delete cascade,
  garage_id     uuid not null references garages (id) on delete cascade,
  driver_id     uuid references profiles (id) on delete set null,  -- null for WhatsApp-only
  customer_name text not null,
  customer_phone text,
  vehicle       text,                            -- 'Toyota Premio · KCA 123A'
  note          text,                            -- driver's free-text description
  ai_summary    text,                            -- technician-facing summary
  slot_at       timestamptz,                     -- chosen appointment time
  slot_label    text,                            -- human label, e.g. 'Today · 2:00 PM'
  fulfilment    fulfilment,                      -- wait vs drop-off
  status        booking_status not null default 'new',
  has_photo     boolean not null default false,
  deposit_paid  boolean not null default false,
  channel       text not null default 'app' check (channel in ('app', 'whatsapp')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index bookings_tenant_idx on bookings (tenant_id);
create index bookings_garage_idx on bookings (garage_id);
create index bookings_driver_idx on bookings (driver_id);
create index bookings_status_idx on bookings (status);

-- Many-to-many: a booking can describe several issues.
create table booking_issues (
  booking_id uuid not null references bookings (id) on delete cascade,
  label      text not null,
  primary key (booking_id, label)
);

-- ---------------------------------------------------------------------------
-- updated_at touch trigger
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on profiles
  for each row execute function set_updated_at();
create trigger bookings_touch before update on bookings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-provision a profile when a new auth user signs up.
-- Role/tenant default to driver; an admin promotes owners/staff afterwards.
-- ---------------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone, email, full_name)
  values (
    new.id,
    new.phone,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
