-- Every email the site sends (payment reminders for now): to whom, which one, and whether Gmail
-- accepted it. Admin → Emails reads it. Run once in the Supabase dashboard: SQL Editor → Run.
create table if not exists email_log (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders (id) on delete set null,
  to_email text not null,
  kind text not null default 'payment_reminder',
  reminder integer,                 -- 1, 2 or 3 for payment reminders
  subject text not null,
  status text not null check (status in ('sent', 'failed')),
  error text,
  created_at timestamptz not null default now()
);
create index if not exists email_log_created_idx on email_log (created_at desc);
create index if not exists email_log_order_idx on email_log (order_id, created_at desc);
alter table email_log enable row level security;
