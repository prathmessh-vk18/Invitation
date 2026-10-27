-- Change requests: couples edit their details after paying, and an admin approves them before they go live.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table if not exists change_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  -- The whole invite as the couple wants it, in the order's own shape, plus their song and photos.
  details jsonb not null,
  song_path text,
  photo_paths text[] not null default '{}',
  note text,                         -- anything else the couple wants us to know
  reply text,                        -- why it was declined, shown to the couple
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists change_requests_status_idx on change_requests (status, created_at desc);
create index if not exists change_requests_order_idx on change_requests (order_id, created_at desc);

-- Server-only, like orders.
alter table change_requests enable row level security;
