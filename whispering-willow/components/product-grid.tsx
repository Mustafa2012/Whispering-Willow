 'use client'

import { Search, ShoppingBag, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { formatPrice, type Product } from '@/lib/products'
import { useCart } from '@/components/cart-provider'

type ProductGridProps = {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort, setSort] = useState('featured')
  const [addedProductName, setAddedProductName] = useState<string | null>(null)
  const addedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const categories = Array.from(new Set(products.map((product) => product.category)))
  const highestPrice = Math.max(...products.map((product) => product.price), 0)
  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = products.filter((product) => {
      const matchesQuery = !normalizedQuery || `${product.name} ${product.description}`.toLowerCase().includes(normalizedQuery)
      const matchesCategory = category === 'All' || product.category === category
      const matchesPrice = !maxPrice || product.price <= Number(maxPrice)
      return product.isActive !== false && matchesQuery && matchesCategory && matchesPrice
    })

    return [...filtered].sort((left, right) => {
      if (sort === 'price-low') return left.price - right.price
      if (sort === 'price-high') return right.price - left.price
      if (sort === 'name') return left.name.localeCompare(right.name)
      return 0
    })
  }, [category, maxPrice, products, query, sort])
  const hasFilters = query || category !== 'All' || maxPrice || sort !== 'featured'

  const clearFilters = () => {
    setQuery('')
    setCategory('All')
    setMaxPrice('')
    setSort('featured')
  }

  const handleAddToCart = (product: Product) => {
    addItem(product)
    setAddedProductName(product.name)
    if (addedTimeout.current) clearTimeout(addedTimeout.current)
    addedTimeout.current = setTimeout(() => setAddedProductName(null), 2000)
  }

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

        <div className="mb-10 rounded-2xl border border-border/70 bg-background p-4 shadow-sm md:p-5">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_180px]">
            <label className="relative block">
              <span className="sr-only">Search products</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search jewelry" className="w-full rounded-xl border border-border bg-card py-3 pl-10 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label>
              <span className="sr-only">Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                <option value="All">All categories</option>
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label>
              <span className="sr-only">Maximum price</span>
              <input type="number" min="0" max={highestPrice} value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Max price (PKR)" className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
            </label>
            <label>
              <span className="sr-only">Sort products</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} className="w-full rounded-xl border border-border bg-card px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                <option value="featured">Featured</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" />{filteredProducts.length} products</span>
            {hasFilters ? <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 text-foreground hover:text-primary"><X className="h-4 w-4" />Clear filters</button> : null}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-16 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-primary" />
            <h3 className="mt-4 font-serif text-2xl text-foreground">No pieces found</h3>
            <p className="mt-2 text-sm text-muted-foreground">Try a different search or clear your filters.</p>
          </div>
        ) : (
          <div className="grid justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((p) => (
                    <article
                      key={p.id ?? p.name}
                      className="group flex w-full max-w-[280px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-sm"
                    >
                      <div className="relative aspect-square w-full overflow-hidden">
                        <img
                          src={p.image || '/placeholder.svg'}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
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
                          <span className="font-serif text-lg text-foreground">{formatPrice(p.price)}</span>
                          <button type="button" onClick={() => handleAddToCart(p)} className={`relative overflow-hidden rounded-full px-4 py-2 text-xs tracking-wide transition-colors ${addedProductName === p.name ? 'bg-white text-foreground' : 'bg-primary text-primary-foreground hover:opacity-90'}`}>
                            <span className={addedProductName === p.name ? 'opacity-0' : 'opacity-100'}>Add to cart</span>
                            {addedProductName === p.name ? <span className="absolute inset-0 flex items-center justify-center bg-white text-foreground">Added</span> : null}
                          </button>
                        </div>
                      </div>
                    </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
