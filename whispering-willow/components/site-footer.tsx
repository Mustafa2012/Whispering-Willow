import Image from 'next/image'
import { AtSign, Mail, MessageCircle, Phone } from 'lucide-react'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/products'
import { AdminAccess } from '@/components/admin-access'
import { CONTACT_EMAIL, CONTACT_PHONE, FORMATTED_CONTACT_PHONE, WHATSAPP_URL } from '@/lib/contact-details'

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-[1440px] px-6 py-12 sm:px-8 md:py-16">
        <div className="grid gap-10 border-b border-primary-foreground/20 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.9fr] lg:gap-12">
          <div>
            <a href="/" className="inline-flex items-center gap-3" aria-label="Whispering Willow home">
              <Image src="/whispering-willow-logo.png" alt="" width={58} height={58} className="h-14 w-14 rounded-full object-cover" />
              <span className="font-serif text-2xl text-primary-foreground">Whispering Willow</span>
            </a>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-primary-foreground/75">
              Minimal, hypoallergenic, tarnish-resistant jewelry designed to be worn every day.
            </p>
            <div className="mt-5 flex flex-wrap items-start gap-3 text-primary-foreground/80">
              <a href={`tel:${CONTACT_PHONE}`} aria-label={`Call ${FORMATTED_CONTACT_PHONE}`} title={FORMATTED_CONTACT_PHONE} className="inline-flex h-10 w-10 items-center justify-center border border-primary-foreground/25 transition-colors hover:border-primary-foreground hover:text-primary-foreground">
                <Phone className="h-4 w-4" />
              </a>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label="Message us on WhatsApp" title="WhatsApp" className="inline-flex h-10 w-10 items-center justify-center border border-primary-foreground/25 transition-colors hover:border-primary-foreground hover:text-primary-foreground">
                <MessageCircle className="h-4 w-4" />
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} aria-label={`Email ${CONTACT_EMAIL}`} title={CONTACT_EMAIL} className="inline-flex h-10 w-10 items-center justify-center border border-primary-foreground/25 transition-colors hover:border-primary-foreground hover:text-primary-foreground">
                <Mail className="h-4 w-4" />
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label={`Instagram @${INSTAGRAM_HANDLE}`} title={`@${INSTAGRAM_HANDLE}`} className="inline-flex h-10 w-10 items-center justify-center border border-primary-foreground/25 transition-colors hover:border-primary-foreground hover:text-primary-foreground">
                <AtSign className="h-4 w-4" />
              </a>
            </div>
          </div>

          <nav aria-label="Shop links">
            <h2 className="text-xs uppercase tracking-[0.16em] text-primary-foreground">Shop</h2>
            <ul className="mt-4 space-y-3 text-sm text-primary-foreground/80">
              <li><a href="/#shop" className="hover:text-primary-foreground">Home</a></li>
              <li><a href="/#shop" className="hover:text-primary-foreground">All jewelry</a></li>
              <li><a href="/?category=Bracelets#shop" className="hover:text-primary-foreground">Bracelets &amp; Anklets</a></li>
              <li><a href="/?category=Earrings#shop" className="hover:text-primary-foreground">Earrings</a></li>
              <li><a href="/?category=Necklaces#shop" className="hover:text-primary-foreground">Necklaces</a></li>
              <li><a href="/?category=Rings#shop" className="hover:text-primary-foreground">Rings</a></li>
            </ul>
          </nav>

          <div>
            <h2 className="text-xs uppercase tracking-[0.16em] text-primary-foreground">Information</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-primary-foreground/80">
              <li>Cash on Delivery</li>
              <li><a href="/return-policy" className="hover:text-primary-foreground">Exchange &amp; Return Policy</a></li>
              <li><a href="/faq" className="hover:text-primary-foreground">FAQs</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col justify-between gap-4 pt-5 text-xs text-primary-foreground/60 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Whispering Willow. All rights reserved.</p>
          <AdminAccess />
        </div>
      </div>
    </footer>
  )
}
