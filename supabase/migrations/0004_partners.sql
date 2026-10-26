-- Partners: friends and influencers who send couples our way and earn a fixed commission per paid order.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table if not exists partners (
  code text primary key check (code ~ '^[A-Z0-9]{3,20}$'),   -- what couples see, e.g. PRIYA
  name text not null,
  phone text not null,                                       -- 91XXXXXXXXXX, also blocks self-referrals
  upi_id text,                                               -- where their commission is sent
  commission integer not null default 100 check (commission >= 0),
  -- The secret in their private earnings page, /p/<token>.
  token text not null unique default replace(gen_random_uuid()::text, '-', ''),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- The partner who referred an order, and what they earn once it is paid (fixed when the order is placed).
alter table orders add column if not exists partner_code text references partners (code) on update cascade;
alter table orders add column if not exists partner_commission integer;
create index if not exists orders_partner_idx on orders (partner_code) where partner_code is not null;

-- Money sent to a partner. What they're owed = commission on paid orders − these.
create table if not exists partner_payouts (
  id uuid primary key default gen_random_uuid(),
  partner_code text not null references partners (code) on update cascade,
  amount integer not null check (amount > 0),
  note text,
  paid_at timestamptz not null default now()
);

-- Server-only, like orders and invites.
alter table partners enable row level security;
alter table partner_payouts enable row level security;
