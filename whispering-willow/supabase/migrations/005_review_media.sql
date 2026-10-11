alter table store_reviews
  add column if not exists customer_id uuid references auth.users(id) on delete set null,
  add column if not exists image_paths text[] not null default '{}';

do $$
begin
  alter table store_reviews
    add constraint store_reviews_image_paths_limit check (cardinality(image_paths) <= 3);
exception
  when duplicate_object then null;
end $$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-images', 'review-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;