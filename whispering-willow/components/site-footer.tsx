import Image from 'next/image'
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/products'
import { AdminAccess } from '@/components/admin-access'

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-12 text-center">
        <Image
          src="/whispering-willow-logo.png"
          alt="Whispering Willow"
          width={64}
          height={64}
          className="h-16 w-16 rounded-full object-cover"
        />
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
          Whispering Willow — premium 316L stainless steel jewelry, made not to
          shout, but to stay.
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            Instagram
          </a>
          <a href="#shop" className="hover:text-foreground">
            Shop
          </a>
          <AdminAccess />
        </div>
        <p className="text-xs tracking-wide text-muted-foreground/70">
          @{INSTAGRAM_HANDLE} · © {new Date().getFullYear()} Whispering Willow. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
