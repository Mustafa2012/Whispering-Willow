import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '@/lib/products'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Contact() {
  return (
    <section id="contact" className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-6 py-16 text-center md:py-24">
        <span className="text-xs uppercase tracking-[0.25em] text-primary-foreground/70">
          Order &amp; Enquiries
        </span>
        <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-balance md:text-5xl">
          Let&apos;s find the piece that stays with you
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-primary-foreground/85 text-pretty">
          We take orders and answer questions directly on Instagram.
          Message us — we&apos;d love to help you choose.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-background px-7 py-3.5 text-sm tracking-wide text-foreground transition-opacity hover:opacity-90"
          >
            <InstagramIcon className="h-4 w-4" />
            @{INSTAGRAM_HANDLE}
          </a>
        </div>
      </div>
    </section>
  )
}
