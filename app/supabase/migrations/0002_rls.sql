-- AutoCheck — Phase 1 row-level security
--
-- Role/tenant rules enforced in the database so the PWA, the WhatsApp webhook,
-- and any future client all share one trust boundary:
--
--   driver  → sees the public garage catalog + only their own bookings
--   staff   → sees/handles bookings for the garages they're assigned to
--   owner   → full read/write across their tenant's garages and bookings
--   admin   → platform-wide read; can verify garages and manage tenants
--
-- Helper functions are SECURITY DEFINER so they can read `profiles` without
-- tripping the table's own RLS (which would recurse).

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function auth_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_tenant_id()
returns uuid
language sql stable security definer set search_path = public
as $$
  select tenant_id from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(auth_role() = 'admin', false);
$$;

-- garages the current user (staff/owner) is allowed to act on
create or replace function member_garage_ids()
returns setof uuid
language sql stable security definer set search_path = public
as $$
  select garage_id from garage_members where profile_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table tenants        enable row level security;
alter table tenant_slugs   enable row level security;
alter table profiles       enable row level security;
alter table garages        enable row level security;
alter table garage_members enable row level security;
alter table issues         enable row level security;
alter table services       enable row level security;
alter table working_hours  enable row level security;
alter table bookings       enable row level security;
alter table booking_issues enable row level security;

-- ---------------------------------------------------------------------------
-- Tenants — public read (branding is shown on the open booking page);
-- only admins write.
-- ---------------------------------------------------------------------------
create policy tenants_read on tenants for select using (true);
create policy tenants_admin_write on tenants for all
  using (is_admin()) with check (is_admin());

create policy tenant_slugs_read on tenant_slugs for select using (true);
create policy tenant_slugs_admin_write on tenant_slugs for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Profiles — you see/edit your own; tenant owners see their staff; admins all.
-- Role and tenant_id are intentionally NOT self-editable (see column policy note
-- in docs); the app updates only full_name/phone via a narrowed server action.
-- ---------------------------------------------------------------------------
create policy profiles_self_read on profiles for select
  using (id = auth.uid());
create policy profiles_owner_read on profiles for select
  using (auth_role() = 'owner' and tenant_id = auth_tenant_id());
create policy profiles_admin_read on profiles for select
  using (is_admin());
create policy profiles_self_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_write on profiles for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Garages — public read (the catalog drivers browse); owners write within
-- their tenant; admins write anywhere (verification).
-- ---------------------------------------------------------------------------
create policy garages_read on garages for select using (true);
create policy garages_owner_write on garages for all
  using (auth_role() = 'owner' and tenant_id = auth_tenant_id())
  with check (auth_role() = 'owner' and tenant_id = auth_tenant_id());
create policy garages_admin_write on garages for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Garage members — owners manage their tenant's assignments; members read
-- their own; admins all.
-- ---------------------------------------------------------------------------
create policy garage_members_self_read on garage_members for select
  using (profile_id = auth.uid());
create policy garage_members_owner_all on garage_members for all
  using (
    auth_role() = 'owner'
    and garage_id in (select id from garages where tenant_id = auth_tenant_id())
  )
  with check (
    auth_role() = 'owner'
    and garage_id in (select id from garages where tenant_id = auth_tenant_id())
  );
create policy garage_members_admin_all on garage_members for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Issues + services — public read (shown in the booking flow); owners/admins
-- write within scope.
-- ---------------------------------------------------------------------------
create policy issues_read on issues for select using (true);
create policy issues_owner_write on issues for all
  using (auth_role() = 'owner' and tenant_id = auth_tenant_id())
  with check (auth_role() = 'owner' and tenant_id = auth_tenant_id());
create policy issues_admin_write on issues for all
  using (is_admin()) with check (is_admin());

create policy services_read on services for select using (true);
create policy services_owner_write on services for all
  using (auth_role() = 'owner' and tenant_id = auth_tenant_id())
  with check (auth_role() = 'owner' and tenant_id = auth_tenant_id());
create policy services_admin_write on services for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Working hours — public read; owners/staff of the garage write; admins all.
-- ---------------------------------------------------------------------------
create policy working_hours_read on working_hours for select using (true);
create policy working_hours_owner_write on working_hours for all
  using (
    auth_role() = 'owner'
    and garage_id in (select id from garages where tenant_id = auth_tenant_id())
  )
  with check (
    auth_role() = 'owner'
    and garage_id in (select id from garages where tenant_id = auth_tenant_id())
  );
create policy working_hours_staff_write on working_hours for update
  using (garage_id in (select member_garage_ids()))
  with check (garage_id in (select member_garage_ids()));
create policy working_hours_admin_write on working_hours for all
  using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- Bookings — the core trust boundary.
--   driver: read/insert/update their own (driver_id = auth.uid())
--   staff : read/update bookings for garages they're assigned to
--   owner : full access within their tenant
--   admin : read-all (for support/trust), no destructive writes by default
-- ---------------------------------------------------------------------------
create policy bookings_driver_read on bookings for select
  using (driver_id = auth.uid());
create policy bookings_driver_insert on bookings for insert
  with check (driver_id = auth.uid());
create policy bookings_driver_update on bookings for update
  using (driver_id = auth.uid()) with check (driver_id = auth.uid());

create policy bookings_staff_read on bookings for select
  using (garage_id in (select member_garage_ids()));
create policy bookings_staff_update on bookings for update
  using (garage_id in (select member_garage_ids()))
  with check (garage_id in (select member_garage_ids()));

create policy bookings_owner_all on bookings for all
  using (auth_role() = 'owner' and tenant_id = auth_tenant_id())
  with check (auth_role() = 'owner' and tenant_id = auth_tenant_id());

create policy bookings_admin_read on bookings for select
  using (is_admin());

-- ---------------------------------------------------------------------------
-- Booking issues — visibility follows the parent booking.
-- ---------------------------------------------------------------------------
create policy booking_issues_read on booking_issues for select
  using (
    booking_id in (
      select id from bookings
      where driver_id = auth.uid()
         or garage_id in (select member_garage_ids())
         or (auth_role() = 'owner' and tenant_id = auth_tenant_id())
         or is_admin()
    )
  );
create policy booking_issues_write on booking_issues for all
  using (
    booking_id in (
      select id from bookings
      where driver_id = auth.uid()
         or garage_id in (select member_garage_ids())
         or (auth_role() = 'owner' and tenant_id = auth_tenant_id())
    )
  )
  with check (
    booking_id in (
      select id from bookings
      where driver_id = auth.uid()
         or garage_id in (select member_garage_ids())
         or (auth_role() = 'owner' and tenant_id = auth_tenant_id())
    )
  );
