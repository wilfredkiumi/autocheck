-- Reviews: drivers rate garages after their car is collected.
-- One review per booking. The garage's aggregate rating is auto-updated.

create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null references bookings(id) on delete cascade,
  garage_id   uuid not null references garages(id) on delete cascade,
  driver_id   uuid references auth.users(id) on delete set null,
  rating      smallint not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (booking_id)  -- one review per booking
);

-- RLS
alter table reviews enable row level security;

-- Anyone can read reviews (public social proof)
create policy "Reviews are publicly readable"
  on reviews for select using (true);

-- Drivers can insert their own review
create policy "Drivers can create reviews"
  on reviews for insert with check (
    driver_id = auth.uid()
    or driver_id is null  -- guest reviews via service client
  );

-- Trigger: recalculate garage rating after insert
create or replace function recalc_garage_rating()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update garages
  set rating = (
    select round(avg(rating)::numeric, 1)
    from reviews
    where garage_id = NEW.garage_id
  )
  where id = NEW.garage_id;
  return NEW;
end;
$$;

create trigger trg_recalc_garage_rating
  after insert on reviews
  for each row
  execute function recalc_garage_rating();

-- Index for fast lookups
create index if not exists idx_reviews_garage_id on reviews(garage_id);
create index if not exists idx_reviews_booking_id on reviews(booking_id);
