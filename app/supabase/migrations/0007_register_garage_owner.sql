-- Self-serve garage owner registration.
-- Creates tenant + garage + promotes the calling user to owner in one transaction.
-- The garage starts with is_verified = false; a platform admin approves it later.

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
  -- Ensure uniqueness by appending random suffix if needed
  if exists (select 1 from tenants where slug = v_slug) then
    v_slug := v_slug || '-' || substr(gen_random_uuid()::text, 1, 4);
  end if;

  -- Create tenant (unverified)
  insert into tenants (slug, name, short_name, mark, accent, accent_dark, accent_soft, domain, is_verified)
  values (
    v_slug,
    p_business_name,
    p_business_name,
    upper(substr(trim(p_business_name), 1, 1)),
    '#0E7C50',     -- default green accent
    '#0A5C3C',
    '#E7F3EC',
    v_slug || '.autocheck.co.ke',
    false
  )
  returning id into v_tenant_id;

  -- Create the garage
  insert into garages (tenant_id, name, area, is_verified)
  values (v_tenant_id, p_garage_name, p_area || ', ' || p_city || ', ' || p_county, false)
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

  return jsonb_build_object(
    'tenant_id', v_tenant_id,
    'garage_id', v_garage_id,
    'slug', v_slug
  );
end;
$$;
