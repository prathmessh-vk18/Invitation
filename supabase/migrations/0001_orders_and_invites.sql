-- Aavjoo: orders placed by couples, and the invites published from them.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create sequence if not exists order_number_seq start 1001;

do $$ begin
  create type order_status as enum ('awaiting_payment', 'payment_submitted', 'paid', 'live', 'cancelled');
exception when duplicate_object then null; end $$;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique default ('NIM-' || nextval('order_number_seq')),
  template text not null,
  status order_status not null default 'awaiting_payment',
  amount integer not null check (amount > 0),
  addons text[] not null default '{}',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  details jsonb not null,           -- everything the couple typed, in the invite's own shape
  song_path text,                   -- path inside the "songs" bucket, if they uploaded one
  utr text,                         -- 12-digit UPI reference the couple enters after paying
  admin_notes text,
  invite_slug text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  payment_submitted_at timestamptz,
  paid_at timestamptz,
  published_at timestamptz
);

create index if not exists orders_status_created_idx on orders (status, created_at desc);

create table if not exists invites (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  order_id uuid references orders (id) on delete set null,
  template text not null,
  data jsonb not null,              -- the full invite the template renders
  music_url text,
  live_until date not null,         -- the link stops working after this day
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists orders_touch on orders;
create trigger orders_touch before update on orders for each row execute function touch_updated_at();
drop trigger if exists invites_touch on invites;
create trigger invites_touch before update on invites for each row execute function touch_updated_at();

-- Lock both tables. With RLS on and no policies, the public (anon) key can't read or write them;
-- only the server, using the service-role key, can.
alter table orders enable row level security;
alter table invites enable row level security;

-- Songs couples upload. Public so invites can stream them; file names are random.
-- Uploads only happen through short-lived signed URLs the server creates.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'songs', 'songs', true, 15728640,
  array['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/x-m4a', 'audio/aac', 'audio/wav', 'audio/x-wav', 'audio/ogg']
)
on conflict (id) do nothing;
