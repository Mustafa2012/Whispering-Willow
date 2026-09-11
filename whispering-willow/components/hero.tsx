import Image from 'next/image'

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col items-start">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold/50 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Premium 316L Steel · Waterproof
          </span>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-tight text-balance text-foreground md:text-7xl">
            Jewelry made
            <br />
            not to shout,
            <br />
            <span className="italic text-primary">but to stay.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground text-pretty">
            Graceful, resilient pieces for the woman who doesn&apos;t need to be
            loud to be remembered — made to be felt, and passed down.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="#shop"
              className="rounded-full bg-primary px-8 py-3.5 text-sm tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore Collection
            </a>
            <a
              href="#story"
              className="rounded-full px-4 py-3.5 text-sm tracking-wide text-foreground underline decoration-gold/60 underline-offset-4 transition-colors hover:text-primary"
            >
              Our Story
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-accent/25 blur-2xl" aria-hidden="true" />
          <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] border border-border/70 shadow-xl shadow-secondary/20">
            <Image
              src="/hero-jewelry.png"
              alt="A woman wearing delicate gold Whispering Willow jewelry"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
