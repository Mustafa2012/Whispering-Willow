'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const links = [
  { label: 'Collections', href: '#collections' },
  { label: 'Why Willow', href: '#why' },
  { label: 'Quality', href: '#quality' },
  { label: 'Shop', href: '#shop' },
  { label: 'Story', href: '#story' },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <a href="#top" className="flex items-center gap-2">
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

        <a
          href="#contact"
          className="hidden rounded-full border border-gold/60 px-5 py-2 text-sm tracking-wide text-foreground transition-colors hover:bg-gold hover:text-background md:inline-block"
        >
          Order Now
        </a>

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
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-1 inline-block rounded-full border border-gold/60 px-5 py-2 text-sm tracking-wide text-foreground"
              >
                Order Now
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
