-- AutoCheck — seed data
-- Ported from app/lib/data.ts so the Supabase-backed app reproduces the demo
-- content. Safe to re-run: every insert is idempotent on its natural key.
--
-- Run after the migrations:  supabase db reset   (applies migrations + this seed)
-- or paste into the SQL editor for a hosted project.

-- ---------------------------------------------------------------------------
-- Tenants
-- ---------------------------------------------------------------------------
insert into tenants (id, slug, name, short_name, mark, accent, accent_dark, accent_soft, domain, plan, price, features, is_verified)
values
  ('11111111-1111-1111-1111-111111111111', 'autocheck', 'AutoCheck', 'AutoCheck', 'A',
   '#0E7C50', '#0A6A44', '#EAF3EE', 'autocheck.app', 'standard', 'KSh 2,500/mo',
   array['AutoCheck sub-domain link', 'Bay & slot management', 'Issue intake + photos'], true),
  ('22222222-2222-2222-2222-222222222222', 'juma-auto', 'Juma Auto Garage', 'Juma Auto', 'J',
   '#C2410C', '#9A330A', '#FBEAE1', 'juma-auto.autocheck.app', 'branded', 'KSh 4,500/mo',
   array['Your logo & colours', 'Branded sub-domain', 'Bay & slot management'], false),
  ('33333333-3333-3333-3333-333333333333', 'westgate', 'Westgate Auto Clinic', 'Westgate', 'W',
   '#0F766E', '#0B5A54', '#E2F2F0', 'book.westgateauto.co.ke', 'pro', 'KSh 7,500/mo',
   array['Your own domain + SSL', 'Full white-label branding', 'Priority listing when verified'], false)
on conflict (slug) do update set
  name = excluded.name, short_name = excluded.short_name, mark = excluded.mark,
  accent = excluded.accent, accent_dark = excluded.accent_dark, accent_soft = excluded.accent_soft,
  domain = excluded.domain, plan = excluded.plan, price = excluded.price,
  features = excluded.features, is_verified = excluded.is_verified;

-- Alternate url slugs (e.g. /juma → juma-auto)
insert into tenant_slugs (slug, tenant_id) values
  ('autocheck', '11111111-1111-1111-1111-111111111111'),
  ('juma-auto', '22222222-2222-2222-2222-222222222222'),
  ('juma',      '22222222-2222-2222-2222-222222222222'),
  ('westgate',  '33333333-3333-3333-3333-333333333333')
on conflict (slug) do update set tenant_id = excluded.tenant_id;

-- ---------------------------------------------------------------------------
-- Garages (the catalog drivers browse, plus the AutoCheck-vetted Nyeri set)
-- ---------------------------------------------------------------------------
insert into garages (id, tenant_id, name, area, bays_total, mode, is_verified, rating, quote, quote_by)
values
  ('a0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222',
   'Juma Auto Garage', 'Ngong Rd', 4, 'circle', false, null,
   'Been bringing my car here for years. Booking online means I just drive straight in now.', 'Aisha · your contact'),
  ('a0000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111',
   'Karanja Motors', 'Industrial Area', 6, 'circle', false, null,
   'They never start work without calling me first with the price. Felt safe sending my daughter here.', 'Aisha · your contact'),
  ('a0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333',
   'Westgate Auto Clinic', 'Westlands', 5, 'circle', false, null,
   'No one talks down to you here. Clear quote, M-Pesa receipt, done.', 'Njeri · your contact'),
  -- AutoCheck-vetted (verified) garages in Nyeri
  ('a0000000-0000-0000-0000-000000000004', '11111111-1111-1111-1111-111111111111',
   'Mt Kenya Auto Repairs', 'Kimathi Way, Nyeri', 5, 'verified', true, 4.8,
   'Stranded on the highway, booked in 2 minutes, they sorted my car the same afternoon.', 'Verified booking · May 2026'),
  ('a0000000-0000-0000-0000-000000000005', '11111111-1111-1111-1111-111111111111',
   'Dedan Motors', 'Gakere Rd, Nyeri', 3, 'verified', true, 4.6,
   'Fair price, showed me the worn part before replacing it. Trustworthy.', 'Verified booking · Apr 2026'),
  ('a0000000-0000-0000-0000-000000000006', '11111111-1111-1111-1111-111111111111',
   'Highlands Garage', 'Ring Rd, Nyeri', 6, 'verified', true, 4.9,
   'Best garage in town. Clean, professional, and they actually pick up the phone.', 'Verified booking · Jun 2026')
