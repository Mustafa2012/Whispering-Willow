alter table store_settings
  add column if not exists bank_transfer_enabled boolean not null default true;

update store_settings
set bank_name = 'Meezan Bank',
    bank_account_name = 'Whispering Willow',
    bank_account_number = '0000000000'
where bank_name = '' and bank_account_name = '' and bank_account_number = '';
