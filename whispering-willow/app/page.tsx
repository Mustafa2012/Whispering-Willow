import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { Collections } from '@/components/collections'
import { WhyWillow } from '@/components/why-willow'
import { Quality } from '@/components/quality'
import { ProductGrid } from '@/components/product-grid'
import { Story } from '@/components/story'
import { Contact } from '@/components/contact'
import { SiteFooter } from '@/components/site-footer'

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Collections />
        <WhyWillow />
        <Quality />
        <ProductGrid />
        <Story />
        <Contact />
      </main>
      <SiteFooter />
    </>
  )
}
