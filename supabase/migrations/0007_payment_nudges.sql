-- WhatsApp payment reminders sent from admin, so we can see who was nudged and when.

alter table orders add column if not exists nudge_count integer not null default 0;
alter table orders add column if not exists nudged_at timestamptz;
