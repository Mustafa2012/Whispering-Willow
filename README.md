# Whispering Willow

## Store setup

From `whispering-willow`, install dependencies with `pnpm install` and run the app with `pnpm dev`.

Create a Supabase project, set the values in `.env.local`, and run `supabase/migrations/001_store.sql` in the Supabase SQL editor. The migration adds availability, orders, order items, store settings, and the transfer-proof storage bucket.

Required environment variables are listed in `whispering-willow/.env.example`. Configure `ADMIN_PANEL_USERNAME` and `ADMIN_PANEL_PASSWORD` before using `/admin`.

For customer email OTP login, copy the Supabase `anon` public key from **Project Settings → API** into `SUPABASE_ANON_KEY`. In Supabase, open **Authentication → Providers → Email** and enable the **Email** provider. Customers sign in at `/login`; Supabase emails them a six-digit one-time code, and their orders are linked to their account. In **Authentication → Email Templates**, make sure the Magic Link template includes `{{ .Token }}` so the code is visible. Set the Supabase **Site URL** to your deployed app URL. Redirect URLs are only needed if you also keep the optional magic-link callback enabled.

Customers can place cash-on-delivery orders or upload bank-transfer proof during checkout. Orders are visible to administrators at `/admin`, where their status can be updated.

