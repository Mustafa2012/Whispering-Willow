import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { CartProvider } from '@/components/cart-provider'
import { CustomerSessionSync } from '@/components/customer-session-sync'
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
  themeColor: '#f4f1ea',
  colorScheme: 'light',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} bg-background`}>
      <body className="font-sans antialiased">
        <CartProvider>
          <CustomerSessionSync />
          {children}
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
