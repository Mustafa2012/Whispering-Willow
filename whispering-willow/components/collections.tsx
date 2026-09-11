import Image from 'next/image'
import { collections } from '@/lib/products'

export function Collections() {
  return (
    <section id="collections" className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-10 flex flex-col items-center text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-primary">Curated</span>
        <h2 className="mt-3 font-serif text-4xl tracking-tight text-foreground md:text-5xl">
          Shop by Collection
        </h2>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:justify-items-center">
          {collections.map((c) => (
            <a
              key={c.name}
              href="#shop"
              className="group flex w-full max-w-[220px] flex-col items-center justify-center text-center"
            >
              <div className="relative aspect-square w-full overflow-hidden rounded-full border border-border/70 bg-card shadow-sm">
                <Image
                  src={c.image || '/placeholder.svg'}
                  alt={c.name}
                  fill
                  sizes="(max-width: 640px) 80vw, 220px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <span className="mt-4 font-serif text-2xl leading-tight text-foreground transition-colors group-hover:text-primary sm:text-[1.65rem]">
                {c.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
