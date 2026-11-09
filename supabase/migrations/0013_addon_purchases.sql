-- Add-ons bought after ordering (the ₹99 printable PDF): their Razorpay order, and whether paid.
-- A paid add-on is added to orders.addons, which is also where one ticked at checkout is kept.
-- Run once in the Supabase dashboard: SQL Editor → New query → paste → Run.

create table if not exists addon_purchases (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  addon text not null check (addon in ('pdf')),
  amount integer not null,
  razorpay_order_id text not null unique,
  razorpay_payment_id text,
  status text not null default 'created' check (status in ('created', 'paid')),
  created_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists addon_purchases_order_idx on addon_purchases (order_id, created_at desc);
alter table addon_purchases enable row level security;

-- Unlocks a paid add-on exactly once: Checkout's callback and Razorpay's webhook may both arrive.
create or replace function credit_addon(p_razorpay_order text, p_payment text) returns uuid
language plpgsql as $$
declare
  v_order uuid;
  v_addon text;
begin
  update addon_purchases set status = 'paid', paid_at = now(), razorpay_payment_id = p_payment
   where razorpay_order_id = p_razorpay_order and status = 'created'
   returning order_id, addon into v_order, v_addon;
  if v_order is null then return null; end if;
  update orders set addons = case when v_addon = any (addons) then addons else array_append(addons, v_addon) end where id = v_order;
  return v_order;
end $$;

revoke execute on function credit_addon(text, text) from public, anon, authenticated;
