-- Couples' changes after payment go live on their own: 3 free edits, then ₹99 buys 3 more.
-- An edit is one approved change request (sent from the change form, applied automatically or by us).
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

-- Edits on top of the free ones: bought in packs or given by us in admin.
alter table orders add column if not exists extra_edits integer not null default 0;

-- Applied by the site on its own (rather than approved by us), and why one was held for us instead.
alter table change_requests add column if not exists auto boolean not null default false;
alter table change_requests add column if not exists hold_reason text;

-- Each ₹99 pack: its Razorpay order, and whether it's paid.
create table if not exists edit_packs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  edits integer not null,
  amount integer not null,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  status text not null default 'created' check (status in ('created', 'paid')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists edit_packs_order_idx on edit_packs (order_id, created_at desc);
alter table edit_packs enable row level security;

-- Credits a paid pack exactly once: Checkout's callback and Razorpay's webhook may both arrive.
create or replace function credit_edit_pack(p_razorpay_order text, p_payment text) returns uuid
language plpgsql as $$
declare
  v_order uuid;
  v_edits integer;
begin
  update edit_packs set status = 'paid', paid_at = now(), razorpay_payment_id = p_payment
   where razorpay_order_id = p_razorpay_order and status = 'created'
   returning order_id, edits into v_order, v_edits;
  if v_order is null then return null; end if;
  update orders set extra_edits = extra_edits + v_edits where id = v_order;
  return v_order;
end $$;

-- Server-only, like the tables.
revoke execute on function credit_edit_pack(text, text) from public, anon, authenticated;
