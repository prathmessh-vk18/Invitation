-- Guests' RSVP replies, for the couple's RSVP page (/order/<id>/rsvps). A reply is saved when a
-- guest taps "Send RSVP on WhatsApp" on an invite; the WhatsApp message still goes to the couple as
-- before. Only invites whose order was placed after RSVP tracking launched are saved (see
-- site.rsvpTrackingFrom). No phone numbers: the form doesn't ask for one.
create table if not exists rsvp_replies (
  id bigserial primary key,
  invite_slug text not null,
  order_id uuid not null references orders (id) on delete cascade,
  name text not null,
  coming boolean not null,
  -- 0 when not coming
  guests smallint not null default 0 check (guests between 0 and 12),
  -- the functions (or days) they ticked, as the invite named them
  functions text[] not null default '{}',
  note text,
  created_at timestamptz not null default now()
);
create index if not exists rsvp_replies_order on rsvp_replies (order_id, created_at desc);
-- Only the server (service key) reads and writes it.
alter table rsvp_replies enable row level security;
