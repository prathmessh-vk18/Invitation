-- Payment reminder emails for unpaid orders: how many went out and when, so each order gets at
-- most three and never two on the same day. Run once in the Supabase dashboard: SQL Editor → Run.
alter table orders add column if not exists email_reminders integer not null default 0;
alter table orders add column if not exists email_reminded_at timestamptz;
-- A couple who replied "stop" (set from admin): no more emails.
alter table orders add column if not exists email_opt_out boolean not null default false;
