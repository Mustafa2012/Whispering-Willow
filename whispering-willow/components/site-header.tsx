'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { LogOut, Menu, ShoppingBag, X } from 'lucide-react'
import { useCart } from '@/components/cart-provider'
import { CartDrawer } from '@/components/cart-drawer'
import { customerSupabase, getCustomerAuthHeaders } from '@/lib/customer-browser'

const links = [
  { label: 'Shop', href: '#shop' },
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
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="/" className="flex items-center gap-2">
          <Image
            src="/whispering-willow-logo.png"
            alt="Whispering Willow"
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
          <span className="font-serif text-xl tracking-wide text-foreground">
            Whispering Willow
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button type="button" onClick={() => setCartOpen(true)} className="hidden items-center gap-2 rounded-full border border-gold/60 px-5 py-2 text-sm tracking-wide text-foreground transition-colors hover:bg-gold hover:text-background md:flex">
          <ShoppingBag className="h-4 w-4" />
          Cart ({itemCount})
        </button>
        {customerEmail ? <div className="hidden items-center gap-3 md:flex"><a href="/orders" className="h-9 w-9 overflow-hidden rounded-full border border-gold/60" title={`View orders for ${customerEmail}`} aria-label={`View orders for ${customerEmail}`}>{customerAvatar ? <img src={customerAvatar} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center bg-secondary text-xs text-foreground">{customerEmail.slice(0, 1).toUpperCase()}</span>}</a><button type="button" onClick={() => void signOut()} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" title="Sign out"><LogOut className="h-4 w-4" />Sign out</button></div> : <a href="/login" className="hidden text-xs text-muted-foreground hover:text-foreground md:block">Sign in</a>}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="text-foreground md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border/60 bg-background px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4">
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
            <li>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  setCartOpen(true)
                }}
                className="mt-1 inline-block rounded-full border border-gold/60 px-5 py-2 text-sm tracking-wide text-foreground"
              >
                Cart ({itemCount})
              </button>
            </li>
          </ul>
        </nav>
      )}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  )
}
