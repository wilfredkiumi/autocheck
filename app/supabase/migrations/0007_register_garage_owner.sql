-- Self-serve garage owner registration.
-- Creates tenant + garage + promotes the calling user to owner in one transaction.
-- The garage starts with is_verified = false; a platform admin approves it later.
-- Seeds issues, services, and working hours so the garage is bookable immediately.

create or replace function register_garage_owner(
  p_business_name  text,
  p_garage_name    text,
  p_area           text,
  p_city           text,
  p_county         text,
  p_owner_name     text,
  p_phone          text default null
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_user_id    uuid := auth.uid();
  v_tenant_id  uuid;
  v_garage_id  uuid;
  v_slug       text;
  v_mark       text;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Check the user isn't already an owner/staff
  if exists (select 1 from profiles where id = v_user_id and role in ('owner', 'staff')) then
    raise exception 'Already registered as a garage owner or staff';
  end if;

  -- Generate a url-safe slug from business name
  v_slug := lower(regexp_replace(trim(p_business_name), '[^a-zA-Z0-9]+', '-', 'g'));
  if exists (select 1 from tenants where slug = v_slug) then
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 4);
  end if;

  v_mark := upper(substr(trim(p_business_name), 1, 1));

  -- Create tenant (unverified)
  insert into tenants (slug, name, short_name, mark, accent, accent_dark, accent_soft, domain, is_verified)
  values (
    v_slug,
    p_business_name,
    p_business_name,
    v_mark,
    '#0E7C50',
    '#0A5C3C',
    '#E7F3EC',
    v_slug || '.autocheck.co.ke',
    false
  )
  returning id into v_tenant_id;

  -- Create the garage with rich defaults so the card looks complete
  insert into garages (tenant_id, name, area, is_verified, details)
  values (
    v_tenant_id,
    p_garage_name,
    p_area || ', ' || p_city || ', ' || p_county,
    false,
    jsonb_build_object(
      'dist', '',
      'next', 'Open today',
      'trustType', 'circle',
      'trust', 'New on AutoCheck · accepting bookings',
      'avatars', '[]'::jsonb,
      'circleAvatars', jsonb_build_array(jsonb_build_object('i', v_mark, 'c', '#0E7C50')),
      'circleText', p_business_name || ' just joined AutoCheck. Be one of their first verified bookings.',
      'visits', '0',
      'open', 'Open now',
      'avail', 'Accepting bookings'
    )
  )
  returning id into v_garage_id;

  -- Promote user from driver → owner and attach to tenant
  update profiles
  set role = 'owner',
      tenant_id = v_tenant_id,
      full_name = coalesce(nullif(trim(p_owner_name), ''), full_name),
      phone = coalesce(nullif(trim(p_phone), ''), phone),
      updated_at = now()
  where id = v_user_id;

  -- Assign owner to the garage
  insert into garage_members (garage_id, profile_id)
  values (v_garage_id, v_user_id);

  -- Seed default issue catalog
  insert into issues (tenant_id, label, est_mins, sort) values
    (v_tenant_id, 'Brakes', 120, 0),
    (v_tenant_id, 'Engine', 180, 1),
    (v_tenant_id, 'Suspension', 120, 2),
    (v_tenant_id, 'Electrical', 90, 3),
    (v_tenant_id, 'Tyres', 45, 4),
    (v_tenant_id, 'Overheating', 120, 5),
    (v_tenant_id, 'Aircon', 90, 6),
    (v_tenant_id, 'Service / oil', 45, 7);

  -- Seed default service durations
  insert into services (tenant_id, key, label, est_mins, sort) values
    (v_tenant_id, 'oil', 'Oil & routine service', 45, 0),
    (v_tenant_id, 'brakes', 'Brakes & pads', 120, 1),
    (v_tenant_id, 'diag', 'Diagnostics / warning light', 60, 2),
    (v_tenant_id, 'susp', 'Suspension & steering', 120, 3),
    (v_tenant_id, 'elec', 'Electrical / battery', 90, 4),
    (v_tenant_id, 'body', 'Bodywork & welding', 480, 5);

  -- Seed working hours: Mon–Sat 08:00–18:00, closed Sunday
  insert into working_hours (garage_id, weekday, opens_at, closes_at, is_open)
  select v_garage_id, d.weekday, '08:00'::time, '18:00'::time, (d.weekday <> 0)
  from generate_series(0, 6) as d(weekday);

  return jsonb_build_object(
    'tenant_id', v_tenant_id,
    'garage_id', v_garage_id,
    'slug', v_slug
  );
end;
$$;
