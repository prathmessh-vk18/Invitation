-- Where a buyer came from: an ad's tag ("instagram:ad3"), or "instagram", "google", "whatsapp"…
-- Set when the order is placed, from a first-party cookie the site keeps for 30 days
-- (src/config/source.ts). Empty for orders placed before tracking started (21 Nov 2026).
alter table orders add column if not exists source text;
create index if not exists orders_source on orders (source, created_at desc);
