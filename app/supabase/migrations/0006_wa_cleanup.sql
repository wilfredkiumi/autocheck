-- AutoCheck — scheduled cleanup of abandoned WhatsApp conversations
--
-- wa_conversations rows for chats that were never finished would otherwise
-- accumulate forever. This deletes anything untouched for a day, on an hourly
-- pg_cron schedule. A driver who comes back after that simply starts a fresh
-- booking conversation (the bot's default for an unknown sender), so expiring
-- stale state is safe.
--
-- pg_cron is available on Supabase; if `create extension` is blocked on your
-- plan, enable "pg_cron" once from Dashboard → Database → Extensions, then
-- re-run from the schedule block below. (Prefer not to use pg_cron? A Vercel
-- Cron hitting a small API route that calls cleanup_wa_conversations() works
-- too — this function is the reusable part either way.)

create extension if not exists pg_cron;

create or replace function cleanup_wa_conversations()
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  v_count integer;
begin
  delete from wa_conversations
   where updated_at < now() - interval '1 day';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- (Re)schedule hourly. cron.schedule upserts by job name, but unschedule first
-- so re-running this migration never errors on a duplicate.
do $$
begin
  perform cron.unschedule('cleanup-wa-conversations');
exception
  when others then null;
end;
$$;

select cron.schedule(
  'cleanup-wa-conversations',
  '0 * * * *',
  $$ select public.cleanup_wa_conversations(); $$
);
