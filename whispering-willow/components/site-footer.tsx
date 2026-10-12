import Image from 'next/image'
import { AtSign, MessageCircle, Phone } from 'lucide-react'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/products'
import { AdminAccess } from '@/components/admin-access'

const phoneNumber = '+923353637626'
const formattedPhone = '+92 335 363 7626'
const whatsappUrl = 'https://wa.me/923353637626'

export function SiteFooter() {
  return (
    <footer className="bg-[#4b3b2e] text-[#eee6dc]">
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-8 md:py-16">
        <div className="grid gap-10 border-b border-white/15 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.9fr_1fr] lg:gap-12">
          <div>
            <a href="/" className="inline-flex items-center gap-3" aria-label="Whispering Willow home">
              <Image src="/whispering-willow-logo.png" alt="" width={58} height={58} className="h-14 w-14 rounded-full object-cover" />
              <span className="font-serif text-2xl text-white">Whispering Willow</span>
            </a>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
              Minimal, hypoallergenic, tarnish-resistant jewelry designed to be worn every day.
            </p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={`Instagram ${INSTAGRAM_HANDLE}`} title="Instagram" className="mt-5 inline-flex h-10 w-10 items-center justify-center border border-white/25 text-white/80 transition-colors hover:border-white hover:text-white">
              <AtSign className="h-5 w-5" />
            </a>
          </div>

          <nav aria-label="Shop links">
            <h2 className="text-xs uppercase tracking-[0.16em] text-primary">Shop</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              <li><a href="/#shop" className="hover:text-white">Home</a></li>
              <li><a href="/#shop" className="hover:text-white">All jewelry</a></li>
              <li><a href="/?category=Bracelets#shop" className="hover:text-white">Bracelets &amp; Anklets</a></li>
              <li><a href="/?category=Earrings#shop" className="hover:text-white">Earrings</a></li>
              <li><a href="/?category=Necklaces#shop" className="hover:text-white">Necklaces</a></li>
              <li><a href="/?category=Rings#shop" className="hover:text-white">Rings</a></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-xs uppercase tracking-[0.16em] text-primary">Information</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/80">
              <li>Cash on Delivery</li>
              <li>Free shipping over Rs. 5,000</li>
              <li>Returns within 3 days</li>
              <li>Exchange &amp; Return Policy</li>
              <li>FAQs</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-[0.16em] text-primary">Contact</h2>
            <ul className="mt-4 space-y-4 text-sm text-white/80">
              <li><a href={`tel:${phoneNumber}`} className="inline-flex items-center gap-3 hover:text-white"><Phone className="h-4 w-4 shrink-0" />{formattedPhone}</a></li>
              <li><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-white"><MessageCircle className="h-4 w-4 shrink-0" />WhatsApp: {formattedPhone}</a></li>
              <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 hover:text-white"><AtSign className="h-4 w-4 shrink-0" />@{INSTAGRAM_HANDLE}</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 pt-5 text-xs text-white/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Whispering Willow. All rights reserved.</p>
          <div className="flex items-center gap-4"><span>Crafted with care in Pakistan</span><AdminAccess /></div>
        </div>
      </div>
    </footer>
  )
}
