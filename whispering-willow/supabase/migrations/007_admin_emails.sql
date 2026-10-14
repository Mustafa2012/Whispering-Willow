create table if not exists admin_emails (
  email text primary key check (email = lower(trim(email))),
  created_at timestamptz not null default now()
);

alter table admin_emails enable row level security;

insert into admin_emails (email)
values ('mustafaali192012@gmail.com')
on conflict (email) do nothing;
