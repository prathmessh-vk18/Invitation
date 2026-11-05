-- A history of every change to an order's details: who made it (the couple before paying, us in
-- admin, an approved change request, or by hand), when, and what changed. It lets admin see an
-- order's history, and warns before approving a request that would undo a later edit.

create table if not exists order_edits (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  created_at timestamptz not null default now(),
  source text not null check (source in ('couple', 'admin', 'approved', 'by hand')),
  request_id uuid references change_requests (id) on delete set null,
  -- [{ "label": "Bride's parents", "before": "…", "after": "…" }]
  changes jsonb not null
);

create index if not exists order_edits_order_idx on order_edits (order_id, created_at desc);
alter table order_edits enable row level security;
