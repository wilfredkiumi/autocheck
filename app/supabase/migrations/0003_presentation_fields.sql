-- AutoCheck — presentation fields
--
-- The driver-facing screens (home, discovery) render rich trust decoration that
-- is content, not core domain data: contact avatars, "people in your network"
-- copy, distance, next-slot label, etc. Rather than hard-code it in the client,
-- store it so the live app reproduces the demo screens exactly. The columns are
-- nullable / defaulted so existing rows are unaffected.

alter table tenants
  add column if not exists sub        text,   -- tagline, e.g. 'White-label tenant'
  add column if not exists plan_label text;   -- display plan, e.g. 'Pro · custom domain'

alter table garages
  add column if not exists sort    int  not null default 0,    -- catalog ordering
  add column if not exists details jsonb not null default '{}'; -- presentation-only fields
