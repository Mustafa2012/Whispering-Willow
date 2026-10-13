 'use client'

import { ShoppingBag, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { formatPrice, slugifyProductName, type Product } from '@/lib/products'
import { useCart } from '@/components/cart-provider'

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [addedProductName, setAddedProductName] = useState<string | null>(null)
  const addedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const categoryOrder = ['Bangles', 'Bracelets', 'Earrings', 'Necklaces', 'Rings']
  const categories = categoryOrder.filter((item) => products.some((product) => product.category === item))

  useEffect(() => {
    const requestedCategory = new URLSearchParams(window.location.search).get('category')
    if (requestedCategory) setCategory(requestedCategory)
  }, [])

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === 'All' || product.category === category
      return product.isActive !== false && matchesCategory
    })

    return [...filtered].sort((left, right) => {
      if (sort === 'newest') {
        if (left.created_at && right.created_at) return Date.parse(right.created_at) - Date.parse(left.created_at)
        if (left.created_at) return -1
        if (right.created_at) return 1
        return products.indexOf(left) - products.indexOf(right)
      }
      if (sort === 'price-low') return left.price - right.price
      if (sort === 'price-high') return right.price - left.price
      if (sort === 'name') return left.name.localeCompare(right.name)
      return products.indexOf(left) - products.indexOf(right)
    })
  }, [category, products, sort])

  const handleAddToCart = (product: Product) => {
    addItem(product)
    setAddedProductName(product.name)
    if (addedTimeout.current) clearTimeout(addedTimeout.current)
    addedTimeout.current = setTimeout(() => setAddedProductName(null), 2000)
  }

  return (
    <section id="shop" className="bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <div className="mb-8 flex flex-col items-center text-center">
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

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-y border-border/70 py-3">
          <div className="flex min-w-0 items-center gap-4">
            <button type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} className="inline-flex items-center gap-2 text-sm text-foreground hover:text-primary">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <span className="text-sm text-muted-foreground">{filteredProducts.length} products</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <label>
              <span className="sr-only">Sort products</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="max-w-40 border-0 bg-transparent py-2 pl-2 pr-7 text-sm text-foreground outline-none focus:ring-0">
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name</option>
              </select>
            </label>
          </div>
        </div>

        <div className={`grid items-start gap-6 ${filtersOpen ? 'lg:grid-cols-[190px_minmax(0,1fr)]' : ''}`}>
          {filtersOpen ? (
            <aside className="border-b border-border/70 pb-4 lg:sticky lg:top-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
              <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-foreground">Category</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-1">
                {['All', ...categories].map((item) => (
                  <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`py-1 text-left text-sm transition-colors ${category === item ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                    {item}
                  </button>
                ))}
              </div>
            </aside>
          ) : null}

          <div className="min-w-0">
            {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-16 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-4 font-serif text-2xl text-foreground">No pieces found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try a different search or clear your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 justify-items-center gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5">
            {filteredProducts.map((p) => (
                    <article
                      key={p.id ?? p.name}
                      className="group flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-border/70 bg-card text-left shadow-sm"
                    >
                      <Link href={`/products/${slugifyProductName(p.name)}`} aria-label={`View ${p.name}`} className="relative aspect-[4/3] w-full overflow-hidden">
                        <img
                          src={p.image || '/placeholder.svg'}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </Link>
                      <div className="flex flex-1 flex-col p-3 sm:p-4">
                        <span className="truncate text-[10px] uppercase tracking-[0.16em] text-primary sm:text-xs">
                          {p.category}
                        </span>
                        <h3 className="mt-1.5 line-clamp-2 font-serif text-base leading-tight text-foreground sm:text-lg">
                          <Link href={`/products/${slugifyProductName(p.name)}`} className="hover:text-primary">{p.name}</Link>
                        </h3>
                        <p className="mt-1.5 line-clamp-2 flex-1 text-[11px] leading-snug text-muted-foreground sm:text-xs">
                          {p.description}
                        </p>
                        <div className="mt-3 flex flex-col items-start justify-between gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                          <span className="font-serif text-sm text-foreground sm:text-base">{formatPrice(p.price)}</span>
                          {p.sizes?.length ? (
                            <Link href={`/products/${slugifyProductName(p.name)}`} className="w-full rounded-full bg-primary px-2 py-1.5 text-center text-[10px] tracking-wide text-primary-foreground transition-opacity hover:opacity-90 sm:w-auto sm:px-3 sm:text-xs">Choose size</Link>
                          ) : (
                            <button type="button" onClick={() => handleAddToCart(p)} className={`relative w-full overflow-hidden rounded-full px-2 py-1.5 text-[10px] tracking-wide transition-colors sm:w-auto sm:px-3 sm:py-1.5 sm:text-xs ${addedProductName === p.name ? 'bg-white text-foreground' : 'bg-primary text-primary-foreground hover:opacity-90'}`}>
                              <span className={addedProductName === p.name ? 'opacity-0' : 'opacity-100'}>Add to cart</span>
                              {addedProductName === p.name ? <span className="absolute inset-0 flex items-center justify-center bg-white text-foreground">Added</span> : null}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
            ))}
          </div>
        )}
          </div>
        </div>
      </div>
    </section>
  )
}
