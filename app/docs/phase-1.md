# Phase 1 — the foundation

This phase turns the standalone design demo into an app with a real backend,
auth, and roles, **without changing the existing screens**. The demo still runs
with zero configuration; the moment Supabase env vars are present, the app
switches to the live Postgres backend and enables sign-in.

## What's in this phase

### 1. Database (`supabase/`)
- `migrations/0001_init.sql` — schema: `tenants`, `tenant_slugs`, `profiles`
  (role + tenant), `garages`, `garage_members`, `issues`, `services`,
  `working_hours`, `bookings`, `booking_issues`. Plus an `updated_at` trigger and
  a `handle_new_user` trigger that auto-creates a profile on signup.
- `migrations/0002_rls.sql` — row-level security for all tables, scoped by role
  and tenant (driver / staff / owner / admin). Helper functions `auth_role()`,
  `auth_tenant_id()`, `is_admin()`, `member_garage_ids()`.
- `seed.sql` — the demo content (3 tenants, 6 garages, issues/services, sample
  bookings) ported verbatim from `lib/data.ts`.

### 2. Supabase wiring (`lib/supabase/`)
- `client.ts` / `server.ts` — browser + server clients (`@supabase/ssr`), plus a
  server-only service-role client for trusted writes (the WhatsApp webhook).
- `middleware.ts` — session refresh + current-user role lookup.
- `types.ts` — hand-written DB types. Regenerate with
  `supabase gen types typescript --linked`.
- `env.ts` — single `isSupabaseConfigured` flag that drives graceful degradation.

### 3. Auth + role routing
- `app/login` — phone OTP (WhatsApp primary, SMS fallback) + email magic link +
  Google, via server actions in `lib/auth/actions.ts`.
- `app/auth/callback` — OAuth / magic-link exchange.
- `middleware.ts` (app root) — when Supabase is configured: unauthenticated users
  hitting `/dashboard` or `/admin` go to `/login`; signed-in users land on their
  role's home (`lib/auth/roles.ts`). A no-op when Supabase is absent.

### 4. Data-access layer (`lib/db/`) + a live vertical slice
- `profiles.ts`, `bookings.ts`, `tenants.ts` — typed queries that rely on RLS for
  scoping.
- `app/dashboard` — the owner/staff dashboard reads **live bookings** through RLS
  as the proof-of-pattern. `app/admin` lists tenants/garages and lets an admin
  verify garages. These are the template for converting the remaining screens.

## What's intentionally deferred

- **Swapping every demo screen to live data.** The driver booking funnel and the
  owner screens inside `AppShell` still run on `lib/data.ts` in-memory state.
  Converting them screen-by-screen to the `lib/db` layer is the next slice — kept
  separate so the working demo isn't destabilised in one big rewrite. The
  dashboard/admin routes show the pattern to follow.
- **Phase 2 integrations** — real M-Pesa deposits, live WhatsApp sends, and the
  server-side Claude "describe my issue" call. These layer on top of this
  foundation.

## Verifying

`npm run build` type-checks and compiles the whole thing (done). End-to-end auth
and RLS behaviour require a real Supabase project — see `docs/supabase-setup.md`.

> Note: this was built without access to a live Supabase project, so the SQL and
> RLS policies have been written and type-checked but not yet run against a
> database. Apply the migrations to a project and exercise the flows before
> relying on them in production.
