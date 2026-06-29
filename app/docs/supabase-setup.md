# Supabase setup (Phase 1)

This wires AutoCheck to a real Postgres backend with phone-OTP auth and
role-based row-level security. **Until you set the env vars, the app runs as the
standalone design demo** on the static data in `lib/data.ts` — nothing breaks if
Supabase is absent.

## 1. Create the project

1. Create a project at [supabase.com](https://supabase.com) (free tier is fine).
2. Copy the API credentials from **Project Settings → API** into `app/.env.local`
   (see `.env.example`):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...        # server-only, never expose
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

## 2. Apply the schema + seed

**Option A — Supabase CLI (recommended).** From `app/`:

```bash
supabase link --project-ref YOUR-REF
supabase db push          # applies supabase/migrations/*.sql
psql "$DATABASE_URL" -f supabase/seed.sql    # or paste seed.sql in the SQL editor
```

Locally you can instead run the whole stack:

```bash
supabase start
supabase db reset         # runs migrations + seed.sql against the local db
```

**Option B — SQL editor.** Paste, in order:
`supabase/migrations/0001_init.sql`, `supabase/migrations/0002_rls.sql`, then
`supabase/seed.sql`.

## 3. Configure auth providers

In **Authentication → Providers**:

- **Phone** — enable, and connect **Twilio** as the SMS provider. Set the message
  channel to **WhatsApp** for the primary path; SMS is the automatic fallback the
  login form offers. (The app requests a channel per attempt via
  `signInWithOtp({ channel })`.)
- **Email** — enable (magic link) for garage-owner / admin logins.
- **Google** — optional, for owner/admin sign-in. Add your OAuth client and set
  the redirect URL to `${NEXT_PUBLIC_SITE_URL}/auth/callback`.

Under **Authentication → URL Configuration**, add
`${NEXT_PUBLIC_SITE_URL}/auth/callback` to the allowed redirect URLs.

## 4. Roles

Every new sign-up becomes a **driver** automatically (via the `handle_new_user`
trigger). Promote owners/staff/admins by hand for now — in the SQL editor:

```sql
-- make someone a platform admin
update profiles set role = 'admin' where id = '<auth-user-uuid>';

-- make someone a garage owner for a tenant
update profiles set role = 'owner', tenant_id = '22222222-2222-2222-2222-222222222222'
where id = '<auth-user-uuid>';

-- assign a fundi (staff) to a garage
update profiles set role = 'staff', tenant_id = '22222222-2222-2222-2222-222222222222'
where id = '<auth-user-uuid>';
insert into garage_members (garage_id, profile_id)
values ('a0000000-0000-0000-0000-000000000001', '<auth-user-uuid>');
```

(The tenant/garage UUIDs are the fixed ones from `seed.sql`.)

## 5. Run

```bash
npm install
npm run dev
```

- `/login` — phone OTP (WhatsApp/SMS) + email/Google
- `/` and `/<tenant>` — the driver booking app (open)
- `/dashboard` — owner / staff (live bookings via RLS)
- `/admin` — platform admin (verify garages)

The middleware enforces role routing **only when Supabase is configured**.

## How the trust boundary works

RLS (in `0002_rls.sql`) means every client runs the *same* query and the
database returns only the rows that role may see:

| Role   | Bookings visible            | Can write                              |
| ------ | --------------------------- | -------------------------------------- |
| driver | their own                   | their own bookings                     |
| staff  | their assigned garages      | update those bookings / hours          |
| owner  | their whole tenant          | full access within the tenant          |
| admin  | all (support / trust)       | verify garages, manage tenants/profiles|

The service-role key (`createServiceClient`) bypasses RLS and is reserved for
trusted server paths such as the WhatsApp webhook, which writes bookings for
users who have no app session.
