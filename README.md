# Whispering Willow

## Store setup

From `whispering-willow`, install dependencies with `pnpm install` and run the app with `pnpm dev`.

Create a Supabase project, set the values in `.env.local`, and run the SQL files in `whispering-willow/supabase/migrations` in order: `001_store.sql`, `002_order_charges.sql`, `003_store_reviews.sql`, `004_product_sizes.sql`, and `005_review_media.sql`. These migrations set up the catalog, orders, discounts, product size choices, store testimonials, and private review-image storage.

Required environment variables are listed in `whispering-willow/.env.example`. Configure `ADMIN_PANEL_USERNAME` and `ADMIN_PANEL_PASSWORD` before using `/admin`.

For customer email OTP login, copy the Supabase `anon` public key from **Project Settings → API** into `SUPABASE_ANON_KEY`. In Supabase, open **Authentication → Providers → Email** and enable the **Email** provider. Customers sign in at `/login`; Supabase emails them a six-digit one-time code, and their orders are linked to their account. In **Authentication → Email Templates**, make sure the Magic Link template includes `{{ .Token }}` so the code is visible. Set the Supabase **Site URL** to your deployed app URL. Redirect URLs are only needed if you also keep the optional magic-link callback enabled.

Customers can place cash-on-delivery orders or upload bank-transfer proof during checkout. Orders are visible to administrators at `/admin/orders`, where their status can be updated. Set product sizes in the inventory editor as comma-separated values; products without sizes do not show a size selector.

Administrators manage store testimonials at `/admin/reviews`, where they can add drafts with up to three JPEG, PNG, WebP, or GIF images (5 MB each), then publish or remove reviews. Signed-in customers can submit a display name, rating, review, and up to three images from the storefront. Customer submissions remain private until an administrator publishes them. Review images are stored in the private `review-images` bucket and are served using signed URLs.

