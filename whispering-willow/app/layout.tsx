import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { CartProvider } from '@/components/cart-provider'
import { CustomerSessionSync } from '@/components/customer-session-sync'
import { NewsletterSignup } from '@/components/newsletter-signup'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jost = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Whispering Willow — Jewelry Made to Stay',
  description:
    'Whispering Willow crafts premium 316L stainless steel jewelry — waterproof, hypoallergenic, and made not to shout, but to stay. Graceful pieces made to be felt and passed down.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f1ea' },
    { media: '(prefers-color-scheme: dark)', color: '#24211e' },
  ],
  colorScheme: 'light dark',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${cormorant.variable} ${jost.variable} bg-background`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var theme=localStorage.getItem('theme');var dark=theme==='dark'||(theme===null&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',dark);var meta=document.querySelector('meta[name="theme-color"]');if(meta){meta.setAttribute('content',dark?'#252b27':'#f4f1ea');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <CartProvider>
          <CustomerSessionSync />
          {children}
          <NewsletterSignup />
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
