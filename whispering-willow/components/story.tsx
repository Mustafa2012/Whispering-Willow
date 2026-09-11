import Image from 'next/image'

export function Story() {
  return (
    <section id="story" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-primary">
            Wear it. Love it. Live in it.
          </span>
          <h2 className="mt-3 font-serif text-4xl leading-tight tracking-tight text-balance text-foreground md:text-5xl">
            The Whispering Willow story
          </h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-foreground/80 text-pretty">
            <p>
              We started Whispering Willow with a simple belief: that jewelry
              should be an heirloom in the making, not a trend that fades by
              season&apos;s end.
            </p>
            <p>
              Every piece is crafted from marine-grade 316L stainless steel — the
              same material trusted for surgical tools — so it stays kind to your
              skin and true to its shine, through everyday wear, water, and time.
            </p>
            <p>
              You&apos;re not just buying a piece of jewelry. You&apos;re investing
              in one that will remain beautiful, and be worn, loved, and lived in.
            </p>
          </div>
        </div>

        <div className="relative aspect-4/5 overflow-hidden rounded-[2rem] border border-border/70 shadow-lg shadow-secondary/20">
          <Image
            src="/story-flatlay.png"
            alt="Flat lay of assorted gold Whispering Willow jewelry on cream silk"
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
