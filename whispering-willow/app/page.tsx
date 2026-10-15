import { SiteHeader } from '@/components/site-header'
import { ProductGrid } from '@/components/product-grid'
import { SiteFooter } from '@/components/site-footer'
import { StoreReviews } from '@/components/store-reviews'
import { NewsletterSignup } from '@/components/newsletter-signup'
import { getProducts } from '@/lib/products-server'
import { getPublishedReviews } from '@/lib/reviews-server'

export default async function Page() {
  const [products, reviews] = await Promise.all([getProducts(), getPublishedReviews()])

  return (
    <>
      <SiteHeader />
      <main>
        <ProductGrid products={products} />
        <StoreReviews reviews={reviews} />
        <NewsletterSignup />
      </main>
      <SiteFooter />
    </>
  )
}
