-- AutoCheck — WhatsApp conversation state + claim-by-phone reconciliation
--
-- 1. wa_conversations: the WhatsApp bot's in-progress state, keyed by the
--    driver's phone. The webhook used an in-memory Map, which does not survive
--    serverless cold starts / multiple instances — so a real deploy must hold it
--    in a shared store. Touched only by the service role (no RLS policies).
--
-- 2. claim_bookings_by_phone(): a WhatsApp booking is saved with driver_id = null
--    and customer_phone = the chat number. When that person later signs into the
--    app with the same number, this attaches those bookings to their account so
--    they appear under "my bookings" (RLS: driver_id = auth.uid()).

create table wa_conversations (
  phone      text primary key,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table wa_conversations enable row level security;
-- No policies: only the service role (the webhook) reads/writes this.

create or replace function claim_bookings_by_phone()
returns integer
language plpgsql security definer set search_path = public
as $$
declare
  v_phone text;
  v_count integer;
begin
  select regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')
    into v_phone
    from profiles
   where id = auth.uid();

  if v_phone is null or v_phone = '' then
    return 0;
  end if;

  update bookings
     set driver_id = auth.uid()
   where driver_id is null
     and regexp_replace(coalesce(customer_phone, ''), '[^0-9]', '', 'g') = v_phone;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
