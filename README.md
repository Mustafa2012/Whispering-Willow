# Whispering Willow

## Store setup

From `whispering-willow`, install dependencies with `pnpm install` and run the app with `pnpm dev`.

Create a Supabase project, set the values in `.env.local`, and run `supabase/migrations/001_store.sql` in the Supabase SQL editor. The migration adds availability, orders, order items, store settings, and the transfer-proof storage bucket.

Required environment variables are listed in `whispering-willow/.env.example`. Configure `ADMIN_PANEL_USERNAME` and `ADMIN_PANEL_PASSWORD` before using `/admin`.

Customers can place cash-on-delivery orders or upload bank-transfer proof during checkout. Orders are visible to administrators at `/admin`, where their status can be updated.