on conflict (id) do update set
  name = excluded.name, area = excluded.area, bays_total = excluded.bays_total,
  mode = excluded.mode, is_verified = excluded.is_verified, rating = excluded.rating,
  quote = excluded.quote, quote_by = excluded.quote_by;

-- ---------------------------------------------------------------------------
-- Issue catalog + service durations (seeded per tenant)
-- ---------------------------------------------------------------------------
insert into issues (tenant_id, label, est_mins, sort)
select t.id, v.label, v.est_mins, v.sort
from tenants t
cross join (values
  ('Brakes', 120, 0), ('Engine', 180, 1), ('Suspension', 120, 2), ('Electrical', 90, 3),
  ('Tyres', 45, 4), ('Overheating', 120, 5), ('Aircon', 90, 6), ('Service / oil', 45, 7)
) as v(label, est_mins, sort)
on conflict (tenant_id, label) do update set est_mins = excluded.est_mins, sort = excluded.sort;

insert into services (tenant_id, key, label, est_mins, sort)
select t.id, v.key, v.label, v.est_mins, v.sort
from tenants t
cross join (values
  ('oil', 'Oil & routine service', 45, 0),
  ('brakes', 'Brakes & pads', 120, 1),
  ('diag', 'Diagnostics / warning light', 60, 2),
  ('susp', 'Suspension & steering', 120, 3),
  ('elec', 'Electrical / battery', 90, 4),
  ('body', 'Bodywork & welding', 480, 5)
) as v(key, label, est_mins, sort)
on conflict (tenant_id, key) do update set label = excluded.label, est_mins = excluded.est_mins, sort = excluded.sort;

-- ---------------------------------------------------------------------------
-- Working hours — Mon–Sat 08:00–18:00, closed Sunday, for every garage
-- ---------------------------------------------------------------------------
insert into working_hours (garage_id, weekday, opens_at, closes_at, is_open)
select g.id, d.weekday, '08:00'::time, '18:00'::time, (d.weekday <> 0)
from garages g
cross join generate_series(0, 6) as d(weekday)
on conflict (garage_id, weekday) do nothing;

-- ---------------------------------------------------------------------------
-- Sample bookings for the Juma Auto owner dashboard (mirrors BOOKINGS[])
-- ---------------------------------------------------------------------------
insert into bookings (id, tenant_id, garage_id, customer_name, vehicle, ai_summary, slot_label, status, has_photo, channel)
values
  ('b0000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001',
   'Grace W.', 'Toyota Premio · KCA 123A',
   'Likely worn front pads + alignment pull. Inspect on arrival, quote pad set.', 'Today · 9:00 AM', 'new', true, 'app'),
  ('b0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001',
   'David K.', 'Subaru Forester · KDJ 456B',
   'Possible coolant leak / thermostat. Pressure-test cooling system first.', 'Today · 11:30 AM', 'confirmed', false, 'app'),
  ('b0000000-0000-0000-0000-000000000003', '22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001',
   'Aisha M.', 'Mazda Demio · KCB 789C',
   'Routine 10,000 km service + oil and filter change.', 'Today · 2:00 PM', 'confirmed', false, 'app'),
  ('b0000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000001',
   'Peter N.', 'Nissan Note · KDK 321D',
   'Battery not holding charge overnight. Test alternator + battery health.', 'Today · 4:30 PM', 'new', true, 'app')
on conflict (id) do nothing;

insert into booking_issues (booking_id, label) values
  ('b0000000-0000-0000-0000-000000000001', 'Brakes'),
  ('b0000000-0000-0000-0000-000000000001', 'Suspension'),
  ('b0000000-0000-0000-0000-000000000002', 'Engine'),
  ('b0000000-0000-0000-0000-000000000002', 'Overheating'),
  ('b0000000-0000-0000-0000-000000000003', 'Service / oil'),
  ('b0000000-0000-0000-0000-000000000004', 'Electrical')
on conflict do nothing;
