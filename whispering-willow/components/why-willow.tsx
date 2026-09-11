import Image from 'next/image'

export function WhyWillow() {
  return (
    <section id="why" className="bg-secondary/40">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="relative order-last md:order-first">
          <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border/70 shadow-lg shadow-secondary/30">
            <Image
              src="/whispering-willow-logo.png"
              alt="Whispering Willow willow tree logo"
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-primary">
            Why Whispering Willow?
          </span>
          <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-balance text-foreground md:text-5xl">
            A willow bends, but never breaks.
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-foreground/80 text-pretty">
            <p>
              Graceful, resilient, and quietly unforgettable — that&apos;s the
              spirit behind everything we curate.
            </p>
            <p>
              Whispering Willow is for the woman who doesn&apos;t need to be loud
              to be remembered. Jewelry that doesn&apos;t fade, made not to shout,
              but to stay — to be felt, and to be passed down.
            </p>
            <p className="font-serif text-2xl italic text-primary">
              The most meaningful things were never meant to be shouted. They were
              meant to be whispered.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
