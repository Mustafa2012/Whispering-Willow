alter table store_settings
  add column if not exists delivery_charge numeric not null default 250 check (delivery_charge >= 0),
  add column if not exists free_shipping_enabled boolean not null default true,
  add column if not exists free_shipping_threshold numeric not null default 5000 check (free_shipping_threshold >= 0);
