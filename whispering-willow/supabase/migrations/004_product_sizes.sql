alter table products add column if not exists sizes text[] not null default '{}';
alter table order_items add column if not exists selected_size text;