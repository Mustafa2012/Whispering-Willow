import Image from 'next/image'
import { Droplets, Sparkles, ShieldCheck, Gem } from 'lucide-react'

const features = [
  {
    icon: Droplets,
    title: 'Waterproof & Sweat-proof',
    body: 'Marine-grade 316L steel resists corrosion from water and saltwater.',
  },
  {
    icon: Sparkles,
    title: 'Lifetime Shine',
    body: 'It never fades or tarnishes — the standard used for surgical tools.',
  },
  {
    icon: ShieldCheck,
    title: 'Hypoallergenic & Safe',
    body: 'Gentle on skin. No irritation, no green marks, no compromise.',
  },
  {
    icon: Gem,
    title: 'Premium Heavy Feel',
    body: 'Substantial, considered pieces designed for everyday wear.',
  },
]

const comparison = [
  { other: 'Low grade 304 steel', willow: 'Marine-grade 316L' },
  { other: 'May fade & tarnish', willow: 'Lifetime shine' },
  { other: 'Can irritate skin', willow: 'Hypoallergenic & safe' },
  { other: 'Lightweight feel', willow: 'Premium heavy feel' },
]

export function Quality() {
  return (
    <section id="quality" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-12 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-primary">
          Uncompromising Quality
        </span>
        <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-tight text-balance text-foreground md:text-5xl">
          Why our jewelry lasts
        </h2>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
          Specifically designed with lower carbon and added molybdenum for
          exceptional resistance to corrosion. Most brands stop at 304 — we
          don&apos;t.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12">
        <div className="relative aspect-4/3 overflow-hidden rounded-[2rem] border border-border/70 shadow-lg shadow-secondary/20">
          <Image
            src="/quality-detail.png"
            alt="Close-up of a polished 316L stainless steel gold bangle"
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/70 bg-card p-6"
            >
              <f.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <h3 className="mt-4 font-serif text-xl text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 overflow-hidden rounded-2xl border border-border/70">
        <div className="grid grid-cols-2 bg-secondary/40 text-sm font-medium tracking-wide">
          <div className="px-6 py-4 text-muted-foreground">Other Jewelry</div>
          <div className="border-l border-border/70 px-6 py-4 text-primary">
            Whispering Willow (316L)
          </div>
        </div>
        {comparison.map((row, i) => (
          <div
            key={row.willow}
            className={`grid grid-cols-2 text-sm ${i % 2 === 1 ? 'bg-muted/40' : 'bg-card'}`}
          >
            <div className="px-6 py-4 text-muted-foreground line-through decoration-accent/60">
              {row.other}
            </div>
            <div className="border-l border-border/70 px-6 py-4 text-foreground">
              {row.willow}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
