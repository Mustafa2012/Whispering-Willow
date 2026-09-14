import { SiteHeader } from '@/components/site-header'
import { ProductGrid } from '@/components/product-grid'
import { SiteFooter } from '@/components/site-footer'
import { getProducts } from '@/lib/products-server'

export default async function Page() {
  const products = await getProducts()

  return (
    <>
      <SiteHeader />
      <main>
        <ProductGrid products={products} />
      </main>
      <SiteFooter />
    </>
  )
}
