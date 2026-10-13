import { AtSign, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { INSTAGRAM_URL } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Exchange & Return Policy | Whispering Willow',
  description:
    'Learn about Whispering Willow’s exchange window, eligibility, damaged orders, and shipping charges.',
}

const sections = [
  {
    title: '1. Returns',
    paragraphs: [
      'All sales are final. We do not offer refunds or returns for change of mind, incorrect selection, or personal preference.',
      'If your order arrives damaged, defective, or incorrect, please contact us within 48 hours of delivery so we can resolve the issue.',
    ],
  },
  {
    title: '2. Exchanges',
    paragraphs: [
      'Exchanges are accepted within 3 days of delivery for eligible items, subject to availability.',
      'Jewelry must be unused, unworn, and returned in its original packaging, with all tags and protective packaging intact.',
      'Items showing signs of wear, damage caused by the customer, or alteration are not eligible for exchange.',
      'Sale, discounted, or promotional items are not eligible for exchange unless they arrive damaged, defective, or incorrect.',
    ],
  },
  {
    title: '3. What We Can’t Accept for Return or Exchange',
    paragraphs: [
      'For hygiene reasons, earrings, nose pins, and nose rings are final sale and cannot be returned or exchanged, except in cases of a verified manufacturing defect.',
      'Worn, used, altered, or customer-damaged items are not eligible for return or exchange.',
    ],
  },
  {
    title: '4. Damaged or Incorrect Orders',
    paragraphs: [
      'Please record an unboxing video when opening your parcel. This helps us verify any damage, missing items, or incorrect products.',
      'Contact us via Instagram DM or WhatsApp within 48 hours of delivery, sharing your order number, unboxing video, and clear photos of the issue.',
      'Once the issue is verified, we will arrange an appropriate resolution, such as a replacement or exchange.',
    ],
  },
  {
    title: '5. Exchange Shipping Charges',
    paragraphs: [
      'For exchanges due to a change of preference, the customer is responsible for return and reshipping charges.',
      'If the mistake is on our end or the item arrives damaged or defective, Whispering Willow will cover the applicable shipping charges once the issue is verified.',
    ],
  },
  {
    title: '6. Important Notes',
    paragraphs: [
      'Please double-check your order before confirming your purchase.',
      'Slight variations in color may occur due to lighting and screen settings.',
      'Tarnishing or damage resulting from improper handling, chemicals, perfumes, or normal wear and tear is not automatically considered a manufacturing defect.',
      'We reserve the right to decline exchanges that do not meet the conditions stated above, subject to applicable consumer-protection laws.',
    ],
  },
]

export default function ReturnPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-secondary/30 text-[#2d3933]">
        <div className="mx-auto max-w-[1000px] px-6 py-16 md:px-8 md:py-24">
          <header className="border-b border-[#c8d1c4] pb-12 text-center md:pb-16">
            <p className="font-sans text-[0.72rem] uppercase tracking-[0.38em] text-[#7d8d7d]">
              Whispering Willow
            </p>
            <h1 className="mt-6 font-serif text-[clamp(3rem,6vw,6rem)] leading-[0.95] tracking-[-0.04em]">
              Exchange &amp; Return Policy
            </h1>
            <p className="mx-auto mt-6 max-w-[700px] text-base leading-relaxed text-[#425047] md:text-lg">
              At Whispering Willow, we want you to love every little piece you
              receive. Please read our exchange and return policy before placing
              your order.
            </p>
            <span className="mt-5 inline-block text-2xl" aria-label="Brown heart">
              🤎
            </span>
          </header>

          <div className="divide-y divide-[#c8d1c4]">
            {sections.map((section) => (
              <section key={section.title} className="py-8 md:py-10">
                <h2 className="font-serif text-2xl tracking-tight md:text-3xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-3 text-[0.98rem] leading-7 text-[#425047] md:text-base md:leading-8">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="mt-6 bg-[#e7e9e1] px-6 py-10 text-center md:px-10 md:py-12">
            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
              A Little Note From Us 🤎
            </h2>
            <p className="mx-auto mt-4 max-w-[700px] text-base leading-relaxed text-[#425047] md:text-lg">
              Every order is packed with love and care. Thank you for supporting
              our business and being a part of the Whispering Willow journey. 🌿
            </p>
            <p className="mt-6 text-sm leading-relaxed text-[#425047] md:text-base">
              For any questions or exchange requests, contact us through our
              official Instagram page or WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#a8b7a1] px-5 py-3 text-sm text-[#1f2a25] transition-colors hover:bg-[#90a18b]"
              >
                <AtSign className="h-4 w-4" />
                Instagram
              </a>
              <a
                href="https://wa.me/923353637626"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#a8b7a1] px-5 py-3 text-sm text-[#2d3933] transition-colors hover:bg-secondary/30"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
