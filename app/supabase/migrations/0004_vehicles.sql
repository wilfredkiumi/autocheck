-- AutoCheck — vehicles (the number plate is the booking's real identity)
--
-- A car, not a person, is the stable thing being booked in: the owner, a spouse,
-- an employee driver, or a fundi moving the car may all create bookings for the
-- same vehicle. So bookings link to a `vehicle` (by plate), and `driver_id`
-- (the app account that happened to book) stays optional and can differ each
-- time. This is what unifies app + WhatsApp bookings and lets a garage see a
-- car's whole history regardless of who brought it in.

create table vehicles (
  id         uuid primary key default gen_random_uuid(),
  plate      text not null unique,   -- normalised: uppercase, alphanumerics only
  make_model text,                   -- e.g. 'Toyota Premio'
  created_at timestamptz not null default now()
);

alter table bookings
  add column vehicle_id uuid references vehicles (id) on delete set null,
  add column plate      text;        -- denormalised for quick lookup / display

create index bookings_plate_idx on bookings (plate);
create index bookings_vehicle_idx on bookings (vehicle_id);

-- Normalise a plate for matching: uppercase, strip spaces/punctuation.
create or replace function normalize_plate(p text)
returns text
language sql immutable
as $$ select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g')) $$;

-- Get-or-create a vehicle by plate, returning its id. SECURITY DEFINER so both
-- the app booking action (running as the signed-in driver) and the WhatsApp
-- service path can resolve a vehicle without a broad insert grant on the table.
create or replace function upsert_vehicle(p_plate text, p_make_model text default null)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_id uuid;
  v_norm text;
begin
  v_norm := normalize_plate(p_plate);
  if v_norm = '' then
    return null;
  end if;
  insert into vehicles (plate, make_model)
  values (v_norm, nullif(p_make_model, ''))
  on conflict (plate) do update
    set make_model = coalesce(excluded.make_model, vehicles.make_model)
  returning id into v_id;
  return v_id;
end;
$$;

-- RLS: a vehicle is visible when it's attached to a booking the caller may see
-- (bookings RLS already scopes that), or to a platform admin. Writes happen only
-- through upsert_vehicle / the service role — no direct insert/update policy.
alter table vehicles enable row level security;
create policy vehicles_read on vehicles for select
  using (
    id in (select vehicle_id from bookings where vehicle_id is not null)
    or is_admin()
  );
