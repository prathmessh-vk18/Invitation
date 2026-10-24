-- "Our moments": photos couples upload with their order.
alter table orders add column if not exists photo_paths text[] not null default '{}';

-- Public so invites can show them; file names are random. Uploads go through short-lived signed URLs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', true, 10485760, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
