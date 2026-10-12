import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Does 18k gold-plated jewelry tarnish?',
    answer:
      'Our gold-plated pieces are designed for everyday wear and are finished with a protective layer to resist tarnishing. With proper care, they remain luminous for extended wear, though exposure to moisture, perfume, and harsh chemicals can speed up oxidation over time.',
  },
  {
    question: 'Is Wear Ivara jewelry waterproof?',
    answer:
      'The pieces are water-resistant for light daily contact, such as handwashing or brief rain exposure. We recommend removing them before swimming, showering, or applying products to preserve the finish and extend their longevity.',
  },
  {
    question: 'What is 316L stainless steel and why does it matter for jewelry?',
    answer:
      '316L stainless steel is a premium, hypoallergenic alloy prized for its strength, durability, and resistance to corrosion. It is an excellent choice for everyday jewelry because it stays polished, lightweight, and comfortable without the heavy feeling of other metals.',
  },
  {
    question: 'Is gold-plated jewelry safe for sensitive skin?',
    answer:
      'Yes. Our hypoallergenic base metals and nickel-free finish make them suitable for many people with sensitive skin. If you have particularly reactive skin, we still recommend removing your pieces before sleeping or exercising to minimize irritation.',
  },
  {
    question: "What's the difference between gold-plated and real gold jewelry?",
    answer:
      'Gold-plated jewelry has a thin layer of gold over a durable base metal, offering the look of gold at a more accessible price point. Solid gold is made entirely of gold, which is heavier and generally more expensive, while plated pieces are ideal for effortless everyday styling.',
  },
  {
    question: 'How long does 18K gold plating last?',
    answer:
      'On average, gold-plated jewelry can last several months to a year depending on wear, skin chemistry, and how well it is cared for. Regular cleaning and keeping it away from water, perfume, and oils can significantly extend the finish.',
  },
  {
    question: 'Can I wear gold-plated jewelry every day?',
    answer:
      'Absolutely. Our everyday pieces are designed to be worn often, but care does matter. Removing them during intense exercise, showering, or while using lotions or fragrances will help maintain the shine and prevent premature wear.',
  },
  {
    question: 'How do I clean and take care of gold-plated jewelry?',
    answer:
      'Use a soft microfiber cloth to gently wipe away oils and residue. Store your pieces in a dry pouch or box, away from humidity, and avoid contact with water, perfume, and cleaning products. A little care goes a long way in preserving their beauty.',
  },
]

export function FaqSection() {
  return (
    <section className="bg-[#f3efe9] text-[#2f2925]">
      <div className="mx-auto max-w-[1280px] px-6 py-20 md:px-8 lg:py-24">
        <div className="text-center">
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.38em] text-[#b18a4d]">Good to know</p>
          <h2 className="mt-6 font-serif text-[clamp(3.25rem,5vw,7rem)] leading-[0.9] tracking-[-0.04em] text-[#2f2925]">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto mt-8 max-w-[880px] text-[1.05rem] leading-relaxed text-[#4b433d] md:text-[1.35rem] md:leading-[1.6]">
            Everything you need to know about wearing, caring for, and choosing your everyday Ivara jewelry.
          </p>
        </div>

        <div className="mt-20 border-t border-[#d7d0c5] pt-12">
          <div className="mb-8 flex items-end justify-between gap-4">
            <p className="font-sans text-[0.72rem] uppercase tracking-[0.38em] text-[#b18a4d]">Materials &amp; Care</p>
            <p className="font-sans text-[0.72rem] uppercase tracking-[0.28em] text-[#6d625d]">10 Questions</p>
          </div>

          <div className="mb-10 text-left">
            <h3 className="font-serif text-[clamp(2.2rem,3vw,4rem)] leading-none tracking-[-0.04em] text-[#2f2925]">
              Your questions, answered
            </h3>
          </div>

          <div className="space-y-0">
            {faqs.map((faq) => (
              <details key={faq.question} className="group border-b border-[#d7d0c5]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[1.15rem] font-medium leading-relaxed text-[#2f2925] md:text-[1.5rem]">
                  <span className="pr-4">{faq.question}</span>
                  <span className="shrink-0">
                    <ChevronDown className="h-5 w-5 text-[#59514d] transition-transform duration-200 group-open:rotate-180" />
                  </span>
                </summary>
                <div className="pb-6 pr-12 text-base leading-7 text-[#5a514b] md:text-lg md:leading-8">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="mt-20 rounded-none border border-[#d7d0c5] bg-[#f7f4f0] px-6 py-14 text-center md:px-10 md:py-20">
          <p className="font-sans text-[0.72rem] uppercase tracking-[0.38em] text-[#b18a4d]">Still curious?</p>
          <h3 className="mt-8 font-serif text-[clamp(2.8rem,4vw,5rem)] leading-[0.95] tracking-[-0.04em] text-[#2f2925]">
            We&apos;re happy to help
          </h3>
          <p className="mx-auto mt-8 max-w-[760px] text-[1.2rem] leading-relaxed text-[#4d433d] md:text-[1.6rem] md:leading-[1.5]">
            Reach out and we&apos;ll help you find the right piece for your everyday collection.
          </p>
          <div className="mt-10 flex justify-center">
            <a
              href="mailto:hello@whisperingwillow.pk"
              className="inline-flex items-center justify-center bg-[#c4a15b] px-10 py-4 font-sans text-[0.86rem] uppercase tracking-[0.28em] text-[#fffaf5] transition-colors hover:bg-[#b88d44]"
            >
              Contact us
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
