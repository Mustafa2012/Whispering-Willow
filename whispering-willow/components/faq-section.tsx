import { ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/contact-details'

const faqs = [
  {
    question: 'Can I wear my jewelry every day?',
    answer:
      'Absolutely! Our pieces are designed with everyday wear in mind. Whether you’re heading out for coffee, working, or enjoying a cozy day at home, Whispering Willow is here for your everyday moments. 🤎',
  },
  {
    question: 'Is your jewelry waterproof? Can I wear it while showering?',
    answer:
      'Our stainless steel pieces are water-resistant, but we recommend removing your jewelry before showering, swimming, or using perfumes and harsh chemicals to help preserve its finish for longer.',
  },
  {
    question: 'Can I change or cancel my order after placing it?',
    answer:
      'Please contact us as soon as possible if you need to make a change. Once an order has been confirmed, packed, or dispatched, changes or cancellations may not be possible.',
  },
  {
    question: 'Will the gold color fade?',
    answer:
      'Our gold-tone pieces are designed to retain their finish with proper care. However, the longevity of the color depends on the specific coating, frequency of wear, and exposure to chemicals, moisture, and friction. We recommend gentle care to keep your jewelry looking its best.',
  },
  {
    question: 'How long will it last?',
    answer:
      'Designed for real life. Our 18K gold plating over stainless steel can last several years with normal wear. Unlike brass or copper, stainless steel holds plating much better, so there’s no quick fading. Just avoid perfume and harsh chemicals on the piece.',
  },
]

export function FaqSection() {
  return (
    <section className="bg-secondary/30 text-[#2d3933]">
      <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-8 lg:py-24">
        <div className="text-center">
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.38em] text-[#7d8d7d]">Good to know</p>
          <h2 className="mt-6 font-serif text-[clamp(3.25rem,5vw,7rem)] leading-[0.9] tracking-[-0.04em] text-[#2d3933]">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-8 max-w-[880px] text-[1.05rem] leading-relaxed text-[#425047] md:text-[1.35rem] md:leading-[1.6]">
            Everything you need to know about wearing, caring for, and choosing your everyday Whispering Willow jewelry.
          </p>
        </div>

        <div className="mt-20 border-t border-[#c8d1c4] pt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <p className="font-sans text-[0.72rem] uppercase tracking-[0.38em] text-[#7d8d7d]">Materials &amp; Care</p>
            <p className="font-sans text-[0.72rem] uppercase tracking-[0.28em] text-[#5d6b63]">{faqs.length} Questions</p>
          </div>

          <div className="mb-10 text-left">
            <h3 className="font-serif text-[clamp(2.2rem,3vw,4rem)] leading-none tracking-[-0.04em] text-[#2d3933]">
              Your questions, answered
            </h3>
          </div>

          <div className="space-y-0">
            {faqs.map((faq) => (
              <details key={faq.question} className="group border-b border-[#c8d1c4]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[1.15rem] font-medium leading-relaxed text-[#2d3933] md:text-[1.5rem]">
                  <span className="pr-4">{faq.question}</span>
                  <span className="shrink-0">
                    <ChevronDown className="h-5 w-5 text-[#4e5f58] transition-transform duration-200 group-open:rotate-180" />
                  </span>
                </summary>
                <div className="pb-6 pr-12 text-base leading-7 text-[#425047] md:text-lg md:leading-8">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-20 border border-[#c8d1c4] bg-secondary/30 px-6 py-14 text-center md:px-10 md:py-20">
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.38em] text-[#7d8d7d]">A Little Help?</p>
          <h3 className="mt-8 font-serif text-[clamp(2.8rem,4vw,5rem)] leading-[0.95] tracking-[-0.04em] text-[#2d3933]">
            We&apos;re just a message away.
          </h3>
          <p className="mx-auto mt-8 max-w-[760px] text-[1.2rem] leading-relaxed text-[#425047] md:text-[1.6rem] md:leading-[1.5]">
            Reach out and we&apos;ll help you find the right piece for your everyday collection.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/whisperingwillow.pk/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#a8b7a1] px-10 py-4 font-sans text-[0.86rem] uppercase tracking-[0.28em] text-[#1f2a25] transition-colors hover:bg-[#90a18b]"
            >
              Instagram
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#a8b7a1] px-10 py-4 font-sans text-[0.86rem] uppercase tracking-[0.28em] text-[#1f2a25] transition-colors hover:bg-[#90a18b]"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center justify-center gap-2 bg-[#a8b7a1] px-10 py-4 font-sans text-[0.86rem] uppercase tracking-[0.18em] text-[#1f2a25] transition-colors hover:bg-[#90a18b]"
            >
              <Mail className="h-4 w-4" />
              Email us
            </a>
          </div>
          <p className="mt-8 text-sm text-[#5d6b63]">
            Need help with an order?{' '}
            <a href="/return-policy" className="font-medium text-[#2d3933] underline decoration-[#a8b7a1] underline-offset-4 transition-colors hover:text-[#7d8d7d]">
              Read our exchange &amp; return policy
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
