# Whispering Willow

## Store setup

From `whispering-willow`, install dependencies with `pnpm install` and run the app with `pnpm dev`.

Create a Supabase project, set the values in `.env.local`, and run the SQL files in `whispering-willow/supabase/migrations` in order: `001_store.sql`, `002_order_charges.sql`, `003_store_reviews.sql`, `004_product_sizes.sql`, `005_review_media.sql`, `006_shipping_settings.sql`, and `007_admin_emails.sql`. These migrations set up the catalog, orders, discounts, product size choices, store testimonials, private review-image storage, shipping settings, and authorized admin emails.

Required environment variables are listed in `whispering-willow/.env.example`. Configure `ADMIN_PANEL_USERNAME` and `ADMIN_PANEL_PASSWORD` for username/password access to `/admin`. The `007_admin_emails.sql` migration initially authorizes `mustafaali192012@gmail.com`; apply it before using email access.

To enable email-based admin access, set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the same project URL and anon key, configure Google as a Supabase Authentication provider, and add `<your-app-url>/admin/auth/callback` to **Authentication → URL Configuration → Redirect URLs**. Admins sign in with Google, and their verified email must be on the allowlist. `mustafaali192012@gmail.com` is the permanent main admin account: it is not shown in the editable email list and cannot be removed. Additional emails can be added or removed in the **Admin email access** section of `/admin`. Existing username/password access continues to work.

Set the server-only `CLEAR_DATA_PASSWORD` in `.env.local` and in your deployment environment to enable the admin clear-all action. Keep the value private; it is separate from the regular admin password.

For customer email OTP login, copy the Supabase `anon` public key from **Project Settings → API** into `SUPABASE_ANON_KEY`. In Supabase, open **Authentication → Providers → Email** and enable the **Email** provider. Customers sign in at `/login`; Supabase emails them a six-digit one-time code, and their orders are linked to their account. In **Authentication → Email Templates**, make sure the Magic Link template includes `{{ .Token }}` so the code is visible. Set the Supabase **Site URL** to your deployed app URL. Redirect URLs are only needed if you also keep the optional magic-link callback enabled.

Customers can place cash-on-delivery orders or upload bank-transfer proof during checkout. Orders are visible to administrators at `/admin/orders`, where their status can be updated. Set product sizes in the inventory editor as comma-separated values; products without sizes do not show a size selector.

Administrators manage store testimonials at `/admin/reviews`, where they can add drafts with up to three JPEG, PNG, WebP, or GIF images (5 MB each), then publish or remove reviews. Customers with an order can submit a display name, rating, review, and up to three images from `/orders`; the homepage only displays published reviews. Customer submissions remain private until an administrator publishes them. Review images are stored in the private `review-images` bucket and are served using signed URLs.
