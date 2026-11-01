-- Enquiries from the "Let's talk" chat: the visitor's answers, what they did next, and any
-- question they asked us to answer (a ticket). Written only by the server (service role).

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  planner text,
  wedding_month text,
  tradition text,
  design text,
  price_ok text,
  need text,
  -- What they did at the end: 'order' (went to the form), 'whatsapp', or null (left).
  outcome text,
  -- A question for us, and how to reply (email or phone they chose to give).
  question text,
  contact text,
  status text not null default 'new',
  page text
);

create index if not exists leads_created_at_idx on leads (created_at desc);
alter table leads enable row level security;
