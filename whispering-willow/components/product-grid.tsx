import Image from 'next/image'
import { products, INSTAGRAM_URL } from '@/lib/products'

const categories = ['Rings', 'Bracelets', 'Earrings'] as const

export function ProductGrid() {
  return (
    <section id="shop" className="bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="mb-12 flex flex-col items-center text-center">
          <span className="text-xs uppercase tracking-[0.25em] text-primary">
            Choose quality, not clutter
          </span>
          <h2 className="mt-3 font-serif text-4xl tracking-tight text-foreground md:text-5xl">
            Our Jewelry
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            Buy once, wear it always. Each piece is chosen to remain beautiful
            for years to come.
          </p>
        </div>

        <div className="space-y-14">
          {categories.map((category) => {
            const categoryProducts = products.filter((product) => product.category === category)

            return (
              <div key={category} className="mx-auto w-full max-w-6xl">
                <div className="mb-6 flex items-center justify-center">
                  <span className="text-[1.8rem] font-serif uppercase tracking-[0.12em] text-primary sm:text-[2.4rem] md:text-[3rem]">
                    {category}
                  </span>
                </div>

                <div className="grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {categoryProducts.map((p) => (
                    <article
                      key={p.name}
                      className="group flex w-full max-w-[280px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-sm"
                    >
                      <div className="relative aspect-square w-full overflow-hidden">
                        <Image
                          src={p.image || '/placeholder.svg'}
                          alt={p.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <span className="text-xs uppercase tracking-[0.2em] text-primary">
                          {p.category}
                        </span>
                        <h3 className="mt-2 font-serif text-xl leading-tight text-foreground">
                          {p.name}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                          {p.description}
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-3">
                          <span className="font-serif text-lg text-foreground">{p.price}</span>
                          <a
                            href={INSTAGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-primary px-4 py-2 text-xs tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            Order
                          </a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
