import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { FaqSection } from '@/components/faq-section'

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  )
}
