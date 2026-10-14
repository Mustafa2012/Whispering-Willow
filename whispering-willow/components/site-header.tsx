'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { LogOut, Menu, ShoppingBag, UserRound, X } from 'lucide-react'
import { useCart } from '@/components/cart-provider'
import { CartDrawer } from '@/components/cart-drawer'
import { customerSupabase, getCustomerAuthHeaders } from '@/lib/customer-browser'

const links = [
  { label: 'Shop', href: '/#shop' },
  { label: 'Contact', href: '/#contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Returns & exchanges', href: '/return-policy' },
  { label: 'My orders', href: '/orders' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const { itemCount } = useCart()
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [customerAvatar, setCustomerAvatar] = useState<string | null>(null)

  useEffect(() => {
    getCustomerAuthHeaders().then((headers) => fetch('/api/auth/me', { headers })).then((response) => response.json()).then((result: { authenticated: boolean; email?: string; avatarUrl?: string }) => {
      setCustomerEmail(result.authenticated ? result.email || 'Account' : null)
      setCustomerAvatar(result.authenticated ? result.avatarUrl || null : null)
    })
  }, [])

  const signOut = async () => {
    await customerSupabase?.auth.signOut()
    await fetch('/api/auth/logout', { method: 'POST' })
    setCustomerEmail(null)
    setCustomerAvatar(null)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="justify-self-start text-foreground"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <a href="/" className="flex h-[60px] w-[120px] items-center justify-self-center sm:h-[80px] sm:w-[160px]" aria-label="Whispering Willow home">
          <Image
            src="/whispering-willow-wordmark.png"
            alt="Whispering Willow"
            width={160}
            height={80}
            className="h-full w-full object-cover mix-blend-multiply"
          />
        </a>

        <div className="flex items-center justify-self-end gap-2">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative p-2 text-foreground transition-colors hover:text-primary"
            aria-label={`Open cart (${itemCount} items)`}
          >
            <ShoppingBag className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[0.65rem] text-primary-foreground">
                {itemCount}
              </span>
            )}
          </button>
          {customerEmail ? (
            <>
              <button
                type="button"
                onClick={() => void signOut()}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                title="Sign out"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <a
                href="/orders"
                className="h-9 w-9 overflow-hidden rounded-full border border-gold/60"
                title={`View orders for ${customerEmail}`}
                aria-label={`View orders for ${customerEmail}`}
              >
                {customerAvatar ? (
                  <img src={customerAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-secondary text-xs text-foreground">
                    {customerEmail.slice(0, 1).toUpperCase()}
                  </span>
                )}
              </a>
            </>
          ) : (
            <a
              href="/login"
              className="p-2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Sign in"
              title="Sign in"
            >
              <UserRound className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-background px-6 py-4">
          <ul className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:justify-center md:gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block text-base tracking-wide text-muted-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  )
}
