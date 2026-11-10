-- Rate limits for the public forms and the admin login. One row per attempt; the visitor is stored
-- only as a keyed hash of their IP address, never the address itself. Rows older than two days
-- are cleared by the app as it goes.
create table if not exists rate_hits (
  id bigserial primary key,
  bucket text not null,
  key text not null,
  at timestamptz not null default now()
);
create index if not exists rate_hits_lookup on rate_hits (bucket, key, at);
-- Only the server (service key) touches this table.
alter table rate_hits enable row level security;
