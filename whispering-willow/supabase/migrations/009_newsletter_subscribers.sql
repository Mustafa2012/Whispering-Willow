create table if not exists newsletter_subscribers (
  email text primary key check (email = lower(trim(email))),
  created_at timestamptz not null default now()
);

alter table newsletter_subscribers enable row level security;
