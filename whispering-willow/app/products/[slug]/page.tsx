import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProductDetail } from '@/components/product-detail'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { slugifyProductName } from '@/lib/products'
import { getProducts } from '@/lib/products-server'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = (await getProducts()).find((item) => slugifyProductName(item.name) === slug)
  return { title: product ? `${product.name} — Whispering Willow` : 'Jewelry — Whispering Willow' }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = (await getProducts()).find((item) => slugifyProductName(item.name) === slug)
  if (!product || product.isActive === false) notFound()

  return (
    <>
      <SiteHeader />
      <ProductDetail product={product} />
      <SiteFooter />
    </>
  )
}